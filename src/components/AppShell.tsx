import { Link } from "@tanstack/react-router";
import { Home, NotebookPen, Activity, Camera, FileText } from "lucide-react";
import type { ReactNode } from "react";

const tabs = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/diario", label: "Diario", icon: NotebookPen },
  { to: "/terapias", label: "Terapias", icon: Activity },
  { to: "/fotos", label: "Fotos", icon: Camera },
  { to: "/reporte", label: "Reporte", icon: FileText },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-28">
      {children}
      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t bg-card/95 backdrop-blur">
        <ul className="grid grid-cols-5">
          {tabs.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                activeOptions={{ exact: true }}
                className="flex flex-col items-center gap-1 py-3 text-xs text-muted-foreground transition-colors data-[status=active]:font-semibold data-[status=active]:text-primary"
              >
                <Icon className="h-6 w-6" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="px-5 pb-4 pt-8">
      <h1 className="font-display text-3xl font-semibold text-foreground">{title}</h1>
      {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
    </header>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`mx-5 mb-4 rounded-3xl border bg-card p-5 shadow-soft ${className}`}>{children}</section>;
}
