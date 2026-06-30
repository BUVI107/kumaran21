"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export interface ConfettiHandle {
  burst: (count?: number) => void;
  rain: (durationMs?: number) => void;
}

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vrot: number;
  color: string;
  life: number;
  maxLife: number;
  shape: "rect" | "circle";
}

const COLORS = ["#f3dfae", "#c9a45c", "#7c5e30", "#f6ecd8"];

const ConfettiField = forwardRef<ConfettiHandle, { className?: string }>(
  function ConfettiField({ className }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const particlesRef = useRef<ConfettiParticle[]>([]);
    const sizeRef = useRef({ w: 0, h: 0 });
    const runningRef = useRef(false);
    const frameRef = useRef<number | null>(null);
    const [active, setActive] = useState(false);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctxRef.current = ctx;
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
      return () => {
        window.removeEventListener("resize", resize);
        if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      };
    }, []);

    function ensureLoop() {
      if (runningRef.current) return;
      runningRef.current = true;
      frameRef.current = requestAnimationFrame(tick);
    }

    function tick() {
      const ctx = ctxRef.current;
      if (!ctx) return;
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);
      const dt = 1 / 60;

      particlesRef.current = particlesRef.current.filter(
        (p) => p.life < p.maxLife
      );

      for (const p of particlesRef.current) {
        p.life += dt;
        p.vy += 0.12;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;

        const fadeStart = p.maxLife * 0.7;
        const alpha =
          p.life > fadeStart
            ? Math.max(0, 1 - (p.life - fadeStart) / (p.maxLife - fadeStart))
            : 1;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (particlesRef.current.length > 0) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        runningRef.current = false;
        setActive(false);
      }
    }

    useImperativeHandle(ref, () => ({
      burst(count = 140) {
        setActive(true);
        const { w, h } = sizeRef.current;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI + Math.PI;
          const speed = Math.random() * 9 + 4;
          particlesRef.current.push({
            x: w / 2 + (Math.random() - 0.5) * 120,
            y: h * 0.45,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 7 + 4,
            rot: Math.random() * Math.PI * 2,
            vrot: (Math.random() - 0.5) * 0.3,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            life: 0,
            maxLife: Math.random() * 2.4 + 2.2,
            shape: Math.random() > 0.5 ? "rect" : "circle",
          });
        }
        ensureLoop();
      },
      rain(durationMs = 6000) {
        setActive(true);
        const start = performance.now();
        const dropOne = () => {
          if (performance.now() - start > durationMs) return;
          const { w } = sizeRef.current;
          particlesRef.current.push({
            x: Math.random() * w,
            y: -20,
            vx: (Math.random() - 0.5) * 1.2,
            vy: Math.random() * 1.5 + 1.5,
            size: Math.random() * 6 + 3,
            rot: Math.random() * Math.PI * 2,
            vrot: (Math.random() - 0.5) * 0.2,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            life: 0,
            maxLife: 6,
            shape: Math.random() > 0.5 ? "rect" : "circle",
          });
          setTimeout(dropOne, 60);
        };
        dropOne();
        ensureLoop();
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={
          (className ?? "pointer-events-none fixed inset-0 z-30 h-full w-full") +
          (active ? " opacity-100" : " opacity-0")
        }
      />
    );
  }
);

export default ConfettiField;
