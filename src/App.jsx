// Chen Realty — chen-realty.com
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useParams, useLocation, Navigate } from "react-router-dom";
import ListingDetail from "./ListingDetail";
import "./App.css";

// ─── GLOBAL STYLES (moved to App.css) ────────────────────────────────────────

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function initials(name) {
  return name
    .split(/[\s()]+/)
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

function statusClass(s) {
  return { Active: "s-active", Closed: "s-closed", "Under Contract": "s-contract", Sold: "s-sold", Withdrawn: "s-withdrawn" }[s] ?? "s-closed";
}

function toDetailListing(l) {
  const priceNum = typeof l.price === "number" ? l.price : parseInt(l.price.replace(/[^0-9]/g, ""), 10) || 0;
  return {
    ...l,
    price: priceNum,
    address: l.address ?? l.location,
    description: l.description ?? l.desc ?? "",
    images: l.images ?? (l.img ? [{ url: l.img, caption: l.type }] : [{ url: "", caption: "No photo" }]),
    beds: l.beds ?? 0,
    baths: l.baths ?? 0,
    halfBaths: l.halfBaths ?? 0,
    sqft: l.sqft ?? 0,
    lotSqft: l.lotSqft ?? 0,
    yearBuilt: l.yearBuilt ?? "",
    agent: l.agent ?? { name: "Chen Realty", title: "Broker", phone: "732.957.8889", email: "allenchen@chenrealty.com" },
  };
}

// ─── SCROLL TO TOP ON ROUTE CHANGE ───────────────────────────────────────────

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

function ListingCard({ l, onViewListing }) {
  const [err, setErr] = useState(false);
  return (
    <div className="listing-card" onClick={() => onViewListing?.(l)} style={{ cursor: onViewListing ? "pointer" : "default" }}>
      {!err && l.img ? <img src={l.img} alt={`${l.type} in ${l.location}`} className="listing-img" onError={() => setErr(true)} loading="lazy" /> : <div className="listing-img-ph">🏠</div>}
      <div className="listing-body">
        <span className={`listing-status ${statusClass(l.status)}`}>{l.status}</span>
        <div className="listing-location">📍 {l.location}</div>
        <div className="listing-type">{l.type}</div>
        <div className="listing-price">{l.price}</div>
        <div className="listing-desc">{l.desc}</div>
        {onViewListing && <button className="listing-view-btn">View Details →</button>}
      </div>
    </div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/listings", label: "Listings" },
  { to: "/agents", label: "Our Agents" },
  { to: "/resources", label: "Resources" },
  { to: "/contact", label: "Contact" },
];

function NavBar({ menuOpen, setMenuOpen }) {
  const navigate = useNavigate();
  const close = () => setMenuOpen(false);

  return (
    <nav className="nav">
      <NavLink to="/" className="nav-brand" onClick={close}>
        <span className="nav-brand-en">Chen Realty</span>
        <span className="nav-brand-zh">陈氏地产</span>
      </NavLink>

      <button className={`nav-hamburger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen((o) => !o)} aria-label={menuOpen ? "Close menu" : "Open menu"}>
        <span />
        <span />
        <span />
      </button>

      <div className={`nav-menu ${menuOpen ? "open" : ""}`}>
        {NAV_ITEMS.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} onClick={close}>
            {n.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────

function Footer({ config }) {
  return (
    <footer className="footer">
      <div className="footer-brand">Chen Realty · 陈氏地产</div>
      <div className="footer-addr">
        {config.address}
        <br />
        {config.phone} ·{" "}
        <a href={`mailto:${config.email}`} style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
          {config.email}
        </a>
      </div>
      <div className="footer-copy">© {new Date().getFullYear()} Chen Realty. All rights reserved. Licensed in New Jersey.</div>
    </footer>
  );
}

// ─── PAGES ───────────────────────────────────────────────────────────────────

function HomePage({ data }) {
  const navigate = useNavigate();
  const { singleFamily, commercial } = data.listings;

  const featured = [...singleFamily.filter((l) => l.status === "Active"), ...commercial.filter((l) => l.status === "Active")].slice(0, 4);

  return (
    <>
      <section className="hero">
        <div className="hero-eyebrow">Chen Realty · 陈氏地产 · Est. 1989</div>
        <h1 className="hero-title">Trusted New Jersey Real Estate</h1>
        <p className="hero-subtitle">Full-service residential and commercial brokerage serving Central and Northern New Jersey. Multilingual agents. Personalized service. Three decades of expertise.</p>
        <button className="btn-primary" onClick={() => navigate("/listings")}>
          Browse Listings
        </button>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-num">35+</div>
            <div className="hero-stat-label">Years in NJ</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num">{data.agents.length}</div>
            <div className="hero-stat-label">Agents</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num">4</div>
            <div className="hero-stat-label">Languages</div>
          </div>
        </div>
      </section>

      <section className="section section-white">
        <div className="section-title">What We Offer</div>
        <div className="section-divider" />
        <p className="section-lead">Whether you're searching for a single family home, condo, commercial property, or vacant lot, our agents provide customized service to ensure a timely sale or purchase at the best price.</p>
        <div className="services-grid">
          {[
            { icon: "🏡", name: "Single Family", count: `${singleFamily.length} listings` },
            { icon: "🏢", name: "Commercial", count: `${data.listings.commercial.length} listings` },
            { icon: "🏘️", name: "Townhome / Multi", count: `${data.listings.townhomes.length} listings` },
            { icon: "🔑", name: "Rentals", count: `${data.listings.rentals.length} listings` },
          ].map((s) => (
            <div key={s.name} className="service-card" onClick={() => navigate("/listings")}>
              <div className="service-icon">{s.icon}</div>
              <div className="service-name">{s.name}</div>
              <div className="service-count">{s.count}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-title">Featured Listings</div>
        <div className="section-divider" />
        <div className="listings-grid">
          {featured.map((l) => (
            <ListingCard key={l.id} l={l} />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <button className="btn-outline" onClick={() => navigate("/listings")}>
            View All Listings →
          </button>
        </div>
      </section>

      <section className="about-strip">
        <div className="section-title section-title-light">About Chen Realty</div>
        <div className="section-divider" />
        <p className="about-text">Established in 1989, Chen Realty is a full-service residential and commercial real estate brokerage firm servicing Central and Northern New Jersey. With over 20 agents with extensive industry training and expertise, we guarantee to be a trustworthy and knowledgeable resource to guide you through the buying, renting, or selling process.</p>
        <div className="lang-pills">
          {data.config.languages.map((l) => (
            <span key={l} className="lang-pill">
              {l}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}

function ListingsPage({ data, onViewListing }) {
  const { singleFamily, commercial, townhomes, rentals } = data.listings;
  const tabs = [
    { id: "sf", label: "Single Family", data: singleFamily },
    { id: "co", label: "Commercial", data: commercial },
    { id: "tm", label: "Townhome / Multi", data: townhomes },
    { id: "re", label: "Rentals", data: rentals },
  ];
  const [tab, setTab] = useState("sf");
  const active = tabs.find((t) => t.id === tab);

  return (
    <>
      <div className="page-header">
        <div className="page-header-title">Listings</div>
        <div className="page-header-sub">Current and recent properties · Updated regularly</div>
      </div>
      <div className="section">
        <div className="listing-filters">
          {tabs.map((t) => (
            <button key={t.id} className={`filter-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="listings-grid">
          {active.data.map((l) => (
            <ListingCard key={l.id} l={l} onViewListing={onViewListing} />
          ))}
        </div>
      </div>
    </>
  );
}

function ListingDetailRoute({ data }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const allListings = [...data.listings.singleFamily, ...data.listings.commercial, ...data.listings.townhomes, ...data.listings.rentals];
  const listing = allListings.find((l) => l.id === id);

  useEffect(() => {
    if (!listing) navigate("/listings", { replace: true });
  }, [listing, navigate]);

  if (!listing) return null;

  return <ListingDetail listing={toDetailListing(listing)} onBack={() => navigate("/listings")} />;
}

function AgentsPage({ data }) {
  const brokers = data.agents.filter((a) => a.broker);
  const assoc = data.agents.filter((a) => !a.broker);

  const AgentCard = ({ a }) => (
    <div className="agent-card">
      <div className={`agent-avatar ${a.broker ? "is-broker" : ""}`}>{initials(a.name)}</div>
      <div style={{ minWidth: 0 }}>
        <div className="agent-name">{a.name}</div>
        <div className="agent-role">{a.role}</div>
        {a.credentials && <div className="agent-creds">{a.credentials}</div>}
        <div className="agent-phone">{a.phone}</div>
        {a.email && (
          <div className="agent-email">
            <a href={`mailto:${a.email}`}>{a.email}</a>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="page-header">
        <div className="page-header-title">Our Agents</div>
        <div className="page-header-sub">Meet our experienced team of {data.agents.length} licensed professionals</div>
      </div>
      <div className="section section-white">
        <div className="section-title">Brokerage Leadership</div>
        <div className="section-divider" />
        <div className="agents-grid" style={{ marginBottom: "2rem" }}>
          {brokers.map((a) => (
            <AgentCard key={a.name} a={a} />
          ))}
        </div>
        <div className="section-title">Sales Associates</div>
        <div className="section-divider" />
        <div className="agents-grid">
          {assoc.map((a) => (
            <AgentCard key={a.name} a={a} />
          ))}
        </div>
      </div>
    </>
  );
}

function ResourcesPage({ data }) {
  return (
    <>
      <div className="page-header">
        <div className="page-header-title">Resources</div>
        <div className="page-header-sub">Useful links for buyers, sellers, and renters</div>
      </div>
      <div className="section">
        <div className="resource-group">
          <div className="resource-group-title">Educational &amp; Training Tools</div>
          {data.resources.educational.map((r) => (
            <a key={r.url} href={r.url} className="resource-link" target="_blank" rel="noopener noreferrer">
              {r.label}
            </a>
          ))}
        </div>
        <div className="resource-group">
          <div className="resource-group-title">NJ Municipality Information</div>
          {data.resources.municipal.map((r) => (
            <a key={r.url} href={r.url} className="resource-link" target="_blank" rel="noopener noreferrer">
              {r.label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

function ContactPage({ config }) {
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [fields, setFields] = useState({ name: "", email: "", phone: "", message: "" });

  const set = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch(`https://formspree.io/f/${config.formspreeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(fields),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-title">Contact Us</div>
        <div className="page-header-sub">We'd love to hear from you</div>
      </div>
      <div className="section">
        <div className="contact-layout">
          <div className="contact-card">
            {[
              { label: "Address", value: config.address },
              { label: "Phone", value: <a href={`tel:${config.phone.replace(/\D/g, "")}`}>{config.phone}</a> },
              { label: "Email", value: <a href={`mailto:${config.email}`}>{config.email}</a> },
              { label: "Area", value: config.serviceArea },
              { label: "Languages", value: config.languages.join(" · ") },
              { label: "Est.", value: config.established },
            ].map((r) => (
              <div key={r.label} className="contact-row">
                <span className="contact-label">{r.label}</span>
                <span className="contact-value">{r.value}</span>
              </div>
            ))}
          </div>

          <div className="contact-form-wrap">
            <div className="contact-form-title">Send Us a Message</div>
            <div className="section-divider" style={{ marginBottom: 0 }} />

            {status === "done" ? (
              <p className="form-feedback success" style={{ marginTop: "1.25rem" }}>
                Thank you! We'll be in touch shortly.
              </p>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="cf-name">
                      Name *
                    </label>
                    <input id="cf-name" className="form-input" type="text" required value={fields.name} onChange={set("name")} placeholder="Your name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="cf-email">
                      Email *
                    </label>
                    <input id="cf-email" className="form-input" type="email" required value={fields.email} onChange={set("email")} placeholder="you@example.com" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cf-phone">
                    Phone (optional)
                  </label>
                  <input id="cf-phone" className="form-input" type="tel" value={fields.phone} onChange={set("phone")} placeholder="732-555-0100" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cf-message">
                    Message *
                  </label>
                  <textarea id="cf-message" className="form-textarea" required value={fields.message} onChange={set("message")} placeholder="How can we help you?" />
                </div>
                {status === "error" && <p className="form-feedback error">Something went wrong. Please try again or call us directly.</p>}
                <button className="form-submit" type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
        {/* /contact-layout */}
      </div>
    </>
  );
}

// ─── APP SHELL (inside BrowserRouter) ────────────────────────────────────────

function AppShell() {
  const [data, setData] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/listings.json")
      .then((r) => r.json())
      .then(setData)
      .catch(() => console.error("Could not load listings.json"));
  }, []);

  if (!data) {
    return (
      <div className="app-loading">
        <div className="app-loading-brand">Chen Realty</div>
        <div className="app-loading-sub">Loading…</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <ScrollToTop />
      <NavBar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage data={data} />} />
          <Route path="/listings" element={<ListingsPage data={data} onViewListing={(l) => navigate(`/listings/${l.id}`)} />} />
          <Route path="/listings/:id" element={<ListingDetailRoute data={data} />} />
          <Route path="/agents" element={<AgentsPage data={data} />} />
          <Route path="/resources" element={<ResourcesPage data={data} />} />
          <Route path="/contact" element={<ContactPage config={data.config} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer config={data.config} />
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
