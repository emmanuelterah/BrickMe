import React from "react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import "../components/sections/ContactSection.css";
import { Helmet } from "react-helmet-async";
import LegoButton from "../components/common/LegoButton";

export default function ContactPage() {
  return (
    <>
      <Helmet>
        <title>Contact | BrickMe LEGO AI Art Support</title>
        <meta name="description" content="Contact BrickMe for support, feedback, or partnership inquiries. We're here to help you LEGO-fy your world!" />
      </Helmet>
      <Header />
      <main>
        <section className="contact-section fire-section">
          <h1 className="fire-h1">Contact <span className="lego-accent">BrickMe</span></h1>
          <form className="contact-form">
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <textarea placeholder="Your Message" rows={4} required />
            <LegoButton type="submit">Send Message</LegoButton>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
} 