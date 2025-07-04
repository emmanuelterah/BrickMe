import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../components/GallerySection.css";
import img1 from "../images/lego1.jpg";
import img2 from "../images/lego2.jpg";
import img3 from "../images/lego3.jpg";
import { Helmet } from "react-helmet-async";
import LegoBrickAnimation, { useLegoRipple } from "../components/LegoBrickAnimation";

function RippleImage({ src, alt }) {
  const [RippleElement, triggerRipple] = useLegoRipple();
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <img
        src={src}
        alt={alt}
        style={{ cursor: "pointer", width: "100%", height: "auto", display: "block" }}
        onClick={triggerRipple}
      />
      <RippleElement />
    </div>
  );
}

export default function GalleryPage() {
  return (
    <>
      <Helmet>
        <title>Gallery | BrickMe LEGO Art Showcase</title>
        <meta name="description" content="Explore the BrickMe gallery: see amazing LEGO-style pixel art transformations created by our AI. Get inspired and LEGO-fy your own photos!" />
      </Helmet>
      <Header />
      <main>
        <LegoBrickAnimation />
        <section className="gallery-section fire-section">
          <h1 className="fire-h1">Gallery</h1>
          <div className="gallery-grid">
            <RippleImage src={img1} alt="LEGO gallery example 1" />
            <RippleImage src={img2} alt="LEGO gallery example 2" />
            <RippleImage src={img3} alt="LEGO gallery example 3" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
} 