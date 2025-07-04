import React from "react";
import "./GallerySection.css";
import img1 from "../../images/lego1.jpg";
import img2 from "../../images/lego2.jpg";
import img3 from "../../images/lego3.jpg";

export default function GallerySection() {
  return (
    <section className="gallery-section" id="gallery">
      <h2>Gallery</h2>
      <div className="gallery-grid">
        <img src={img1} alt="Gallery 1" />
        <img src={img2} alt="Gallery 2" />
        <img src={img3} alt="Gallery 3" />
      </div>
    </section>
  );
} 