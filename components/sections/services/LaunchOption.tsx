"use client";

import { Check, Globe, CheckCircle2, Clock, Home, Server } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";
import { InclusionMark } from "@/components/sections/services/InclusionMark";
import {
  editsSubscription,
  launchOption,
  megahanaHosting,
  ROUTE_CURRENCY_SYMBOL,
  type OrderRoute,
} from "@/lib/services-offers";

const ITEM_KEYS = ["domain", "hosting", "deployment", "checks", "access"] as const;

/**
 * Comparaison des 2 sous-options d'hébergement (clients directs) : une ligne
 * par critère DÉCIDÉ (pas de "support" ni de "transfert", non définis).
 * `null` = pas de précision à côté de la coche/croix.
 */
const HOSTING_ROWS = [
  { key: "includedAtStart", self: false, megahana: true, selfNote: true, megahanaNote: true },
  { key: "noSubscription", self: true, megahana: false, selfNote: false, megahanaNote: true },
  { key: "ownAccount", self: true, megahana: false, selfNote: false, megahanaNote: true },
] as const;
type HostingColumn = "self" | "megahana";

/** "Bientôt disponible" : information seulement — jamais un bouton d'achat/souscription. */
function ComingSoon() {
  const t = useTranslations("Services");
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-text-muted">
      <Clock className="w-3 h-3" aria-hidden="true" />
      {t("soon")}
    </span>
  );
}

/**
 * Hébergement chez vous / par Megahana. Hors du <label> de l'option (un
 * tableau n'a rien à faire dans un label, et chaque clic cocherait
 * l'option). ≥640px : tableau ; en dessous : 2 blocs empilés (le tableau
 * à 3 colonnes déborde de la carte).
 */
function HostingComparison() {
  const t = useTranslations("Services.launch.hosting");
  const noteFor = (row: (typeof HOSTING_ROWS)[number], column: HostingColumn) => {
    if (column === "self") return row.selfNote ? t(`rows.${row.key}.self`) : null;
    if (!row.megahanaNote) return null;
    return t(`rows.${row.key}.megahana`, {
      months: megahanaHosting.includedMonths,
      price: megahanaHosting.monthlyPrice,
    });
  };
  const columns = [
    { key: "self" as const, label: t("self"), Icon: Home, soon: false },
    { key: "megahana" as const, label: t("megahana"), Icon: Server, soon: true },
  ];

  return (
    <div className="card-border rounded-2xl p-px mt-4 max-w-4xl mx-auto">
      <div className="bg-surface rounded-2xl p-6 sm:p-8">
        <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
          {t("title")}
        </h3>

        {/* < 640px : un bloc par option. */}
        <div className="space-y-3 sm:hidden">
          {columns.map(({ key, label, Icon, soon }) => (
            <div key={key} className="rounded-xl border border-border p-4">
              <p className="mb-3 flex flex-wrap items-center gap-2 text-sm font-medium text-text-primary">
                <Icon className="w-4 h-4 text-gold shrink-0" aria-hidden="true" />
                {label}
                {soon && <ComingSoon />}
              </p>
              <ul className="space-y-2 text-sm">
                {HOSTING_ROWS.map((row) => {
                  const included = row[key];
                  const note = noteFor(row, key);
                  return (
                    <li key={row.key} className="flex items-start gap-2">
                      <InclusionMark included={included} className="mt-0.5" />
                      <span className={included ? "text-text-secondary" : "text-text-muted"}>
                        {t(`rows.${row.key}.label`)}
                        {note && <span className="text-text-muted"> — {note}</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* ≥ 640px : tableau comparatif. */}
        <div className="hidden overflow-hidden rounded-xl border border-border sm:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-2">
              <tr>
                <th scope="col" className="p-3">
                  <span className="sr-only">{t("criterion")}</span>
                </th>
                {columns.map(({ key, label, Icon, soon }) => (
                  <th key={key} scope="col" className="p-3 align-middle">
                    <span className="flex flex-wrap items-center gap-2 font-medium text-text-primary">
                      <Icon className="w-4 h-4 text-gold shrink-0" aria-hidden="true" />
                      {label}
                      {soon && <ComingSoon />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOSTING_ROWS.map((row) => (
                <tr key={row.key} className="border-t border-border">
                  <th scope="row" className="p-3 font-normal text-text-secondary">
                    {t(`rows.${row.key}.label`)}
                  </th>
                  {columns.map(({ key }) => {
                    const included = row[key];
                    const note = noteFor(row, key);
                    return (
                      <td key={key} className="p-3 align-top">
                        <span className="flex items-start gap-2">
                          <InclusionMark included={included} className="mt-0.5" />
                          {note && (
                            <span className={included ? "text-text-secondary" : "text-text-muted"}>
                              {note}
                            </span>
                          )}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-text-muted italic">{t("upworkNote")}</p>
      </div>
    </div>
  );
}

interface LaunchOptionProps {
  enabled: boolean;
  onToggle: () => void;
  /** Parcours choisi : sur Upwork, la mise en ligne n'a pas de prix ("sur demande"). */
  route: OrderRoute;
}

export function LaunchOption({ enabled, onToggle, route }: LaunchOptionProps) {
  const t = useTranslations("Services.launch");
  const tServices = useTranslations("Services");

  return (
    <section
      id="launch-option"
      className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <AnimateIn>
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("titleLead")}
          titleHighlight={t("titleHighlight")}
          description={t("description")}
        />
      </AnimateIn>

      <AnimateIn>
        <label className="launch-toggle card-border rounded-2xl p-px mt-10 max-w-4xl mx-auto block cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={onToggle}
            aria-label={t("titleHighlight")}
            className="sr-only"
          />
          <div className="relative bg-surface rounded-2xl p-6 sm:p-8 grid gap-8 md:grid-cols-2">
            <CheckCircle2
              aria-hidden="true"
              className={cn(
                "absolute top-4 right-4 w-6 h-6",
                enabled ? "text-accent-accessible" : "text-text-muted",
              )}
            />
            <div className="flex flex-col">
              <Globe className="w-8 h-8 text-gold" />
              <p className="mt-4 text-sm font-medium text-text-muted">{t("priceLabel")}</p>
              {/* Parcours Upwork : pas d'annonce dédiée, donc pas de prix — jamais
                  le prix EUR recopié en dollars (lib/upwork.ts). */}
              {route === "direct" ? (
                <>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold gradient-text">{launchOption.price}</span>
                    <span className="text-sm text-text-muted">{ROUTE_CURRENCY_SYMBOL.direct}</span>
                  </div>
                  <p className="mt-2 text-xs text-text-muted">{t("priceNote")}</p>
                </>
              ) : (
                <p className="mt-1 text-2xl font-bold gradient-text">{tServices("onRequest")}</p>
              )}
            </div>

            <div className="flex flex-col">
              <ul className="space-y-2.5">
                {ITEM_KEYS.map((key) => (
                  <li key={key} className="flex items-start gap-2.5 text-sm text-text-secondary">
                    <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    <span>{t(`items.${key}`)}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-xs text-text-muted leading-relaxed italic">
                {t("exclusion")}
              </p>

              <div className="mt-6 space-y-3 text-xs text-text-muted leading-relaxed">
                <p>{t("ownership")}</p>
                <p>{t("externalFees")}</p>
                <p>{t("separation")}</p>
                <p className="flex flex-wrap items-center gap-2">
                  {t("edits", { price: editsSubscription.monthlyPrice })}
                  <ComingSoon />
                </p>
              </div>
            </div>
          </div>
        </label>
        <HostingComparison />
      </AnimateIn>
    </section>
  );
}
