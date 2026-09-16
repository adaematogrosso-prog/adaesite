import { ImageLightbox } from "@/components/ImageLightbox";
import type { SeniorPillar } from "@/types/database";

type Props = {
  pillar: SeniorPillar;
};

export function SeniorPillarCard({ pillar }: Props) {
  return (
    <article className="landing-card group flex h-full flex-col overflow-hidden">
      <div className="landing-card-bar" aria-hidden />
      <div className="flex min-h-[9.5rem] flex-col justify-center p-6 text-center sm:p-7">
        <h3 className="landing-card-title">{pillar.title}</h3>
        <p className="landing-card-muted mt-3 text-sm leading-relaxed sm:text-[0.9375rem]">
          {pillar.description}
        </p>
      </div>

      {pillar.image_url ? (
        <ImageLightbox src={pillar.image_url} alt={pillar.title} />
      ) : (
        <div className="flex aspect-[4/3] w-full shrink-0 items-center justify-center border-t border-white/8 bg-black/20">
          <p className="landing-card-muted text-xs italic">Imagem em breve</p>
        </div>
      )}
    </article>
  );
}
