"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";

const nav = ["Home", "About", "Team", "Contributions", "Gallery", "Contact"];
const team = [
  { initial: "", name: "k Pavan", role: "President", description: "Guiding every moment with care and clarity.", src: "/teammem1.png" },
  { initial: "", name: "K Sudhakar", role: "ustav head", description: "Creating an experience the community feels.", src: "/teammem2.png" },
  { initial: "", name: "P Dinesh", role: "Logistics head", description: "Making every detail come together beautifully.", src: "/teammem3.png" },
  { initial: "", name: "K rahul", role: "Volunteer captain", description: "Bringing our people and purpose closer.", src: "/teammem4.jpeg" },
  { initial: "", name: "K sathesh", role: "Art President", description: "Keeping every ritual rooted in shared devotion.", src: "/teammem5.jpeg" },
  { initial: "", name: "P venkatesh", role: "Creative Director", description: "Caring for every contribution with transparency.", src: "/teammem6.jpeg" },
  { initial: "", name: "M Srinu", role: "Support Coordinator", description: "Helping hands come together at every step.", src: "/teammem7.png" },
];
// Replace each source below with the final image URL when it is available.
// These cards are deliberately kept as static homepage content (no API or storage service).
const gallery = [
  { title: "Celebration", src: "./Logo.jpeg" },
  { title: "Tradition", src: "./vinayaka1.png" },
  { title: "Togetherness", src: "./Lord-Ganesh.webp" },
  { title: "Devotion", src: "./ganesh4.png" },
  { title: "The Process", src: "./ganesh3.jpg" },
];
const GOOGLE_DRIVE_MEMORIES_URL = "https://photos.app.goo.gl/a4Uqh3aS8WCVZYVx9";
type FinancialSummary = {
  totalReceived: number;
  totalSpent: number;
  remaining: number;
  expenses: { _id: string; category: string; amount: number }[];
};

/* ------------------------------------------------------------------
   All 3D / motion below is applied as inline styles via refs.
   Nothing here depends on new CSS classes, so it layers cleanly on
   top of your existing globals.css without touching or colliding
   with any of its selectors.
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
        <span>✦</span>
      </div>
    ) : (
      <i>✦</i>
    );
  }
  return (
    <img
      src="/logo.png"
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

/* ---------------- Ganesh mark ----------------
   Drop a transparent PNG/WebP at /public/ganesha-hero.png and it will
   be used automatically. Falls back to the drawn SVG murti otherwise.
   Both use the existing ".mark" class from globals.css, so sizing,
   the drop-shadow, and the float animation apply either way. */
function GaneshMark() {
  const [failed, setFailed] = useState(false);
  if (!failed) {
    return <img src="/ganesha.png" alt="Lord Ganesha" className="mark" onError={() => setFailed(true)} />;
  }
  return (
    <svg className="mark" viewBox="0 0 430 500" role="img" aria-label="Lord Ganesha illustration">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffe7a5" />
          <stop offset=".45" stopColor="#f0a93b" />
          <stop offset="1" stopColor="#a3480f" />
        </linearGradient>
      </defs>
      <path d="M213 72c-52 5-84 40-82 91 1 39 25 76 45 99-20 37-6 84 38 109 3 35-14 67-52 88 52 9 103-17 109-70 43-28 58-78 37-120 24-32 31-59 24-84-11-44-55-68-91-52-11 4-19 10-28 18z" fill="url(#g)" stroke="#4a1c07" strokeWidth="2" />
      <path d="M207 143c-40 9-53 47-36 78 8 15 18 28 34 42m46-118c35 20 39 58 21 88-9 15-18 27-31 39" fill="none" stroke="#2c1005" strokeWidth="9" strokeLinecap="round" />
      <path d="M217 276c-42 12-57 54-28 83 16 16 38 23 59 18 18-4 32-18 39-34-24 14-45 12-56-7-11-21-3-42 16-59-10-5-20-5-30-1z" fill="#2c120b" />
      <path d="M178 205c12 16 30 17 44 1m33-1c-12 16-30 17-44 1" fill="none" stroke="#2c120b" strokeWidth="7" strokeLinecap="round" />
      <ellipse cx="211" cy="184" rx="4" ry="11" fill="#d6782e" />
      <path d="M215 43l18 37h-36zM102 146l41 11-22 26zm225 0l-41 11 22 26z" fill="url(#g)" />
      <path d="M95 397c35-49 73-55 120-20 43-35 83-29 120 20-39-19-79-18-120 4-41-22-81-23-120-4z" fill="url(#g)" />
      <path d="M69 426c49-24 96-19 146 14 50-33 97-38 146-14-45 34-97 43-146 17-50 26-101 17-146-17z" fill="#9c491c" opacity=".8" />
    </svg>
  );
}

