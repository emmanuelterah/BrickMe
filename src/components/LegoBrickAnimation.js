import React, { useEffect, useState } from "react";
import "./LegoBrickAnimation.css";

export function useLegoRipple() {
  const [ripple, setRipple] = useState(null);
  function triggerRipple(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      key: Date.now()
    });
    setTimeout(() => setRipple(null), 600);
  }
  function RippleElement() {
    return ripple ? (
      <span
        className="lego-btn-ripple"
        style={{ left: ripple.x - 20, top: ripple.y - 20, width: 40, height: 40 }}
        key={ripple.key}
      />
    ) : null;
  }
  return [RippleElement, triggerRipple];
}

export default function LegoBrickAnimation() {
  const [assembled, setAssembled] = useState(false);
  const [RippleElement, triggerRipple] = useLegoRipple();

  useEffect(() => {
    setTimeout(() => setAssembled(true), 300);
  }, []);

  return (
    <div className="lego-brick-animation" onClick={triggerRipple} style={{cursor: 'pointer', position: 'relative'}}>
      <div className={`lego-brick-base ${assembled ? "snap" : ""}`}></div>
      <div className={`lego-brick-stud stud1 ${assembled ? "snap" : ""}`}></div>
      <div className={`lego-brick-stud stud2 ${assembled ? "snap" : ""}`}></div>
      <div className={`lego-brick-stud stud3 ${assembled ? "snap" : ""}`}></div>
      <div className={`lego-brick-stud stud4 ${assembled ? "snap" : ""}`}></div>
      <RippleElement />
    </div>
  );
} 