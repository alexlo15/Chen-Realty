import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import "./MarketAnalysis.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDollar(n) {
  return n != null ? "$" + Number(n).toLocaleString() : "—";
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}

function stripMd(text) {
  if (!text) return "";
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/gs, "$1")
    .replace(/\*(.*?)\*/gs, "$1")
    .trim();
}

function loadGoogleMaps() {
  if (window.__googleMapsLoading || window.google?.maps?.places) return;
  window.__googleMapsLoading = true;
  const s = document.createElement("script");
  s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places`;
  s.async = true;
  s.defer = true;
  document.head.appendChild(s);
}

// ─── INPUT VIEW ───────────────────────────────────────────────────────────────

function InputView({ onSubmit, onRetrieve, initialAddress, initialEmail, errorMsg }) {
  const inputRef = useRef(null);
  const [email, setEmail] = useState(initialEmail ?? "");
  const [mapsReady, setMapsReady] = useState(!!window.google?.maps?.places);
  const [mapsFailed, setMapsFailed] = useState(false);
  const [retrieveOpen, setRetrieveOpen] = useState(false);
  const [rEmail, setREmail] = useState("");
  const [rToken, setRToken] = useState("");
  const [rError, setRError] = useState(null);
  const [rLoading, setRLoading] = useState(false);

  useEffect(() => {
    if (mapsReady || mapsFailed) return;
    loadGoogleMaps();
    let attempts = 0;
    const id = setInterval(() => {
      attempts++;
      if (window.google?.maps?.places) { setMapsReady(true); clearInterval(id); }
      else if (attempts >= 25) { setMapsFailed(true); clearInterval(id); }
    }, 200);
    return () => clearInterval(id);
  }, [mapsReady, mapsFailed]);

  useEffect(() => {
    if (!mapsReady || !inputRef.current) return;
    try {
      const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        componentRestrictions: { country: "us" },
      });
      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (place?.formatted_address) inputRef.current.value = place.formatted_address;
      });
      if (initialAddress) inputRef.current.value = initialAddress;
      return () => window.google.maps.event.clearInstanceListeners(ac);
    } catch {
      setMapsFailed(true);
    }
  }, [mapsReady, initialAddress]);

  function handleSubmit(e) {
    e.preventDefault();
    const address = inputRef.current?.value?.trim();
    if (!address || !email.trim()) return;
    onSubmit(address, email.trim());
  }

  async function handleRetrieve(e) {
    e.preventDefault();
    if (!rEmail.trim() || !rToken.trim()) return;
    setRLoading(true);
    setRError(null);
    const { data, error } = await supabase
      .from("market_analyses")
      .select("*")
      .eq("email", rEmail.trim())
      .eq("share_token", rToken.trim().toLowerCase())
      .single();
    setRLoading(false);
    if (error || !data) { setRError("No report found. Check your email and access code."); return; }
    onRetrieve({
      address: data.address,
      email: data.email,
      property: data.property_data,
      avm: data.avm_data,
      comps: data.comps ?? [],
      aiSummary: data.ai_summary,
      priceLow: data.price_low,
      priceHigh: data.price_high,
      priceEstimate: data.avm_data?.price ?? null,
      shareToken: data.share_token,
    });
  }

  return (
    <div className="ma-root">
      <div className="ma-hero">
        <div className="ma-hero-eyebrow">Chen Realty · Market Intelligence</div>
        <h1 className="ma-hero-title">What's Your Home Worth?</h1>
        <p className="ma-hero-sub">
          Get an AI-powered market analysis with comparable sales and a suggested listing price — in under 30 seconds.
        </p>
      </div>

      <div className="ma-form-wrap">
        <form className="ma-form" onSubmit={handleSubmit} noValidate>
          <div className="ma-field">
            <label className="ma-label" htmlFor="ma-address">
              Property Address
              {mapsFailed && <span className="ma-maps-note"> · autocomplete unavailable</span>}
            </label>
            <input
              ref={inputRef}
              id="ma-address"
              className="ma-input"
              type="text"
              placeholder="123 Main St, Holmdel, NJ 07733"
              defaultValue={initialAddress ?? ""}
              required
              autoComplete="off"
            />
          </div>
          <div className="ma-field">
            <label className="ma-label" htmlFor="ma-email">
              Your Email <span className="ma-label-note">— to receive and save your report</span>
            </label>
            <input
              id="ma-email"
              className="ma-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          {errorMsg && <div className="ma-error-msg">{errorMsg}</div>}
          <button className="ma-submit" type="submit">
            Run Market Analysis
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>

        <p className="ma-form-note">
          Analysis uses public property records and recent comparable listings. Not a formal appraisal.
        </p>

        {/* Retrieve a saved report */}
        <div className="ma-retrieve">
          <button className="ma-retrieve-toggle" type="button" onClick={() => setRetrieveOpen((o) => !o)}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retrieve a saved report
          </button>
          {retrieveOpen && (
            <form className="ma-retrieve-form" onSubmit={handleRetrieve} noValidate>
              <p className="ma-retrieve-desc">Enter the email and access code shown when you saved your report.</p>
              <div className="ma-retrieve-row">
                <input
                  className="ma-input"
                  type="email"
                  placeholder="Email address"
                  value={rEmail}
                  onChange={(e) => setREmail(e.target.value)}
                  required
                />
                <input
                  className="ma-input ma-input-code"
                  type="text"
                  placeholder="Access code"
                  value={rToken}
                  onChange={(e) => setRToken(e.target.value)}
                  required
                  maxLength={16}
                  spellCheck={false}
                />
              </div>
              {rError && <div className="ma-error-msg">{rError}</div>}
              <button className="ma-submit ma-submit-sm" type="submit" disabled={rLoading}>
                {rLoading ? "Loading…" : "Load Saved Report"}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="ma-how">
        <div className="ma-how-title">How It Works</div>
        <div className="ma-steps">
          {[
            { n: "1", t: "Enter an address", d: "Any NJ property. Start typing to get address suggestions." },
            { n: "2", t: "We pull public data", d: "Property records, automated valuation, and 10+ recent comparable listings." },
            { n: "3", t: "Our tool writes the analysis", d: "The data is synthesized into a professional market summary with a specific suggested price." },
          ].map((s) => (
            <div key={s.n} className="ma-step">
              <div className="ma-step-num">{s.n}</div>
              <div>
                <div className="ma-step-title">{s.t}</div>
                <div className="ma-step-desc">{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── LOADING VIEW ─────────────────────────────────────────────────────────────

const LOADING_MSGS = [
  "Fetching property records…",
  "Running comparable sales analysis…",
  "Generating your market summary…",
];

function LoadingView({ address }) {
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setMsgIdx((i) => Math.min(i + 1, LOADING_MSGS.length - 1)), 2800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="ma-root">
      <div className="ma-loading">
        <div className="ma-spinner" />
        <div className="ma-loading-addr">{address}</div>
        <div className="ma-loading-msg">{LOADING_MSGS[msgIdx]}</div>
        <div className="ma-loading-steps">
          {LOADING_MSGS.map((m, i) => (
            <div key={i} className={`ma-loading-step ${i <= msgIdx ? "done" : ""} ${i === msgIdx ? "active" : ""}`}>
              <div className="ma-loading-dot" />
              <span>{m.replace("…", "")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── LOCATION CARD ────────────────────────────────────────────────────────────

function LocationCard({ property, avm }) {
  const lat = property?.latitude ?? avm?.subjectProperty?.latitude ?? avm?.latitude;
  const lon = property?.longitude ?? avm?.subjectProperty?.longitude ?? avm?.longitude;
  const [svFailed, setSvFailed] = useState(false);
  if (!lat || !lon) return null;

  const delta = 0.005;
  const osmSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - delta},${lat - delta},${lon + delta},${lat + delta}&layer=mapnik&marker=${lat},${lon}`;
  const svSrc = MAPS_KEY
    ? `https://maps.googleapis.com/maps/api/streetview?size=800x400&location=${lat},${lon}&key=${MAPS_KEY}&fov=80&pitch=5`
    : null;

  return (
    <div className="ma-card ma-location-card">
      <div className="ma-card-title">Location</div>
      <div className="ma-gold-rule" />
      <div className="ma-location-wrap">
        {!svFailed && svSrc && (
          <div className="ma-sv-wrap">
            <img
              src={svSrc}
              alt="Street view"
              className="ma-sv-img"
              onError={() => setSvFailed(true)}
            />
            <div className="ma-sv-label">Street View</div>
          </div>
        )}
        <div className="ma-map-wrap">
          <iframe
            src={osmSrc}
            title="Property location"
            className="ma-osm"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
          />
          <div className="ma-map-label">OpenStreetMap</div>
        </div>
      </div>
    </div>
  );
}

