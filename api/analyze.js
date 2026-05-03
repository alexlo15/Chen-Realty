const RENTCAST_BASE = "https://api.rentcast.io/v1";

function $$(n) {
  return n != null ? "$" + Number(n).toLocaleString() : "N/A";
}

async function rentcastFetch(path, apiKey) {
  const res = await fetch(`${RENTCAST_BASE}${path}`, {
    headers: { "X-Api-Key": apiKey, Accept: "application/json" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Rentcast ${path.split("?")[0]} → ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

function stripMarkdown(text) {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/gs, "$1")
    .replace(/\*(.*?)\*/gs, "$1")
    .replace(/__(.*?)__/gs, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { address, email } = req.body ?? {};
  if (!address?.trim() || !email?.trim()) {
    return res.status(400).json({ error: "address and email are required" });
  }

  const RENTCAST_KEY = process.env.RENTCAST_API_KEY;
  const CLAUDE_KEY = process.env.CLAUDE_API_KEY;
  if (!RENTCAST_KEY || !CLAUDE_KEY) {
    return res.status(500).json({ error: "Server misconfigured — API keys missing" });
  }

  const encoded = encodeURIComponent(address.trim());

  try {
    // Property record + AVM (which includes its own comparables) in parallel
    const [rawProperty, avmData] = await Promise.all([
      rentcastFetch(`/properties?address=${encoded}`, RENTCAST_KEY).catch(() => null),
      rentcastFetch(`/avm/value?address=${encoded}&compCount=10`, RENTCAST_KEY).catch(() => null),
    ]);

    if (!avmData && !rawProperty) {
      return res.status(404).json({
        error: "No property data found for this address. Please verify the full address and try again.",
      });
    }

    // Rentcast /properties returns an array — normalize to a single object
    const property = Array.isArray(rawProperty)
      ? rawProperty[0]
      : (rawProperty ?? avmData?.subjectProperty ?? null);

    // The AVM response already contains the best comparable listings
    // The separate /avm/sale/comparables endpoint is secondary
    const avmComps = avmData?.comparables ?? [];

    // Try dedicated comps endpoint as supplement (fails gracefully)
    const propertyType = property?.propertyType ?? "Single Family";
    const extraCompsData = await rentcastFetch(
      `/avm/sale/comparables?address=${encoded}&propertyType=${encodeURIComponent(propertyType)}&status=Sold&daysOld=730&compCount=8`,
      RENTCAST_KEY
    ).catch(() => null);
    const soldComps = extraCompsData?.comparables ?? [];

    // Merge: sold comps first (more reliable pricing signal), then AVM comps to fill out
    const seenIds = new Set(soldComps.map((c) => c.id));
    const mergedComps = [
      ...soldComps,
      ...avmComps.filter((c) => !seenIds.has(c.id)),
    ].slice(0, 10);

    // ── Build rich property context for Claude ──────────────────────────────

    const taxLines = property?.taxAssessments
      ? Object.values(property.taxAssessments)
          .sort((a, b) => b.year - a.year)
          .slice(0, 3)
          .map((t) => `${t.year}: ${$$(t.value)} assessed (${$$(t.land)} land + ${$$(t.improvements)} improvements)`)
          .join(" | ")
      : null;

    const taxPayLines = property?.propertyTaxes
      ? Object.values(property.propertyTaxes)
          .sort((a, b) => b.year - a.year)
          .slice(0, 2)
          .map((t) => `${t.year}: ${$$(t.total)}/yr`)
          .join(" | ")
      : null;

    const feat = property?.features ?? {};
    const featureStr = [
      feat.architectureType,
      feat.floorCount ? `${feat.floorCount}-story` : null,
      feat.roomCount ? `${feat.roomCount} rooms` : null,
      feat.exteriorType,
      feat.roofType ? `${feat.roofType} roof` : null,
    ]
      .filter(Boolean)
      .join(", ");

    const lastSale = property?.lastSaleDate && property?.lastSalePrice
      ? `${$$(property.lastSalePrice)} on ${new Date(property.lastSaleDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
      : null;

    const ppsf = avmData?.price && property?.squareFootage
      ? Math.round(avmData.price / property.squareFootage)
      : null;

    const compLines = mergedComps
      .slice(0, 8)
      .map((c, i) => {
        const cPpsf = c.price && c.squareFootage ? `$${Math.round(c.price / c.squareFootage)}/sqft` : "";
        const listed = c.listedDate ? new Date(c.listedDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "?";
        const removed = c.removedDate ? new Date(c.removedDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : null;
        const dom = c.daysOnMarket ? `${c.daysOnMarket} DOM` : "";
        const dist = c.distance != null ? `${c.distance.toFixed(2)}mi` : "";
        const corr = c.correlation != null ? `${Math.round(c.correlation * 100)}% match` : "";
        const statusStr = c.status === "Active" ? "ACTIVE" : (removed ? `off market ${removed}` : "off market");
        return `${i + 1}. ${c.formattedAddress ?? "Unknown"} — ${$$(c.price)} ${cPpsf} | ${c.bedrooms ?? "?"}bd/${c.bathrooms ?? "?"}ba${c.squareFootage ? " " + c.squareFootage.toLocaleString() + "sqft" : ""} | built ${c.yearBuilt ?? "?"} | listed ${listed}, ${dom} | ${statusStr} | ${dist} | ${corr}`;
      })
      .join("\n");

    // ── Claude prompt ────────────────────────────────────────────────────────

    const systemPrompt = `You are a licensed New Jersey real estate broker with 20+ years of experience in Monmouth and Ocean County residential markets. You write precise, data-driven Comparative Market Analyses for listing clients.

STRICT FORMATTING RULES — violations are unacceptable:
- Plain prose paragraphs only
- Zero markdown: no asterisks, no pound signs, no dashes for lists, no backticks, no underscores for emphasis
- Do not write the property address as a heading or title
- Do not use the words "Comparative Market Analysis" or "CMA" as a title
- Numbers and prices: use dollar signs and commas ($617,000 not 617000)`;

    const userPrompt = `Analyze this property and write a market analysis for the listing agent to present to the seller.

SUBJECT PROPERTY
Address: ${property?.formattedAddress ?? address.trim()}
Type: ${property?.propertyType ?? "Residential"} | ${property?.bedrooms ?? "?"}BR / ${property?.bathrooms ?? "?"}BA | ${property?.squareFootage?.toLocaleString() ?? "?"}sqft | Built ${property?.yearBuilt ?? "?"}
${property?.lotSize ? `Lot: ${property.lotSize.toLocaleString()} sqft` : ""}
${featureStr ? `Features: ${featureStr}` : ""}
${lastSale ? `Last sale: ${lastSale}` : ""}
${taxLines ? `Tax assessments (recent): ${taxLines}` : ""}
${taxPayLines ? `Property taxes: ${taxPayLines}` : ""}

AUTOMATED VALUATION MODEL
Estimate: ${$$(avmData?.price)} ${ppsf ? `($${ppsf}/sqft)` : ""}
Range: ${$$(avmData?.priceRangeLow)} – ${$$(avmData?.priceRangeHigh)}

COMPARABLE LISTINGS (recently active nearby — correlation score = similarity to subject)
${compLines || "No comparable data available."}

Write exactly 4 paragraphs of plain prose:
1. Brief property overview and current market conditions in ${property?.city ?? "this area"}, NJ — reference what property type demand looks like and what the tax assessment trend suggests about value appreciation
2. Analysis of the comparable listings — note the pricing spread, price per square foot, days on market for nearby units; identify which comps are most similar and why
3. Your specific recommended listing price (a precise number or tight $10K–$20K range) with clear reasoning tied to the comp data and the AVM estimate
4. One focused sentence on seller strategy — timing, staging, pricing approach to generate early offers

Plain text only. Reference specific addresses and prices from the comps. Do not start any sentence with "I" as the first word.`;

    // ── Call Claude Sonnet ───────────────────────────────────────────────────

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": CLAUDE_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 900,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!claudeRes.ok) {
      console.error("Claude API error:", await claudeRes.text().catch(() => "unknown"));
    }

    const claudeData = claudeRes.ok ? await claudeRes.json() : null;
    const rawSummary = claudeData?.content?.[0]?.text ?? "";
    const aiSummary = stripMarkdown(rawSummary);

    return res.status(200).json({
      address: address.trim(),
      email: email.trim(),
      property,
      avm: avmData,
      comps: mergedComps,
      aiSummary,
      priceLow: avmData?.priceRangeLow ?? null,
      priceHigh: avmData?.priceRangeHigh ?? null,
      priceEstimate: avmData?.price ?? null,
    });
  } catch (err) {
    console.error("analyze handler error:", err);
    return res.status(500).json({ error: err.message || "Analysis failed. Please try again." });
  }
}
