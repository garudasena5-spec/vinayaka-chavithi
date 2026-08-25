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
  { name: "M.Sudheer", role: "Organizer & Sponsorship Lead", img: "/members/sudheer.jpg" },
  { name: "P.Srikanth Reddy", role: "Event Coordinator", img: "/members/srikanth.jpg" },
  { name: "K.Pavan", role: "President", img: "/members/pavan.jpg" },
  { name: "K.Vinay", role: "Event Organizer", img: "/members/vinay-k.jpg" },
  { name: "K.Vamsi", role: "Treasurer", img: "/members/vamsi.jpg" },
  { name: "Venky Parvatala", role: "Creative Director & Website Administrator", img: "teammem6.jpeg" },
  { name: "K.Sudhakar", role: "Utsav Head", img: "/members/sudhakar.jpg" },
  { name: "K.Rahul", role: "Volunteer Captain", img: "/members/rahul.jpg" },
  { name: "K.Praveen", role: "Visarjan Head", img: "/members/praveen.jpg" },
  { name: "K.Satheesh", role: "Art President", img: "/members/satheesh.jpg" },
  { name: "B.Teja", role: "Media Organizer", img: "/members/teja.jpg" },
  { name: "P.Dinesh", role: "Logistics Head", img: "/members/dinesh.jpg" },
  { name: "P.Charan", role: "Art Manager", img: "/members/charan.jpg" },
  { name: "U.Adi", role: "Support Lead", img: "/members/adi.jpg" },
  { name: "M.Srinu", role: "Support Coordinator", img: "/members/srinu.jpg" },
  { name: "M.Sai Teja", role: "Pooja Coordinator", img: "/members/saiteja.jpg" },
  { name: "M.Sai", role: "Vice President", img: "/members/sai.jpg" },
  { name: "M.Hemanth", role: "Fund Rising Manager", img: "/members/hemanth.jpg" },
  { name: "A. Naveen", role: "Community Head", img: "/members/naveen.jpg" },
  { name: "P.Yaswanth", role: "Art Member", img: "/members/yaswanth.jpg" },
  { name: "B.Santhosh", role: "Content Editor", img: "/members/santhosh.jpg" },
  { name: "V.Suresh", role: "Support Champion", img: "/members/suresh.jpg" },
  { name: "P. Ayeel Kumar", role: "Support Lead", img: "/members/ayeel.jpg" },
  { name: "A.Hariprasad", role: "Art Member", img: "/members/hariprasad.jpg" },
  { name: "U.Prasanth", role: "Support Member", img: "/members/prasanth.jpg" },
  { name: "P.Vinay", role: "Support Member", img: "/members/vinay-p.jpg" },
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
   Static full-bleed photo hero (matches the reference site): a
   background image, a legibility overlay, emblem + eyebrow + headline,
   two side-by-side CTA buttons, and the countdown plate underneath.
   Drop your own photo at /public/hero-ganesh.jpg. */
function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-bg" style={{ backgroundImage: "url('/Lord-Ganesh.webp')" }} aria-hidden="true" />
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