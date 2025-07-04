import React from "react";
import { useLegoRipple } from "./LegoBrickAnimation";

export default function LegoButton({ children, className = "", ...props }) {
  const [RippleElement, triggerRipple] = useLegoRipple();
  return (
    <button
      className={`lego-btn ${className}`}
      onClick={e => {
        triggerRipple(e);
        if (props.onClick) props.onClick(e);
      }}
      style={{ position: "relative", overflow: "hidden" }}
      {...props}
    >
      {children}
      <RippleElement />
    </button>
  );
} 