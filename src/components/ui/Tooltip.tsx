import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function Tooltip({
  content,
  children,
  className = ""
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent) {
    const offset = 12;
    setCoords({ x: e.clientX + offset, y: e.clientY + offset });
  }

  return (
    <>
      <span
        className={"relative inline-block " + className}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onMouseMove={handleMouseMove}
        style={{ cursor: "pointer" }}
      >
        {children}
      </span>
      {visible &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-[9999999] px-3 py-2 rounded-lg normal-case text-xs text-white bg-gray-900 dark:bg-gray-800 dark:text-white shadow-theme-sm transition-opacity duration-150 pointer-events-auto"
            style={{
              left: Math.min(coords.x, window.innerWidth - 260),
              top: Math.min(coords.y, window.innerHeight - 40),
              minWidth: 180,
              maxWidth: 260,
              opacity: visible ? 1 : 0,
              whiteSpace: "normal",
              position: "fixed",
              pointerEvents: "auto",
              zIndex: 9999999
            }}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
}
