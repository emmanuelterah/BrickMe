import React from "react";
import "./SamplesShowcase.css";
import img1 from "../../images/lego1.jpg";
import img2 from "../../images/lego2.jpg";
import img3 from "../../images/lego3.jpg";

const samples = [
  {
    name: "Brick Star",
    before: img1,
    after: img2,
  },
  {
    name: "Brick Hero",
    before: img2,
    after: img3,
  },
  {
    name: "Brick Legend",
    before: img3,
    after: img1,
  },
];
// Attributions: Unsplash portraits, Flickr LEGO mosaics (https://www.flickr.com/photos/legomosaicart/51196423436/)

export default function SamplesShowcase() {
  return (
    <section className="samples-showcase">
      <h2>Celebrity LEGO Magic ✨</h2>
      <div className="samples-grid">
        {samples.map((s, i) => (
          <div className="sample-card" key={i}>
            <div className="sample-imgs">
              <img src={s.before} alt={s.name + " before"} className="before" />
              <span className="arrow">➡️</span>
              <img src={s.after} alt={s.name + " after"} className="after" />
            </div>
            <div className="sample-name">{s.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
} 