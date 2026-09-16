"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  sizes?: string;
  variant?: "cover" | "avatar";
};

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
      className="h-5 w-5"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function ImageLightbox({
  src,
  alt,
  sizes = "(max-width: 640px) 100vw, 33vw",
  variant = "cover",
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const isAvatar = variant === "avatar";

  const modal =
    open && mounted
      ? createPortal(
          <div
            className="image-lightbox-backdrop fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4 sm:p-8"
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={alt}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="image-lightbox-close absolute right-4 top-4 z-[201] flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:border-gold/40 hover:bg-white/20"
              aria-label="Fechar"
            >
              <CloseIcon />
            </button>

            <div
              className="relative max-h-[90vh] max-w-5xl"
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={src}
                alt={alt}
                width={1600}
                height={1200}
                className="max-h-[90vh] w-auto max-w-full object-contain"
                unoptimized
              />
              <p className="mt-3 text-center text-sm text-white/80">{alt}</p>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          isAvatar
            ? "group relative h-32 w-32 shrink-0 cursor-zoom-in overflow-hidden rounded-full border-4 border-gold/30 bg-royal-blue/5"
            : "group relative block aspect-[4/3] w-full shrink-0 cursor-zoom-in bg-royal-blue/5"
        }
        aria-label={`Ampliar imagem: ${alt}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition group-hover:brightness-95"
          sizes={sizes}
        />
        <span className="absolute inset-0 flex items-center justify-center bg-royal-blue/0 transition group-hover:bg-royal-blue/10">
          <span
            className={`rounded-full bg-white/90 font-medium text-royal-blue opacity-0 shadow transition group-hover:opacity-100 ${
              isAvatar ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
            }`}
          >
            Ver
          </span>
        </span>
      </button>

      {modal}
    </>
  );
}
