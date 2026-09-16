import { BoardMemberCard } from "@/components/BoardMemberCard";
import { ExecutiveBoardGrid } from "@/components/ExecutiveBoardGrid";
import { ExecutiveBoardMeta } from "@/components/ExecutiveBoardMeta";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { LandingSectionAccent } from "@/components/landing/LandingBackgrounds";
import { LandingSectionHeader } from "@/components/landing/LandingSectionHeader";
import {
  buildExecutiveBoardLayout,
  canBuildExecutiveBoardLayout,
} from "@/lib/members/executive-board-layout";
import { getPublicExecutiveBoardSettings } from "@/lib/members/executive-board-settings";
import { getPublicExecutiveBoard } from "@/lib/members/public-executive-board";

export async function ExecutiveBoard() {
  const [boardMembers, boardSettings] = await Promise.all([
    getPublicExecutiveBoard(),
    getPublicExecutiveBoardSettings(),
  ]);
  const hasStructuredLayout = canBuildExecutiveBoardLayout(boardMembers);

  return (
    <section id="diretoria" className="landing-section relative py-20 sm:py-28">
      <LandingSectionAccent segment="diretoria" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <RevealOnScroll>
          <LandingSectionHeader
            eyebrow="Liderança"
            title="Diretoria Executiva"
            description="Conheça os irmãos que conduzem a ADAE-MT."
          />
        </RevealOnScroll>

        <RevealOnScroll delay={80}>
          <ExecutiveBoardMeta settings={boardSettings} />
        </RevealOnScroll>

        {hasStructuredLayout ? (
          <ExecutiveBoardGrid
            layout={buildExecutiveBoardLayout(boardMembers)}
          />
        ) : boardMembers.length > 0 ? (
          <div className="mt-14 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {boardMembers.map((member, index) => (
              <RevealOnScroll key={member.id} delay={index * 80} className="h-full">
                <BoardMemberCard member={member} />
              </RevealOnScroll>
            ))}
          </div>
        ) : (
          <RevealOnScroll delay={120}>
            <div className="landing-content-panel mx-auto mt-14 max-w-xl text-center">
              <p className="landing-section-lead">
                A diretoria executiva será publicada em breve.
              </p>
            </div>
          </RevealOnScroll>
        )}
      </div>
    </section>
  );
}
