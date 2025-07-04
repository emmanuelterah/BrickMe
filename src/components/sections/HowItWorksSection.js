import React from "react";
import "./HowItWorksSection.css";

const steps = [
  {
    icon: "🧱",
    title: "Upload Your Photo",
    desc: "Choose any image or selfie you love."
  },
  {
    icon: "🤖",
    title: "AI LEGO-fies It!",
    desc: "Our AI transforms your photo into LEGO-style pixel art."
  },
  {
    icon: "🎤",
    title: "Customize with Voice",
    desc: "Tell the AI what you want — more color, a fun background, or even a superhero twist!"
  },
  {
    icon: "✨",
    title: "Download & Share",
    desc: "Save your LEGO masterpiece or share it with friends!"
  }
];

export default function HowItWorksSection() {
  return (
    <section className="how-section" id="how">
      <h2>How It Works</h2>
      <div className="how-steps">
        {steps.map((step, i) => (
          <div className="how-step" key={i}>
            <div className="how-icon">{step.icon}</div>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
} 