// ─── COMP CARD ────────────────────────────────────────────────────────────────

function CompCard({ comp }) {
  const [imgFailed, setImgFailed] = useState(false);
  const isActive = comp.status === "Active";
  const ppsf = comp.price && comp.squareFootage ? "$" + Math.round(comp.price / comp.squareFootage) : null;
  const svSrc = MAPS_KEY && !imgFailed && comp.formattedAddress
    ? `https://maps.googleapis.com/maps/api/streetview?size=160x110&location=${encodeURIComponent(comp.formattedAddress)}&key=${MAPS_KEY}&fov=90`
    : null;

  return (
    <div className="ma-comp-card">
      <div className="ma-comp-thumb">
        {svSrc ? (
          <img src={svSrc} alt={comp.formattedAddress} onError={() => setImgFailed(true)} />
        ) : (
          <div className="ma-comp-thumb-ph">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="currentColor" opacity=".4"/>
            </svg>
          </div>
        )}
      </div>
      <div className="ma-comp-card-body">
        <div className="ma-comp-card-top">
          <div className="ma-comp-card-addr">{comp.formattedAddress ?? "—"}</div>
          <span className={`ma-comp-status ${isActive ? "active" : "offmarket"}`}>
            {isActive ? "Active" : "Off Market"}
          </span>
        </div>
        <div className="ma-comp-card-price">{fmtDollar(comp.price)}</div>
        <div className="ma-comp-card-specs">
          {[
            comp.bedrooms != null ? `${comp.bedrooms}bd` : null,
            comp.bathrooms != null ? `${comp.bathrooms}ba` : null,
            comp.squareFootage ? `${comp.squareFootage.toLocaleString()} sqft` : null,
            ppsf ? `${ppsf}/sqft` : null,
          ].filter(Boolean).join(" · ")}
        </div>
        <div className="ma-comp-card-meta">
          {[
            comp.listedDate ? `Listed ${fmtDate(comp.listedDate)}` : null,
            comp.daysOnMarket != null ? `${comp.daysOnMarket} DOM` : null,
            comp.distance != null ? `${comp.distance.toFixed(2)} mi` : null,
            comp.correlation != null ? `${Math.round(comp.correlation * 100)}% match` : null,
          ].filter(Boolean).join(" · ")}
        </div>
      </div>
    </div>
  );
}

