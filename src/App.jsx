import { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";

// ─── THEME ───────────────────────────────────────────────────────────────────
const theme = {
  forest: "#1a3a2a",
  green: "#2d6a4f",
  mid: "#40916c",
  light: "#74c69d",
  pale: "#b7e4c7",
  cream: "#fefae0",
  sand: "#fdf3dc",
  warm: "#f5e6c8",
  text: "#1c2b20",
  muted: "#5a7a65",
  white: "#ffffff",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', sans-serif; background: #fefae0; color: #1c2b20; }
  a { text-decoration: none; color: inherit; }
  
  .fade-in { animation: fadeUp 0.7s ease both; }
  .fade-in-2 { animation: fadeUp 0.7s 0.15s ease both; }
  .fade-in-3 { animation: fadeUp 0.7s 0.3s ease both; }
  .fade-in-4 { animation: fadeUp 0.7s 0.45s ease both; }
  
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .card-hover {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
  }
  .card-hover:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 60px rgba(26,58,42,0.15) !important;
  }

  .btn-primary {
    background: #2d6a4f;
    color: white;
    border: none;
    padding: 16px 32px;
    border-radius: 50px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s ease;
    letter-spacing: 0.02em;
  }
  .btn-primary:hover {
    background: #1a3a2a;
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(45,106,79,0.35);
  }

  .btn-outline {
    background: transparent;
    color: #2d6a4f;
    border: 2px solid #2d6a4f;
    padding: 14px 30px;
    border-radius: 50px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s ease;
  }
  .btn-outline:hover {
    background: #2d6a4f;
    color: white;
    transform: translateY(-2px);
  }

  .chip-select {
    padding: 10px 20px;
    border-radius: 50px;
    border: 2px solid #b7e4c7;
    background: white;
    color: #2d6a4f;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }
  .chip-select:hover { border-color: #2d6a4f; background: #f0faf4; }
  .chip-select.active { background: #2d6a4f; color: white; border-color: #2d6a4f; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #fefae0; }
  ::-webkit-scrollbar-thumb { background: #74c69d; border-radius: 3px; }

  .nav-link {
    font-size: 15px;
    font-weight: 500;
    color: #1c2b20;
    padding: 8px 16px;
    border-radius: 50px;
    transition: all 0.2s ease;
  }
  .nav-link:hover { background: #f0faf4; color: #2d6a4f; }

  .section-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #e8f5ee;
    color: #2d6a4f;
    padding: 6px 16px;
    border-radius: 50px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 16px;
  }

  .destination-card {
    border-radius: 20px;
    overflow: hidden;
    position: relative;
    aspect-ratio: 3/4;
    cursor: pointer;
  }

  .planner-chip {
    padding: 10px 20px;
    border-radius: 50px;
    border: 2px solid #b7e4c7;
    background: white;
    color: #2d6a4f;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .planner-chip:hover { border-color: #2d6a4f; }
  .planner-chip.selected { background: #2d6a4f; color: white; border-color: #2d6a4f; }
`;

// ─── DESTINATIONS DATA ────────────────────────────────────────────────────────
const destinations = [
  { name: "Switzerland", emoji: "🇨🇭", tag: "Alpine magic", color: "#1a3a2a", light: "#b7e4c7", desc: "Oeschinensee · Saxer Lücke · Bernina Express" },
  { name: "Italy", emoji: "🇮🇹", tag: "La dolce vita", color: "#5c2a0a", light: "#f5c9a0", desc: "Rome · Venice · Amalfi · Dolomites" },
  { name: "France", emoji: "🇫🇷", tag: "Timeless beauty", color: "#1a2a5c", light: "#a0b4f5", desc: "Paris · Provence · French Riviera" },
  { name: "Germany", emoji: "🇩🇪", tag: "Hidden gems", color: "#2a1a3a", light: "#c9a0f5", desc: "Black Forest · Eibsee · Christmas Markets" },
];

const guides = [
  { title: "Switzerland Travel Guide", emoji: "🇨🇭", desc: "Lakes, hikes, trains & hidden gems", trigger: "SWISS", color: "#e8f5ee" },
  { title: "Eibsee Day Trip Guide", emoji: "🪞", desc: "Bavaria's secret mirror lake", trigger: "EIBSEE", color: "#e8f0f5" },
  { title: "PTO Europe Playbook", emoji: "✈️", desc: "Turn 10 PTO days into 20+ in Europe", trigger: "PTO", color: "#fef5e8" },
];

// ─── PLANNER CONSTANTS ────────────────────────────────────────────────────────
const DESTS = ["Switzerland", "Italy", "France", "Germany", "All of Europe"];
const DURS = ["3 days", "5 days", "7 days", "10 days", "2 weeks"];
const STYLES = ["Cinematic & aesthetic", "Food & culture", "Adventure & hiking", "Budget travel", "Luxury"];
const BUDGETS = ["Budget (< $100/day)", "Mid-range ($100–200/day)", "Luxury ($200+/day)"];

// ─── NAV ──────────────────────────────────────────────────────────────────────
function Nav({ page, setPage }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(254,250,224,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(180,220,195,0.4)" : "none",
      transition: "all 0.3s ease",
      padding: "0 24px",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
        <button onClick={() => setPage("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 26 }}>🌍</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: theme.forest }}>Cameron Skye</span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button className="nav-link" onClick={() => setPage("home")} style={{ background: "none", border: "none" }}>Home</button>
          <button className="nav-link" onClick={() => setPage("planner")} style={{ background: "none", border: "none" }}>Trip Planner</button>
          <a href="https://linktr.ee/Cameronskye_" target="_blank" rel="noopener noreferrer" className="nav-link">Guides</a>
          <button className="btn-primary" style={{ marginLeft: 8, padding: "10px 22px", fontSize: 14 }} onClick={() => setPage("planner")}>Plan My Trip ✨</button>
        </div>
      </div>
    </nav>
  );
}

// ─── HOMEPAGE ─────────────────────────────────────────────────────────────────
function HomePage({ setPage }) {
  return (
    <div>
      {/* HERO */}
      <section style={{
        minHeight: "100vh",
        background: `linear-gradient(160deg, #e8f5ee 0%, #fefae0 50%, #fdf3dc 100%)`,
        display: "flex", alignItems: "center",
        padding: "100px 24px 60px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background blobs */}
        <div style={{ position: "absolute", top: "10%", right: "5%", width: 400, height: 400, borderRadius: "60% 40% 70% 30%", background: "rgba(116,198,157,0.15)", filter: "blur(40px)", animation: "float 6s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "15%", left: "2%", width: 300, height: 300, borderRadius: "40% 60% 30% 70%", background: "rgba(45,106,79,0.08)", filter: "blur(30px)" }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <div className="section-tag fade-in">🌿 9-5 Dad · World Traveller</div>
            <h1 className="fade-in-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(44px, 5vw, 68px)", fontWeight: 900, lineHeight: 1.05, color: theme.forest, margin: "8px 0 24px" }}>
              See Europe on<br />
              <em style={{ color: theme.green }}>your terms.</em>
            </h1>
            <p className="fade-in-3" style={{ fontSize: 18, color: theme.muted, lineHeight: 1.7, marginBottom: 36, maxWidth: 460 }}>
              A 9-5 dad using every PTO day to explore the world. Real destinations, honest guides, and a free AI trip planner built for people with limited time off.
            </p>
            <div className="fade-in-4" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="btn-primary" onClick={() => setPage("planner")}>Plan My Trip ✨</button>
              <a href="https://linktr.ee/Cameronskye_" target="_blank" rel="noopener noreferrer"><button className="btn-outline">Free Guides →</button></a>
            </div>
            <div style={{ marginTop: 40, display: "flex", gap: 32 }}>
              {[["🌍", "4", "Countries"], ["📸", "50+", "Locations"], ["✈️", "Free", "Trip Planner"]].map(([emoji, num, label]) => (
                <div key={label}>
                  <div style={{ fontSize: 22, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: theme.forest }}>{emoji} {num}</div>
                  <div style={{ fontSize: 13, color: theme.muted, marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero card */}
          <div style={{ position: "relative" }}>
            <div style={{
              background: "white",
              borderRadius: 28,
              padding: 8,
              boxShadow: "0 30px 80px rgba(26,58,42,0.15)",
              transform: "rotate(2deg)",
              animation: "float 7s ease-in-out infinite",
            }}>
              <div style={{
                background: `linear-gradient(135deg, #1a3a2a, #2d6a4f, #40916c)`,
                borderRadius: 22,
                padding: "40px 32px",
                color: "white",
                minHeight: 340,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ fontSize: 13, opacity: 0.7, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Latest Adventure</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, lineHeight: 1.2, marginBottom: 8 }}>Oeschinensee,<br />Switzerland 🇨🇭</div>
                  <div style={{ opacity: 0.75, fontSize: 15, lineHeight: 1.6 }}>Snow-capped cliffs, turquoise reflections, and almost no tourists. This is Switzerland at its most raw.</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20 }}>
                  {["3 PTO days used", "November 2024", "🏔 Alpine"].map(t => (
                    <span key={t} style={{ background: "rgba(255,255,255,0.15)", padding: "5px 12px", borderRadius: 50, fontSize: 12 }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
            <div style={{
              position: "absolute", bottom: -16, right: -16, background: theme.cream,
              borderRadius: 16, padding: "14px 20px",
              boxShadow: "0 8px 30px rgba(26,58,42,0.12)",
              border: "1px solid #b7e4c7",
            }}>
              <div style={{ fontSize: 12, color: theme.muted }}>Next up</div>
              <div style={{ fontWeight: 600, color: theme.forest, fontSize: 15 }}>🇮🇹 Dolomites</div>
            </div>
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section style={{ padding: "100px 24px", background: "white" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="section-tag">🗺️ Destinations</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 700, color: theme.forest, marginTop: 8 }}>Where I've been</h2>
            <p style={{ color: theme.muted, fontSize: 17, marginTop: 12, maxWidth: 480, margin: "12px auto 0" }}>Every destination explored on regular PTO days, stacked smart.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {destinations.map(dest => (
              <div key={dest.name} className="card-hover destination-card" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} onClick={() => setPage("planner")}>
                <div style={{
                  position: "absolute", inset: 0,
                  background: `linear-gradient(160deg, ${dest.color}ee, ${dest.color}99)`,
                  display: "flex", flexDirection: "column", justifyContent: "space-between",
                  padding: 24,
                }}>
                  <div>
                    <span style={{ fontSize: 42 }}>{dest.emoji}</span>
                    <div style={{ display: "inline-block", background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: 50, fontSize: 11, color: "white", marginTop: 12, fontWeight: 500 }}>{dest.tag}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "white", marginBottom: 6 }}>{dest.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{dest.desc}</div>
                    <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", padding: "8px 16px", borderRadius: 50, color: "white", fontSize: 13, fontWeight: 500 }}>
                      Plan a trip →
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI PLANNER CTA */}
      <section style={{
        padding: "100px 24px",
        background: `linear-gradient(135deg, #1a3a2a, #2d6a4f)`,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "-30%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: "rgba(116,198,157,0.08)", filter: "blur(60px)" }} />
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{ fontSize: 56, marginBottom: 16, animation: "float 5s ease-in-out infinite" }}>🗺️</div>
          <div className="section-tag" style={{ background: "rgba(183,228,199,0.2)", color: "#b7e4c7" }}>Free Tool</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 700, color: "white", margin: "12px 0 20px", lineHeight: 1.15 }}>
            Your free AI<br />trip planner
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 18, lineHeight: 1.7, marginBottom: 40, maxWidth: 500, margin: "0 auto 40px" }}>
            Tell me your destination, how long you have, and your style — I'll build you a complete day-by-day itinerary in seconds.
          </p>
          <button className="btn-primary" style={{ background: theme.cream, color: theme.forest, fontSize: 17, padding: "18px 40px" }} onClick={() => setPage("planner")}>
            Plan My Europe Trip ✨
          </button>
          <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 24, color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
            <span>✓ Completely free</span>
            <span>✓ No sign up needed</span>
            <span>✓ Instant results</span>
          </div>
        </div>
      </section>

      {/* FREE GUIDES */}
      <section style={{ padding: "100px 24px", background: theme.sand }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="section-tag">📚 Free Resources</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 700, color: theme.forest, marginTop: 8 }}>Free travel guides</h2>
            <p style={{ color: theme.muted, fontSize: 17, marginTop: 12 }}>Comment the keyword on Instagram and I'll DM you the guide instantly.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {guides.map(guide => (
              <div key={guide.title} className="card-hover" style={{
                background: "white", borderRadius: 20, padding: 32,
                boxShadow: "0 4px 20px rgba(26,58,42,0.07)",
                border: "1px solid #e8f5ee",
              }}>
                <div style={{ fontSize: 44, marginBottom: 16 }}>{guide.emoji}</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: theme.forest, marginBottom: 8 }}>{guide.title}</h3>
                <p style={{ color: theme.muted, fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>{guide.desc}</p>
                <div style={{ background: guide.color, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: theme.forest, fontWeight: 500 }}>Comment on Instagram:</span>
                  <span style={{ background: theme.green, color: "white", padding: "4px 14px", borderRadius: 50, fontSize: 13, fontWeight: 700 }}>{guide.trigger}</span>
                </div>
                <a href="https://linktr.ee/Cameronskye_" target="_blank" rel="noopener noreferrer">
                  <button className="btn-outline" style={{ width: "100%", marginTop: 16 }}>Download Free →</button>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section style={{ padding: "100px 24px", background: "white" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <div style={{
              background: `linear-gradient(135deg, #e8f5ee, #b7e4c7)`,
              borderRadius: 28, padding: 40,
              boxShadow: "0 20px 60px rgba(45,106,79,0.12)",
            }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: theme.forest, marginBottom: 16 }}>
                "I used 3 PTO days to stand at Oeschinensee at sunrise. Worth every second."
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 24 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: theme.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👨‍👧</div>
                <div>
                  <div style={{ fontWeight: 600, color: theme.forest }}>Cameron Skye</div>
                  <div style={{ fontSize: 13, color: theme.muted }}>@_skyetravels</div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="section-tag">👋 About</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 700, color: theme.forest, margin: "12px 0 20px", lineHeight: 1.2 }}>
              A 9-5 dad who refuses to stop travelling
            </h2>
            <p style={{ color: theme.muted, fontSize: 16, lineHeight: 1.75, marginBottom: 16 }}>
              I get 10–14 PTO days a year like everyone else. But I've figured out how to stack them around holidays and weekends to turn 10 days into 20+ days in Europe.
            </p>
            <p style={{ color: theme.muted, fontSize: 16, lineHeight: 1.75, marginBottom: 32 }}>
              Switzerland, Italy, France, Germany — all done on regular vacation days. This site is everything I've learned, free.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <a href="https://instagram.com/_skyetravels" target="_blank" rel="noopener noreferrer"><button className="btn-primary">Follow on IG 📸</button></a>
              <button className="btn-outline" onClick={() => setPage("planner")}>Plan a trip</button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: theme.forest, color: "rgba(255,255,255,0.7)", padding: "48px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 28, marginBottom: 12 }}>🌍</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "white", fontWeight: 700, marginBottom: 8 }}>Cameron Skye Travels</div>
        <div style={{ fontSize: 14, marginBottom: 24 }}>9-5 dad · Smart traveller · Free guides</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, fontSize: 14, marginBottom: 24 }}>
          <a href="https://instagram.com/_skyetravels" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.7)" }}>Instagram</a>
          <a href="https://linktr.ee/Cameronskye_" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.7)" }}>Linktree</a>
          <button onClick={() => {}} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 14 }}>Trip Planner</button>
        </div>
        <div style={{ fontSize: 13, opacity: 0.5 }}>© 2025 cameronskyetravels.com · Some links are affiliate links</div>
      </footer>
    </div>
  );
}

// ─── PLANNER PAGE ─────────────────────────────────────────────────────────────
function PlannerPage() {
  const [form, setForm] = useState({ destination: "", duration: "", style: "", budget: "" });
  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const [itineraryText, setItineraryText] = useState("");
  const [itineraryTitle, setItineraryTitle] = useState("");

  const allSelected = form.destination && form.duration && form.style && form.budget;

  async function generate() {
    setLoading(true);
    setStep("result");
    setItineraryText("");

    const prompt = `You are Skye, a European travel expert and 9-5 dad who travels smart. Create a detailed, inspiring travel itinerary.

Destination: ${form.destination}
Duration: ${form.duration}
Travel style: ${form.style}
Budget: ${form.budget}

Format your response with:
TITLE: [catchy trip title here]

Then a full day-by-day itinerary with morning/afternoon/evening activities, 3 must-eat food recommendations, 2 best photography spots, 1 insider tip most tourists miss, estimated daily budget breakdown, and best PTO window to book this trip.

Write like a friend who has actually been there. Inspiring but practical.`;

    try {
      const res = await fetch("/.netlify/functions/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.error) {
        setItineraryText("Error: " + data.error);
        setLoading(false);
        return;
      }
      const text = data.content?.map(b => b.text || "").join("") || "No response received. Please try again.";
      // Extract title if present
      const titleMatch = text.match(/TITLE:\s*(.+)/);
      if (titleMatch) {
        setItineraryTitle(titleMatch[1].trim());
        setItineraryText(text.replace(/TITLE:[^\n]*\n?/, "").trim());
      } else {
        setItineraryTitle(`${form.destination} — ${form.duration}`);
        setItineraryText(text);
      }
      setLoading(false);
    } catch (err) {
      setItineraryText("Error: " + (err.message || "Something went wrong. Please try again."));
      setLoading(false);
    }
  }

  function downloadPDF() {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxW = pageW - margin * 2;

    // Header background
    doc.setFillColor(26, 58, 42);
    doc.rect(0, 0, pageW, 45, "F");

    // Gold accent line
    doc.setFillColor(201, 169, 110);
    doc.rect(0, 45, pageW, 2, "F");

    // Header text
    doc.setTextColor(254, 250, 224);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(itineraryTitle || "My Europe Itinerary", margin, 22);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(183, 228, 199);
    doc.text(`${form.destination} · ${form.duration} · ${form.style} · ${form.budget}`, margin, 33);
    doc.text("cameronskyetravels.com · @_skyetravels", margin, 40);

    // Body text
    doc.setTextColor(28, 43, 32);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    let y = 58;
    const lines = doc.splitTextToSize(itineraryText, maxW);

    lines.forEach(line => {
      if (y > pageH - 30) {
        doc.addPage();
        // Subtle header on subsequent pages
        doc.setFillColor(26, 58, 42);
        doc.rect(0, 0, pageW, 12, "F");
        doc.setTextColor(183, 228, 199);
        doc.setFontSize(8);
        doc.text("cameronskyetravels.com — Your Personal Europe Itinerary", margin, 8);
        doc.setTextColor(28, 43, 32);
        doc.setFontSize(11);
        y = 22;
      }

      // Bold day headers
      if (line.match(/^Day \d+/i) || line.match(/^DAY \d+/i)) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(45, 106, 79);
        doc.setFontSize(12);
        y += 4;
      } else if (line.match(/^(Morning|Afternoon|Evening|🍽|📸|💡|💰|✈️)/)) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(28, 43, 32);
        doc.setFontSize(11);
      } else {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 80, 65);
        doc.setFontSize(10.5);
      }

      doc.text(line, margin, y);
      y += line === "" ? 4 : 6;
    });

    // Footer on last page
    doc.setFillColor(26, 58, 42);
    doc.rect(0, pageH - 18, pageW, 18, "F");
    doc.setFillColor(201, 169, 110);
    doc.rect(0, pageH - 18, pageW, 1.5, "F");
    doc.setTextColor(254, 250, 224);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Generated by cameronskyetravels.com · Free AI Trip Planner · @_skyetravels", margin, pageH - 9);
    doc.text("Book via links at cameronskyetravels.com — some links are affiliate links", margin, pageH - 4);

    const filename = `${form.destination.toLowerCase().replace(/\s+/g, "-")}-${form.duration.replace(/\s+/g, "")}-itinerary.pdf`;
    doc.save(filename);
  }

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, #e8f5ee, #fefae0)`, paddingTop: 100 }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 80px" }}>

        {step === "form" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ fontSize: 52, marginBottom: 16, animation: "float 5s ease-in-out infinite" }}>🗺️</div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, color: theme.forest, marginBottom: 12 }}>Plan your Europe trip</h1>
              <p style={{ color: theme.muted, fontSize: 17, lineHeight: 1.6 }}>Built by a 9-5 dad who travels smart. Get a free day-by-day itinerary in seconds.</p>
            </div>

            {[
              { label: "Where to?", field: "destination", options: DESTS },
              { label: "How long?", field: "duration", options: DURS },
              { label: "Your travel style?", field: "style", options: STYLES },
              { label: "Budget per day?", field: "budget", options: BUDGETS },
            ].map(({ label, field, options }) => (
              <div key={field} style={{ marginBottom: 32 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: theme.forest, marginBottom: 12 }}>{label}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {options.map(opt => (
                    <button key={opt} className={`planner-chip ${form[field] === opt ? "selected" : ""}`}
                      onClick={() => setForm(f => ({ ...f, [field]: opt }))}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <button className="btn-primary" disabled={!allSelected} onClick={generate}
              style={{ width: "100%", padding: 20, fontSize: 17, opacity: allSelected ? 1 : 0.4, borderRadius: 16 }}>
              {allSelected ? "Generate My Itinerary ✨" : "Select all options above"}
            </button>
          </>
        )}

        {step === "result" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
              <button onClick={() => { setStep("form"); setItineraryText(""); setForm({ destination: "", duration: "", style: "", budget: "" }); }}
                style={{ background: "white", border: "1px solid #b7e4c7", borderRadius: 50, padding: "8px 16px", cursor: "pointer", color: theme.green, fontWeight: 500, fontSize: 14 }}>← Back</button>
              <div style={{ fontSize: 14, color: theme.muted }}>
                {form.destination} · {form.duration} · {form.style}
              </div>
            </div>

            {loading && (
              <div style={{ textAlign: "center", padding: "80px 0", overflow: "hidden" }}>
                {/* Sky background */}
                <div style={{
                  position: "relative", background: "linear-gradient(180deg, #bde0fe 0%, #e8f5ee 100%)",
                  borderRadius: 24, padding: "48px 32px", marginBottom: 28,
                  overflow: "hidden", minHeight: 180,
                }}>
                  {/* Clouds */}
                  <div style={{ position: "absolute", top: 24, left: "-10%", animation: "cloudMove 8s linear infinite", opacity: 0.9 }}>
                    <div style={{ background: "white", borderRadius: 50, width: 80, height: 28, boxShadow: "20px -8px 0 10px white, -20px -4px 0 8px white" }} />
                  </div>
                  <div style={{ position: "absolute", top: 50, left: "-5%", animation: "cloudMove 12s linear infinite 2s", opacity: 0.7 }}>
                    <div style={{ background: "white", borderRadius: 50, width: 55, height: 20, boxShadow: "14px -6px 0 7px white, -14px -3px 0 6px white" }} />
                  </div>
                  <div style={{ position: "absolute", top: 18, right: "-5%", animation: "cloudMoveReverse 10s linear infinite 1s", opacity: 0.8 }}>
                    <div style={{ background: "white", borderRadius: 50, width: 65, height: 22, boxShadow: "16px -7px 0 8px white, -16px -3px 0 7px white" }} />
                  </div>
                  <div style={{ position: "absolute", bottom: 30, left: "5%", animation: "cloudMove 15s linear infinite 4s", opacity: 0.6 }}>
                    <div style={{ background: "white", borderRadius: 50, width: 45, height: 16, boxShadow: "10px -5px 0 5px white, -10px -2px 0 5px white" }} />
                  </div>

                  {/* Airplane */}
                  <div style={{ animation: "flyAcross 3s ease-in-out infinite", display: "inline-block" }}>
                    <span style={{ fontSize: 52, filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.15))" }}>✈️</span>
                  </div>

                  {/* Dotted flight path */}
                  <div style={{ position: "absolute", bottom: 55, left: "10%", right: "10%", borderTop: "2px dashed rgba(45,106,79,0.3)", borderRadius: "0 0 50% 50%" }} />
                </div>

                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: theme.forest, marginBottom: 8 }}>
                  Planning your adventure...
                </div>
                <div style={{ color: theme.muted, fontSize: 15 }}>Building your perfect itinerary. Takes 5–10 seconds.</div>

                <style>{`
                  @keyframes flyAcross {
                    0% { transform: translateX(-60px) translateY(8px) rotate(-5deg); }
                    25% { transform: translateX(0px) translateY(-12px) rotate(3deg); }
                    50% { transform: translateX(60px) translateY(4px) rotate(-2deg); }
                    75% { transform: translateX(20px) translateY(-8px) rotate(4deg); }
                    100% { transform: translateX(-60px) translateY(8px) rotate(-5deg); }
                  }
                  @keyframes cloudMove {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(120vw); }
                  }
                  @keyframes cloudMoveReverse {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-120vw); }
                  }
                `}</style>
              </div>
            )}

            {!loading && itineraryText && (
              <>
                {itineraryTitle && (
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: theme.forest, marginBottom: 20, lineHeight: 1.3 }}>{itineraryTitle}</h2>
                )}
                <div style={{
                  background: "white", borderRadius: 24, padding: "32px 28px",
                  boxShadow: "0 8px 40px rgba(26,58,42,0.1)",
                  border: "1px solid #e8f5ee",
                  lineHeight: 1.85, fontSize: 15, color: theme.text,
                  whiteSpace: "pre-wrap", marginBottom: 24,
                }}>
                  {itineraryText}
                </div>

                {/* Download PDF button */}
                <button onClick={downloadPDF} style={{
                  width: "100%", padding: "18px", marginBottom: 12, borderRadius: 16,
                  background: "linear-gradient(135deg, #1a3a2a, #2d6a4f)",
                  color: "white", border: "none", fontSize: 16, fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  transition: "all 0.25s ease", boxShadow: "0 4px 20px rgba(26,58,42,0.25)",
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                >
                  📥 Download Your Free PDF Itinerary
                </button>

                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Book your trip</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { label: "🏨 Find hotels on Booking.com", url: "https://www.booking.com" },
                      { label: "🎭 Book tours on GetYourGuide", url: "https://www.getyourguide.com" },
                      { label: "🗺️ Day trips on Viator", url: "https://www.viator.com" },
                      { label: "📱 Travel eSIM — no roaming fees", url: "https://www.airalo.com" },
                    ].map(({ label, url }) => (
                      <a key={url} href={url} target="_blank" rel="noopener noreferrer" style={{
                        display: "block", padding: "14px 20px", borderRadius: 14,
                        border: "1.5px solid #e8f5ee", background: "white",
                        color: theme.forest, fontSize: 15, fontWeight: 500,
                        transition: "all 0.2s",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#74c69d"; e.currentTarget.style.background = "#f0faf4"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8f5ee"; e.currentTarget.style.background = "white"; }}
                      >
                        {label}
                      </a>
                    ))}
                  </div>
                </div>

                <button className="btn-primary" style={{ width: "100%", padding: 18, fontSize: 16, borderRadius: 16 }}
                  onClick={() => { setStep("form"); setItineraryText(""); setForm({ destination: "", duration: "", style: "", budget: "" }); }}>
                  Plan Another Trip ✨
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");

  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  return (
    <>
      <style>{css}</style>
      <Nav page={page} setPage={setPage} />
      {page === "home" ? <HomePage setPage={setPage} /> : <PlannerPage />}
    </>
  );
}
