import React from "react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import "../components/sections/PricingSection.css";
import { Helmet } from "react-helmet-async";
import LegoButton from "../components/common/LegoButton";

const plans = [
  {
    name: "Free",
    price: "$0",
    features: ["Basic LEGO-fy", "Download 1 image/day", "Voice commands"],
    accent: "#ffcf00"
  },
  {
    name: "Pro",
    price: "$5/mo",
    features: ["Unlimited LEGO-fy", "HD downloads", "Priority AI"],
    accent: "#00b4d8"
  },
  {
    name: "Ultimate",
    price: "$15/mo",
    features: ["All Pro features", "Commercial use", "Custom LEGO backgrounds"],
    accent: "#e53d00"
  }
];

export default function PricingPage() {
  return (
    <>
      <Helmet>
        <title>Pricing | BrickMe LEGO AI Art Plans</title>
        <meta name="description" content="Choose your BrickMe plan: Free, Pro, or Ultimate. Unlock unlimited LEGO-style AI art, HD downloads, and more!" />
      </Helmet>
      <Header />
      <main>
        <section className="pricing-section fire-section">
          <h1 className="fire-h1">Pricing</h1>
          <div className="pricing-cards">
            {plans.map((plan, i) => (
              <div className="pricing-card" key={i} style={{ borderColor: plan.accent }}>
                <h2 style={{ color: plan.accent }}>{plan.name}</h2>
                <div className="price" style={{ color: plan.accent }}>{plan.price}</div>
                <ul>
                  {plan.features.map((f, j) => <li key={j}>{f}</li>)}
                </ul>
                <LegoButton style={{ background: plan.accent, color: '#fff', boxShadow: `0 4px ${plan.accent}` }}>Choose</LegoButton>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
} 