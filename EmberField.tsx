"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  vy: number;
  sway: number;
  phase: number;
}

interface EmberFieldProps {
  /** Roughly how many embers drift on screen at once. */
  density?: number;
  className?: string;
}

/**
 * The site's one recurring signature motion: slow drifting gold
 * light. Used as the ambient backdrop behind every screen.
 */
export default function EmberField({
  density = 26,
  className,
}: EmberFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const densityRef = useRef(density);
  const sizeRef = useRef({ w: 0, h: 0 });
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    densityRef.current = density;
    const particles = particlesRef.current;
    while (particles.length < density) {
      particles.push(makeParticle(sizeRef.current.w, sizeRef.current.h));
    }
    while (particles.length > density) {
      particles.pop();
    }
  }, [density]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      sizeRef.current = { w, h };
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    if (particlesRef.current.length === 0) {
      for (let i = 0; i < densityRef.current; i++) {
        particlesRef.current.push(
          makeParticle(sizeRef.current.w, sizeRef.current.h)
        );
      }
    }

    function tick() {
      const { w, h } = sizeRef.current;
      ctx!.clearRect(0, 0, w, h);
      const t = performance.now() * 0.001;

      for (const p of particlesRef.current) {
        p.y += p.vy;
        p.phase += 0.012;
        const x = p.x + Math.sin(p.phase) * p.sway * 6;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }

        const flicker = 0.7 + Math.sin(t * 2 + p.phase) * 0.3;
        const alpha = p.baseAlpha * flicker;

        const grad = ctx!.createRadialGradient(x, p.y, 0, x, p.y, p.r * 5);
        grad.addColorStop(0, `rgba(243,223,174,${alpha})`);
        grad.addColorStop(1, "rgba(243,223,174,0)");
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(x, p.y, p.r * 5, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.fillStyle = `rgba(255,245,225,${Math.min(alpha + 0.25, 0.9)})`;
        ctx!.beginPath();
        ctx!.arc(x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }

      frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={
        className ?? "pointer-events-none fixed inset-0 z-0 h-full w-full"
      }
    />
  );
}

function makeParticle(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.6 + 0.4,
    baseAlpha: Math.random() * 0.5 + 0.15,
    vy: -(Math.random() * 0.22 + 0.05),
    sway: Math.random() * 0.6 + 0.2,
    phase: Math.random() * Math.PI * 2,
  };
}