// ─── COMPS SECTION ────────────────────────────────────────────────────────────

function CompsSection({ comps }) {
  const [tab, setTab] = useState("offmarket");
  const offMarket = comps.filter((c) => c.status !== "Active");
  const active = comps.filter((c) => c.status === "Active");
  const shown = tab === "offmarket" ? offMarket : active;

  return (
    <div className="ma-card">
      <div className="ma-card-title">Comparable Listings</div>
      <div className="ma-gold-rule" />
      <div className="ma-comps-tabs">
        <button
          className={`ma-comps-tab ${tab === "offmarket" ? "on" : ""}`}
          onClick={() => setTab("offmarket")}
        >
          Off Market · Likely Sold
          <span className="ma-comps-tab-ct">{offMarket.length}</span>
        </button>
        <button
          className={`ma-comps-tab ${tab === "active" ? "on" : ""}`}
          onClick={() => setTab("active")}
        >
          Active Listings
          <span className="ma-comps-tab-ct">{active.length}</span>
        </button>
      </div>
      <p className="ma-comps-note">
        {tab === "offmarket"
          ? "Removed from MLS — most likely sold or under contract. Best signal for actual sale prices."
          : "Currently listed. Reflects current market pricing expectations, not confirmed sale prices."}
      </p>
      {shown.length > 0 ? (
        <div className="ma-comp-cards">
          {shown.map((c, i) => <CompCard key={c.id ?? i} comp={c} />)}
        </div>
      ) : (
        <p className="ma-comps-empty">
          No {tab === "offmarket" ? "off-market" : "active"} listings in this comparison set.
        </p>
      )}
    </div>
  );
}