/* ---------------- Hero with mouse-driven 3D parallax ---------------- */
function Hero() {
  const orbRef = useRef<HTMLDivElement>(null);
  const raysRef = useRef<HTMLDivElement>(null);
  const deityRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const onMove = (e: MouseEvent) => {
      const px = e.clientX / window.innerWidth - 0.5;
      const py = e.clientY / window.innerHeight - 0.5;
      if (orbRef.current) orbRef.current.style.transform = `translate3d(${px * 30}px, ${py * 30}px, 0)`;
      if (raysRef.current) raysRef.current.style.transform = `rotate(${px * 6}deg)`;
      if (deityRef.current)
        deityRef.current.style.transform = `perspective(1000px) rotateY(${px * -12}deg) rotateX(${py * 8}deg) translateZ(20px)`;
      if (plateRef.current)
        plateRef.current.style.transform = `perspective(1200px) rotateX(${py * -4}deg) rotateY(${px * 4}deg)`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section className="hero" id="home">
      <div className="orb" ref={orbRef} />
      <div className="rays" ref={raysRef} />
      <div className="hero-veil" />

      <div className="deity" aria-hidden="true">
        <div className="halo" />
        <div ref={deityRef} style={{ transition: "transform .15s ease-out", willChange: "transform" }}>
          <GaneshMark />
        </div>
      </div>

      <div className="hero-inner">
        <SiteLogo variant="hero" />
        <p className="eyebrow">Mekanuru East Street</p>
        <h1>
          <em>Garudasena</em>
        </h1>
        <p className="hero-sub">Where heritage meets the energy of a new generation. A celebration made together, for everyone.</p>

        <div className="countdown-plate" ref={plateRef}>
          <span className="countdown-plate-label">Ganesh Chaturthi begins in</span>
          <Countdown />
        </div>

        <div className="actions">
          <a href="#contributions" className="button">
            Join the celebration <span>→</span>
          </a>
          <a href="#about" className="link-underline">
            Discover our story ↓
          </a>
        </div>
      </div>

      <a className="scroll-cue" href="#about">
        <span>Scroll to explore</span>
        <i />
      </a>
    </section>
  );
}

function TeamCard({ initial, name, role, description, src, i }: (typeof team)[number] & { i: number }) {
  const reveal = useReveal<HTMLDivElement>(i * 80);
  const tilt = useTilt<HTMLDivElement>(8);
  return (
    <div
      ref={(node) => {
        (reveal as React.MutableRefObject<HTMLDivElement | null>).current = node;
        (tilt.ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      onMouseEnter={tilt.onMouseEnter}
    >
      <article>
        <div className={`portrait p${i}`}>
          <img src={src} alt={name} />
          <span>{initial}</span>
          <small>GARUDASENA</small>
        </div>
        <div className="member">
          <div>
            <h3>{name}</h3>
            <p>{role}</p>
          </div>
          <b>↗</b>
        </div>
        <p>{description}</p>
      </article>
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
      <b>✦</b>
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
        <a className="nav-cta" href="#contributions">
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
        <div className="team-marquee">
          <div className="team-grid">
            {[...team, ...team].map((member, i) => (
              <TeamCard key={`${member.src}-${i}`} {...member} i={i % team.length} />
            ))}
          </div>
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
          <a href="#contact" className="button light">
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
                <button type="button" onClick={() => navigator.clipboard.writeText("7989141890@ybl")}>
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
            <span>✦</span>
            <h3>{picked}</h3>
            <p>GARUDASENA · 2026</p>
          </div>
        </div>
      )}
    </main>
  );
}
