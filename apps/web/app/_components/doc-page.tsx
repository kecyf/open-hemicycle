import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "./site-chrome";

export function DocPage({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-10 px-6 py-16">
      <SiteHeader />
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="text-base text-muted">{description}</p>}
      </header>
      <article className="prose-doc flex flex-col gap-8 text-sm leading-relaxed text-muted">
        {children}
      </article>
      <SiteFooter />
    </main>
  );
}

export function DocSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

export function DocCallout({ children }: { children: ReactNode }) {
  return (
    <aside className="rounded-xl border border-border bg-card p-4 text-sm leading-relaxed">
      {children}
    </aside>
  );
}
