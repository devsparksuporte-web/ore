"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Landmark } from "lucide-react";
import { companies } from "@/mocks/companies";
import { AuthLayout } from "@/components/layouts";
import { IntegrationBadge } from "@/components/data/status-badge";
import { mockSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export default function SelectContextPage() {
  return (
    <AuthLayout variant="center">
      <p className="text-sm text-muted-foreground">Olá, {mockSession.user.name.split(" ")[0]}</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-navy-900">Onde você quer trabalhar?</h1>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-3">
          {/* Portfólio */}
          <Link
            href="/portfolio/overview"
            className="flex items-center gap-4 rounded-md bg-inverse p-6 text-white transition-[transform,box-shadow] duration-fast ease-standard hover:shadow-md hover:-translate-y-0.5"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-white/10">
              <Landmark className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="block font-display text-base font-semibold">Portfólio Ore</span>
              <span className="text-body-sm text-white/70">Visão consolidada · 6 investidas · dashboard corporativo</span>
            </span>
            <ArrowRight className="h-5 w-5" />
          </Link>

          {/* Empresas */}
          <p className="pt-3 text-caption font-medium uppercase tracking-wide text-muted-foreground">Investidas</p>
          {companies.map((c) => {
            const integrated = c.integrationStatus === "integrated";
            const content = (
              <div
                className={cn(
                  "flex items-center gap-4 rounded-md border bg-surface p-4 transition-colors duration-fast",
                  integrated ? "hover:border-action-600" : "opacity-60"
                )}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-navy-100">
                  <Building2 className="h-5 w-5 text-navy-900" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-navy-900">{c.name}</span>
                  <span className="text-caption text-muted-foreground">{c.commodity} · {c.region}</span>
                </span>
                <IntegrationBadge status={c.integrationStatus} />
                {integrated && <ArrowRight className="h-4 w-4 text-action-600" />}
              </div>
            );
            return integrated ? (
              <Link key={c.id} href={`/e/${c.slug}/overview`} className="block">{content}</Link>
            ) : (
              <div key={c.id}>{content}</div>
            );
          })}
        </motion.div>
    </AuthLayout>
  );
}
