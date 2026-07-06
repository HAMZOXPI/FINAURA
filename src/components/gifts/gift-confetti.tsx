"use client";

import { useEffect, useRef } from "react";

export function GiftConfetti({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !ref.current) return;
    const container = ref.current;
    const colors = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#3b82f6", "#8b5cf6"];

    for (let i = 0; i < 72; i++) {
      const piece = document.createElement("div");
      piece.style.cssText = `
        position: fixed;
        width: ${7 + Math.random() * 7}px;
        height: ${5 + Math.random() * 5}px;
        background: ${colors[i % colors.length]};
        border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
        top: 45%;
        left: 50%;
        pointer-events: none;
        z-index: 9999;
        opacity: 1;
      `;
      container.appendChild(piece);

      const angle = Math.random() * Math.PI * 2;
      const velocity = 140 + Math.random() * 320;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity - 120;
      let x = 0;
      let y = 0;
      let opacity = 1;
      let frame = 0;

      const animate = () => {
        frame++;
        x += vx * 0.016;
        y += vy * 0.016 + frame * 0.45;
        opacity -= 0.01;
        piece.style.transform = `translate(${x}px, ${y}px) rotate(${frame * 10}deg)`;
        piece.style.opacity = String(Math.max(0, opacity));
        if (opacity > 0) requestAnimationFrame(animate);
        else piece.remove();
      };
      requestAnimationFrame(animate);
    }
  }, [active]);

  return <div ref={ref} className="pointer-events-none fixed inset-0 z-[300]" aria-hidden />;
}
