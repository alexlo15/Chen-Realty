// ListingDetail.jsx — Chen Realty
// Usage: <ListingDetail listing={yourListingObject} onBack={() => setPage('listings')} />
// Standalone: renders with SAMPLE_LISTING if no prop is passed.
// Wire into App.jsx: import ListingDetail + add a `detail` page state.

import { useState, useEffect, useCallback } from "react";
import "./ListingDetail.css";

// ─── SAMPLE DATA ──────────────────────────────────────────────────────────────

export const SAMPLE_LISTING = {
  id:        "SF5",
  status:    "Active",
  type:      "Single Family — Contemporary Colonial",
  address:   "Holmdel, NJ 07733",
  price:     779900,
  beds:      4,
  baths:     3,
  halfBaths: 2,
  sqft:      4200,
  lotSqft:   18750,
  yearBuilt: 1998,
  garage:    "2-Car",
  mls:       "22134567",
  taxes:     "$12,400 / yr",
  heating:   "Gas Forced Air",
  cooling:   "Central A/C",
  basement:  "Finished Walkout",
  style:     "Contemporary Colonial",
  school:    "Holmdel School District",
  hoa:       "None",
  parking:   "Driveway + 2-Car Garage",
  agent: {
    name:  "Cheng-Jen (Allen) Chen",
    title: "Broker-Associate, CRS, ABR",
    phone: "732.673.8882",
    email: "allenchen@chenrealty.com",
  },
  description: `This spacious, bright, and well-maintained contemporary custom home sits on a private cul-de-sac wooded lot — offering 4 bedrooms, 3 full baths, 2 half baths, and a finished walkout basement.

The dramatic sunken Living Room features a wood-burning fireplace and soaring cathedral ceilings. The Great Room boasts a wall of windows and sliders opening to a massive deck overlooking the wooded backyard. The gourmet Kitchen is appointed with custom cabinetry, granite countertops, stainless steel appliances, and a sun-drenched breakfast nook.

The spacious Family Room includes built-in shelving, perfect for a home library or media space. Upstairs, the Master Bedroom suite offers a generous walk-in closet and a fully updated spa-inspired bathroom. Additional highlights include beautiful paver walkways, professional landscaping, and a full-house generator.`,
  features: [
    "Wood-burning fireplace",
    "Full-house generator",
    "Cathedral ceilings",
    "Gourmet kitchen with granite",
    "Stainless steel appliances",
    "Master suite with walk-in closet",
    "Finished walkout basement",
    "Private wooded cul-de-sac lot",
    "Paver walkways & landscaping",
    "Wall of windows + deck access",
  ],
  // ↓ Replace with real listing photos — any aspect ratio works, recommended 3:2
  images: [
    { url: "https://picsum.photos/seed/chen-ext/1200/800",     caption: "Front Exterior"     },
    { url: "https://picsum.photos/seed/chen-living/1200/800",  caption: "Living Room"         },
    { url: "https://picsum.photos/seed/chen-kitchen/1200/800", caption: "Gourmet Kitchen"     },
    { url: "https://picsum.photos/seed/chen-master/1200/800",  caption: "Master Bedroom"      },
    { url: "https://picsum.photos/seed/chen-deck/1200/800",    caption: "Deck & Backyard"     },
    { url: "https://picsum.photos/seed/chen-basement/1200/800",caption: "Finished Basement"   },
  ],
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmt  = (n) => "$" + n.toLocaleString();
const sqft = (n) => n.toLocaleString() + " sf";
const ini  = (name) =>
  name.split(/[\s()]+/).filter(w => /^[A-Z]/.test(w)).slice(0, 2).map(w => w[0]).join("");

const STATUS_G  = { Active: "ld-gs-active",   Closed: "ld-gs-closed",   "Under Contract": "ld-gs-contract", Sold: "ld-gs-sold" };
const STATUS_MS = { Active: "ld-ms-active",   Closed: "ld-ms-closed",   "Under Contract": "ld-ms-contract", Sold: "ld-ms-sold" };
const STATUS_PB = { Active: "ld-pb-active",   Closed: "ld-pb-closed",   "Under Contract": "ld-pb-contract", Sold: "ld-pb-sold" };

// ─── LIGHTBOX ─────────────────────────────────────────────────────────────────

function Lightbox({ images, idx, onClose, onNav }) {
  const img = images[idx];

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowLeft")  onNav(-1);
      if (e.key === "ArrowRight") onNav(+1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onNav]);

  return (
    <div className="ld-lb" onClick={onClose}>
      <button className="ld-lb-close" onClick={onClose}>✕</button>
      <span className="ld-lb-counter">{idx + 1} / {images.length}</span>

      <div className="ld-lb-inner" onClick={e => e.stopPropagation()}>
        <div className="ld-lb-img-wrap">
          <img src={img.url} alt={img.caption} className="ld-lb-img" />
          {images.length > 1 && (
            <>
              <button className="ld-lb-arrow ld-lb-arrow-p" onClick={() => onNav(-1)}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button className="ld-lb-arrow ld-lb-arrow-n" onClick={() => onNav(+1)}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </>
          )}
        </div>
        {img.caption && <p className="ld-lb-caption">{img.caption}</p>}
        <div className="ld-lb-thumbs">
          {images.map((im, i) => (
            <div key={i} className={`ld-lb-thumb ${i === idx ? "on" : ""}`} onClick={() => onNav(i - idx)}>
              <img src={im.url} alt={im.caption} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── GALLERY ──────────────────────────────────────────────────────────────────

function Gallery({ images, price, address, status, onOpenLightbox }) {
  const [idx, setIdx] = useState(0);

  const go = useCallback((dir) => {
    setIdx(i => (i + dir + images.length) % images.length);
  }, [images.length]);

  const goTo = (i) => setIdx(i);

  return (
    <div className="ld-gallery-wrap">
      {/* ── Main image ── */}
      <div className="ld-gallery">
        {images.map((im, i) => (
          <img
            key={i}
            src={im.url}
            alt={im.caption}
            className={`ld-gimg ${i === idx ? "on" : ""}`}
            onClick={() => onOpenLightbox(idx)}
            draggable={false}
          />
        ))}

        {/* Status badge */}
        <span className={`ld-g-status ${STATUS_G[status] ?? "ld-gs-closed"}`}>{status}</span>

        {/* Photo count */}
        <button className="ld-g-count" onClick={() => onOpenLightbox(idx)}>
          ⊞ {images.length} photos
        </button>

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button className="ld-g-arrow ld-g-arrow-prev" onClick={() => go(-1)} aria-label="Previous photo">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="ld-g-arrow ld-g-arrow-next" onClick={() => go(+1)} aria-label="Next photo">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </>
        )}

        {/* Bottom overlay */}
        <div className="ld-g-overlay">
          <div className="ld-g-info">
            <div className="ld-g-price">{fmt(price)}</div>
            <div className="ld-g-addr">{address}</div>
          </div>
          <button className="ld-g-expand" onClick={() => onOpenLightbox(idx)}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            View all
          </button>
        </div>
      </div>

      {/* ── Dots ── */}
      {images.length > 1 && (
        <div className="ld-dots">
          {images.map((_, i) => (
            <div key={i} className={`ld-dot ${i === idx ? "on" : ""}`} onClick={() => goTo(i)} />
          ))}
        </div>
      )}

      {/* ── Thumbnails ── */}
      <div className="ld-thumbs">
        {images.map((im, i) => (
          <div key={i} className={`ld-thumb ${i === idx ? "on" : ""}`} onClick={() => goTo(i)}>
            {im.url
              ? <img src={im.url} alt={im.caption} loading="lazy" />
              : <div className="ld-thumb-ph">{im.caption}</div>
            }
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function ListingDetail({ listing = SAMPLE_LISTING, onBack }) {
  const [lbIdx, setLbIdx]       = useState(null); // null = closed
  const [descOpen, setDescOpen] = useState(false);

  const { images, status, price, address, type, beds, baths, halfBaths,
    sqft: sf, lotSqft, yearBuilt, garage, mls, taxes, heating, cooling,
    basement, style: propStyle, school, hoa, parking,
    agent, description, features, videoUrl } = listing;


  const openLb  = (i)   => setLbIdx(i);
  const closeLb = ()    => setLbIdx(null);
  const navLb   = useCallback((dir) => {
    setLbIdx(i => (i + dir + images.length) % images.length);
  }, [images.length]);

  const details = [
    { l: "MLS #",       v: mls        },
    { l: "Property Type", v: propStyle ?? type },
    { l: "Year Built",  v: yearBuilt  },
    { l: "Square Feet", v: sqft(sf)   },
    { l: "Lot Size",    v: sqft(lotSqft) },
    { l: "Garage",      v: garage     },
    { l: "Heating",     v: heating    },
    { l: "Cooling",     v: cooling    },
    { l: "Basement",    v: basement   },
    { l: "Parking",     v: parking    },
    { l: "School Dist.",v: school     },
    { l: "Taxes",       v: taxes      },
    { l: "HOA",         v: hoa        },
  ];

  const bathLabel = baths + (halfBaths ? `  ·  ${halfBaths} half` : "");

  return (
    <div className="ld-root">

      {/* ── Top navigation bar ── */}
      <div className="ld-topbar">
        <button className="ld-back" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Listings
        </button>
        <span className="ld-topbar-crumb">{address}</span>
      </div>

      {/* ── Gallery ── */}
      <Gallery
        images={images}
        price={price}
        address={address}
        status={status}
        onOpenLightbox={openLb}
      />

      {/* ── Body ── */}
      <div className="ld-body">

        {/* ── Main column ── */}
        <div className="ld-main">

          {/* Mobile-only price header */}
          <div className="ld-mobile-header">
            <span className={`ld-mh-status ${STATUS_MS[status] ?? "ld-ms-closed"}`}>{status}</span>
            <div className="ld-mh-price">{fmt(price)}</div>
            <div className="ld-mh-addr">{type} · {address}</div>
          </div>

          {/* ── Quick stats bar ── */}
          <div className="ld-stats">
            <div className="ld-stat">
              <span className="ld-stat-icon">🛏</span>
              <span className="ld-stat-val">{beds}</span>
              <span className="ld-stat-lbl">Beds</span>
            </div>
            <div className="ld-stat">
              <span className="ld-stat-icon">🚿</span>
              <span className="ld-stat-val">{baths}</span>
              <span className="ld-stat-lbl">Baths</span>
            </div>
            {halfBaths > 0 && (
              <div className="ld-stat">
                <span className="ld-stat-icon">🚽</span>
                <span className="ld-stat-val">{halfBaths}</span>
                <span className="ld-stat-lbl">Half Bath</span>
              </div>
            )}
            <div className="ld-stat">
              <span className="ld-stat-icon">📐</span>
              <span className="ld-stat-val">{sf.toLocaleString()}</span>
              <span className="ld-stat-lbl">Sq Ft</span>
            </div>
            <div className="ld-stat">
              <span className="ld-stat-icon">🌿</span>
              <span className="ld-stat-val">{(lotSqft / 43560).toFixed(2)}</span>
              <span className="ld-stat-lbl">Acres</span>
            </div>
            <div className="ld-stat">
              <span className="ld-stat-icon">🏗</span>
              <span className="ld-stat-val">{yearBuilt}</span>
              <span className="ld-stat-lbl">Built</span>
            </div>
          </div>

          {/* ── Video tour ── */}
          {videoUrl && (
            <div className="ld-card ld-video-card">
              <div className="ld-card-title">Video Tour</div>
              <div className="ld-gold-rule" />
              <video className="ld-video" src={videoUrl} controls playsInline />
            </div>
          )}

          {/* ── Description ── */}
          <div className="ld-card">
            <div className="ld-card-title">About This Property</div>
            <div className="ld-gold-rule" />
            <div className={`ld-desc ${descOpen ? "expanded" : "collapsed"}`}>{description}</div>
            <button className="ld-read-more" onClick={() => setDescOpen(o => !o)}>
              {descOpen ? "Show less ↑" : "Read more ↓"}
            </button>
          </div>

          {/* ── Features / Highlights ── */}
          {features?.length > 0 && (
            <div className="ld-card">
              <div className="ld-card-title">Highlights</div>
              <div className="ld-gold-rule" />
              <div className="ld-features">
                {features.map((f, i) => (
                  <div key={i} className="ld-feat">
                    <div className="ld-feat-dot" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Property Details ── */}
          <div className="ld-card">
            <div className="ld-card-title">Property Details</div>
            <div className="ld-gold-rule" />
            <div className="ld-details">
              {details.filter(d => d.v).map((d, i) => (
                <div key={i} className="ld-drow">
                  <div className="ld-dl">{d.l}</div>
                  <div className="ld-dv">{d.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Mobile agent card ── */}
          <div className="ld-card" style={{ display: "block" }}>
            <div className="ld-card-title">Listing Agent</div>
            <div className="ld-gold-rule" />
            <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1.1rem" }}>
              <div className="ld-agent-av">{ini(agent.name)}</div>
              <div>
                <div className="ld-agent-name">{agent.name}</div>
                <div className="ld-agent-creds">{agent.title}</div>
                <a href={`tel:${agent.phone.replace(/\D/g,'')}`} className="ld-agent-tel">{agent.phone}</a>
              </div>
            </div>
            <button className="ld-cta-a" onClick={() => window.location.href = `tel:${agent.phone.replace(/\D/g,'')}`}>
              Schedule a Tour
            </button>
            <button className="ld-cta-b" onClick={() => window.location.href = `mailto:${agent.email}`}>
              Send a Message
            </button>
          </div>

        </div>{/* /ld-main */}

        {/* ── Sidebar (desktop only) ── */}
        <aside className="ld-sidebar">
          <div className="ld-pcard">

            {/* Dark header */}
            <div className="ld-pcard-head">
              <span className={`ld-pcard-badge ${STATUS_PB[status] ?? "ld-pb-closed"}`}>{status}</span>
              <div className="ld-pcard-price">{fmt(price)}</div>
              <div className="ld-pcard-addr">{type}<br />{address}</div>
            </div>

            {/* Body */}
            <div className="ld-pcard-body">

              {/* 3-col mini stats */}
              <div className="ld-ss">
                <div className="ld-ss-col">
                  <div className="ld-ss-val">{beds}</div>
                  <div className="ld-ss-lbl">Beds</div>
                </div>
                <div className="ld-ss-col">
                  <div className="ld-ss-val">{baths}</div>
                  <div className="ld-ss-lbl">Baths</div>
                </div>
                <div className="ld-ss-col">
                  <div className="ld-ss-val">{(sf / 1000).toFixed(1)}k</div>
                  <div className="ld-ss-lbl">Sq Ft</div>
                </div>
              </div>

              {/* CTAs */}
              <button className="ld-cta-a" onClick={() => window.location.href = `tel:${agent.phone.replace(/\D/g,'')}`}>
                Schedule a Tour
              </button>
              <button className="ld-cta-b" onClick={() => window.location.href = `mailto:${agent.email}`}>
                Send a Message
              </button>

              {/* Agent */}
              <div className="ld-agent">
                <div className="ld-agent-av">{ini(agent.name)}</div>
                <div>
                  <div className="ld-agent-name">{agent.name}</div>
                  <div className="ld-agent-creds">{agent.title}</div>
                  <a href={`tel:${agent.phone.replace(/\D/g,'')}`} className="ld-agent-tel">{agent.phone}</a>
                </div>
              </div>

            </div>
          </div>
        </aside>

      </div>{/* /ld-body */}

      {/* ── Mobile sticky bottom bar ── */}
      <div className="ld-floatbar">
        <div>
          <div className="ld-fb-price">{fmt(price)}</div>
          <div className="ld-fb-status">{type}</div>
        </div>
        <button className="ld-fb-btn" onClick={() => window.location.href = `tel:${agent.phone.replace(/\D/g,'')}`}>
          Contact Agent
        </button>
      </div>

      {/* ── Lightbox ── */}
      {lbIdx !== null && (
        <Lightbox
          images={images}
          idx={lbIdx}
          onClose={closeLb}
          onNav={navLb}
        />
      )}

    </div>
  );
}
