import React, { useState, useRef } from "react";

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
    <span
      className={"relative inline-block " + className}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onMouseMove={handleMouseMove}
      style={{ cursor: "pointer" }}
    >
      {children}
      {visible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 px-3 py-2 rounded-lg normal-case text-xs text-white bg-gray-900 dark:bg-gray-800 dark:text-white shadow-theme-sm transition-opacity duration-150 pointer-events-none"
          style={{
            left: coords.x,
            top: coords.y,
            minWidth: 180,
            maxWidth: 260,
            opacity: visible ? 1 : 0,
            whiteSpace: "normal"
          }}
        >
          {content}
        </div>
      )}
    </span>
  );
}
