"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";

const nav = ["Home", "About", "Team", "Contributions", "Gallery", "Contact"];

/* ------------------------------------------------------------------
   Committee roster — single flat list, rendered as photo cards in a
   wrapping grid (matches the reference site's "Meet our members"
   layout). Swap these placeholder `img` paths for real photos in
   /public/members/ whenever you have them — the card gracefully
   falls back to initials if an image 404s.
------------------------------------------------------------------- */
const committee = [
  { name: "M.Sudheer", role: "Organizer & Sponsorship Lead", img: "SS.jpeg" },
  { name: "P.Srikanth Reddy", role: "Event Coordinator", img: "PS.jpeg" },
  { name: "K.Pavan", role: "President", img: "K.Pavan.jpeg" },
  { name: "K.Vinay", role: "Event Organizer", img: "Vinay2.jpeg" },
  { name: "K.Vamsi", role: "Treasurer", img: "Vamsi.jpeg" },
  { name: "Venky Parvatala", role: "Creative Director & Website Administrator", img: "teammem6.jpeg" },
  { name: "K.Sudhakar", role: "Utsav Head", img: "Sudha.png" },
  { name: "K.Rahul", role: "Volunteer Captain", img: "Rahul.jpeg" },
  { name: "K.Praveen", role: "Visarjan Head", img: "Praveen.jpeg" },
  { name: "K.Satheesh", role: "Art President", img: "K.Sateesh.jpeg" },
  { name: "M.Sai", role: "Vice President", img: "MS.jpeg" },
  { name: "B.Teja", role: "Media Organizer", img: "Teja2.jpeg" },
  { name: "P.Dinesh", role: "Logistics Head", img: "Dinesh.png" },
  { name: "P.Charan", role: "Art Manager", img: "P.Charan.jpeg" },
  { name: "M.Srinu", role: "Support Coordinator", img: "Srinu2.jpeg" },
  { name: "M.Sai Teja", role: "Pooja Coordinator", img: "M.SaiT.jpeg" },
  { name: "M.Hemanth", role: "Fund Rising Manager", img: "Hemanth.jpeg" },
  { name: "A.Naveen", role: "Community Head", img: "A.Naveen.jpeg" },
  { name: "P.Yaswanth", role: "Art Member", img: "PY.png" },
  { name: "B.Santhosh", role: "Content Editor", img: "B.jpeg" },
  { name: "Sai", role: "Content Supporter", img: "Sai.jpeg" },
  { name: "V.Suresh", role: "Support Champion", img: "VS.jpeg" },
  { name: "P.Ayeel Kumar", role: "Support Lead", img: "PA.png" },
  { name: "A.Hariprasad", role: "Art Member", img: "Hari.jpeg" },
  { name: "K.Prasanth", role: "Support Member", img: "UP.jpeg" },
  { name: "P.Vinay", role: "Support Member", img: "PV.jpeg" },
  { name: "U.Adi", role: "Support Member", img: "UP.jpeg" },
];

function getInitials(name: string): string {
  const tokens = name
    .split(/[\s.]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  return tokens
    .slice(0, 2)
    .map((t) => t[0]?.toUpperCase() ?? "")
    .join("");
}

const gallery = [
  { title: "Celebration", src: "./Logo.jpeg" },
  { title: "Tradition", src: "./vinayaka1.png" },
  { title: "Togetherness", src: "./Lord-Ganesh.webp" },
  { title: "Devotion", src: "./ganesh4.png" },
  { title: "The Process", src: "./ganesh3.jpg" },
];
const GOOGLE_DRIVE_MEMORIES_URL = "https://photos.app.goo.gl/a4Uqh3aS8WCVZYVx9";

/* ------------------------------------------------------------------
   Hero background media. Drop your video file at this exact path
   inside /public (e.g. public/hero-bg1.mp4). It renders through a
   real <video> element below — autoplay, muted, loop, playsInline —
   so it behaves like a silent looping background on both desktop and
   mobile. An optional poster frame shows instantly while the video
   buffers, so there's never a flash of black. Change either path to
   match your actual file names.
------------------------------------------------------------------- */
const HERO_BG_SRC = "/hero-bg1.mp4";
const HERO_BG_POSTER = "/hero-bg1-poster.jpg"; // optional — first-frame fallback image; remove the poster prop below if you don't have one

type FinancialSummary = {
  totalReceived: number;
  totalSpent: number;
  remaining: number;
  expenses: { _id: string; category: string; amount: number }[];
};

/* ------------------------------------------------------------------
   Motion hooks — unchanged from before, applied via inline styles so
   they layer on top of globals.css without new selectors colliding.
------------------------------------------------------------------- */

/** Fade + rise in once the element enters the viewport. */
function useReveal<T extends HTMLElement>(delay = 0) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(36px)";
    el.style.transition = `opacity .8s cubic-bezier(.2,.7,.2,1) ${delay}ms, transform .8s cubic-bezier(.2,.7,.2,1) ${delay}ms`;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return ref;
}

