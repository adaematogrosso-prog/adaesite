import { LandingFlowBackground } from "@/components/landing/LandingBackgrounds";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function CeremonialPageShell({ children, className = "" }: Props) {
  return (
    <div className={`ceremonial-page relative ${className}`.trim()}>
      <LandingFlowBackground variant="page" />
      <div className="ceremonial-page-content relative z-[1]">{children}</div>
    </div>
  );
}
