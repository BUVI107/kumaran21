"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/Button";

interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  hit: boolean;
}

interface Player {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface CarGameProps {
  targetDistance: number;
  onComplete: () => void;
}

const COLORS = {
  playerBody: ["#f3dfae", "#c9a45c"],
  playerGlass: "#1a1408",
  traffic: ["#cfd2d6", "#7a2424", "#e9e7e0", "#3a3f47"],
  dash: "rgba(243,239,230,0.35)",
};

export default function CarGame({ targetDistance, onComplete }: CarGameProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const sizeRef = useRef({ w: 0, h: 0 });
  const lanesRef = useRef<number[]>([]);
  const playerRef = useRef<Player>({ x: 0, y: 0, w: 0, h: 0 });
  const obstaclesRef = useRef<Obstacle[]>([]);
  const dashesRef = useRef<number[]>([]);
  const laneIndexRef = useRef(1);
  const distanceRef = useRef(0);
  const speedRef = useRef(5.2);
  const spawnTimerRef = useRef(0);
  const shakeRef = useRef(0);
  const bumpFlashRef = useRef(0);
  const invulnRef = useRef(0);
  const runningRef = useRef(false);
  const wonRef = useRef(false);
  const startedRef = useRef(false);
  const lastTimeRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  const loopRef = useRef<(now: number) => void>(() => {});

  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);
  const [hud, setHud] = useState({ score: 0, speed: 0, pct: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctxRef.current = ctx;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function buildLanes() {
      const { w } = sizeRef.current;
      const margin = w * 0.08;
      const roadW = w - margin * 2;
      const laneW = roadW / 3;
      lanesRef.current = [0, 1, 2].map((i) => margin + laneW * i + laneW / 2);
    }

    function laneCenter(i: number) {
      return lanesRef.current[i] ?? sizeRef.current.w / 2;
    }

    function resize() {
      const w = wrap!.clientWidth;
      const h = wrap!.clientHeight;
      sizeRef.current = { w, h };
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildLanes();
      playerRef.current.x = laneCenter(laneIndexRef.current);
    }

    function resetWorld() {
      const { h, w } = sizeRef.current;
      distanceRef.current = 0;
      speedRef.current = 5.2;
      laneIndexRef.current = 1;
      wonRef.current = false;
      spawnTimerRef.current = 0;
      shakeRef.current = 0;
      bumpFlashRef.current = 0;
      invulnRef.current = 0;
      const pw = Math.min(46, w * 0.09);
      playerRef.current = {
        x: laneCenter(1),
        y: h - pw * 1.7 * 1.3,
        w: pw,
        h: pw * 1.7,
      };
      obstaclesRef.current = [];
      const dashCount = 10;
      dashesRef.current = Array.from(
        { length: dashCount },
        (_, i) => i * (h / dashCount)
      );
    }

    function drawNeonEdge(x: number) {
      const { h } = sizeRef.current;
      const grad = ctx!.createLinearGradient(x - 10, 0, x + 10, 0);
      grad.addColorStop(0, "rgba(201,164,92,0)");
      grad.addColorStop(0.5, "rgba(201,164,92,0.9)");
      grad.addColorStop(1, "rgba(201,164,92,0)");
      ctx!.fillStyle = grad;
      ctx!.fillRect(x - 10, 0, 20, h);
    }

    function taperedCarBody(w: number, h: number) {
      const noseW = w * 0.62;
      const tailW = w * 0.94;
      const r = w * 0.18;
      ctx!.beginPath();
      ctx!.moveTo(-noseW / 2, -h / 2 + r);
      ctx!.quadraticCurveTo(-noseW / 2, -h / 2, 0, -h / 2);
      ctx!.quadraticCurveTo(noseW / 2, -h / 2, noseW / 2, -h / 2 + r);
      ctx!.lineTo(tailW / 2, h / 2 - r);
      ctx!.quadraticCurveTo(tailW / 2, h / 2, tailW / 2 - r, h / 2);
      ctx!.lineTo(-tailW / 2 + r, h / 2);
      ctx!.quadraticCurveTo(-tailW / 2, h / 2, -tailW / 2, h / 2 - r);
      ctx!.closePath();
    }

    function drawCar(
      x: number,
      y: number,
      w: number,
      h: number,
      color: string | null,
      isPlayer: boolean
    ) {
      ctx!.save();
      ctx!.translate(x, y);

      ctx!.fillStyle = isPlayer ? "rgba(201,164,92,0.28)" : "rgba(0,0,0,0.35)";
      ctx!.beginPath();
      ctx!.ellipse(0, h * 0.4, w * 0.6, h * 0.24, 0, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.fillStyle = "#0c0c0d";
      const wheelW = w * 0.16;
      const wheelH = h * 0.22;
      ctx!.fillRect(-w * 0.56, -h * 0.22, wheelW, wheelH);
      ctx!.fillRect(w * 0.56 - wheelW, -h * 0.22, wheelW, wheelH);
      ctx!.fillRect(-w * 0.56, h * 0.04, wheelW, wheelH);
      ctx!.fillRect(w * 0.56 - wheelW, h * 0.04, wheelW, wheelH);

      if (isPlayer) {
        const grad = ctx!.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
        grad.addColorStop(0, COLORS.playerBody[0]);
        grad.addColorStop(1, COLORS.playerBody[1]);
        ctx!.fillStyle = grad;
      } else {
        ctx!.fillStyle = color!;
      }
      taperedCarBody(w, h);
      ctx!.fill();

      ctx!.fillStyle = isPlayer ? COLORS.playerBody[1] : color!;
      ctx!.fillRect(-w * 0.52, -h * 0.08, w * 0.07, h * 0.07);
      ctx!.fillRect(w * 0.45, -h * 0.08, w * 0.07, h * 0.07);

      ctx!.fillStyle = isPlayer ? COLORS.playerGlass : "rgba(10,10,12,0.85)";
      ctx!.beginPath();
      ctx!.moveTo(-w * 0.24, -h * 0.32);
      ctx!.lineTo(w * 0.24, -h * 0.32);
      ctx!.lineTo(w * 0.18, h * 0.02);
      ctx!.lineTo(-w * 0.18, h * 0.02);
      ctx!.closePath();
      ctx!.fill();

      ctx!.fillStyle = isPlayer ? "rgba(26,20,8,0.7)" : "rgba(10,10,12,0.6)";
      ctx!.beginPath();
      ctx!.moveTo(-w * 0.2, h * 0.22);
      ctx!.lineTo(w * 0.2, h * 0.22);
      ctx!.lineTo(w * 0.26, h * 0.4);
      ctx!.lineTo(-w * 0.26, h * 0.4);
      ctx!.closePath();
      ctx!.fill();

      ctx!.fillStyle = isPlayer
        ? "rgba(255,250,235,0.95)"
        : "rgba(255,120,90,0.85)";
      ctx!.fillRect(-w * 0.26, -h * 0.47, w * 0.13, h * 0.05);
      ctx!.fillRect(w * 0.13, -h * 0.47, w * 0.13, h * 0.05);

      if (isPlayer) {
        ctx!.fillStyle = "rgba(20,15,5,0.55)";
        ctx!.fillRect(-w * 0.045, -h * 0.46, w * 0.09, h * 0.92);
        ctx!.fillStyle = COLORS.playerGlass;
        ctx!.fillRect(-w * 0.34, h * 0.44, w * 0.68, h * 0.05);
      }

      ctx!.restore();
    }

    function draw() {
      const { w, h } = sizeRef.current;
      ctx!.save();
      const shake = shakeRef.current;
      const sx = shake ? (Math.random() - 0.5) * shake : 0;
      const sy = shake ? (Math.random() - 0.5) * shake : 0;
      ctx!.translate(sx, sy);

      const roadGrad = ctx!.createLinearGradient(0, 0, 0, h);
      roadGrad.addColorStop(0, "#08080a");
      roadGrad.addColorStop(1, "#111114");
      ctx!.fillStyle = roadGrad;
      ctx!.fillRect(-20, -20, w + 40, h + 40);

      const margin = w * 0.08;
      drawNeonEdge(margin);
      drawNeonEdge(w - margin);

      ctx!.strokeStyle = COLORS.dash;
      ctx!.lineWidth = 2;
      const laneXs = [
        margin + ((w - margin * 2) / 3) * 1,
        margin + ((w - margin * 2) / 3) * 2,
      ];
      for (const lx of laneXs) {
        for (const y of dashesRef.current) {
          ctx!.beginPath();
          ctx!.moveTo(lx, y);
          ctx!.lineTo(lx, y + h * 0.045);
          ctx!.stroke();
        }
      }

      for (const o of obstaclesRef.current) {
        drawCar(o.x, o.y, o.w, o.h, o.color, false);
      }
      drawCar(
        playerRef.current.x,
        playerRef.current.y,
        playerRef.current.w,
        playerRef.current.h,
        null,
        true
      );

      ctx!.restore();

      if (bumpFlashRef.current > 0) {
        ctx!.fillStyle = `rgba(200,60,40,${bumpFlashRef.current * 0.28})`;
        ctx!.fillRect(0, 0, w, h);
      }
    }

    function spawnObstacle() {
      const { w } = sizeRef.current;
      const li = Math.floor(Math.random() * 3);
      const cw = Math.min(40, w * 0.08);
      obstaclesRef.current.push({
        x: laneCenter(li),
        y: -60,
        w: cw,
        h: cw * 1.7,
        color:
          COLORS.traffic[Math.floor(Math.random() * COLORS.traffic.length)],
        hit: false,
      });
    }

    function updateHud() {
      const pct = Math.min(
        100,
        Math.floor((distanceRef.current / targetDistance) * 100)
      );
      setHud({
        score: Math.floor(distanceRef.current),
        speed: startedRef.current ? Math.floor(40 + speedRef.current * 14) : 0,
        pct,
      });
    }

    function update(dt: number) {
      if (wonRef.current) return;
      const { h } = sizeRef.current;

      speedRef.current = Math.min(speedRef.current + 0.0026 * dt, 13.5);
      distanceRef.current += speedRef.current * dt * 0.105;

      const targetX = laneCenter(laneIndexRef.current);
      playerRef.current.x +=
        (targetX - playerRef.current.x) * Math.min(0.18 * dt, 1);

      dashesRef.current = dashesRef.current.map((y) => {
        let ny = y + speedRef.current * dt * 2.2;
        if (ny > h) ny -= h;
        return ny;
      });

      spawnTimerRef.current -= dt;
      if (spawnTimerRef.current <= 0) {
        spawnTimerRef.current =
          Math.max(38 - speedRef.current * 1.6, 16) + Math.random() * 14;
        spawnObstacle();
      }

      for (const o of obstaclesRef.current) {
        o.y += (speedRef.current * 0.86 + 1.4) * dt * 2.0;
      }
      obstaclesRef.current = obstaclesRef.current.filter((o) => o.y < h + 120);

      if (invulnRef.current <= 0) {
        for (const o of obstaclesRef.current) {
          if (o.hit) continue;
          const dx = Math.abs(o.x - playerRef.current.x);
          const dy = Math.abs(o.y - playerRef.current.y);
          if (
            dx < (playerRef.current.w + o.w) * 0.34 &&
            dy < (playerRef.current.h + o.h) * 0.3
          ) {
            o.hit = true;
            shakeRef.current = 9;
            bumpFlashRef.current = 0.7;
            invulnRef.current = 55;
            speedRef.current = Math.max(speedRef.current * 0.82, 4);
          }
        }
      }

      if (invulnRef.current > 0) {
        invulnRef.current = Math.max(0, invulnRef.current - dt);
      }
      if (shakeRef.current > 0) {
        shakeRef.current = Math.max(0, shakeRef.current - dt * 1.6);
      }
      if (bumpFlashRef.current > 0) {
        bumpFlashRef.current = Math.max(0, bumpFlashRef.current - dt * 0.09);
      }

      updateHud();

      if (distanceRef.current >= targetDistance && !wonRef.current) {
        wonRef.current = true;
        runningRef.current = false;
        window.setTimeout(() => setWon(true), 400);
      }
    }

    function loop(now: number) {
      if (!runningRef.current) return;
      const dt = Math.min((now - lastTimeRef.current) / 16.67, 2.4);
      lastTimeRef.current = now;
      update(dt);
      draw();
      if (runningRef.current) {
        frameRef.current = requestAnimationFrame(loop);
      }
    }

    loopRef.current = loop;

    resize();
    resetWorld();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [targetDistance]);

  function moveLane(dir: -1 | 1) {
    laneIndexRef.current = Math.max(0, Math.min(2, laneIndexRef.current + dir));
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!runningRef.current) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") moveLane(-1);
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") moveLane(1);
    }
    window.addEventListener("keydown", onKeyDown);

    const wrap = wrapRef.current;
    let touchStartX: number | null = null;
    function onTouchStart(e: TouchEvent) {
      touchStartX = e.touches[0]?.clientX ?? null;
    }
    function onTouchEnd(e: TouchEvent) {
      if (touchStartX === null || !runningRef.current) return;
      const dx = (e.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
      if (Math.abs(dx) > 40) moveLane(dx > 0 ? 1 : -1);
      touchStartX = null;
    }
    wrap?.addEventListener("touchstart", onTouchStart, { passive: true });
    wrap?.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      wrap?.removeEventListener("touchstart", onTouchStart);
      wrap?.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  function handleStart() {
    setStarted(true);
    startedRef.current = true;
    runningRef.current = true;
    lastTimeRef.current = performance.now();
    frameRef.current = requestAnimationFrame(loopRef.current);
  }

  function handleSkip() {
    runningRef.current = false;
    onComplete();
  }

  function handleContinue() {
    onComplete();
  }

  return (
    <div className="game-frame">
      <header className="game-header">
        <div>
          <p className="eyebrow">Chapter One</p>
          <h2 className="display-md">The Road To Twenty&#8209;One</h2>
        </div>
        <div className="game-hud">
          <div className="hud-stat">
            <span className="hud-label">Distance</span>
            <span className="hud-value">{hud.score} m</span>
          </div>
          <div className="hud-stat">
            <span className="hud-label">Speed</span>
            <span className="hud-value">{hud.speed} km/h</span>
          </div>
        </div>
      </header>

      <div className="game-progress-track">
        <div className="game-progress-fill" style={{ width: `${hud.pct}%` }} />
        <span className="game-progress-label">Destination — {hud.pct}%</span>
      </div>

      <div className="game-canvas-wrap" ref={wrapRef}>
        <canvas ref={canvasRef} />

        <AnimatePresence>
          {!started && (
            <motion.div
              className="game-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="overlay-kicker">
                Premium Sports Car · Night Highway
              </p>
              <h3 className="display-md">Drive To The Destination</h3>
              <p className="overlay-copy">
                Use <kbd>&larr;</kbd> <kbd>&rarr;</kbd> or the controls below
                to weave through traffic and reach the finish line.
              </p>
              <Button onClick={handleStart}>Start Engine</Button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {won && (
            <motion.div
              className="game-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="overlay-kicker">Destination Reached</p>
              <h3 className="display-md">You Made It, Kumaran</h3>
              <p className="overlay-copy">
                A journey completed is a memory unlocked.
              </p>
              <Button onClick={handleContinue}>Enter The Memory Hall</Button>
            </motion.div>
          )}
        </AnimatePresence>

        {started && !won && (
          <div className="mobile-controls">
            <button
              className="ctrl-btn"
              aria-label="Move left"
              onClick={() => moveLane(-1)}
            >
              &#9664;
            </button>
            <button
              className="ctrl-btn"
              aria-label="Move right"
              onClick={() => moveLane(1)}
            >
              &#9654;
            </button>
          </div>
        )}
      </div>

      {!won && (
        <button className="skip-link" onClick={handleSkip}>
          Skip ahead &rarr;
        </button>
      )}
    </div>
  );
}