/** 3D tilt toward the cursor, reset on mouse leave. */
function useTilt<T extends HTMLElement>(max = 10) {
  const ref = useRef<T>(null);
  const onMouseMove = (e: React.MouseEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateZ(0)`;
  };
  const onMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform .5s cubic-bezier(.2,.8,.2,1)";
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  };
  const onMouseEnter = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform .12s ease-out";
  };
  return { ref, onMouseMove, onMouseLeave, onMouseEnter };
}

/* ---------------- Site mark (logo image, graceful fallback) ---------------- */
function SiteLogo({ variant }: { variant: "nav" | "hero" }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return variant === "hero" ? (
      <div className="hero-logo hero-logo--fallback" aria-hidden="true">
        
      </div>
    ) : (
      <i>✦</i>
    );
  }
  return (
    <img
      src="/Logo1.jpeg"
      alt="GARUDASENA emblem"
      className={variant === "hero" ? "hero-logo" : "nav-logo"}
      onError={() => setFailed(true)}
    />
  );
}

/* ---------------- Garland divider (signature element) ----------------
   A hand-strung marigold garland separating sections, the way real
   toran bunting marks a threshold. Sways gently; respects
   prefers-reduced-motion. */
function Garland({ tone = "light" }: { tone?: "light" | "dark" }) {
  const flowers = Array.from({ length: 17 });
  return (
    <div className={`garland garland--${tone}`} aria-hidden="true">
      <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="garland-svg">
        <path d="M0 6 C 200 54, 400 54, 600 30 C 800 6, 1000 6, 1200 40" className="garland-string" />
      </svg>
      <div className="garland-flowers">
        {flowers.map((_, i) => (
          <span key={i} className="garland-flower" style={{ animationDelay: `${(i % 5) * 0.4}s` }}>
            ✿
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Countdown (hydration-safe, big-format) ---------------- */
function Countdown() {
  const target = new Date("2026-09-14T00:00:00+05:30").getTime();
  // null on the very first render, so server HTML and the first client
  // paint match exactly — this is what avoids the hydration error.
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    setLeft(target - Date.now());
    const i = setInterval(() => setLeft(target - Date.now()), 1000);
    return () => clearInterval(i);
  }, [target]);

  const labels = ["Days", "Hours", "Minutes", "Seconds"];

  if (left === null) {
    return (
      <div className="countdown">
        {labels.map((label) => (
          <div className="countdown-cell" key={label}>
            <strong>--</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    );
  }
  if (left <= 0) return <p className="begun">Ganesh Chaturthi Has Begun — Ganpati Bappa Morya!</p>;

  const v = [Math.floor(left / 864e5), Math.floor((left / 36e5) % 24), Math.floor((left / 6e4) % 60), Math.floor((left / 1e3) % 60)];
  return (
    <div className="countdown">
      {v.map((x, i) => (
        <div className="countdown-cell" key={i}>
          <strong>{String(x).padStart(2, "0")}</strong>
          <span>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Hero ----------------
   Static full-bleed video hero (matches the reference site): a
   background <video> layer (autoplay, muted, loop, playsInline — the
   combination required for browsers, especially iOS Safari, to allow
   autoplay without a user tap), a legibility overlay, emblem +
   eyebrow + headline, two side-by-side CTA buttons, and the
   countdown plate underneath. Set HERO_BG_SRC above to your actual
   video file path — it will loop silently in the background on both
   desktop and mobile. */
function Hero() {
  return (
    <section className="hero" id="home">
      <video
        className="hero-bg"
        src={HERO_BG_SRC}
        poster={HERO_BG_POSTER}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className="hero-overlay" aria-hidden="true" />

      <div className="hero-inner">
        <SiteLogo variant="hero" />
        <p className="hero-location">Mekanuru East Street</p>
        <p className="eyebrow">Ganesh Chaturthi community celebration</p>
        <h1>GARUDASENA</h1>
        <p className="hero-sub">Where heritage meets the energy of a new generation. A celebration made together, for everyone.</p>

        <div className="actions">
          <a href="#contributions" className="btn btn-primary">
            Join the celebration <span>→</span>
          </a>
          <a href="#about" className="btn btn-secondary">
            Discover our story
          </a>
        </div>

        <div className="countdown-plate">
          <span className="countdown-plate-label">Ganesh Chaturthi begins in</span>
          <Countdown />
        </div>

        <div className="hero-tags">
          <span className="pill">Ganesh Chaturthi 2026</span>
          <span className="pill">Mekanuru youth group</span>
          <span className="pill">Contributions via UPI</span>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Ganesha mark (inline SVG used by the loader) ----------------
   A minimal, stylised elephant-head glyph — ears, crown dot, eyes and
   a curved trunk — built from plain shapes so it stays crisp at any
   size and can be animated purely with CSS (trunk sway + ear flap). */
function GaneshaMark() {
  return (
    <svg className="loader-mark" viewBox="0 0 104 104" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="ganeshGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0b661" />
          <stop offset="100%" stopColor="#7a2230" />
        </linearGradient>
      </defs>
      <ellipse className="loader-ear left" cx="26" cy="44" rx="19" ry="23" fill="url(#ganeshGrad)" opacity="0.94" />
      <ellipse className="loader-ear right" cx="78" cy="44" rx="19" ry="23" fill="url(#ganeshGrad)" opacity="0.94" />
      <circle cx="52" cy="46" r="26" fill="url(#ganeshGrad)" />
      <circle cx="52" cy="21" r="3.4" fill="#fff3de" />
      <path d="M46 16 L52 10 L58 16" stroke="#fff3de" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="43" cy="42" r="2.6" fill="#1a1006" />
      <circle cx="61" cy="42" r="2.6" fill="#1a1006" />
      <path d="M56 58 L 62 64" stroke="#fff3de" strokeWidth="3" strokeLinecap="round" />
      <path
        className="loader-trunk"
        d="M50 58 C 48 68, 61 69, 59 79 C 58 85, 49 87, 44 83"
        stroke="#fff3de"
        strokeWidth="6.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ---------------- Loading screen ----------------
   Full-screen intro shown for ~5.5-6s on every load and every reload
   (it's tied to component mount, not to any stored "seen before"
   flag, so it plays every single time the page opens). Three pulsing
   rings breathe behind a glowing, gently-animated Ganesha mark; the
   group name reveals letter by letter underneath; a thin progress
   hairline fills across the same duration; then the whole thing
   fades into the page. Scrolling is locked while it's up so nothing
   jumps once it clears. */
const LOADER_DURATION_MS = 5800;
const LOADER_FADE_MS = 650;
const LOADER_REDUCED_MS = 2200;
const LOADER_WORD = "MEKANURU YOUTH";

function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduce ? LOADER_REDUCED_MS : LOADER_DURATION_MS;

    const hideTimer = setTimeout(() => setHide(true), duration);
    const doneTimer = setTimeout(() => {
      document.body.style.overflow = prevOverflow;
      onDone();
    }, duration + LOADER_FADE_MS);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(doneTimer);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`loader ${hide ? "hide" : ""}`} role="status" aria-live="polite" aria-label="Loading GARUDASENA">
      <div className="loader-flowers" aria-hidden="true">
        <span style={{ left: "12%", top: "18%" }}>✿</span>
        <span style={{ right: "14%", top: "24%", animationDelay: "1.4s" }}>✿</span>
        <span style={{ left: "18%", bottom: "20%", animationDelay: "2.6s" }}>✿</span>
        <span style={{ right: "10%", bottom: "16%", animationDelay: "3.4s" }}>✿</span>
      </div>

      <div className="loader-rings" aria-hidden="true">
        <span className="loader-ring" />
        <span className="loader-ring" />
        <span className="loader-ring" />
        <div className="loader-glow" />
        <GaneshaMark />
      </div>

      <p className="loader-eyebrow">Ganpati Bappa Morya</p>

      <div className="loader-text">
        {LOADER_WORD.split("").map((ch, i) => (
          <span key={i} style={{ animationDelay: `${0.55 + i * 0.045}s` }}>
            {ch === " " ? "\u00A0" : ch}
          </span>
        ))}
      </div>

      <p className="loader-sub">Ganesh Chaturthi · 2026</p>

      <div className="loader-bar" aria-hidden="true">
        <i />
      </div>
    </div>
  );
}

/* ---------------- Member card (photo, name, role) ----------------
   Matches the reference site's team-grid pattern: circular photo on
   top, name and role underneath. Falls back to initials if the image
   is missing so the grid never shows a broken-image icon. */
function MemberCard({ name, role, img, index }: { name: string; role: string; img: string; index: number }) {
  const reveal = useReveal<HTMLDivElement>((index % 10) * 50);
  const [failed, setFailed] = useState(false);
  return (
    <div className="member-card" ref={reveal}>
      <div className="member-photo">
        {!failed ? (
          <img src={img} alt={name} onError={() => setFailed(true)} />
        ) : (
          <span className="member-photo-fallback">{getInitials(name)}</span>
        )}
      </div>
      <h3>{name}</h3>
      <p>{role}</p>
    </div>
  );
}

function GalleryTile({ title, src, i, onOpen }: { title: string; src: string; i: number; onOpen: (title: string) => void }) {
  const reveal = useReveal<HTMLButtonElement>(i * 60);
  const tilt = useTilt<HTMLButtonElement>(8);
  return (
    <button
      className={`item i${i}`}
      onClick={() => onOpen(title)}
      ref={(node) => {
        (reveal as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        (tilt.ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      }}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      onMouseEnter={tilt.onMouseEnter}
    >
     
      <img className="gallery-image" src={src} alt={title} />
      <span>{title}</span>
      <i>EXPLORE ↗</i>
    </button>
  );
}

/** Generic scroll-reveal wrapper for whole sections (div, not <section>,
    so it can wrap any element type without prop-type friction). */
function Reveal({ children, delay = 0, ...rest }: { children: React.ReactNode; delay?: number; className?: string; id?: string }) {
  const ref = useReveal<HTMLDivElement>(delay);
  return (
    <div ref={ref} {...rest}>
      {children}
    </div>
  );
}

export default function HomePage() {
  const [menu, setMenu] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const qrTilt = useTilt<HTMLDivElement>(6);

  useEffect(() => {
    const f = () => setScrolled(scrollY > 35);
    addEventListener("scroll", f);
    return () => removeEventListener("scroll", f);
  }, []);

  useEffect(() => {
    api<FinancialSummary>("/api/financial-summary").then(setFinancialSummary).catch(() => setFinancialSummary(null));
  }, []);

  return (
    <main>
      {loading && <LoadingScreen onDone={() => setLoading(false)} />}
      <div className="grain" />
      <header className={`nav ${scrolled ? "scrolled" : ""}`}>
        <a className="brand" href="#home">
          <SiteLogo variant="nav" /> GARUDASENA
        </a>
        <button className="menu" onClick={() => setMenu(!menu)} aria-label="Toggle menu">
          {menu ? "×" : "☰"}
        </button>
        <nav className={menu ? "open" : ""}>
          {nav.map((x) => (
            <a onClick={() => setMenu(false)} href={`#${x.toLowerCase()}`} key={x}>
              {x}
            </a>
          ))}
        </nav>
        <a className="btn btn-outline btn-sm nav-cta" href="#contributions">
          Contribute <span>↗</span>
        </a>
      </header>

      <Hero />
      <Garland tone="dark" />

      <Reveal className="intro section" id="about">
        <div>
          <p className="eyebrow">THE SPIRIT OF GARUDASENA</p>
          <h2>
            Rooted in <em>faith.</em>
            <br />
            Built for <em>tomorrow.</em>
          </h2>
        </div>
        <div className="intro-copy">
          <p>GARUDASENA is more than a celebration. It is a shared expression of devotion, a stage for our youth, and a promise to carry tradition forward with fresh energy.</p>
          <a href="#team" className="link-underline">
            Meet our community ↗
          </a>
        </div>
        <div className="stats">
          <div>
            <strong>01</strong>
            <span>Shared purpose</span>
          </div>
          <div>
            <strong>∞</strong>
            <span>Moments of joy</span>
          </div>
          <div>
            <strong>2026</strong>
            <span>A new chapter</span>
          </div>
        </div>
      </Reveal>

      <section className="team-section section" id="team">
        <p className="eyebrow">THE PEOPLE BEHIND THE PRAYER</p>
        <h2>
          One <em>vision,</em>
          <br />
          many hands.
        </h2>
        <p className="team-intro">The dedicated members who work together every year to make the Ganesh Chaturthi celebrations successful.</p>

        <div className="members-grid">
          {committee.map((m, i) => (
            <MemberCard key={m.name} name={m.name} role={m.role} img={m.img} index={i} />
          ))}
        </div>
      </section>

      <Garland tone="light" />

      <Reveal className="contribute" id="contributions">
        <div>
          <p className="eyebrow">A SMALL GESTURE, A GREAT CELEBRATION</p>
          <h2>
            Offer your
            <br />
            <em>support.</em>
          </h2>
          <p>Every contribution helps us create a meaningful, welcoming celebration for our entire community.</p>
          <a href="#contact" className="btn btn-light">
            Contribute now <span>→</span>
          </a>
        </div>
        <div className="qr-tilt" ref={qrTilt.ref} onMouseMove={qrTilt.onMouseMove} onMouseLeave={qrTilt.onMouseLeave} onMouseEnter={qrTilt.onMouseEnter}>
          <div className="contribute-card">
            <div className="contribute-card-header">
              <span>SCAN & CONTRIBUTE</span>
              <i>✦</i>
            </div>

            <div className="qr-wrapper">
              <img src="/phonepay.png" alt="GARUDASENA UPI QR Code" />
            </div>

            <div className="upi-details">
              <p>UPI ID</p>

              <div className="upi-row">
                <strong>7989141890@ybl</strong>
                <button type="button" className="btn btn-copy" onClick={() => navigator.clipboard.writeText("7989141890@ybl")}>
                  Copy
                </button>
              </div>
            </div>

            <div className="payment-note">
              <span>✓</span>
              <small>Scan the QR code or use the UPI ID above to contribute.</small>
            </div>

            <div className="managed-by">
              Payment details managed securely by <strong>GARUDASENA</strong>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal className="received section">
        <div>
          <p className="eyebrow">TRANSPARENT CELEBRATION FUND</p>
          <h2>
            Fund
            <br />
            <em>overview.</em>
          </h2>
          <div className="total">
            <span>TOTAL CONTRIBUTIONS</span>
            <strong>
              ₹ <b>{(financialSummary?.totalReceived ?? 0).toLocaleString("en-IN")}</b>
            </strong>
          </div>
          <div className="fund-cards">
            <div><span>Total amount received</span><strong>₹{(financialSummary?.totalReceived ?? 0).toLocaleString("en-IN")}</strong></div>
            <div><span>Amount spent</span><strong>₹{(financialSummary?.totalSpent ?? 0).toLocaleString("en-IN")}</strong></div>
            <div className="balance"><span>Remaining amount</span><strong>₹{(financialSummary?.remaining ?? 0).toLocaleString("en-IN")}</strong></div>
          </div>
        </div>
        <div className="expense-breakdown">
          <div className="expense-heading"><div><p className="eyebrow">SPENDING BREAKDOWN</p><h3>Where the fund is <em>going.</em></h3></div><span>{financialSummary?.expenses.length ?? 0} categories</span></div>
          <div className="expense-list">
            {financialSummary?.expenses.map((expense) => (
              <div key={expense._id}>
                <span className="expense-mark" />
                <b>{expense.category}</b>
                <strong>₹{expense.amount.toLocaleString("en-IN")}</strong>
              </div>
            ))}
            {!financialSummary?.expenses.length && <p className="empty-content">Spending details will be published here by the organizers.</p>}
          </div>
        </div>
      </Reveal>

      <section className="gallery section" id="gallery">
        <div className="gallery-head">
          <div>
            <p className="eyebrow">MEMORIES IN THE MAKING</p>
            <h2>
              Frames of <em>faith.</em>
            </h2>
          </div>
          <a href={GOOGLE_DRIVE_MEMORIES_URL} target="_blank" rel="noreferrer">
            View all memories ↗
          </a>
        </div>
        <div className="gallery-grid">
          {gallery.map(({ title, src }, i) => (
            <GalleryTile key={title} title={title} src={src} i={i} onOpen={setPicked} />
          ))}
        </div>
      </section>

      <footer id="contact">
        <p className="eyebrow">GANPATI BAPPA MORYA</p>
        <h2>
          Let&rsquo;s make it
          <br />
          <em>unforgettable.</em>
        </h2>
        <a className="email" href="mailto:hello@garudasena.in">
          hello@garudasena.in ↗
        </a>
        <div className="footer-bottom">
          <a className="brand" href="#home">
            <SiteLogo variant="nav" /> GARUDASENA
          </a>
          <strong>
            <p>Website made by Campus Code Labs</p>
          </strong>
          <span>
            For website{" "}
            <a href="https://wa.me/8985373780" target="_blank" rel="noopener noreferrer">
              contact:<strong>campuscodelabs@gmail.com</strong>
            </a>
          </span>
        </div>
      </footer>

      {picked && (
        <div className="modal" onClick={() => setPicked(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPicked(null)}>×</button>
            
            <h3>{picked}</h3>
            <p>GARUDASENA · 2026</p>
          </div>
        </div>
      )}
    </main>
  );
}