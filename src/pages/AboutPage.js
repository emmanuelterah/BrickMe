import React from "react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import "../components/sections/AboutSection.css";
import { Helmet } from "react-helmet-async";

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About BrickMe | LEGO-Style AI Art for Everyone</title>
        <meta name="description" content="Discover BrickMe: the AI-powered platform that transforms your photos into stunning LEGO-style pixel art. Perfect for kids, adults, and creators!" />
      </Helmet>
      <Header />
      <main>
        <section className="about-section fire-section">
          <div className="about-content">
            <h1 className="fire-h1">About <span className="lego-accent">BrickMe</span></h1>
            <p className="fire-p">
              BrickMe is an AI-powered playground where anyone can turn their favorite photos into stunning LEGO-style pixel art! Whether you're a kid, a creator, or just curious, BrickMe brings your imagination to life — one brick at a time. Our mission is to make creativity accessible, playful, and fun for all ages.
            </p>
            <p className="fire-p">
              <strong>Why LEGO?</strong> LEGO bricks are a universal symbol of creativity, nostalgia, and fun. By combining AI with the magic of LEGO, we help you reimagine your world, brick by brick.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
} 