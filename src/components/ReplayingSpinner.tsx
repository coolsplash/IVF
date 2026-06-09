'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function ReplayingSpinner({ className = '', opacity = 0.15 }: { className?: string, opacity?: number }) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // Start first spin after a short delay
    const initialTimeout = setTimeout(() => {
      setRotation(prev => prev + 1800 + Math.random() * 360);
    }, 1000);

    const interval = setInterval(() => {
      // Simulate a random spin every 10 seconds
      setRotation(prev => {
        const extraSpins = 5 + Math.random() * 5;
        return prev + (extraSpins * 360) + Math.random() * 360;
      });
    }, 10000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  // Match the 10-segment design from SpinnerWheel (1-300 range)
  const segmentValues = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300];
  const segmentAngles = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324];

  return (
    <div className={`pointer-events-none select-none overflow-visible ${className}`} style={{ opacity }}>
      <motion.div
        animate={{ rotate: rotation }}
        transition={{ 
          duration: 6, 
          ease: [0.1, 0.7, 0.1, 1] 
        }}
        className="w-full h-full relative origin-center"
      >
        <svg viewBox="0 0 380 380" className="w-full h-full drop-shadow-2xl">
          {/* Main wheel background - darker for better contrast */}
          <circle cx="190" cy="190" r="175" fill="#0f3d3a" stroke="#ffffff" strokeWidth="6" />
          
          {/* 10 segments matching the real spinner */}
          {segmentAngles.map((angle, index) => {
            const angleRad = (angle - 90) * (Math.PI / 180);
            return (
              <line
                key={index}
                x1="190"
                y1="190"
                x2={190 + 175 * Math.cos(angleRad)}
                y2={190 + 175 * Math.sin(angleRad)}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Outer beads - brighter */}
          {Array.from({ length: 40 }).map((_, i) => {
            const angle = (i * 9 - 90) * (Math.PI / 180);
            const bx = 190 + 185 * Math.cos(angle);
            const by = 190 + 185 * Math.sin(angle);
            return (
              <circle
                key={i}
                cx={bx}
                cy={by}
                r="4"
                fill={i % 2 === 0 ? "#2dd4bf" : "#ffffff"}
                className="drop-shadow-[0_0_8px_rgba(45,212,191,0.8)]"
              />
            );
          })}
          
          {/* Segment values matching the real spinner */}
          {segmentAngles.map((val, index) => {
            const angleRad = (val - 90) * (Math.PI / 180);
            const x = 190 + (175 - 30) * Math.cos(angleRad);
            const y = 190 + (175 - 30) * Math.sin(angleRad);
            return (
              <text
                key={val}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="rgba(255,255,255,0.3)"
                fontSize="14"
                fontWeight="bold"
                transform={`rotate(${val}, ${x}, ${y})`}
              >
                {segmentValues[index]}
              </text>
            );
          })}
          
          {/* Center hub - more distinct */}
          <circle cx="190" cy="190" r="65" fill="#ffffff" />
          <circle cx="190" cy="190" r="55" fill="#14b8a6" />
          <text 
            x="190" 
            y="190" 
            textAnchor="middle" 
            dominantBaseline="central" 
            fill="white" 
            fontSize="36" 
            fontWeight="900" 
            style={{ fontFamily: 'var(--font-display)', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
          >
            SPIN
          </text>
        </svg>
      </motion.div>
      
      {/* Pointer (at the top) - more visible */}
      <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 z-10">
        <svg width="40" height="50" viewBox="0 0 40 50">
          <polygon points="20,48 4,10 20,18 36,10" fill="#ef4444" stroke="#fff" strokeWidth="3" />
        </svg>
      </div>
    </div>
  );
}
