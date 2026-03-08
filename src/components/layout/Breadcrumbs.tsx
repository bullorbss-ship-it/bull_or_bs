import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm mb-6">
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-1.5 text-muted-light">/</span>}
          {item.href ? (
            <Link href={item.href} className="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-muted-light">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
