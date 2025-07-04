import React from "react";
import "./ContactSection.css";

export default function ContactSection() {
  return (
    <section className="contact-section" id="contact">
      <h2>Contact <span className="lego-accent">BrickMe</span></h2>
      <form className="contact-form">
        <input type="text" placeholder="Your Name" required />
        <input type="email" placeholder="Your Email" required />
        <textarea placeholder="Your Message" rows={4} required />
        <button className="lego-btn" type="submit">Send Message</button>
      </form>
    </section>
  );
} 