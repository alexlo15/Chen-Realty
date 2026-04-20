// ListingDetail.jsx — Chen Realty
// Usage: <ListingDetail listing={yourListingObject} onBack={() => setPage('listings')} />
// Standalone: renders with SAMPLE_LISTING if no prop is passed.
// Wire into App.jsx: import ListingDetail + add a `detail` page state.

import { useState, useEffect, useCallback } from "react";

// ─── STYLES ──────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&display=swap');

  :root {
    --ld-navy:      #131E30;
    --ld-navy-mid:  #1B2A4A;
    --ld-navy-soft: #243660;
    --ld-gold:      #C9A55A;
    --ld-gold-dim:  #9E7D3E;
    --ld-gold-pale: #F6EDD6;
    --ld-cream:     #FAF9F6;
    --ld-white:     #FFFFFF;
    --ld-text:      #1C1C1C;
    --ld-muted:     #717787;
    --ld-border:    #E8E3D9;
    --ld-serif:     'Cormorant Garamond', Georgia, serif;
    --ld-sans:      'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
    --ld-r:         10px;
    --ld-r-lg:      16px;
  }

  .ld-root { font-family: var(--ld-sans); color: var(--ld-text); background: var(--ld-cream); min-height: 100vh; }

  /* ── BACK BAR ───────────────────────────────────────────────── */
  .ld-topbar {
    position: sticky; top: 0; z-index: 30;
    background: rgba(19,30,48,0.94);
    backdrop-filter: blur(12px) saturate(1.4);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    height: 52px; display: flex; align-items: center;
    padding: 0 1.25rem; gap: 0;
  }
  .ld-back {
    display: inline-flex; align-items: center; gap: 0.45rem;
    background: none; border: none; cursor: pointer;
    color: rgba(255,255,255,0.75); font-size: 0.8rem; font-weight: 500;
    font-family: var(--ld-sans); letter-spacing: 0.04em;
    padding: 0; transition: color 0.15s;
  }
  .ld-back:hover { color: var(--ld-gold); }
  .ld-back svg { transition: transform 0.15s; }
  .ld-back:hover svg { transform: translateX(-3px); }

  .ld-topbar-crumb {
    margin-left: auto; font-size: 0.72rem; color: rgba(255,255,255,0.35);
    font-weight: 400; letter-spacing: 0.06em; text-transform: uppercase;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    max-width: 200px;
  }

  /* ── GALLERY ────────────────────────────────────────────────── */
  .ld-gallery {
    position: relative; width: 100%;
    height: clamp(260px, 56vw, 600px);
    background: var(--ld-navy); overflow: hidden;
  }

  .ld-gimg {
    position: absolute; inset: 0; width: 100%; height: 100%;
    object-fit: cover;
    opacity: 0; transform: scale(1.04);
    transition: opacity 0.55s ease, transform 0.55s ease;
    will-change: opacity, transform;
  }
  .ld-gimg.on { opacity: 1; transform: scale(1); }

  /* Cinematic gradient overlay */
  .ld-gallery::after {
    content: '';
    position: absolute; inset: 0; pointer-events: none;
    background:
      linear-gradient(to top,   rgba(13,20,35,0.88) 0%,  transparent 45%),
      linear-gradient(to bottom, rgba(13,20,35,0.35) 0%,  transparent 28%),
      linear-gradient(to right,  rgba(13,20,35,0.15) 0%,  transparent 40%);
  }

  /* Status badge */
  .ld-g-status {
    position: absolute; top: 1rem; left: 1rem; z-index: 5;
    font-size: 0.63rem; font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; padding: 0.3rem 0.8rem;
    border-radius: 4px; backdrop-filter: blur(4px);
  }
  .ld-gs-active   { background: rgba(16,185,129,0.9); color: #fff; }
  .ld-gs-closed   { background: rgba(107,114,128,0.9); color: #fff; }
  .ld-gs-contract { background: rgba(245,158,11,0.9); color: #fff; }
  .ld-gs-sold     { background: rgba(239,68,68,0.9); color: #fff; }

  /* Photo count pill */
  .ld-g-count {
    position: absolute; top: 1rem; right: 1rem; z-index: 5;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(6px);
    color: rgba(255,255,255,0.85); font-size: 0.7rem; font-weight: 600;
    padding: 0.3rem 0.7rem; border-radius: 20px; letter-spacing: 0.06em;
    border: 1px solid rgba(255,255,255,0.12);
    cursor: pointer; transition: background 0.15s;
  }
  .ld-g-count:hover { background: rgba(0,0,0,0.72); }

  /* Bottom overlay: price + expand */
  .ld-g-overlay {
    position: absolute; bottom: 0; left: 0; right: 0; z-index: 5;
    padding: 1.25rem 1.5rem 1.4rem;
    display: flex; align-items: flex-end; gap: 1rem;
  }
  .ld-g-info { flex: 1; }
  .ld-g-price {
    font-family: var(--ld-serif); font-size: clamp(1.7rem, 5.5vw, 2.6rem);
    font-weight: 700; color: #FFFFFF; line-height: 1;
    letter-spacing: -0.01em;
    text-shadow: 0 2px 12px rgba(0,0,0,0.4);
  }
  .ld-g-addr {
    font-size: 0.8rem; color: rgba(255,255,255,0.72); margin-top: 0.35rem;
    font-weight: 400; letter-spacing: 0.01em;
  }
  .ld-g-expand {
    flex-shrink: 0; display: flex; align-items: center; gap: 0.4rem;
    background: rgba(255,255,255,0.12); backdrop-filter: blur(6px);
    border: 1px solid rgba(255,255,255,0.2); border-radius: 8px;
    color: rgba(255,255,255,0.88); font-size: 0.72rem; font-weight: 600;
    padding: 0.55rem 0.9rem; cursor: pointer; letter-spacing: 0.04em;
    transition: background 0.15s; font-family: var(--ld-sans);
    white-space: nowrap;
  }
  .ld-g-expand:hover { background: rgba(255,255,255,0.22); }

  /* Nav arrows */
  .ld-g-arrow {
    position: absolute; top: 50%; transform: translateY(-50%); z-index: 6;
    width: 42px; height: 42px; border-radius: 50%;
    background: rgba(255,255,255,0.12); backdrop-filter: blur(6px);
    border: 1px solid rgba(255,255,255,0.2); color: #fff;
    font-size: 1rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s, transform 0.15s;
  }
  .ld-g-arrow:hover { background: rgba(255,255,255,0.26); transform: translateY(-50%) scale(1.08); }
  .ld-g-arrow-prev { left: 0.875rem; }
  .ld-g-arrow-next { right: 0.875rem; }

  /* Dot indicators */
  .ld-dots {
    display: flex; gap: 5px; justify-content: center;
    padding: 0.7rem 1rem 0;
    background: var(--ld-navy);
  }
  .ld-dot {
    height: 5px; border-radius: 3px; cursor: pointer;
    background: rgba(255,255,255,0.22); transition: background 0.2s, width 0.25s;
    width: 5px;
  }
  .ld-dot.on { background: var(--ld-gold); width: 22px; }

  /* Thumbnail strip */
  .ld-thumbs {
    display: flex; gap: 5px; padding: 5px 1rem 8px;
    background: var(--ld-navy);
    overflow-x: auto; scrollbar-width: none;
  }
  .ld-thumbs::-webkit-scrollbar { display: none; }
  .ld-thumb {
    flex-shrink: 0; width: 70px; height: 50px; border-radius: 5px;
    overflow: hidden; cursor: pointer;
    border: 2px solid transparent;
    transition: border-color 0.18s, transform 0.18s, opacity 0.18s;
    opacity: 0.55;
  }
  .ld-thumb:hover { opacity: 0.8; transform: translateY(-2px); }
  .ld-thumb.on { border-color: var(--ld-gold); opacity: 1; }
  .ld-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .ld-thumb-ph {
    width: 100%; height: 100%;
    background: var(--ld-navy-soft);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.6rem; color: rgba(255,255,255,0.3);
    font-family: var(--ld-sans);
  }

  /* ── BODY LAYOUT ────────────────────────────────────────────── */
  .ld-body {
    padding: 1.5rem 1.1rem 7rem;
    animation: ldFadeUp 0.4s ease both;
  }
  @keyframes ldFadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (min-width: 960px) {
    .ld-body {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 2rem;
      max-width: 1180px;
      margin: 0 auto;
      padding: 2.25rem 2rem 4rem;
      align-items: start;
    }
  }

  /* ── MAIN COLUMN ────────────────────────────────────────────── */
  .ld-main > * + * { margin-top: 1.5rem; }

  /* Address header — mobile only (desktop it's in sidebar) */
  .ld-mobile-header { margin-bottom: 0; }
  @media (min-width: 960px) { .ld-mobile-header { display: none; } }
  .ld-mh-price {
    font-family: var(--ld-serif); font-size: 2rem; font-weight: 700;
    color: var(--ld-navy); line-height: 1;
  }
  .ld-mh-addr { font-size: 0.85rem; color: var(--ld-muted); margin-top: 0.35rem; }
  .ld-mh-status {
    display: inline-block; font-size: 0.63rem; font-weight: 700;
    letter-spacing: 0.14em; text-transform: uppercase;
    padding: 0.25rem 0.65rem; border-radius: 4px; margin-bottom: 0.5rem;
  }
  .ld-ms-active   { background: #D1FAE5; color: #065F46; }
  .ld-ms-closed   { background: #F3F4F6; color: #6B7280; }
  .ld-ms-contract { background: #FEF3C7; color: #92400E; }
  .ld-ms-sold     { background: #FEE2E2; color: #991B1B; }

  /* ── STATS BAR ──────────────────────────────────────────────── */
  .ld-stats {
    display: flex; background: var(--ld-white);
    border: 1px solid var(--ld-border); border-radius: var(--ld-r-lg);
    overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  .ld-stat {
    flex: 1; min-width: 0; text-align: center;
    padding: 0.9rem 0.4rem;
    border-right: 1px solid var(--ld-border);
    position: relative;
  }
  .ld-stat:last-child { border-right: none; }
  .ld-stat-icon { font-size: 1.05rem; line-height: 1; display: block; }
  .ld-stat-val {
    display: block; font-size: 0.92rem; font-weight: 700;
    color: var(--ld-navy); line-height: 1.1; margin-top: 0.25rem;
  }
  .ld-stat-lbl {
    display: block; font-size: 0.58rem; color: var(--ld-muted);
    text-transform: uppercase; letter-spacing: 0.1em;
    margin-top: 0.15rem; font-weight: 600;
  }

  /* ── SECTION CARD ───────────────────────────────────────────── */
  .ld-card {
    background: var(--ld-white);
    border: 1px solid var(--ld-border);
    border-radius: var(--ld-r-lg);
    padding: 1.5rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }
  .ld-card-title {
    font-family: var(--ld-serif); font-size: 1.35rem; font-weight: 600;
    color: var(--ld-navy); letter-spacing: 0.01em;
    margin-bottom: 0.5rem;
  }
  .ld-gold-rule {
    width: 30px; height: 2px;
    background: var(--ld-gold); border-radius: 2px;
    margin-bottom: 1rem;
  }

  /* Description */
  .ld-desc {
    font-size: 0.88rem; color: #3D4554; line-height: 1.8;
    white-space: pre-line; overflow: hidden;
    transition: max-height 0.3s ease;
  }
  .ld-desc.collapsed { max-height: 120px; -webkit-mask-image: linear-gradient(black 60%, transparent 100%); mask-image: linear-gradient(black 60%, transparent 100%); }
  .ld-desc.expanded  { max-height: 1000px; -webkit-mask-image: none; mask-image: none; }
  .ld-read-more {
    background: none; border: none; cursor: pointer; padding: 0;
    font-family: var(--ld-sans); font-size: 0.82rem; font-weight: 600;
    color: var(--ld-navy); text-decoration: underline;
    text-underline-offset: 3px; margin-top: 0.65rem; display: block;
    transition: color 0.15s;
  }
  .ld-read-more:hover { color: var(--ld-gold); }

  /* Details grid */
  .ld-details {
    display: grid; grid-template-columns: 1fr 1fr; gap: 0;
    border: 1px solid var(--ld-border); border-radius: var(--ld-r);
    overflow: hidden; margin-top: 0.5rem;
  }
  .ld-drow {
    padding: 0.7rem 0.9rem;
    border-bottom: 1px solid var(--ld-border);
    border-right: 1px solid var(--ld-border);
  }
  .ld-drow:nth-child(even) { border-right: none; }
  /* Remove bottom border from last 2 rows */
  .ld-drow:nth-last-child(1),
  .ld-drow:nth-last-child(2) { border-bottom: none; }
  .ld-dl { font-size: 0.63rem; color: var(--ld-muted); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; margin-bottom: 0.2rem; }
  .ld-dv { font-size: 0.845rem; color: var(--ld-navy); font-weight: 500; }

  /* Features checklist */
  .ld-features { display: grid; grid-template-columns: 1fr 1fr; gap: 0.55rem; margin-top: 0.25rem; }
  .ld-feat {
    display: flex; align-items: flex-start; gap: 0.5rem;
    font-size: 0.82rem; color: #3D4554; line-height: 1.4;
  }
  .ld-feat-dot {
    margin-top: 3px; flex-shrink: 0;
    width: 16px; height: 16px; border-radius: 50%;
    background: var(--ld-gold-pale);
    display: flex; align-items: center; justify-content: center;
  }
  .ld-feat-dot::after {
    content: '✓'; font-size: 0.55rem; font-weight: 900;
    color: var(--ld-gold-dim);
  }

  /* ── SIDEBAR ────────────────────────────────────────────────── */
  .ld-sidebar { display: none; }
  @media (min-width: 960px) {
    .ld-sidebar {
      display: block;
      position: sticky;
      top: 72px; /* topbar height + gap */
    }
  }

  .ld-pcard {
    background: var(--ld-white);
    border: 1px solid var(--ld-border);
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(19,30,48,0.12), 0 2px 8px rgba(0,0,0,0.06);
  }

  .ld-pcard-head {
    background: var(--ld-navy);
    padding: 1.5rem 1.5rem 1.4rem;
    position: relative;
    overflow: hidden;
  }
  /* Subtle texture in the card header */
  .ld-pcard-head::before {
    content: '';
    position: absolute; top: -40px; right: -40px;
    width: 140px; height: 140px; border-radius: 50%;
    background: rgba(201,165,90,0.07);
    pointer-events: none;
  }
  .ld-pcard-head::after {
    content: '';
    position: absolute; bottom: -60px; left: -20px;
    width: 160px; height: 160px; border-radius: 50%;
    background: rgba(255,255,255,0.03);
    pointer-events: none;
  }

  .ld-pcard-badge {
    display: inline-block; font-size: 0.62rem; font-weight: 800;
    letter-spacing: 0.14em; text-transform: uppercase;
    padding: 0.28rem 0.7rem; border-radius: 4px;
    margin-bottom: 0.8rem; position: relative; z-index: 1;
  }
  .ld-pb-active   { background: #10B981; color: #fff; }
  .ld-pb-closed   { background: rgba(255,255,255,0.2); color: rgba(255,255,255,0.7); }
  .ld-pb-contract { background: #F59E0B; color: #fff; }
  .ld-pb-sold     { background: #EF4444; color: #fff; }

  .ld-pcard-price {
    font-family: var(--ld-serif); font-size: 2.35rem; font-weight: 700;
    color: #fff; line-height: 1; letter-spacing: -0.01em;
    position: relative; z-index: 1;
  }
  .ld-pcard-addr {
    font-size: 0.78rem; color: rgba(255,255,255,0.55);
    margin-top: 0.5rem; line-height: 1.45; position: relative; z-index: 1;
    font-weight: 400;
  }

  .ld-pcard-body { padding: 1.25rem 1.5rem 1.5rem; }

  /* 3-col mini stats in sidebar */
  .ld-ss {
    display: grid; grid-template-columns: repeat(3, 1fr);
    border: 1px solid var(--ld-border); border-radius: 10px;
    overflow: hidden; margin-bottom: 1.25rem;
  }
  .ld-ss-col {
    text-align: center; padding: 0.8rem 0.5rem;
    border-right: 1px solid var(--ld-border);
  }
  .ld-ss-col:last-child { border-right: none; }
  .ld-ss-val { font-size: 1rem; font-weight: 700; color: var(--ld-navy); line-height: 1; }
  .ld-ss-lbl { font-size: 0.58rem; color: var(--ld-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 0.2rem; font-weight: 600; }

  .ld-cta-a {
    display: block; width: 100%; padding: 0.9rem;
    background: var(--ld-gold); color: #fff;
    font-family: var(--ld-sans); font-weight: 700; font-size: 0.88rem;
    letter-spacing: 0.03em; border: none; border-radius: 10px;
    cursor: pointer; text-align: center; margin-bottom: 0.625rem;
    transition: background 0.18s, transform 0.15s;
  }
  .ld-cta-a:hover { background: #D4AF5C; transform: translateY(-1px); }
  .ld-cta-a:active { transform: translateY(0); }

  .ld-cta-b {
    display: block; width: 100%; padding: 0.875rem;
    background: transparent; color: var(--ld-navy);
    font-family: var(--ld-sans); font-weight: 600; font-size: 0.875rem;
    border: 1.5px solid var(--ld-navy); border-radius: 10px;
    cursor: pointer; text-align: center; margin-bottom: 1.1rem;
    transition: background 0.18s, color 0.18s;
  }
  .ld-cta-b:hover { background: var(--ld-navy); color: #fff; }

  /* Agent strip in sidebar */
  .ld-agent {
    display: flex; align-items: center; gap: 0.875rem;
    padding-top: 1rem;
    border-top: 1px solid var(--ld-border);
  }
  .ld-agent-av {
    width: 46px; height: 46px; border-radius: 50%; flex-shrink: 0;
    background: var(--ld-gold);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--ld-serif); font-size: 1rem;
    color: #fff; font-weight: 600; letter-spacing: 0.02em;
  }
  .ld-agent-name { font-size: 0.82rem; font-weight: 700; color: var(--ld-navy); }
  .ld-agent-creds { font-size: 0.68rem; color: var(--ld-muted); margin-top: 0.1rem; }
  .ld-agent-tel {
    font-size: 0.72rem; color: var(--ld-gold); font-weight: 700;
    margin-top: 0.25rem; letter-spacing: 0.02em; text-decoration: none;
  }
  .ld-agent-tel:hover { color: var(--ld-gold-dim); }

  /* ── MOBILE STICKY BAR ──────────────────────────────────────── */
  .ld-floatbar {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 40;
    background: rgba(255,255,255,0.96); backdrop-filter: blur(10px);
    border-top: 1px solid var(--ld-border);
    padding: 0.875rem 1.25rem;
    display: flex; align-items: center; justify-content: space-between;
    box-shadow: 0 -4px 24px rgba(0,0,0,0.1);
  }
  @media (min-width: 960px) { .ld-floatbar { display: none; } }

  .ld-fb-price {
    font-family: var(--ld-serif); font-size: 1.45rem; font-weight: 700;
    color: var(--ld-navy); line-height: 1;
  }
  .ld-fb-status { font-size: 0.67rem; color: var(--ld-muted); margin-top: 0.15rem; font-weight: 500; }
  .ld-fb-btn {
    background: var(--ld-gold); color: #fff;
    font-family: var(--ld-sans); font-weight: 700; font-size: 0.875rem;
    padding: 0.7rem 1.6rem; border-radius: 10px; border: none; cursor: pointer;
    letter-spacing: 0.02em;
    transition: background 0.18s;
  }
  .ld-fb-btn:hover { background: #D4AF5C; }

  /* ── LIGHTBOX ───────────────────────────────────────────────── */
  .ld-lb {
    position: fixed; inset: 0; z-index: 999;
    background: rgba(8,13,22,0.97);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    animation: ldLbIn 0.2s ease;
  }
  @keyframes ldLbIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .ld-lb-close {
    position: absolute; top: 1rem; right: 1rem;
    width: 42px; height: 42px; border-radius: 50%;
    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.18);
    color: rgba(255,255,255,0.85); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem; transition: background 0.15s; font-family: var(--ld-sans);
  }
  .ld-lb-close:hover { background: rgba(255,255,255,0.22); }

  .ld-lb-counter {
    position: absolute; top: 1.2rem; left: 50%; transform: translateX(-50%);
    font-size: 0.72rem; color: rgba(255,255,255,0.5);
    font-weight: 600; letter-spacing: 0.1em; font-family: var(--ld-sans);
  }

  .ld-lb-inner {
    width: 90vw; max-width: 1060px;
    display: flex; flex-direction: column; align-items: center;
  }

  .ld-lb-img-wrap {
    position: relative; width: 100%;
    max-height: 72vh; display: flex; align-items: center;
  }
  .ld-lb-img {
    width: 100%; max-height: 72vh;
    object-fit: contain; border-radius: 8px; display: block;
  }

  .ld-lb-arrow {
    position: absolute; top: 50%; transform: translateY(-50%);
    width: 48px; height: 48px; border-radius: 50%;
    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
    color: rgba(255,255,255,0.85); font-size: 1rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
  }
  .ld-lb-arrow:hover { background: rgba(255,255,255,0.22); }
  .ld-lb-arrow-p { left: -64px; }
  .ld-lb-arrow-n { right: -64px; }
  @media (max-width: 860px) {
    .ld-lb-arrow-p { left: 0.5rem; }
    .ld-lb-arrow-n { right: 0.5rem; }
    .ld-lb-inner { width: 100vw; }
    .ld-lb-img { border-radius: 0; }
  }

  .ld-lb-caption {
    text-align: center; color: rgba(255,255,255,0.55); font-size: 0.82rem;
    margin-top: 1rem; font-weight: 400; letter-spacing: 0.03em;
    font-family: var(--ld-sans);
  }

  .ld-lb-thumbs {
    display: flex; gap: 6px; margin-top: 1.25rem;
    overflow-x: auto; max-width: 90vw; scrollbar-width: none;
    padding-bottom: 4px;
  }
  .ld-lb-thumbs::-webkit-scrollbar { display: none; }
  .ld-lb-thumb {
    flex-shrink: 0; width: 60px; height: 42px; border-radius: 4px;
    overflow: hidden; cursor: pointer; opacity: 0.45;
    border: 1.5px solid transparent;
    transition: opacity 0.15s, border-color 0.15s;
  }
  .ld-lb-thumb:hover { opacity: 0.7; }
  .ld-lb-thumb.on { opacity: 1; border-color: var(--ld-gold); }
  .ld-lb-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* ── UTILITY ────────────────────────────────────────────────── */
  .ld-divider { height: 1px; background: var(--ld-border); margin: 0; }

  @media (max-width: 480px) {
    .ld-features { grid-template-columns: 1fr; }
    .ld-details  { grid-template-columns: 1fr; }
    .ld-drow { border-right: none !important; }
    .ld-drow:nth-last-child(1) { border-bottom: none; }
    .ld-drow:nth-last-child(2) { border-bottom: 1px solid var(--ld-border); }
  }
`;

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
    agent, description, features } = listing;

  // Inject styles + fonts
  useEffect(() => {
    if (!document.getElementById("ld-styles")) {
      const el = document.createElement("style");
      el.id = "ld-styles";
      el.textContent = CSS;
      document.head.appendChild(el);
    }
    if (!document.getElementById("ld-fonts")) {
      const el = document.createElement("link");
      el.id   = "ld-fonts";
      el.rel  = "stylesheet";
      el.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&display=swap";
      document.head.appendChild(el);
    }
  }, []);

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
