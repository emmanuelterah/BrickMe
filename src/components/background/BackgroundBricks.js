import React, { useEffect, useRef, useState } from "react";
import "./BackgroundBricks.css";

function LegoBrick({ color = "#ffcf00", x = 0, y = 0, rotate = 0, size = 80, style = {}, className = "" }) {
  // Photorealistic SVG brick with highlights and shadow
  return (
    <svg
      className={`lego-svg-brick ${className}`}
      style={{ position: 'absolute', left: x, top: y, transform: `rotate(${rotate}deg)`, width: size, height: size * 0.4, ...style }}
      viewBox="0 0 80 32"
      fill="none"
    >
      <defs>
        <linearGradient id="brickBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffbe7" stopOpacity="0.7" />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
        <radialGradient id="studHighlight" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </radialGradient>
      </defs>
      <rect x="2" y="8" width="76" height="20" rx="6" fill="url(#brickBody)" stroke="#e53d00" strokeWidth="2" />
      {/* Studs */}
      {[10, 30, 50, 70].map((cx, i) => (
        <ellipse key={i} cx={cx} cy={12} rx={7} ry={7} fill="url(#studHighlight)" stroke="#e53d00" strokeWidth="1.5" />
      ))}
      {/* Shadow */}
      <ellipse cx="40" cy="30" rx="34" ry="5" fill="#e53d00" opacity="0.13" />
    </svg>
  );
}

const BRICKS = [
  { color: "#ffcf00", x: "12%", y: "8%", rotate: -8, size: 100 },
  { color: "#e53d00", x: "70%", y: "22%", rotate: 12, size: 80 },
  { color: "#00b4d8", x: "18%", y: "60%", rotate: -16, size: 120 },
  { color: "#43aa8b", x: "80%", y: "75%", rotate: 6, size: 70 },
  { color: "#f3722c", x: "45%", y: "40%", rotate: -4, size: 90 },
  { color: "#22223b", x: "30%", y: "85%", rotate: 18, size: 60 },
];

export default function BackgroundBricks() {
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [assembled, setAssembled] = useState(false);

  useEffect(() => {
    setTimeout(() => setAssembled(true), 200); // Delay for assembly animation
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setParallax({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="background-bricks">
      {BRICKS.map((b, i) => {
        // Parallax: each brick moves at a different rate
        const px = `calc(${b.x} + ${parallax.x * (8 + i * 2)}px)`;
        const py = `calc(${b.y} + ${parallax.y * (8 + i * 2)}px)`;
        return (
          <LegoBrick
            key={i}
            {...b}
            x={px}
            y={py}
            className={assembled ? "brick-assembled" : "brick-hidden"}
          />
        );
      })}
    </div>
  );
} 