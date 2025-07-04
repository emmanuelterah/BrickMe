import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import HeroSection from "./components/sections/HeroSection";
import ImageUpload from "./components/upload/ImageUpload";
import LegoArtPreview from "./components/upload/LegoArtPreview";
import VoiceAssistant from "./components/voice/VoiceAssistant";
import SamplesShowcase from "./components/samples/SamplesShowcase";
import BackgroundBricks from "./components/background/BackgroundBricks";
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
