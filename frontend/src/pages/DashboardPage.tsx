import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { clientsApi, contratsApi, equipementsApi, facturesRecurrentesApi, interventionsApi, produitsApi } from "../api/endpoints";
import { EtatEquipement, StatutContrat, StatutFacture, StatutIntervention } from "../api/types";
import { Badge } from "../components/ui/Badge";
import { PageHeader } from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";
import {
  AlertIcon,
  BoxIcon,
  ChevronRightIcon,
  ClockIcon,
  DesktopIcon,
  FileTextIcon,
  InvoiceIcon,
  ShieldIcon,
  UsersIcon,
  WrenchIcon,
} from "../components/ui/Icons";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext";

export function DashboardPage() {
  const { hasRole } = useAuth();
  const { t, el } = useI18n();
  const canSeeClients = hasRole("Admin", "GestionnaireParc", "GestionnaireIntervention", "Technicien");

  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: clientsApi.getAll, enabled: canSeeClients });
  const { data: equipements = [] } = useQuery({ queryKey: ["equipements"], queryFn: () => equipementsApi.getAll() });
  const { data: contrats = [] } = useQuery({ queryKey: ["contrats"], queryFn: () => contratsApi.getAll() });
  const { data: interventions = [] } = useQuery({ queryKey: ["interventions"], queryFn: () => interventionsApi.getAll() });
  const { data: factures = [] } = useQuery({ queryKey: ["factures-recurrentes"], queryFn: () => facturesRecurrentesApi.getAll() });
  const { data: produits = [] } = useQuery({ queryKey: ["produits"], queryFn: produitsApi.getAll, enabled: canSeeClients });

  const stats = useMemo(() => {
    const today = new Date();
    const dans30j = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return {
      clients: clients.length,
      equipements: equipements.length,
      enPanne: equipements.filter((e) => e.etat === EtatEquipement.EnPanne).length,
      garantie: equipements.filter((e) => e.garantieFin && new Date(e.garantieFin) >= today && new Date(e.garantieFin) <= dans30j).length,
      contrats: contrats.filter((c) => c.statut === StatutContrat.Actif).length,
      interventions: interventions.filter((i) => i.statut !== StatutIntervention.Termine && i.statut !== StatutIntervention.Annule).length,
      impayees: factures.filter((f) => f.statut !== StatutFacture.Payee).length,
      produits: produits.length,
    };
  }, [clients, equipements, contrats, interventions, factures, produits]);

  const recentInterventions = useMemo(
    () => [...interventions].sort((a, b) => +new Date(b.dateIntervention) - +new Date(a.dateIntervention)).slice(0, 6),
    [interventions]
  );

  const garantieAlertes = useMemo(() => {
    const today = new Date();
    const dans30j = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return equipements
      .filter((e) => e.garantieFin && new Date(e.garantieFin) >= today && new Date(e.garantieFin) <= dans30j)
      .sort((a, b) => +new Date(a.garantieFin!) - +new Date(b.garantieFin!))
      .slice(0, 6);
  }, [equipements]);

  const facturesBreakdown = useMemo(() => {
    return [StatutFacture.Brouillon, StatutFacture.Envoyee, StatutFacture.Payee].map((s) => ({
      statut: s,
      count: factures.filter((f) => f.statut === s).length,
    }));
  }, [factures]);

  const interventionBadge = (statut: number) => {
    if (statut === StatutIntervention.Termine) return <Badge color="green">{el("statutIntervention", statut)}</Badge>;
    if (statut === StatutIntervention.Annule) return <Badge color="red">{el("statutIntervention", statut)}</Badge>;
    if (statut === StatutIntervention.EnCours) return <Badge color="blue">{el("statutIntervention", statut)}</Badge>;
    return <Badge color="amber">{el("statutIntervention", statut)}</Badge>;
  };

  const kpis: Array<{ to: string; label: string; value: number; icon: React.ReactNode; status?: any }> = [
    { to: "/equipements", label: t("dashboard.kpi.equipements"), value: stats.equipements, icon: <DesktopIcon className="h-5 w-5" /> },
    { to: "/equipements", label: t("dashboard.kpi.enPanne"), value: stats.enPanne, icon: <AlertIcon className="h-5 w-5" />, status: "critical" },
    { to: "/interventions", label: t("dashboard.kpi.interventions"), value: stats.interventions, icon: <WrenchIcon className="h-5 w-5" />, status: "serious" },
    { to: "/equipements", label: t("dashboard.kpi.garantie"), value: stats.garantie, icon: <ShieldIcon className="h-5 w-5" />, status: "warning" },
    { to: "/contrats", label: t("dashboard.kpi.contrats"), value: stats.contrats, icon: <FileTextIcon className="h-5 w-5" />, status: "good" },
    { to: "/factures-recurrentes", label: t("dashboard.kpi.impayees"), value: stats.impayees, icon: <InvoiceIcon className="h-5 w-5" />, status: "warning" },
    { to: "/clients", label: t("dashboard.kpi.clients"), value: stats.clients, icon: <UsersIcon className="h-5 w-5" /> },
    { to: "/produits", label: t("dashboard.kpi.produits"), value: stats.produits, icon: <BoxIcon className="h-5 w-5" /> },
  ];

  const panelClass = "rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900";
  const panelTitle = "font-heading text-sm font-bold text-slate-800 dark:text-slate-100";
  const linkClass = "inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline dark:text-lime";

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <PageHeader title={t("dashboard.title")} subtitle={t("dashboard.subtitle")} />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <Link key={i} to={k.to} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-2xl" data-testid={`kpi-${i}`}>
            <StatCard label={k.label} value={k.value} icon={k.icon} status={k.status} />
          </Link>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className={`${panelClass} lg:col-span-2`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className={panelTitle}>{t("dashboard.recentInterventions")}</h2>
            <Link to="/interventions" className={linkClass}>
              {t("action.search")} <ChevronRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentInterventions.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">{t("dashboard.emptyInterventions")}</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentInterventions.map((i) => (
                <li key={i.id} className="flex items-center gap-3 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand dark:bg-slate-800 dark:text-lime">
                    <WrenchIcon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{i.name}</div>
                    <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {i.clientName} · {i.equipementName}
                    </div>
                  </div>
                  <div className="hidden text-xs text-slate-400 sm:block dark:text-slate-500">
                    {new Date(i.dateIntervention).toLocaleDateString()}
                  </div>
                  {interventionBadge(i.statut)}
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className={panelClass}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className={panelTitle}>{t("dashboard.garantieAlertes")}</h2>
              <ShieldIcon className="h-4 w-4 text-amber-500" />
            </div>
            {garantieAlertes.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">{t("dashboard.emptyGaranties")}</p>
            ) : (
              <ul className="space-y-3">
                {garantieAlertes.map((e) => (
                  <li key={e.id} className="flex items-center gap-2 text-sm">
                    <ClockIcon className="h-4 w-4 shrink-0 text-amber-500" />
                    <span className="min-w-0 flex-1 truncate text-slate-700 dark:text-slate-200">{e.name}</span>
                    <span className="shrink-0 text-xs font-medium text-amber-600 dark:text-amber-400">{e.garantieFin}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={panelClass}>
            <h2 className={`${panelTitle} mb-4`}>{t("dashboard.facturesStatut")}</h2>
            <ul className="space-y-3">
              {facturesBreakdown.map(({ statut, count }) => {
                const total = factures.length || 1;
                const pct = Math.round((count / total) * 100);
                const color = statut === StatutFacture.Payee ? "#16a34a" : statut === StatutFacture.Envoyee ? "#0284c7" : "#f59e0b";
                return (
                  <li key={statut}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600 dark:text-slate-300">{el("statutFacture", statut)}</span>
                      <span className="text-slate-400 dark:text-slate-500">{count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
