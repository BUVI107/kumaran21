"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

export interface LightboxPhoto {
  src: string;
  alt: string;
  name?: string;
  caption?: string;
}

interface LightboxProps {
  photo: LightboxPhoto | null;
  onClose: () => void;
}

export default function Lightbox({ photo, onClose }: LightboxProps) {
  useEffect(() => {
    if (!photo) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [photo, onClose]);

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          className="lightbox-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <button
            className="lightbox-close"
            aria-label="Close"
            onClick={onClose}
          >
            &times;
          </button>
          <motion.figure
            className="lightbox-figure"
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.96 }}
            transition={{ duration: 0.4 }}
          >
            <div className="lightbox-img-wrap">
              <Image
                src={photo.src}
                alt={photo.alt}
                width={1280}
                height={1280}
                sizes="88vw"
                style={{
                  width: "auto",
                  height: "auto",
                  maxWidth: "100%",
                  maxHeight: "70vh",
                }}
              />
            </div>
            {(photo.name || photo.caption) && (
              <figcaption>
                {photo.name && (
                  <span className="lightbox-name">{photo.name}</span>
                )}
                {photo.caption && (
                  <span className="lightbox-caption">{photo.caption}</span>
                )}
              </figcaption>
            )}
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
