import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import "./MarketAnalysis.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;

function fmtDollar(n) {
  return n != null ? "$" + Number(n).toLocaleString() : "—";
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}

// ─── Google Maps loader ───────────────────────────────────────────────────────

function loadGoogleMaps() {
  if (window.__googleMapsLoading || window.google?.maps?.places) return;
  window.__googleMapsLoading = true;
  const s = document.createElement("script");
  s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places`;
  s.async = true;
  s.defer = true;
  document.head.appendChild(s);
}

// ─── INPUT VIEW ──────────────────────────────────────────────────────────────

function InputView({ onSubmit, initialAddress, initialEmail, errorMsg }) {
  const inputRef = useRef(null);
  const [email, setEmail] = useState(initialEmail ?? "");
  const [mapsReady, setMapsReady] = useState(!!window.google?.maps?.places);

  // Poll until google.maps.places is available
  useEffect(() => {
    if (mapsReady) return;
    loadGoogleMaps();
    const id = setInterval(() => {
      if (window.google?.maps?.places) {
        setMapsReady(true);
        clearInterval(id);
      }
    }, 200);
    return () => clearInterval(id);
  }, [mapsReady]);

  // Attach autocomplete once Maps is ready
  useEffect(() => {
    if (!mapsReady || !inputRef.current) return;
    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      componentRestrictions: { country: "us" },
    });
    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (place?.formatted_address) {
        inputRef.current.value = place.formatted_address;
      }
    });
    if (initialAddress) inputRef.current.value = initialAddress;
    return () => window.google.maps.event.clearInstanceListeners(ac);
  }, [mapsReady, initialAddress]);

  function handleSubmit(e) {
    e.preventDefault();
    const address = inputRef.current?.value?.trim();
    if (!address || !email.trim()) return;
    onSubmit(address, email.trim());
  }

  return (
    <div className="ma-root">
      <div className="ma-hero">
        <div className="ma-hero-eyebrow">Chen Realty · Market Intelligence</div>
        <h1 className="ma-hero-title">What's Your Home Worth?</h1>
        <p className="ma-hero-sub">
          Get an AI-powered market analysis with comparable sales and a suggested listing price —
          in under 30 seconds.
        </p>
      </div>

      <div className="ma-form-wrap">
        <form className="ma-form" onSubmit={handleSubmit} noValidate>
          <div className="ma-field">
            <label className="ma-label" htmlFor="ma-address">
              Property Address
            </label>
            <input
              ref={inputRef}
              id="ma-address"
              className="ma-input"
              type="text"
              placeholder="123 Main St, Holmdel, NJ 07733"
              required
              autoComplete="off"
            />
          </div>

          <div className="ma-field">
            <label className="ma-label" htmlFor="ma-email">
              Your Email{" "}
              <span className="ma-label-note">— to receive and save your report</span>
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
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>

        <p className="ma-form-note">
          Analysis uses public property records and recent comparable sales. Not a formal appraisal.
        </p>
      </div>

      <div className="ma-how">
        <div className="ma-how-title">How It Works</div>
        <div className="ma-steps">
          {[
            { n: "1", t: "Enter an address", d: "Any NJ property. Google Maps autocomplete ensures a clean address." },
            { n: "2", t: "We pull public data", d: "Property records, automated valuation, and 10+ recent comparable sales." },
            { n: "3", t: "Our custom research tool writes the analysis", d: "Our agent synthesizes the data into a professional market summary with a suggested price." },
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
    const id = setInterval(() => {
      setMsgIdx((i) => Math.min(i + 1, LOADING_MSGS.length - 1));
    }, 2800);
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

// ─── RESULTS VIEW ─────────────────────────────────────────────────────────────

function ResultsView({ results, onReset }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const { address, property, avm, comps, aiSummary, priceLow, priceHigh, priceEstimate } = results;
  const confidence = avm?.score != null ? Math.round(avm.score * 100) : null;

  async function handleSave() {
    if (saving || saved) return;
    setSaving(true);
    setSaveError(null);
    const { error } = await supabase.from("market_analyses").insert({
      email: results.email,
      address: results.address,
      property_data: results.property,
      avm_data: results.avm,
      comps: results.comps,
      ai_summary: results.aiSummary,
      price_low: results.priceLow,
      price_high: results.priceHigh,
    });
    setSaving(false);
    if (error) {
      setSaveError("Could not save. Please try again.");
    } else {
      setSaved(true);
    }
  }

  return (
    <div className="ma-root">
      {/* Sticky results header */}
      <div className="ma-results-bar">
        <button className="ma-results-back" onClick={onReset}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          New Analysis
        </button>
        <div className="ma-results-bar-addr">{address}</div>
        <button
          className={`ma-save-btn ${saved ? "saved" : ""}`}
          onClick={handleSave}
          disabled={saving || saved}
        >
          {saved ? "✓ Saved" : saving ? "Saving…" : "Save Report"}
        </button>
      </div>

      <div className="ma-results-body">
        {/* ── Price estimate ── */}
        <div className="ma-price-card">
          <div className="ma-price-eyebrow">Estimated Market Value</div>
          <div className="ma-price-value">{fmtDollar(priceEstimate)}</div>
          <div className="ma-price-range">
            <span className="ma-range-low">{fmtDollar(priceLow)}</span>
            <span className="ma-range-sep">–</span>
            <span className="ma-range-high">{fmtDollar(priceHigh)}</span>
          </div>
          <div className="ma-range-label">Estimated Range</div>
          {confidence !== null && (
            <div className="ma-confidence">
              <div className="ma-confidence-track">
                <div className="ma-confidence-fill" style={{ width: `${confidence}%` }} />
              </div>
              <span className="ma-confidence-label">{confidence}% data confidence</span>
            </div>
          )}
        </div>

        {/* ── Property details ── */}
        {property && (
          <div className="ma-card">
            <div className="ma-card-title">Property Details</div>
            <div className="ma-gold-rule" />
            <div className="ma-prop-grid">
              {[
                { l: "Type",       v: property.propertyType },
                { l: "Beds",       v: property.bedrooms },
                { l: "Baths",      v: property.bathrooms },
                { l: "Sq Ft",      v: property.squareFootage?.toLocaleString() },
                { l: "Lot Size",   v: property.lotSize ? `${property.lotSize} ac` : null },
                { l: "Year Built", v: property.yearBuilt },
                { l: "City",       v: property.city },
                { l: "County",     v: property.county },
                { l: "Zip",        v: property.zipCode },
                { l: "Last Sale",  v: property.lastSalePrice ? `${fmtDollar(property.lastSalePrice)} (${fmtDate(property.lastSaleDate)})` : null },
              ]
                .filter((d) => d.v != null && d.v !== "")
                .map((d, i) => (
                  <div key={i} className="ma-prop-row">
                    <div className="ma-prop-label">{d.l}</div>
                    <div className="ma-prop-value">{d.v}</div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── Narrative ── */}
        {aiSummary && (
          <div className="ma-card ma-ai-card">
            <div className="ma-card-title">Market Analysis</div>
            <div className="ma-gold-rule" />
            <div className="ma-ai-badge">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M5.5 8.5l2 2 3-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              AI-Generated Summary · Claude Haiku
            </div>
            <p className="ma-ai-text">{aiSummary}</p>
          </div>
        )}

        {/* ── Comps table ── */}
        {comps?.length > 0 && (
          <div className="ma-card">
            <div className="ma-card-title">Comparable Sales</div>
            <div className="ma-gold-rule" />
            <div className="ma-comps-scroll">
              <table className="ma-comps">
                <thead>
                  <tr>
                    <th>Address</th>
                    <th>Sold Price</th>
                    <th>Bd</th>
                    <th>Ba</th>
                    <th>Sq Ft</th>
                    <th>$/Sqft</th>
                    <th>Sold Date</th>
                    <th>Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {comps.map((c, i) => {
                    const ppsf =
                      c.price && c.squareFootage
                        ? "$" + Math.round(c.price / c.squareFootage)
                        : "—";
                    return (
                      <tr key={i}>
                        <td className="ma-comp-addr">{c.formattedAddress ?? "—"}</td>
                        <td className="ma-comp-price">{fmtDollar(c.price)}</td>
                        <td>{c.bedrooms ?? "—"}</td>
                        <td>{c.bathrooms ?? "—"}</td>
                        <td>{c.squareFootage?.toLocaleString() ?? "—"}</td>
                        <td>{ppsf}</td>
                        <td>{fmtDate(c.listedDate)}</td>
                        <td>{c.distance != null ? `${c.distance.toFixed(2)} mi` : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Save error ── */}
        {saveError && <p className="ma-save-error">{saveError}</p>}

        {/* ── Disclaimer ── */}
        <p className="ma-disclaimer">
          This report is generated using automated valuation models and publicly available comparable
          sales data. It is not a formal appraisal and should not be used as the sole basis for
          pricing decisions. Contact a licensed real estate agent for a comprehensive market
          evaluation.
        </p>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function MarketAnalysis() {
  const [phase, setPhase] = useState("input"); // input | loading | results | error
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

      if (!res.ok) {
        setErrorMsg(data.error || `Request failed (${res.status})`);
        setPhase("error");
        return;
      }

      setResults(data);
      setPhase("results");
    } catch (err) {
      setErrorMsg(err.message || "Network error — please try again");
      setPhase("error");
    }
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
      initialAddress={phase === "error" ? lastAddress : ""}
      initialEmail={phase === "error" ? lastEmail : ""}
      errorMsg={errorMsg}
    />
  );
}
