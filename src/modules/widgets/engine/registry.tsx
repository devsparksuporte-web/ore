"use client";

/**
 * Registry do Widget Engine — extensível sem alterar o engine:
 * registerWidget("meu-tipo", MeuCorpo) e o tipo passa a existir na
 * plataforma inteira. Corpos recebem SOMENTE dados prontos (o frame
 * resolve loading/erro/empty/permissão antes).
 */
import * as React from "react";
import { WidgetFrame } from "./widget-frame";
import type { WidgetConfig } from "./types";

export type WidgetBody<T> = React.ComponentType<{ data: T; config: WidgetConfig<T> }>;

const registry = new Map<string, WidgetBody<any>>();

export function registerWidget<T>(type: string, body: WidgetBody<T>) {
  if (registry.has(type)) {
    // Substituição consciente é permitida (white label/tenant), mas logada em dev.
    if (process.env.NODE_ENV !== "production") console.warn(`[widget-engine] sobrescrevendo widget "${type}"`);
  }
  registry.set(type, body);
}

export function Widget({ config, index }: { config: WidgetConfig<any>; index?: number }) {
  const Body = registry.get(config.type);
  return (
    <WidgetFrame config={config} index={index}>
      {config.data.status === "ready" ? (
        Body ? (
          <Body data={config.data.data} config={config} />
        ) : (
          <p className="text-body-sm text-danger">Widget &quot;{config.type}&quot; não registrado.</p>
        )
      ) : null}
    </WidgetFrame>
  );
}