// ─── RESULTS VIEW ─────────────────────────────────────────────────────────────

function ResultsView({ results, onReset }) {
  const [saved, setSaved] = useState(!!results.shareToken);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [savedToken, setSavedToken] = useState(results.shareToken ?? null);
  const [copied, setCopied] = useState(false);

  const rawProp = results.property;
  const property = Array.isArray(rawProp) ? rawProp[0] : rawProp;
  const { address, avm, aiSummary, priceLow, priceHigh, priceEstimate } = results;
  const comps = results.comps?.length > 0 ? results.comps : (avm?.comparables ?? []);

  const taxRows = property?.taxAssessments
    ? Object.values(property.taxAssessments).sort((a, b) => b.year - a.year).slice(0, 3)
    : [];
  const taxPayRows = property?.propertyTaxes
    ? Object.values(property.propertyTaxes).sort((a, b) => b.year - a.year).slice(0, 2)
    : [];

  // Price range indicator position (0–100%)
  const rangePos = priceLow && priceHigh && priceEstimate
    ? Math.round(((priceEstimate - priceLow) / (priceHigh - priceLow)) * 100)
    : 50;

  async function handleSave() {
    if (saving || saved) return;
    setSaving(true);
    setSaveError(null);
    const { data, error } = await supabase
      .from("market_analyses")
      .insert({
        email: results.email,
        address: results.address,
        property_data: results.property,
        avm_data: results.avm,
        comps: results.comps,
        ai_summary: results.aiSummary,
        price_low: results.priceLow,
        price_high: results.priceHigh,
      })
      .select("share_token")
      .single();
    setSaving(false);
    if (error) { setSaveError("Could not save — please try again."); return; }
    setSaved(true);
    setSavedToken(data?.share_token ?? null);
  }

  function handleCopy() {
    if (savedToken) {
      navigator.clipboard.writeText(savedToken).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <div className="ma-root">
      {/* Sticky header */}
      <div className="ma-results-bar">
        <button className="ma-results-back" onClick={onReset}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          New Analysis
        </button>
        <div className="ma-results-bar-addr">{address}</div>
        <button className={`ma-save-btn ${saved ? "saved" : ""}`} onClick={handleSave} disabled={saving || saved}>
          {saved ? "✓ Saved" : saving ? "Saving…" : "Save Report"}
        </button>
      </div>

      {/* Token banner */}
      {savedToken && (
        <div className="ma-token-banner">
          <span className="ma-token-label">Access code to retrieve this report:</span>
          <span className="ma-token-val">{savedToken}</span>
          <button className="ma-token-copy" onClick={handleCopy}>{copied ? "Copied!" : "Copy"}</button>
        </div>
      )}

      <div className="ma-results-body">
        {/* ── Price card ── */}
        <div className="ma-price-card">
          <div className="ma-price-eyebrow">Estimated Market Value</div>
          <div className="ma-price-value">{fmtDollar(priceEstimate)}</div>
          <div className="ma-price-range">
            <span className="ma-range-low">{fmtDollar(priceLow)}</span>
            <span className="ma-range-sep">–</span>
            <span className="ma-range-high">{fmtDollar(priceHigh)}</span>
          </div>
          <div className="ma-range-label">Estimated Range</div>
          {priceLow && priceHigh && (
            <div className="ma-range-track">
              <div className="ma-range-fill" />
              <div className="ma-range-dot" style={{ left: `${rangePos}%` }} />
            </div>
          )}
        </div>

        {/* ── Location ── */}
        <LocationCard property={property} avm={avm} />

        {/* ── Property details ── */}
        {property && (
          <div className="ma-card">
            <div className="ma-card-title">Property Details</div>
            <div className="ma-gold-rule" />
            <div className="ma-prop-grid">
              {[
                { l: "Type",        v: property.propertyType },
                { l: "Beds",        v: property.bedrooms },
                { l: "Baths",       v: property.bathrooms },
                { l: "Sq Ft",       v: property.squareFootage?.toLocaleString() },
                { l: "Lot",         v: property.lotSize ? `${property.lotSize.toLocaleString()} sqft` : null },
                { l: "Year Built",  v: property.yearBuilt },
                { l: "City",        v: property.city },
                { l: "County",      v: property.county },
                { l: "Zip",         v: property.zipCode },
                { l: "Subdivision", v: property.subdivision ?? null },
                { l: "Zoning",      v: property.zoning ?? null },
                { l: "Last Sale",   v: property.lastSalePrice ? `${fmtDollar(property.lastSalePrice)} — ${fmtDate(property.lastSaleDate)}` : null },
              ].filter((d) => d.v != null && d.v !== "").map((d, i) => (
                <div key={i} className="ma-prop-row">
                  <div className="ma-prop-label">{d.l}</div>
                  <div className="ma-prop-value">{d.v}</div>
                </div>
              ))}
            </div>

            {taxRows.length > 0 && (
              <div className="ma-tax-section">
                <div className="ma-tax-title">Tax Assessments</div>
                <div className="ma-tax-grid">
                  {taxRows.map((t) => (
                    <div key={t.year} className="ma-tax-row">
                      <span className="ma-tax-year">{t.year}</span>
                      <span className="ma-tax-val">{fmtDollar(t.value)}</span>
                      <span className="ma-tax-sub">Land {fmtDollar(t.land)} · Imp {fmtDollar(t.improvements)}</span>
                    </div>
                  ))}
                  {taxPayRows.map((t) => (
                    <div key={`pay-${t.year}`} className="ma-tax-row">
                      <span className="ma-tax-year">{t.year}</span>
                      <span className="ma-tax-val">{fmtDollar(t.total)}/yr</span>
                      <span className="ma-tax-sub">Property tax</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── AI narrative ── */}
        {aiSummary && (
          <div className="ma-card ma-ai-card">
            <div className="ma-card-title">Market Analysis</div>
            <div className="ma-gold-rule" />
            <div className="ma-ai-badge">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M5.5 8.5l2 2 3-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              AI-Generated Summary · Claude Sonnet
            </div>
            <p className="ma-ai-text">{stripMd(aiSummary)}</p>
          </div>
        )}

        {/* ── Comps ── */}
        {comps?.length > 0 && <CompsSection comps={comps} />}

        {saveError && <p className="ma-save-error">{saveError}</p>}

        <p className="ma-disclaimer">
          This report is generated using automated valuation models and publicly available comparable
          sales data. It is not a formal appraisal and should not be used as the sole basis for
          pricing decisions. Contact a licensed real estate agent for a comprehensive market evaluation.
        </p>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function MarketAnalysis() {
  const [phase, setPhase] = useState("input");
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [lastAddress, setLastAddress] = useState("");
  const [lastEmail, setLastEmail] = useState("");

  async function handleSubmit(address, email) {
    setLastAddress(address);
    setLastEmail(email);
    setPhase("loading");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, email }),
      });
      const data = await res.json().catch(() => ({ error: "Unexpected server response" }));
      if (!res.ok) { setErrorMsg(data.error || `Request failed (${res.status})`); setPhase("error"); return; }
      setResults(data);
      setPhase("results");
    } catch (err) {
      setErrorMsg(err.message || "Network error — please try again");
      setPhase("error");
    }
  }

  function handleRetrieve(data) {
    setResults(data);
    setPhase("results");
  }

  function handleReset() {
    setPhase("input");
    setResults(null);
    setErrorMsg(null);
  }

  if (phase === "loading") return <LoadingView address={lastAddress} />;
  if (phase === "results") return <ResultsView results={results} onReset={handleReset} />;

  return (
    <InputView
      onSubmit={handleSubmit}
      onRetrieve={handleRetrieve}
      initialAddress={phase === "error" ? lastAddress : ""}
      initialEmail={phase === "error" ? lastEmail : ""}
      errorMsg={errorMsg}
    />
  );
}
