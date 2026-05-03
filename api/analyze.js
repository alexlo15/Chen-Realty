const RENTCAST_BASE = "https://api.rentcast.io/v1";

function dollarFmt(n) {
  return n ? "$" + Number(n).toLocaleString() : "N/A";
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
    // Property record + AVM value in parallel
    const [property, avmData] = await Promise.all([
      rentcastFetch(`/properties?address=${encoded}`, RENTCAST_KEY).catch(() => null),
      rentcastFetch(`/avm/value?address=${encoded}&compCount=5`, RENTCAST_KEY).catch(() => null),
    ]);

    if (!avmData && !property) {
      return res.status(404).json({
        error: "No property data found for this address. Please verify the full address and try again.",
      });
    }

    // Comparable sales (depends on property type)
    const propertyType = property?.propertyType ?? "Single Family";
    const compsData = await rentcastFetch(
      `/avm/sale/comparables?address=${encoded}&propertyType=${encodeURIComponent(propertyType)}&status=Sold&daysOld=365&compCount=10`,
      RENTCAST_KEY
    ).catch(() => null);

    const comparables = compsData?.comparables ?? [];

    // Build Claude prompt
    const propDesc = property
      ? `${property.bedrooms ?? "?"}BR / ${property.bathrooms ?? "?"}BA, ${property.squareFootage?.toLocaleString() ?? "?"}sqft, built ${property.yearBuilt ?? "?"}, ${property.propertyType ?? "residential"} at ${address.trim()}`
      : address.trim();

    const avmDesc = avmData
      ? `Automated valuation: ${dollarFmt(avmData.price)} (range: ${dollarFmt(avmData.priceRangeLow)} – ${dollarFmt(avmData.priceRangeHigh)})${avmData.score != null ? `, ${Math.round(avmData.score * 100)}% confidence` : ""}`
      : "Automated valuation data unavailable";

    const compLines = comparables
      .slice(0, 8)
      .map((c, i) => {
        const ppsf =
          c.price && c.squareFootage ? `$${Math.round(c.price / c.squareFootage)}/sqft` : "";
        const date = c.listedDate
          ? new Date(c.listedDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
          : "?";
        return `${i + 1}. ${c.formattedAddress ?? "Unknown address"} — sold ${dollarFmt(c.price)} ${ppsf}, ${c.squareFootage?.toLocaleString() ?? "?"}sqft, ${c.bedrooms ?? "?"}bd/${c.bathrooms ?? "?"}ba, ${date}, ${c.distance?.toFixed(2) ?? "?"}mi away`;
      })
      .join("\n");

    const prompt = `You are a licensed NJ real estate listing agent writing a brief Comparative Market Analysis (CMA) for a client.

Subject property: ${propDesc}
${avmDesc}

Recent comparable sold listings used in this analysis:
${compLines || "No comparable sales data available"}

Write a concise professional market analysis in 3–4 short paragraphs covering: (1) a brief overview of this property and the current local market, (2) what the comparable sales indicate about pricing and demand in this neighborhood, (3) a specific suggested listing price with rationale, and (4) one sentence on seller positioning strategy. Use specific dollar figures. Keep it under 280 words. Do not use headers or bullet points. Write in first person as the listing agent.`;

    // Call Claude Haiku for cost-efficient generation
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": CLAUDE_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 650,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const claudeData = claudeRes.ok ? await claudeRes.json() : null;
    if (!claudeRes.ok) {
      console.error("Claude API error:", await claudeRes.text().catch(() => "unknown"));
    }
    const aiSummary = claudeData?.content?.[0]?.text ?? "";

    return res.status(200).json({
      address: address.trim(),
      email: email.trim(),
      property,
      avm: avmData,
      comps: comparables,
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
