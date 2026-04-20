// Chen Realty — chen-realty.com
// Drop this into a Vite + React project as src/App.jsx
// No external dependencies beyond React itself.

import { useState, useEffect } from "react";
import ListingDetail from "./ListingDetail";

// ─── GLOBAL STYLES ───────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy:        #1B2A4A;
    --navy-mid:    #243660;
    --navy-light:  #2D4275;
    --gold:        #B8963E;
    --gold-light:  #D4AF5C;
    --gold-pale:   #F5EDD8;
    --cream:       #F8F6F2;
    --white:       #FFFFFF;
    --text:        #1C1C1C;
    --muted:       #6B7280;
    --border:      #E5E0D8;
    --font-serif:  'Playfair Display', Georgia, 'Times New Roman', serif;
    --font-sans:   'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    --radius:      8px;
    --radius-lg:   14px;
    --shadow-sm:   0 1px 3px rgba(0,0,0,0.07), 0 1px 6px rgba(0,0,0,0.04);
    --shadow:      0 2px 8px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.05);
    --shadow-hover:0 6px 20px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
  }

  html  { scroll-behavior: smooth; }
  body  { font-family: var(--font-sans); color: var(--text); background: var(--cream); -webkit-font-smoothing: antialiased; }
  button { font-family: var(--font-sans); cursor: pointer; }

  /* ─── NAV ─────────────────────────────────────────────── */
  .nav {
    position: sticky; top: 0; z-index: 200;
    background: var(--navy);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 1.25rem; height: 64px;
    box-shadow: 0 2px 16px rgba(0,0,0,0.25);
  }
  .nav-brand { display: flex; flex-direction: column; cursor: pointer; user-select: none; }
  .nav-brand-en {
    font-family: var(--font-serif); font-size: 1.15rem; font-weight: 700;
    color: var(--white); letter-spacing: 0.02em; line-height: 1.2;
  }
  .nav-brand-zh { font-size: 0.62rem; color: var(--gold-light); letter-spacing: 0.14em; margin-top: 1px; }

  .nav-hamburger {
    display: flex; flex-direction: column; justify-content: center; gap: 5px;
    width: 36px; height: 36px; padding: 6px;
    border: none; background: none;
  }
  .nav-hamburger span {
    display: block; width: 20px; height: 2px;
    background: rgba(255,255,255,0.85); border-radius: 2px;
    transition: transform 0.22s ease, opacity 0.22s ease;
  }
  .nav-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .nav-hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .nav-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

  .nav-menu {
    display: none;
    position: absolute; top: 64px; left: 0; right: 0;
    background: var(--navy-mid);
    padding: 0.5rem 0 0.75rem;
    box-shadow: 0 12px 32px rgba(0,0,0,0.25);
    animation: slideDown 0.18s ease;
  }
  .nav-menu.open { display: block; }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .nav-item {
    display: block; width: 100%; padding: 0.75rem 1.5rem;
    color: rgba(255,255,255,0.8); font-size: 0.875rem; font-weight: 500;
    border: none; background: none; text-align: left; letter-spacing: 0.01em;
    transition: color 0.15s, background 0.15s;
  }
  .nav-item:hover { color: var(--gold-light); background: rgba(255,255,255,0.06); }
  .nav-item.active { color: var(--gold-light); }

  @media (min-width: 768px) {
    .nav-hamburger { display: none; }
    .nav-menu {
      display: flex !important; position: static;
      background: none; padding: 0; box-shadow: none;
      gap: 0.125rem; align-items: center;
      animation: none;
    }
    .nav-item { padding: 0.4rem 0.75rem; border-radius: 6px; }
    .nav-item.active { background: rgba(255,255,255,0.1); }
  }

  /* ─── HERO ────────────────────────────────────────────── */
  .hero {
    background: var(--navy);
    padding: 3.5rem 1.5rem 3.25rem;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 120%, rgba(184,150,62,0.18) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-eyebrow {
    font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--gold-light); margin-bottom: 0.9rem; font-weight: 600;
  }
  .hero-title {
    font-family: var(--font-serif); font-size: clamp(1.75rem, 6vw, 2.6rem);
    font-weight: 700; color: var(--white); line-height: 1.18;
    margin-bottom: 1rem; max-width: 520px; margin-left: auto; margin-right: auto;
  }
  .hero-subtitle {
    font-size: 0.925rem; color: rgba(255,255,255,0.7); line-height: 1.65;
    max-width: 460px; margin: 0 auto 1.75rem; font-weight: 300;
  }
  .btn-primary {
    display: inline-block;
    background: var(--gold); color: var(--white);
    font-weight: 600; font-size: 0.875rem; letter-spacing: 0.03em;
    padding: 0.75rem 2rem; border-radius: var(--radius);
    border: none; cursor: pointer;
    transition: background 0.2s, transform 0.15s;
  }
  .btn-primary:hover { background: var(--gold-light); transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); }
  .btn-outline {
    display: inline-block;
    background: transparent; color: var(--navy);
    font-weight: 600; font-size: 0.875rem; letter-spacing: 0.02em;
    padding: 0.7rem 1.75rem; border-radius: var(--radius);
    border: 1.5px solid var(--navy); cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .btn-outline:hover { background: var(--navy); color: var(--white); }
  .hero-stats {
    display: flex; gap: 2rem; justify-content: center;
    margin-top: 2.25rem; flex-wrap: wrap;
  }
  .hero-stat { text-align: center; }
  .hero-stat-num {
    font-family: var(--font-serif); font-size: 1.9rem;
    color: var(--gold-light); font-weight: 700; line-height: 1;
  }
  .hero-stat-label {
    font-size: 0.67rem; color: rgba(255,255,255,0.5);
    letter-spacing: 0.12em; text-transform: uppercase; margin-top: 0.3rem;
  }

  /* ─── SECTION ─────────────────────────────────────────── */
  .section { padding: 2.5rem 1.25rem; }
  .section-white { background: var(--white); }
  .section-navy { background: var(--navy); }
  .section-title {
    font-family: var(--font-serif); font-size: 1.55rem;
    font-weight: 700; color: var(--navy); line-height: 1.25;
  }
  .section-title-light { color: var(--white); }
  .section-divider {
    width: 36px; height: 3px; background: var(--gold);
    border-radius: 2px; margin: 0.6rem 0 1.5rem;
  }
  .section-lead {
    font-size: 0.9rem; color: var(--muted); line-height: 1.7;
    margin-bottom: 1.5rem;
  }

  /* ─── PAGE HEADER ─────────────────────────────────────── */
  .page-header {
    background: var(--navy);
    padding: 2rem 1.25rem 1.75rem;
    border-bottom: 3px solid var(--gold);
  }
  .page-header-title {
    font-family: var(--font-serif); font-size: 1.9rem;
    color: var(--white); font-weight: 700;
  }
  .page-header-sub {
    font-size: 0.83rem; color: rgba(255,255,255,0.55);
    margin-top: 0.3rem; font-weight: 400;
  }

  /* ─── SERVICES GRID ───────────────────────────────────── */
  .services-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem;
  }
  .service-card {
    background: var(--white); border: 1.5px solid var(--border);
    border-radius: var(--radius-lg); padding: 1.25rem 1rem;
    cursor: pointer; transition: box-shadow 0.2s, border-color 0.2s, transform 0.2s;
    text-align: center;
  }
  .service-card:hover {
    box-shadow: var(--shadow-hover); border-color: var(--gold);
    transform: translateY(-2px);
  }
  .service-icon { font-size: 1.6rem; margin-bottom: 0.5rem; line-height: 1; }
  .service-name { font-weight: 600; font-size: 0.82rem; color: var(--navy); }
  .service-count { font-size: 0.72rem; color: var(--muted); margin-top: 0.2rem; }

  /* ─── LISTING CARDS ───────────────────────────────────── */
  .listing-filters {
    display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.25rem;
  }
  .filter-btn {
    padding: 0.35rem 0.9rem; border-radius: 20px;
    font-size: 0.78rem; font-weight: 500; font-family: var(--font-sans);
    border: 1.5px solid var(--border); background: var(--white); color: var(--muted);
    cursor: pointer; transition: all 0.15s;
  }
  .filter-btn:hover { border-color: var(--navy); color: var(--navy); }
  .filter-btn.active { background: var(--navy); border-color: var(--navy); color: var(--white); }

  .listings-grid { display: grid; gap: 1rem; }
  @media (min-width: 580px) {
    .listings-grid { grid-template-columns: 1fr 1fr; }
  }

  .listing-card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: var(--radius-lg); overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .listing-card:hover { box-shadow: var(--shadow-hover); transform: translateY(-2px); }

  .listing-img { width: 100%; height: 190px; object-fit: cover; display: block; background: var(--border); }
  .listing-img-ph {
    width: 100%; height: 190px;
    background: linear-gradient(135deg, #E8E3DB 0%, #D6CFC4 100%);
    display: flex; align-items: center; justify-content: center;
    font-size: 2.5rem;
  }
  .listing-body { padding: 1rem 1.1rem 1.1rem; }

  .listing-status {
    display: inline-block; font-size: 0.67rem; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    padding: 0.2rem 0.55rem; border-radius: 4px; margin-bottom: 0.6rem;
  }
  .s-active   { background: #D1FAE5; color: #065F46; }
  .s-closed   { background: #F3F4F6; color: #6B7280; }
  .s-contract { background: #FEF3C7; color: #92400E; }
  .s-sold     { background: #FEE2E2; color: #991B1B; }
  .s-withdrawn{ background: #F3F4F6; color: #9CA3AF; }

  .listing-location {
    font-size: 0.75rem; color: var(--muted); font-weight: 500;
    margin-bottom: 0.2rem; letter-spacing: 0.01em;
  }
  .listing-type {
    font-family: var(--font-serif); font-size: 1rem;
    font-weight: 600; color: var(--navy); margin-bottom: 0.2rem;
    line-height: 1.3;
  }
  .listing-price {
    font-size: 1.1rem; font-weight: 700; color: var(--gold);
    margin-bottom: 0.6rem;
  }
  .listing-desc {
    font-size: 0.8rem; color: var(--muted); line-height: 1.55;
    display: -webkit-box; -webkit-line-clamp: 3;
    -webkit-box-orient: vertical; overflow: hidden;
  }
  .listing-view-btn {
    display: block; width: 100%; margin-top: 0.75rem;
    padding: 0.6rem; background: var(--navy); color: #fff;
    font-weight: 600; font-size: 0.8rem; border: none;
    border-radius: 8px; cursor: pointer; font-family: var(--font-sans);
    transition: background 0.15s;
  }
  .listing-view-btn:hover { background: var(--navy-mid); }

  /* ─── AGENTS ──────────────────────────────────────────── */
  .agents-grid { display: grid; gap: 0.75rem; }
  @media (min-width: 580px) {
    .agents-grid { grid-template-columns: 1fr 1fr; }
  }

  .agent-card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 1rem 1.1rem;
    display: flex; align-items: flex-start; gap: 0.875rem;
    box-shadow: var(--shadow-sm);
  }
  .agent-avatar {
    width: 46px; height: 46px; border-radius: 50%;
    background: var(--navy-mid);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-serif); font-size: 0.95rem;
    color: var(--white); font-weight: 600; flex-shrink: 0;
    letter-spacing: 0.02em;
  }
  .agent-avatar.is-broker { background: var(--gold); }
  .agent-name  { font-weight: 600; font-size: 0.875rem; color: var(--navy); line-height: 1.3; }
  .agent-role  { font-size: 0.73rem; color: var(--muted); margin-top: 0.1rem; }
  .agent-creds { font-size: 0.7rem; color: var(--gold); font-weight: 700; margin-top: 0.15rem; letter-spacing: 0.04em; }
  .agent-phone { font-size: 0.73rem; color: var(--muted); margin-top: 0.3rem; }
  .agent-email { font-size: 0.73rem; margin-top: 0.15rem; }
  .agent-email a { color: var(--navy); text-decoration: none; font-weight: 500; }
  .agent-email a:hover { color: var(--gold); }

  /* ─── RESOURCES ───────────────────────────────────────── */
  .resource-group { margin-bottom: 2rem; }
  .resource-group-title {
    font-size: 0.68rem; font-weight: 700; letter-spacing: 0.15em;
    text-transform: uppercase; color: var(--gold); margin-bottom: 0.75rem;
  }
  .resource-link {
    display: flex; align-items: center;
    padding: 0.8rem 1rem; background: var(--white);
    border: 1px solid var(--border); border-radius: var(--radius);
    margin-bottom: 0.5rem; text-decoration: none;
    color: var(--navy); font-size: 0.865rem; font-weight: 500;
    transition: border-color 0.15s, color 0.15s;
  }
  .resource-link:hover { border-color: var(--gold); color: var(--gold); }
  .resource-link::after { content: '→'; margin-left: auto; color: var(--muted); font-size: 0.85rem; transition: color 0.15s; }
  .resource-link:hover::after { color: var(--gold); }

  /* ─── CONTACT ─────────────────────────────────────────── */
  .contact-card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: var(--radius-lg); overflow: hidden;
    box-shadow: var(--shadow);
  }
  .contact-row {
    display: flex; align-items: flex-start; gap: 1rem;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border);
  }
  .contact-row:last-child { border-bottom: none; }
  .contact-icon-wrap {
    width: 38px; height: 38px; border-radius: 50%;
    background: var(--gold-pale); display: flex;
    align-items: center; justify-content: center;
    font-size: 1rem; flex-shrink: 0;
  }
  .contact-label { font-size: 0.72rem; color: var(--muted); font-weight: 600; margin-bottom: 0.2rem; letter-spacing: 0.04em; text-transform: uppercase; }
  .contact-value { font-size: 0.9rem; color: var(--navy); font-weight: 500; line-height: 1.4; }
  .contact-value a { color: var(--navy); text-decoration: none; }
  .contact-value a:hover { color: var(--gold); }

  /* ─── ABOUT STRIP ─────────────────────────────────────── */
  .about-strip { background: var(--navy); padding: 2.5rem 1.25rem; }
  .about-text { font-size: 0.9rem; color: rgba(255,255,255,0.75); line-height: 1.7; }
  .lang-pills { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem; }
  .lang-pill {
    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18);
    border-radius: 20px; padding: 0.3rem 0.85rem;
    font-size: 0.73rem; color: rgba(255,255,255,0.8); font-weight: 500;
  }

  /* ─── FOOTER ──────────────────────────────────────────── */
  .footer { background: #0D1829; padding: 1.75rem 1.25rem; text-align: center; }
  .footer-brand { font-family: var(--font-serif); font-size: 1.1rem; color: var(--white); font-weight: 600; }
  .footer-addr { font-size: 0.775rem; color: rgba(255,255,255,0.4); margin-top: 0.4rem; line-height: 1.6; }
  .footer-copy { font-size: 0.7rem; color: rgba(255,255,255,0.25); margin-top: 0.75rem; }
`;

// ─── DATA ────────────────────────────────────────────────────────────────────

const AGENTS = [
  { name: "Yang-Heh (Kathy) Chen", role: "Broker of Record",   credentials: "GRI",       phone: "c. 732.673.5952", email: "kathychen@chenrealty.com",  broker: true  },
  { name: "Cheng-Jen (Allen) Chen", role: "Broker-Associate", credentials: "CRS, ABR",   phone: "c. 732.673.8882", email: "allenchen@chenrealty.com", broker: true  },
  { name: "Elaine Chen",         role: "Sales Associate", phone: "h. 732.739.3751" },
  { name: "William Chuang",      role: "Sales Associate", phone: "h. 732.888.0117" },
  { name: "Ling Wei Chiou",      role: "Sales Associate", phone: "h. 732.888.1318 · c. 908.601.2799" },
  { name: "Sheree Lan",          role: "Sales Associate", phone: "h. 732.888.1024" },
  { name: "Anchi Lin",           role: "Sales Associate", phone: "h. 732.946.7228 · c. 908.601.8782" },
  { name: "Eddie Hwang",         role: "Sales Associate", phone: "c. 902.902.1871" },
  { name: "Hsueh-Ling Jen",      role: "Sales Associate", phone: "h. 732.303.8291 · c. 732.995.6063" },
  { name: "Hwey Yuen Kuo",       role: "Sales Associate", phone: "h. 732.957.0563" },
  { name: "Judy Wang",           role: "Sales Associate", phone: "h. 732.957.2988" },
  { name: "Sylvia Lu",           role: "Sales Associate", phone: "h. 732.946.3716 · c. 732.673.7641" },
  { name: "Chia-Chi (Angie) Chen", role: "Sales Associate", phone: "c. 917.913.7238" },
  { name: "Wendy Yenching Chen", role: "Sales Associate", phone: "h. 732.410.4618 · c. 908.907.5251" },
  { name: "Wei-Min Wang",        role: "Sales Associate", phone: "h. 732.946.1699 · c. 732.939.3840" },
  { name: "Hsiumei Hung",        role: "Sales Associate", phone: "h. 732.335.9422" },
  { name: "Alexander Lo",        role: "Sales Associate", phone: "c. 732.403.6636" },
  { name: "Shirley Huang",       role: "Sales Associate", phone: "h. 408.777.0241" },
];

const SINGLE_FAMILY = [
  {
    id: "SF1", location: "Ocean, NJ", type: "Single Family", price: "$405,000", status: "Active",
    desc: "Private 4-bedroom Colonial at end of a quiet street. Fireplace and cathedral ceiling in family room. Updated kitchen with granite countertops and ceramic tiles. Central A/C, updated master bath, aluminum fence. Close to shopping.",
    img: "http://chenrealty.com/assets/images/Front_View_2011.226115555_std.JPG",
  },
  {
    id: "SF2", location: "Tinton Falls, NJ", type: "Single Family", price: "$375,000", status: "Active",
    desc: "Well-maintained 3 bed, 2 bath bilevel in desirable Tinton Greens. Updated roof, gutters, hot water heater, and vinyl floors throughout. New dishwasher. Sliding door in family room to large backyard with shed.",
    img: "http://chenrealty.com/assets/images/Front_View.86122357_std.jpg",
  },
  {
    id: "SF3", location: "Middletown, NJ", type: "Single Family", price: "$375,000", status: "Closed",
    desc: "Well-maintained ranch on 0.7+ acres in one of Middletown's finest neighborhoods. Huge family room addition with patio slider, spacious eat-in kitchen with pantry. Finished basement with 3 rooms. Underground sprinkler, oversized shed. Close to GSP, train & ferry.",
    img: "http://chenrealty.com/assets/images/20170819214102858220000000.86134553_std.jpg",
  },
  {
    id: "SF4", location: "Hazlet, NJ", type: "Single Family", price: "$348,000", status: "Closed",
    desc: "Lovely 4 bed, 2 bath split level with open floor plan. Updated granite kitchen with new appliances. Vaulted ceilings, manicured landscaping, fenced private backyard. Close to schools and NYC ferry, bus & train.",
    img: "http://chenrealty.com/assets/images/20150417180552108953000000-o.159110206_std.jpg",
  },
  {
    id: "SF5", location: "Holmdel, NJ", type: "Single Family", price: "$779,900", status: "Active",
    desc: "Spacious contemporary custom home — 4 BR, 3 full + 2 half baths, finished walkout basement on a private cul-de-sac wooded lot. Sunken LR with fireplace, great room with wall of windows, gourmet kitchen with granite and stainless appliances. Full house generator.",
    img: "https://cdn1.photos.sparkplatform.com/mo/20190319023420809798000000.jpg",
  },
];

const COMMERCIAL = [
  {
    id: "C1", location: "Holmdel, NJ", type: "Office Space (Rental)", price: "$17/sq.ft. + NNN", status: "Closed",
    desc: "Prime 568 sq.ft. second-floor office space near two Holmdel shopping centers. Ideal for professional office. Available immediately.",
    img: "http://chenrealty.com/assets/images/2124_Hwy_35.119100419_std.jpg",
  },
  {
    id: "C2", location: "Marlboro, NJ", type: "Commercial Land", price: "$749,000", status: "Active",
    desc: "6+ acre property in Commercial Service zone on Route 79. Old single family house on property. Tax map, zoning, and other documents available upon request. Priced for quick sale.",
    img: "http://chenrealty.com/assets/images/picture_rt79a.226123004_std.jpg",
  },
  {
    id: "C3", location: "Brick, NJ", type: "Strip Mall", price: "$2,000,000", status: "Active",
    desc: "Highly visible 8-unit retail and office building at the corner of Route 88 and Midstreams Place. Excellent parking. Outstanding investment opportunity. Rent roll and expenses available through the listing agent. Do not approach tenants.",
    img: "http://cdn0.photos.flexmls.com/mo/20141006170520695151000000.jpg",
  },
  {
    id: "C4", location: "Hazlet, NJ", type: "Office/Retail Rental", price: "$13/sq.ft. + NNN", status: "Closed",
    desc: "2,400 sq.ft. on busy Highway 35. Zoned Business Highway. Office facing highway with large garage in back. Permitted uses include retail, professional offices, computer training, health & fitness club. May allow 3 bays for auto repair.",
    img: "http://chenrealty.com/assets/images/DSC03727.166141357.JPG",
  },
  {
    id: "C5", location: "Point Pleasant, NJ", type: "Office Building", price: "$595,000", status: "Closed",
    desc: "6,200 sq.ft. office building with 4 suites at River Road Medical Plaza near Rt. 70. Suite #2 occupied by a dentist; 3 suites vacant — suitable for medical, legal, or accountant offices. 32 shared parking spaces.",
    img: "http://chenrealty.com/assets/images/21205545_0722500.45125516_std.jpg",
  },
];

const TOWNHOMES = [
  {
    id: "TM1", location: "Holmdel, NJ", type: "Townhouse", price: "$449,000", status: "Closed",
    desc: "Beautiful Ascot Model in Orchard Crossing. 4 bedrooms, 1-car garage, quiet cul-de-sac. Newer ceramic floors, updated granite kitchen. Great location near shopping and NYC bus.",
    img: "http://chenrealty.com/assets/images/Front_View.121190202_std.jpg",
  },
  {
    id: "TM2", location: "Middletown, NJ", type: "Townhouse", price: "$249,000", status: "Under Contract",
    desc: "Spacious 3-bedroom townhouse with finished walk-out basement. Fireplace in living room. Close to train, bus, and ferry to NYC.",
    img: "http://cdn2.photos.flexmls.com/mo/20150829160853120299000000.jpg",
  },
  {
    id: "TM3", location: "South Amboy, NJ", type: "Townhouse", price: "$449,000", status: "Withdrawn",
    desc: "Bright 3 bed, 3.5 bath townhouse in Waterfront Community. New hardwood floors, gas fireplace, 42\" maple cabinets. Master suite with sitting area and walk-in closet. 2-car garage. Close to NYC trains, buses, and highways.",
    img: "http://chenrealty.com/assets/images/20160119061042632124000000.121193958_std.jpg",
  },
  {
    id: "TM4", location: "Middletown, NJ", type: "Townhouse", price: "$249,000", status: "Sold",
    desc: "3-bedroom end-unit townhouse. Walk-out basement, fireplace in living room, newer hot water heater and some windows. Close to shopping, bus, train, and ferry to NYC. Sold AS IS.",
    img: "http://chenrealty.com/assets/images/20170902004042209575000000.86135125_std.jpg",
  },
  {
    id: "TM5", location: "Eatontown, NJ", type: "Townhouse", price: "$259,999", status: "Sold",
    desc: "2 bed, 2.5 bath townhouse with 1-car garage and loft/office. Wood burning fireplace, new 2017 gas furnace, new hot water heater. Excellent access to transportation, beach, and shopping.",
    img: "http://chenrealty.com/assets/images/20180409212139791931000000.86135504_std.jpg",
  },
];

const RENTALS = [
  {
    id: "R1", location: "Holmdel, NJ", type: "Single Family", price: "$4,500/mo", status: "Closed",
    desc: "Elegant 5-bed colonial with brick front on wooded lot adjacent to Holmdel Park. Two-story entry foyer, gourmet kitchen with granite and custom maple cabinetry, magnificent master suite. Close to NYC bus, train & ferry.",
    img: "http://chenrealty.com/assets/images/rose_yu_house.21203435_std.jpg",
  },
  {
    id: "R2", location: "Holmdel, NJ", type: "Townhouse", price: "$2,800/mo", status: "Closed",
    desc: "Updated 3-bed townhouse with full finished basement. Viking stove, Bosch dishwasher, stainless refrigerator, granite counters. Newer hardwood floors in LR & DR. Close to shopping, bus, and train.",
    img: "http://chenrealty.com/assets/images/Persimmon.64121248_std.jpg",
  },
  {
    id: "R3", location: "Holmdel, NJ", type: "Townhouse", price: "$2,800/mo", status: "Under Contract",
    desc: "Spacious 3 bed, 2.5 bath townhouse in desirable Woods at Holmdel. Gas fireplace, private deck overlooking wooded buffer, vaulted master bedroom, walkout basement. Close to all forms of NYC transportation.",
    img: "http://chenrealty.com/assets/images/IMG_1985.86124635_std.JPG",
  },
  {
    id: "R4", location: "Freehold, NJ", type: "Condo", price: "$1,600/mo", status: "Closed",
    desc: "2 bedrooms plus den. Spacious LR/DR combination. Washer/dryer included. Newer windows and carpet. Near park-and-ride, shopping, highway, and mall. No pets. Minimum 1-year lease. Credit check required.",
    img: "http://chenrealty.com/assets/images/Ying_Freehold.64114944_std.jpg",
  },
  {
    id: "R5", location: "Holmdel, NJ", type: "Single Family", price: "$4,500/mo", status: "Closed",
    desc: "Stunning home in the heart of Holmdel with amazing cherry blossom views. Updated kitchen with stainless appliances and marble counters. Master suite with skylights, his/her walk-in closets, claw-foot tub. Fully finished basement.",
    img: "http://chenrealty.com/assets/images/Front_View_Riverside_Holmdel.86132517_std.jpg",
  },
];

const RESOURCES_EDUCATIONAL = [
  { label: "Real Estate ABC's — Home Buying Guide", url: "http://www.realestateabc.com/homebuying/" },
  { label: "Realtor.org (National Association of Realtors)", url: "http://www.realtor.org/" },
  { label: "Mortgage Calculator", url: "https://www.bankrate.com/calculators/mortgages/mortgage-calculator.aspx" },
];

const RESOURCES_MUNICIPAL = [
  { label: "Monmouth County", url: "http://www.visitmonmouth.com/" },
  { label: "Holmdel Township School System", url: "http://www.holmdeltownship-nj.com/services/schools.html" },
  { label: "Middlesex County", url: "http://www.co.middlesex.nj.us/" },
  { label: "Ocean County, NJ", url: "http://www.co.ocean.nj.us/" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function initials(name) {
  return name
    .split(/[\s()]+/)
    .filter(w => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map(w => w[0])
    .join("");
}

function statusClass(s) {
  return { Active: "s-active", Closed: "s-closed", "Under Contract": "s-contract", Sold: "s-sold", Withdrawn: "s-withdrawn" }[s] ?? "s-closed";
}

// Adapts the flat listing-card shape to the richer shape ListingDetail expects.
function toDetailListing(l) {
  const priceNum = typeof l.price === "number"
    ? l.price
    : parseInt(l.price.replace(/[^0-9]/g, ""), 10) || 0;
  return {
    ...l,
    price:       priceNum,
    address:     l.address     ?? l.location,
    description: l.description ?? l.desc ?? "",
    images:      l.images      ?? (l.img ? [{ url: l.img, caption: l.type }] : [{ url: "", caption: "No photo" }]),
    beds:        l.beds        ?? 0,
    baths:       l.baths       ?? 0,
    halfBaths:   l.halfBaths   ?? 0,
    sqft:        l.sqft        ?? 0,
    lotSqft:     l.lotSqft     ?? 0,
    yearBuilt:   l.yearBuilt   ?? "",
    agent:       l.agent       ?? { name: "Chen Realty", title: "Broker", phone: "732.957.8889", email: "allenchen@chenrealty.com" },
  };
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

function ListingCard({ l, onViewListing }) {
  const [err, setErr] = useState(false);
  return (
    <div className="listing-card" onClick={() => onViewListing?.(l)} style={{ cursor: onViewListing ? "pointer" : "default" }}>
      {!err && l.img
        ? <img src={l.img} alt={`${l.type} in ${l.location}`} className="listing-img" onError={() => setErr(true)} loading="lazy" />
        : <div className="listing-img-ph">🏠</div>
      }
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

// ─── PAGES ───────────────────────────────────────────────────────────────────

function HomePage({ nav }) {
  const featured = [
    ...SINGLE_FAMILY.filter(l => l.status === "Active"),
    ...COMMERCIAL.filter(l => l.status === "Active"),
  ].slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-eyebrow">Chen Realty · 陈氏地产 · Est. 1989</div>
        <h1 className="hero-title">Trusted New Jersey Real Estate</h1>
        <p className="hero-subtitle">
          Full-service residential and commercial brokerage serving Central and Northern New Jersey.
          Multilingual agents. Personalized service. Three decades of expertise.
        </p>
        <button className="btn-primary" onClick={() => nav("listings")}>Browse Listings</button>
        <div className="hero-stats">
          <div className="hero-stat"><div className="hero-stat-num">35+</div><div className="hero-stat-label">Years in NJ</div></div>
          <div className="hero-stat"><div className="hero-stat-num">18</div><div className="hero-stat-label">Agents</div></div>
          <div className="hero-stat"><div className="hero-stat-num">4</div><div className="hero-stat-label">Languages</div></div>
        </div>
      </section>

      {/* Services */}
      <section className="section section-white">
        <div className="section-title">What We Offer</div>
        <div className="section-divider" />
        <p className="section-lead">
          Whether you're searching for a single family home, condo, commercial property, or vacant lot,
          our agents provide customized service to ensure a timely sale or purchase at the best price.
        </p>
        <div className="services-grid">
          {[
            { icon: "🏡", name: "Single Family",     count: `${SINGLE_FAMILY.length} listings` },
            { icon: "🏢", name: "Commercial",         count: `${COMMERCIAL.length} listings` },
            { icon: "🏘️", name: "Townhome / Multi",  count: `${TOWNHOMES.length} listings` },
            { icon: "🔑", name: "Rentals",             count: `${RENTALS.length} listings` },
          ].map(s => (
            <div key={s.name} className="service-card" onClick={() => nav("listings")}>
              <div className="service-icon">{s.icon}</div>
              <div className="service-name">{s.name}</div>
              <div className="service-count">{s.count}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="section">
        <div className="section-title">Featured Listings</div>
        <div className="section-divider" />
        <div className="listings-grid">
          {featured.map(l => <ListingCard key={l.id} l={l} />)}
        </div>
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <button className="btn-outline" onClick={() => nav("listings")}>View All Listings →</button>
        </div>
      </section>

      {/* About */}
      <section className="about-strip">
        <div className="section-title section-title-light">About Chen Realty</div>
        <div className="section-divider" />
        <p className="about-text">
          Established in 1989, Chen Realty is a full-service residential and commercial real estate brokerage
          firm servicing Central and Northern New Jersey. With over 20 agents with extensive industry training
          and expertise, we guarantee to be a trustworthy and knowledgeable resource to guide you through the
          buying, renting, or selling process.
        </p>
        <div className="lang-pills">
          {["English", "Taiwanese", "Cantonese", "Mandarin"].map(l => (
            <span key={l} className="lang-pill">{l}</span>
          ))}
        </div>
      </section>
    </>
  );
}

function ListingsPage({ onViewListing }) {
  const tabs = [
    { id: "sf",  label: "Single Family",    data: SINGLE_FAMILY },
    { id: "co",  label: "Commercial",        data: COMMERCIAL    },
    { id: "tm",  label: "Townhome / Multi",  data: TOWNHOMES     },
    { id: "re",  label: "Rentals",           data: RENTALS       },
  ];
  const [tab, setTab] = useState("sf");
  const active = tabs.find(t => t.id === tab);

  return (
    <>
      <div className="page-header">
        <div className="page-header-title">Listings</div>
        <div className="page-header-sub">Current and recent properties · Updated regularly</div>
      </div>
      <div className="section">
        <div className="listing-filters">
          {tabs.map(t => (
            <button key={t.id} className={`filter-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="listings-grid">
          {active.data.map(l => <ListingCard key={l.id} l={l} onViewListing={onViewListing} />)}
        </div>
      </div>
    </>
  );
}

