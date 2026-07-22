import clsx from "clsx";

export default function SectionHeading({ eyebrow, title, subtitle, align = "left", className }) {
  return (
    <div className={clsx(align === "center" && "text-center mx-auto max-w-2xl", className)}>
      {eyebrow && (
        <p className="font-mono text-xs tracking-widest text-coral mb-2 uppercase">{eyebrow}</p>
      )}
      <h2 className="font-display font-700 text-2xl sm:text-3xl md:text-4xl text-slate-850 tracking-tight">
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-black/60 text-base leading-relaxed">{subtitle}</p>}
    </div>
  );
}
