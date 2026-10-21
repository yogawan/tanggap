export function SectionIntro({
  eyebrow,
  title,
  copy,
  centered = false,
  as: Heading = "h2",
}: {
  eyebrow: string;
  title: string;
  copy: string;
  centered?: boolean;
  as?: "h1" | "h2";
}) {
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-xs font-bold tracking-[.18em] text-primary">
        {eyebrow}
      </p>
      <Heading className="mt-3 text-3xl font-semibold tracking-[-.03em] text-foreground sm:text-4xl">
        {title}
      </Heading>
      <p className="mt-4 text-base leading-7 text-muted">{copy}</p>
    </div>
  );
}
