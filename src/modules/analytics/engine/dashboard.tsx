"use client";

/**
 * ConfigurableDashboard — renderiza um DashboardSpec (JSON) de ponta a ponta:
 * seções → buildWidget(spec) → WidgetGrid. Nenhum markup fixo.
 */
import { WidgetGrid } from "@modules/widgets";
import type { DashboardSpec } from "./types";
import { buildWidget } from "./builders";

export function ConfigurableDashboard({ spec }: { spec: DashboardSpec }) {
  return (
    <div className="space-y-8">
      {spec.sections.map((section, i) => (
        <section key={i} aria-label={section.title ?? `Seção ${i + 1}`}>
          {(section.title || section.caption) && (
            <div className="mb-3 flex items-baseline gap-2">
              {section.title && (
                <h2 className="font-display text-lg font-semibold text-navy-900">{section.title}</h2>
              )}
              {section.caption && <span className="text-caption text-muted-foreground">{section.caption}</span>}
            </div>
          )}
          <WidgetGrid widgets={section.widgets.map(buildWidget)} />
        </section>
      ))}
    </div>
  );
}
