import React from "react";
import "./PricingSection.css";

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

export default function PricingSection() {
  return (
    <section className="pricing-section" id="pricing">
      <h2>Pricing</h2>
      <div className="pricing-cards">
        {plans.map((plan, i) => (
          <div className="pricing-card" key={i} style={{ borderColor: plan.accent }}>
            <h3 style={{ color: plan.accent }}>{plan.name}</h3>
            <div className="price" style={{ color: plan.accent }}>{plan.price}</div>
            <ul>
              {plan.features.map((f, j) => <li key={j}>{f}</li>)}
            </ul>
            <button className="lego-btn" style={{ background: plan.accent, color: '#fff', boxShadow: `0 4px ${plan.accent}` }}>Choose</button>
          </div>
        ))}
      </div>
    </section>
  );
} 