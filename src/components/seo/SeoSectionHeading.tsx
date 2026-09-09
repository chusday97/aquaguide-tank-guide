export function SeoSectionHeading({ number, eyebrow, title, description, id }: { number: string; eyebrow: string; title: string; description?: string; id?: string }) {
  return <div className="seo-section-heading">
    <span className="seo-section-heading__number" aria-hidden="true">{number}</span>
    <div>
      {eyebrow && eyebrow !== title && <p className="seo-eyebrow">{eyebrow}</p>}
      <h2 id={id} className="seo-section-heading__title">{title}</h2>
      {description && <p className="seo-section-heading__description">{description}</p>}
    </div>
  </div>;
}

export default SeoSectionHeading;