function AgentsPage() {
  const brokers = AGENTS.filter(a => a.broker);
  const assoc   = AGENTS.filter(a => !a.broker);

  const AgentCard = ({ a }) => (
    <div className="agent-card">
      <div className={`agent-avatar ${a.broker ? "is-broker" : ""}`}>{initials(a.name)}</div>
      <div style={{ minWidth: 0 }}>
        <div className="agent-name">{a.name}</div>
        <div className="agent-role">{a.role}</div>
        {a.credentials && <div className="agent-creds">{a.credentials}</div>}
        <div className="agent-phone">{a.phone}</div>
        {a.email && <div className="agent-email"><a href={`mailto:${a.email}`}>{a.email}</a></div>}
      </div>
    </div>
  );

  return (
    <>
      <div className="page-header">
        <div className="page-header-title">Our Agents</div>
        <div className="page-header-sub">Meet our experienced team of 18 licensed professionals</div>
      </div>
      <div className="section section-white">
        <div className="section-title">Brokerage Leadership</div>
        <div className="section-divider" />
        <div className="agents-grid" style={{ marginBottom: "2rem" }}>
          {brokers.map(a => <AgentCard key={a.name} a={a} />)}
        </div>
        <div className="section-title">Sales Associates</div>
        <div className="section-divider" />
        <div className="agents-grid">
          {assoc.map(a => <AgentCard key={a.name} a={a} />)}
        </div>
      </div>
    </>
  );
}

