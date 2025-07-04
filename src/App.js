import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import ImageUpload from "./components/ImageUpload";
import LegoArtPreview from "./components/LegoArtPreview";
import VoiceAssistant from "./components/VoiceAssistant";
import SamplesShowcase from "./components/SamplesShowcase";
import BackgroundBricks from "./components/BackgroundBricks";
import AboutPage from "./pages/AboutPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import GalleryPage from "./pages/GalleryPage";
import PricingPage from "./pages/PricingPage";
import ContactPage from "./pages/ContactPage";
import "./App.css";

function HomePage() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [legoArt, setLegoArt] = useState(null);
  const handleMicClick = () => {};
  return (
    <div className="App">
      <Header onMicClick={handleMicClick} />
      <BackgroundBricks />
      <VoiceAssistant />
      <HeroSection />
      <ImageUpload onImageUpload={setUploadedImage} />
      <LegoArtPreview
        originalImage={uploadedImage}
        legoArt={legoArt}
        setLegoArt={setLegoArt}
      />
      <SamplesShowcase />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </Router>
  );
}

export default App;
