import { useState, useRef, useEffect } from "react";

const DESTINATIONS = ["Switzerland", "Italy", "France", "Germany", "All of Europe"];
const DURATIONS = ["3 days", "5 days", "7 days", "10 days", "2 weeks"];
const STYLES = ["Cinematic & aesthetic", "Food & culture", "Adventure & hiking", "Budget travel", "Luxury"];
const BUDGETS = ["Budget (< $100/day)", "Mid-range ($100–200/day)", "Luxury ($200+/day)"];

const AFFILIATE_LINKS = {
  booking: "https://www.booking.com",
  getyourguide: "https://www.getyourguide.com",
  viator: "https://www.viator.com",
};

const gradientText = {
  background: "linear-gradient(135deg, #c9a96e, #f0d9a0, #c9a96e)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

export default function App() {
  const [step, setStep] = useState("home");
  const [form, setForm] = useState({ destination: "", duration: "", style: "", budget: "" });
  const [loading, setLoading] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [itinerary, setItinerary] = useState("");
  const resultRef = useRef(null);

  useEffect(() => {
    if (streamedText && resultRef.current) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
    }
  }, [streamedText]);

  const allSelected = form.destination && form.duration && form.style && form.budget;

  async function generateItinerary() {
    setLoading(true);
    setStep("result");
    setStreamedText("");

    const prompt = `You are Skye, a cinematic European travel expert and 9-5 dad who travels smart. Create a detailed, inspiring travel itinerary.

Destination: ${form.destination}
Duration: ${form.duration}
Travel style: ${form.style}
Budget: ${form.budget}

Format your response with:
1. A catchy title for this trip
2. Day-by-day itinerary with morning/afternoon/evening activities
3. 3 must-eat food recommendations
4. 2 cinematic photography spots
5. 1 insider tip most tourists miss
6. Estimated daily budget breakdown
7. Best time to use PTO days for this trip

Write in an inspiring, personal tone like a friend who has actually been there. Use emojis sparingly. Keep it practical but beautiful.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "Something went wrong. Please try again.";

      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setStreamedText(prev => prev + text[i]);
          i++;
        } else {
          clearInterval(interval);
          setItinerary(text);
          setLoading(false);
        }
      }, 8);
    } catch (e) {
      setStreamedText("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const Chip = ({ field, value }) => {
    const selected = form[field] === value;
    return (
      <button
        onClick={() => setForm(f => ({ ...f, [field]: value }))}
        style={{
          padding: "10px 18px",
          borderRadius: "100px",
          border: selected ? "1.5px solid #c9a96e" : "1.5px solid rgba(255,255,255,0.12)",
          background: selected ? "rgba(201,169,110,0.15)" : "rgba(255,255,255,0.04)",
          color: selected ? "#f0d9a0" : "rgba(255,255,255,0.55)",
          fontSize: "13px",
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: selected ? "600" : "400",
          cursor: "pointer",
          transition: "all 0.2s ease",
          letterSpacing: "0.02em",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </button>
    );
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      color: "#f5f0e8",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(201,169,110,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "560px", margin: "0 auto", padding: "0 20px" }}>

        {step === "home" && (
          <div style={{ paddingTop: "80px", paddingBottom: "60px" }}>
            <div style={{ textAlign: "center", marginBottom: "52px" }}>
              <div style={{ fontSize: "12px", letterSpacing: "0.25em", color: "#c9a96e", marginBottom: "20px", textTransform: "uppercase" }}>
                ✦ cameronskyetravels.com
              </div>
              <h1 style={{ fontSize: "clamp(40px, 8vw, 60px)", fontWeight: "300", lineHeight: "1.05", margin: "0 0 16px", letterSpacing: "-0.02em" }}>
                Your personal<br />
                <span style={gradientText}>Europe itinerary</span>
              </h1>
              <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.45)", fontWeight: "300", lineHeight: "1.6", margin: "0" }}>
                Built by a 9-5 dad who travels smart.<br />Tell me where you want to go.
              </p>
            </div>

            <Section label="Where to?">
              <ChipRow>{DESTINATIONS.map(d => <Chip key={d} field="destination" value={d} />)}</ChipRow>
            </Section>
            <Section label="How long?">
              <ChipRow>{DURATIONS.map(d => <Chip key={d} field="duration" value={d} />)}</ChipRow>
            </Section>
            <Section label="Your vibe?">
              <ChipRow>{STYLES.map(s => <Chip key={s} field="style" value={s} />)}</ChipRow>
            </Section>
            <Section label="Budget?">
              <ChipRow>{BUDGETS.map(b => <Chip key={b} field="budget" value={b} />)}</ChipRow>
            </Section>

            <button
              onClick={generateItinerary}
              disabled={!allSelected}
              style={{
                width: "100%", padding: "18px", marginTop: "8px", borderRadius: "14px", border: "none",
                background: allSelected ? "linear-gradient(135deg, #c9a96e, #a07840)" : "rgba(255,255,255,0.06)",
                color: allSelected ? "#0a0a0f" : "rgba(255,255,255,0.2)",
                fontSize: "16px", fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase",
                cursor: allSelected ? "pointer" : "not-allowed", transition: "all 0.3s ease",
              }}
            >
              Plan My Trip →
            </button>
            {!allSelected && (
              <p style={{ textAlign: "center", fontSize: "13px", color: "rgba(255,255,255,0.25)", marginTop: "12px" }}>
                Select all options above to continue
              </p>
            )}
          </div>
        )}

        {step === "result" && (
          <div style={{ paddingTop: "60px", paddingBottom: "80px" }}>
            <div style={{ marginBottom: "32px" }}>
              <div style={{ fontSize: "12px", letterSpacing: "0.25em", color: "#c9a96e", marginBottom: "12px", textTransform: "uppercase" }}>✦ Your itinerary</div>
              <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <span>{form.destination}</span><span>·</span><span>{form.duration}</span><span>·</span><span>{form.style}</span>
              </div>
            </div>

            <div ref={resultRef} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,169,110,0.15)",
              borderRadius: "16px", padding: "28px 24px", marginBottom: "32px",
              lineHeight: "1.8", fontSize: "15px", color: "rgba(255,255,255,0.8)",
              whiteSpace: "pre-wrap", minHeight: "200px", maxHeight: "60vh", overflowY: "auto",
            }}>
              {streamedText}
              {loading && <span style={{ opacity: 0.4 }}>▌</span>}
            </div>

            {!loading && streamedText && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px" }}>Book your trip</p>
                {[
                  { label: "🏨 Find hotels on Booking.com", url: AFFILIATE_LINKS.booking },
                  { label: "🎭 Book tours on GetYourGuide", url: AFFILIATE_LINKS.getyourguide },
                  { label: "🗺️ Day trips on Viator", url: AFFILIATE_LINKS.viator },
                ].map(({ label, url }) => (
                  <a key={url} href={url} target="_blank" rel="noopener noreferrer" style={{
                    display: "block", padding: "14px 20px", borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "14px",
                    fontFamily: "'Cormorant Garamond', Georgia, serif", transition: "all 0.2s ease",
                  }}>
                    {label}
                  </a>
                ))}
              </div>
            )}

            {!loading && (
              <button
                onClick={() => { setStep("home"); setForm({ destination: "", duration: "", style: "", budget: "" }); setStreamedText(""); }}
                style={{
                  width: "100%", padding: "16px", borderRadius: "12px",
                  border: "1.5px solid rgba(201,169,110,0.3)", background: "transparent",
                  color: "#c9a96e", fontSize: "14px", fontFamily: "'Cormorant Garamond', Georgia, serif",
                  letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
                }}
              >
                Plan Another Trip
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(201,169,110,0.3); border-radius: 2px; }
      `}</style>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <p style={{ fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 12px" }}>{label}</p>
      {children}
    </div>
  );
}

function ChipRow({ children }) {
  return <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>{children}</div>;
}
