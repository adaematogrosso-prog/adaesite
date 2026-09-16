type LandingSectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
};

export function LandingSectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
}: LandingSectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <div className={isCenter ? "mx-auto max-w-3xl text-center" : "max-w-xl"}>
      <p className="landing-section-eyebrow">{eyebrow}</p>
      <h2 className="landing-section-title">{title}</h2>
      <div
        className={`landing-section-rule mt-5 ${isCenter ? "mx-auto" : ""}`}
        aria-hidden
      />
      {description ? (
        <p
          className={`landing-section-lead mt-6 ${isCenter ? "mx-auto max-w-2xl" : ""}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
