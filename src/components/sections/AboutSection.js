import React from "react";
import "./AboutSection.css";

export default function AboutSection() {
  return (
    <section className="about-section" id="about">
      <div className="about-content">
        <h2>About <span className="lego-accent">BrickMe</span></h2>
        <p>
          BrickMe is an AI-powered playground where anyone can turn their favorite photos into stunning LEGO-style pixel art! Whether you're a kid, a creator, or just curious, BrickMe brings your imagination to life — one brick at a time.
        </p>
      </div>
    </section>
  );
} 