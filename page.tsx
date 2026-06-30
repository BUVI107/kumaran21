"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, useAnimationControls, AnimatePresence } from "framer-motion";
import EmberField from "@/components/EmberField";
import Button from "@/components/Button";
import { useAppState } from "@/context/AppStateContext";
import { PORTRAIT_IMAGE } from "@/data/memories";
import { SITE_PASSWORD } from "@/lib/constants";

const EASE = [0.22, 0.61, 0.18, 1] as const;

export default function PasswordPage() {
  const router = useRouter();
  const { setUnlocked } = useAppState();
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const shakeControls = useAnimationControls();

  const focusBox = (index: number) => {
    inputsRef.current[index]?.focus();
  };

  const handleChange = (index: number, raw: string) => {
    const value = raw.replace(/[^0-9]/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    if (value && index < 3) focusBox(index + 1);
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      focusBox(index - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData("text").match(/[0-9]/g) ?? []).slice(
      0,
      4
    );
    if (pasted.length === 0) return;
    setDigits((prev) => {
      const next = [...prev];
      pasted.forEach((d, i) => {
        if (i < 4) next[i] = d;
      });
      return next;
    });
    focusBox(Math.min(pasted.length, 3));
  };

  const triggerShake = useCallback(() => {
    shakeControls.start({
      x: [0, -10, 10, -10, 10, -6, 6, -3, 3, 0],
      transition: { duration: 0.45, ease: "easeInOut" },
    });
  }, [shakeControls]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = digits.join("");

    if (entered.length < 4) {
      setError(true);
      triggerShake();
      return;
    }

    if (entered === SITE_PASSWORD) {
      setError(false);
      setUnlocked(true);
      setLeaving(true);
      window.setTimeout(() => {
        router.push("/welcome");
      }, 650);
    } else {
      setError(true);
      triggerShake();
      setDigits(["", "", "", ""]);
      focusBox(0);
    }
  };

  return (
    <main className="page-shell flex items-center justify-center">
      <EmberField density={22} />

      <AnimatePresence>
        {!leaving && (
          <motion.div
            className="password-layout relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(18px)" }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <div className="password-portrait">
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 1.04 }}
                animate={{ scale: 1.1, y: "-1.5%" }}
                transition={{
                  duration: 14,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              >
                <Image
                  src={PORTRAIT_IMAGE.src}
                  alt={PORTRAIT_IMAGE.alt}
                  fill
                  priority
                  sizes="(max-width: 880px) 100vw, 55vw"
                />
              </motion.div>
              <div className="portrait-veil" />
            </div>

            <div className="password-panel">
              <motion.div
                className="glass-card password-card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
              >
                <p className="eyebrow">A Private Invitation</p>
                <h1 className="display-xl">
                  Kumaran&apos;s 21<span className="sup">st</span>
                </h1>
                <p className="subtitle">
                  Some journeys deserve to be remembered.
                </p>

                <div className="hairline" />

                <form onSubmit={handleSubmit} autoComplete="off">
                  <label className="field-label" htmlFor="otp-0">
                    Enter the date — <span className="hint">DDMM</span>
                  </label>

                  <motion.div className="otp-row" animate={shakeControls}>
                    {digits.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        ref={(el) => {
                          inputsRef.current[i] = el;
                        }}
                        className="otp-box"
                        maxLength={1}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={digit}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onPaste={handlePaste}
                        aria-label={`Digit ${i + 1} of 4`}
                      />
                    ))}
                  </motion.div>

                  <p
                    className="password-error"
                    role="alert"
                    style={{ opacity: error ? 1 : 0 }}
                  >
                    That&apos;s not quite the date. Try again.
                  </p>

                  <Button type="submit" block className="mt-2">
                    Unlock
                  </Button>
                </form>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
