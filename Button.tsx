"use client";

import { motion } from "framer-motion";
import type { MouseEventHandler, ReactNode } from "react";

type Variant = "gold" | "gold-outline";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  variant?: Variant;
  block?: boolean;
  className?: string;
  children: ReactNode;
}

export default function Button({
  type = "button",
  onClick,
  disabled,
  variant = "gold",
  block = false,
  className = "",
  children,
}: ButtonProps) {
  const variantClass = variant === "gold" ? "btn-gold" : "btn-gold-outline";
  const blockClass = block ? "btn-block" : "";

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${variantClass} ${blockClass} ${className}`}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { y: 0, scale: 0.97 }}
      transition={{ duration: 0.25, ease: [0.22, 0.61, 0.18, 1] }}
    >
      {children}
    </motion.button>
  );
}
