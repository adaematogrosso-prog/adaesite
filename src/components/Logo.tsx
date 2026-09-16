import Image from "next/image";
import { SITE_SHORT_NAME } from "@/lib/constants";

const LOGO_RATIO = 426 / 444;

const sizes = {
  sm: { width: 44, className: "drop-shadow-md" },
  md: { width: 56, className: "drop-shadow-md" },
  panel: { width: 112, className: "drop-shadow-lg" },
  lg: { width: 200, className: "drop-shadow-lg" },
  xl: { width: 280, className: "drop-shadow-2xl drop-shadow-black/50" },
} as const;

type LogoSize = keyof typeof sizes;

type Props = {
  size?: LogoSize;
  priority?: boolean;
  className?: string;
};

export function Logo({ size = "md", priority = false, className = "" }: Props) {
  const { width, className: sizeClassName } = sizes[size];
  const height = Math.round(width / LOGO_RATIO);

  return (
    <Image
      src="/imagenspublicas/logoalumni2.png"
      alt={`Logo ${SITE_SHORT_NAME}`}
      width={width}
      height={height}
      quality={100}
      priority={priority}
      className={`h-auto max-w-full object-contain ${sizeClassName} ${className}`.trim()}
    />
  );
}