function ResourcesPage() {
  return (
    <>
      <div className="page-header">
        <div className="page-header-title">Resources</div>
        <div className="page-header-sub">Useful links for buyers, sellers, and renters</div>
      </div>
      <div className="section">
        <div className="resource-group">
          <div className="resource-group-title">Educational &amp; Training Tools</div>
          {RESOURCES_EDUCATIONAL.map(r => (
            <a key={r.url} href={r.url} className="resource-link" target="_blank" rel="noopener noreferrer">{r.label}</a>
          ))}
        </div>
        <div className="resource-group">
          <div className="resource-group-title">NJ Municipality Information</div>
          {RESOURCES_MUNICIPAL.map(r => (
            <a key={r.url} href={r.url} className="resource-link" target="_blank" rel="noopener noreferrer">{r.label}</a>
          ))}
        </div>
      </div>
    </>
  );
}

function ContactPage() {
  return (
    <>
      <div className="page-header">
        <div className="page-header-title">Contact Us</div>
        <div className="page-header-sub">We'd love to hear from you</div>
      </div>
      <div className="section">
        <div className="contact-card">
          {[
            { icon: "📍", label: "Office Address",    value: "2124 NJ Hwy 35, Holmdel, NJ 07733" },
            { icon: "📞", label: "Phone",              value: <a href="tel:7329578889">732.957.8889</a> },
            { icon: "✉️",  label: "Email",              value: <a href="mailto:allenchen@chenrealty.com">allenchen@chenrealty.com</a> },
            { icon: "🗺️", label: "Service Area",       value: "Central & Northern New Jersey" },
            { icon: "🗣️", label: "Languages Spoken",  value: "English · Taiwanese · Cantonese · Mandarin" },
            { icon: "🏢", label: "Established",        value: "1989 · 35+ years serving New Jersey" },
          ].map(r => (
            <div key={r.label} className="contact-row">
              <div className="contact-icon-wrap">{r.icon}</div>
              <div>
                <div className="contact-label">{r.label}</div>
                <div className="contact-value">{r.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "home",      label: "Home"       },
  { id: "listings",  label: "Listings"   },
  { id: "agents",    label: "Our Agents" },
  { id: "resources", label: "Resources"  },
  { id: "contact",   label: "Contact"    },
];

export default function App() {
  const [page, setPage]         = useState("home");
  const [detail, setDetail]     = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Inject styles + Google Fonts once
  useEffect(() => {
    // Styles
    const styleEl = document.createElement("style");
    styleEl.id    = "cr-global-styles";
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);

    // Google Fonts
    const fontEl  = document.createElement("link");
    fontEl.rel    = "stylesheet";
    fontEl.href   = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap";
    document.head.appendChild(fontEl);

    return () => {
      document.getElementById("cr-global-styles")?.remove();
    };
  }, []);

  const navigate = (p) => {
    setPage(p);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ── Navigation ── */}
      <nav className="nav">
        <div className="nav-brand" onClick={() => navigate("home")}>
          <span className="nav-brand-en">Chen Realty</span>
          <span className="nav-brand-zh">陈氏地产</span>
        </div>

        {/* Mobile hamburger */}
        <button
          className={`nav-hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <span /><span /><span />
        </button>

        {/* Menu — always rendered; visible on desktop, toggled on mobile */}
        <div className={`nav-menu ${menuOpen ? "open" : ""}`}>
          {NAV_ITEMS.map(n => (
            <button
              key={n.id}
              className={`nav-item ${page === n.id ? "active" : ""}`}
              onClick={() => navigate(n.id)}
            >
              {n.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Page Content ── */}
      <main style={{ flex: 1 }}>
        {page === "home"      && <HomePage nav={navigate} />}
        {page === "listings"  && (
          <ListingsPage onViewListing={(l) => { setDetail(toDetailListing(l)); navigate("detail"); }} />
        )}
        {page === "detail"    && detail && (
          <ListingDetail listing={detail} onBack={() => { navigate("listings"); setDetail(null); }} />
        )}
        {page === "agents"    && <AgentsPage />}
        {page === "resources" && <ResourcesPage />}
        {page === "contact"   && <ContactPage />}
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-brand">Chen Realty · 陈氏地产</div>
        <div className="footer-addr">
          2124 NJ Hwy 35, Holmdel, NJ 07733<br />
          732.957.8889 · allenchen@chenrealty.com
        </div>
        <div className="footer-copy">
          © {new Date().getFullYear()} Chen Realty. All rights reserved. Licensed in New Jersey.
        </div>
      </footer>
    </div>
  );
}
