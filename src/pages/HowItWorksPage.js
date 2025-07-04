import React from "react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import "../components/sections/HowItWorksSection.css";
import { Helmet } from "react-helmet-async";

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

export default function HowItWorksPage() {
  return (
    <>
      <Helmet>
        <title>How It Works | BrickMe LEGO AI Art Generator</title>
        <meta name="description" content="See how BrickMe transforms your photos into LEGO-style pixel art using AI. Upload, customize, and download your LEGO masterpiece!" />
      </Helmet>
      <Header />
      <main>
        <section className="how-section fire-section">
          <h1 className="fire-h1">How It Works</h1>
          <div className="how-steps">
            {steps.map((step, i) => (
              <div className="how-step" key={i}>
                <div className="how-icon">{step.icon}</div>
                <h2>{step.title}</h2>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
          <p className="how-keywords fire-p">
            <strong>Keywords:</strong> LEGO art, AI LEGO generator, pixel art, photo to LEGO, creative AI, LEGOify, voice AI, LEGO mosaic, fun for kids and adults
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
} 