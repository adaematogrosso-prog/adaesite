import Image from "next/image";

export function SeniorEmblem() {
  return (
    <div className="senior-emblem-wrap">
      <div className="senior-emblem-aura senior-emblem-aura-outer" aria-hidden />
      <div className="senior-emblem-aura senior-emblem-aura-inner" aria-hidden />
      <div className="senior-emblem-ring" aria-hidden />
      <Image
        src="/imagenspublicas/emblema-senior.png?v=2"
        alt="Emblema DeMolay Alumni, grau Sênior"
        width={280}
        height={373}
        unoptimized
        className="senior-emblem-image relative z-10 mx-auto h-auto w-full max-w-[260px] sm:max-w-[280px]"
      />
    </div>
  );
}
