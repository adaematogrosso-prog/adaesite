import { BoardMemberCard } from "@/components/BoardMemberCard";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import type { ExecutiveBoardLayout } from "@/lib/members/executive-board-layout";

type Props = {
  layout: ExecutiveBoardLayout;
};

export function ExecutiveBoardGrid({ layout }: Props) {
  return (
    <div className="board-org-chart">
      <div className="board-org-leadership">
        {layout.leadership.map((member, index) => (
          <RevealOnScroll key={member.id} delay={index * 80} className="h-full">
            <BoardMemberCard member={member} />
          </RevealOnScroll>
        ))}
      </div>

      <div className="board-org-columns">
        {layout.columns.map((column, columnIndex) => (
          <div key={column.main.role} className="board-org-column">
            <RevealOnScroll delay={160 + columnIndex * 80} className="h-full">
              <BoardMemberCard member={column.main} />
            </RevealOnScroll>

            <div className="board-org-adjunct-wrap">
              <RevealOnScroll delay={240 + columnIndex * 80} className="h-full">
                <BoardMemberCard member={column.adjunct} variant="adjunct" />
              </RevealOnScroll>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
