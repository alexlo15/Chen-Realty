// Chen Realty — chen-realty.com
import { useState, useEffect, Component } from "react";
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useParams, useLocation, useSearchParams, Navigate } from "react-router-dom";
import ListingDetail from "./ListingDetail";
import "./App.css";

// ─── ERROR BOUNDARY ───────────────────────────────────────────────────────────

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: "3rem 2rem", textAlign: "center" }}>
          <p style={{ color: "#888", marginBottom: "1rem" }}>Something went wrong loading this page.</p>
          <button className="btn-outline" onClick={() => this.setState({ error: null })}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
      {!err && l.img ? (
        <img src={l.img} alt={`${l.type} in ${l.location}`} className="listing-img" onError={() => setErr(true)} loading="lazy" />
      ) : (
        <div className="listing-img-ph">No Photo</div>
      )}
      <div className="listing-body">
        <span className={`listing-status ${statusClass(l.status)}`}>{l.status}</span>
        <div className="listing-location">{l.location}</div>
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
  { to: "/agents", label: "Agents" },
  { to: "/resources", label: "Resources" },
  { to: "/contact", label: "Contact" },
];

function NavBar({ menuOpen, setMenuOpen }) {
  const close = () => setMenuOpen(false);

  return (
    <nav className="nav">
      <NavLink to="/" className="nav-brand" onClick={close}>
        <span className="nav-brand-en">Chen Realty</span>
        <span className="nav-brand-zh">陈氏地产</span>
      </NavLink>

      <button
        className={`nav-hamburger ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen((o) => !o)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
      >
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

function Footer({ site }) {
  const { contact, footer } = site;
  return (
    <footer className="footer">
      <div className="footer-brand">{footer.tagline}</div>
      <div className="footer-addr">
        {contact.address}
        <br />
        {contact.phone} ·{" "}
        <a href={`mailto:${contact.email}`} style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
          {contact.email}
        </a>
      </div>
      <div className="footer-copy">
        © {new Date().getFullYear()} Chen Realty. {footer.legal} {footer.built}
      </div>
    </footer>
  );
}

// ─── PAGES ───────────────────────────────────────────────────────────────────

function HomePage({ site, listings }) {
  const navigate = useNavigate();

  const byCategory = (cat) => listings.filter((l) => l.category === cat);
  const featured = listings.slice(0, 4);

  return (
    <>
      <section className="hero">
        <div className="hero-eyebrow">{site.hero.eyebrow}</div>
        <h1 className="hero-title">{site.hero.title}</h1>
        <p className="hero-subtitle">{site.hero.subtitle}</p>
        <button className="btn-primary" onClick={() => navigate("/listings")}>
          {site.hero.cta}
        </button>
        <div className="hero-stats">
          {site.stats.map((s) => (
            <div key={s.label} className="hero-stat">
              <div className="hero-stat-num">{s.num}</div>
              <div className="hero-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-white">
        <div className="section-title">{site.services.heading}</div>
        <div className="section-divider" />
        <p className="section-lead">{site.services.lead}</p>
        <div className="services-grid">
          {[
            { name: "Single Family",    category: "singleFamily" },
            { name: "Commercial",       category: "commercial"   },
            { name: "Townhome / Multi", category: "townhomes"    },
            { name: "Rentals",          category: "rentals"      },
          ].map((s) => (
            <div key={s.name} className="service-card" onClick={() => navigate(`/listings?category=${s.category}`)}>
              <div className="service-name">{s.name}</div>
              <div className="service-count">{byCategory(s.category).length} listings</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-title">{site.featured.heading}</div>
        <div className="section-divider" />
        <div className="listings-grid">
          {featured.map((l) => (
            <ListingCard key={l.id} l={l} onViewListing={(l) => navigate(`/listings/${l.id}`)} />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <button className="btn-outline" onClick={() => navigate("/listings")}>
            {site.featured.cta}
          </button>
        </div>
      </section>

      <section className="about-strip">
        <div className="section-title section-title-light">{site.about.heading}</div>
        <div className="section-divider" />
        <p className="about-text">{site.about.body}</p>
        <div className="lang-pills">
          {site.contact.languages.map((l) => (
            <span key={l} className="lang-pill">
              {l}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}

function ListingsPage({ listings, onViewListing }) {
  const tabs = [
    { id: "singleFamily", label: "Single Family" },
    { id: "commercial",   label: "Commercial"   },
    { id: "townhomes",    label: "Townhome / Multi" },
    { id: "rentals",      label: "Rentals"      },
  ];
  const [searchParams] = useSearchParams();
  const validIds = tabs.map((t) => t.id);
  const initial = searchParams.get("category");
  const [tab, setTab] = useState(validIds.includes(initial) ? initial : "singleFamily");
  const active = listings.filter((l) => l.category === tab);

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
        {active.length === 0 ? (
          <div className="listings-empty">Nothing to see now. More coming soon!</div>
        ) : (
          <div className="listings-grid">
            {active.map((l) => (
              <ListingCard key={l.id} l={l} onViewListing={onViewListing} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function ListingDetailRoute({ listings }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setDetail(null);
    setNotFound(false);
    fetch(`/data/listings/${id}.json`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then(setDetail)
      .catch(() => setNotFound(true));
  }, [id]);

  useEffect(() => {
    if (notFound) navigate("/listings", { replace: true });
  }, [notFound, navigate]);

  if (!detail) {
    return (
      <div className="app-loading">
        <div className="app-loading-brand">Chen Realty</div>
        <div className="app-loading-sub">Loading…</div>
      </div>
    );
  }

  return <ListingDetail listing={toDetailListing(detail)} onBack={() => navigate("/listings")} />;
}

function AgentsPage() {
  const [agents, setAgents] = useState(null);

  useEffect(() => {
    fetch("/data/agents.json")
      .then((r) => r.json())
      .then(setAgents)
      .catch(() => console.error("Could not load agents.json"));
  }, []);

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

  if (!agents) {
    return (
      <div className="app-loading">
        <div className="app-loading-brand">Chen Realty</div>
        <div className="app-loading-sub">Loading…</div>
      </div>
    );
  }

  const brokers = agents.filter((a) => a.broker);
  const assoc = agents.filter((a) => !a.broker);

  return (
    <>
      <div className="page-header">
        <div className="page-header-title">Our Agents</div>
        <div className="page-header-sub">Meet our experienced team of {agents.length} licensed professionals</div>
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

function ResourcesPage({ site }) {
  return (
    <>
      <div className="page-header">
        <div className="page-header-title">Resources</div>
        <div className="page-header-sub">Useful links for buyers, sellers, and renters</div>
      </div>
      <div className="section">
        <div className="resource-group">
          <div className="resource-group-title">Educational &amp; Training Tools</div>
          {site.resources.educational.map((r) => (
            <a key={r.url} href={r.url} className="resource-link" target="_blank" rel="noopener noreferrer">
              {r.label}
            </a>
          ))}
        </div>
        <div className="resource-group">
          <div className="resource-group-title">NJ Municipality Information</div>
          {site.resources.municipal.map((r) => (
            <a key={r.url} href={r.url} className="resource-link" target="_blank" rel="noopener noreferrer">
              {r.label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

function ContactPage({ site }) {
  const { contact } = site;
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [fields, setFields] = useState({ name: "", email: "", phone: "", message: "" });

  const set = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("https://formsubmit.co/ajax/loalexander389@gmail.com", {
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
              { label: "Address",   value: contact.address },
              { label: "Phone",     value: <a href={`tel:${contact.phone.replace(/\D/g, "")}`}>{contact.phone}</a> },
              { label: "Email",     value: <a href={`mailto:${contact.email}`}>{contact.email}</a> },
              { label: "Area",      value: contact.serviceArea },
              { label: "Languages", value: contact.languages.join(" · ") },
              { label: "Est.",      value: contact.established },
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
                    <label className="form-label" htmlFor="cf-name">Name *</label>
                    <input id="cf-name" className="form-input" type="text" required value={fields.name} onChange={set("name")} placeholder="Your name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="cf-email">Email *</label>
                    <input id="cf-email" className="form-input" type="email" required value={fields.email} onChange={set("email")} placeholder="you@example.com" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cf-phone">Phone (optional)</label>
                  <input id="cf-phone" className="form-input" type="tel" value={fields.phone} onChange={set("phone")} placeholder="732-555-0100" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cf-message">Message *</label>
                  <textarea id="cf-message" className="form-textarea" required value={fields.message} onChange={set("message")} placeholder="How can we help you?" />
                </div>
                {status === "error" && (
                  <p className="form-feedback error">Something went wrong. Please try again or call us directly.</p>
                )}
                <button className="form-submit" type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── APP SHELL (inside BrowserRouter) ────────────────────────────────────────

function AppShell() {
  const [site, setSite] = useState(null);
  const [listings, setListings] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch("/data/site.json").then((r) => r.json()),
      fetch("/data/listings/index.json").then((r) => r.json()),
    ])
      .then(([siteData, listingsData]) => {
        setSite(siteData);
        setListings(listingsData);
      })
      .catch(() => console.error("Could not load site data"));
  }, []);

  if (!site || !listings) {
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
        <ErrorBoundary>
          <Routes>
            <Route path="/"           element={<HomePage site={site} listings={listings} />} />
            <Route path="/listings"   element={<ListingsPage listings={listings} onViewListing={(l) => navigate(`/listings/${l.id}`)} />} />
            <Route path="/listings/:id" element={<ListingDetailRoute listings={listings} />} />
            <Route path="/agents"     element={<AgentsPage />} />
            <Route path="/resources"  element={<ResourcesPage site={site} />} />
            <Route path="/contact"    element={<ContactPage site={site} />} />
            <Route path="*"           element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <Footer site={site} />
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
