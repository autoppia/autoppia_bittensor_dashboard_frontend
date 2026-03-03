"use client";

import { useEffect, useState, useRef } from 'react';

interface MarqueeTextProps {
  text: string;
  className?: string;
  speed?: number; // pixels per second
  pauseDuration?: number; // pause between cycles in seconds
  containerClassName?: string;
}

export default function MarqueeText({
  text,
  className = "",
  speed = 50, // pixels per second
  pauseDuration = 1, // 1 second pause between cycles
  containerClassName = ""
}: MarqueeTextProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [animationDuration, setAnimationDuration] = useState(0);

  useEffect(() => {
    const calculateAnimation = () => {
      if (containerRef.current && textRef.current) {
        const containerW = containerRef.current.offsetWidth;
        const textWidth = textRef.current.scrollWidth;

        setContainerWidth(containerW);

        // Total distance: container width + text width (from outside right to -100% left)
        const totalDistance = containerW + textWidth;

        // Duration based on speed
        const duration = totalDistance / speed;
        setAnimationDuration(duration);
      }
    };

    // Calculate after component mounts
    calculateAnimation();

    // Recalculate on window resize
    const handleResize = () => calculateAnimation();
    window.addEventListener('resize', handleResize);

    // Start animation after calculation
    const startTimer = setTimeout(() => {
      setIsAnimating(true);
    }, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(startTimer);
    };
  }, [text, speed]);

  const totalCycleTime = animationDuration + pauseDuration;

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden whitespace-nowrap relative ${containerClassName}`}
    >
      <p
        ref={textRef}
        className={`inline-block ${className} ${isAnimating ? 'animate-marquee' : ''}`}
        style={{
          '--container-width': `${containerWidth}px`,
          '--marquee-cycle': `${totalCycleTime}s`,
          animationDuration: `${totalCycleTime}s`,
          transform: isAnimating ? undefined : `translateX(${containerWidth}px)`, // Start from outside right edge
        } as React.CSSProperties}
      >
        {text}
      </p>
    </div>
  );
}
