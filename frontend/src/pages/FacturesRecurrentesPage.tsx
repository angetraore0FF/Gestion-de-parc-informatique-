import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { facturesRecurrentesApi } from "../api/endpoints";
import { StatutFacture, type FactureRecurrenteDto } from "../api/types";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { DownloadIcon } from "../components/ui/Icons";
import { downloadCsv } from "../lib/csv";
import { PageHeader } from "../components/ui/PageHeader";
import { Select } from "../components/ui/Select";
import { Table, type Column } from "../components/ui/Table";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext";

export function FacturesRecurrentesPage() {
  const { hasRole } = useAuth();
  const { t, el, elEntries } = useI18n();
  const canUpdateStatut = hasRole("Admin", "GestionnaireParc", "GestionnaireIntervention", "Technicien");
  const qc = useQueryClient();
  const { data: factures = [], isLoading } = useQuery({
    queryKey: ["factures-recurrentes"],
    queryFn: () => facturesRecurrentesApi.getAll(),
  });

  const updateStatutMutation = useMutation({
    mutationFn: ({ id, statut }: { id: number; statut: number }) => facturesRecurrentesApi.updateStatut(id, { statut }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["factures-recurrentes"] }),
  });

  const statutBadge = (statut: number) => {
    if (statut === StatutFacture.Payee) return <Badge color="green">{el("statutFacture", statut)}</Badge>;
    if (statut === StatutFacture.Envoyee) return <Badge color="blue">{el("statutFacture", statut)}</Badge>;
    return <Badge color="amber">{el("statutFacture", statut)}</Badge>;
  };

  const columns: Column<FactureRecurrenteDto>[] = [
    { header: t("factures.col.contrat"), render: (f) => f.contratName },
    { header: t("factures.col.client"), render: (f) => f.clientName },
    { header: t("factures.col.date"), render: (f) => f.dateFacture },
    { header: t("factures.col.montant"), render: (f) => `${f.montant.toFixed(2)} €` },
    {
      header: t("factures.col.statut"),
      render: (f) =>
        canUpdateStatut ? (
          <Select
            value={f.statut}
            onChange={(e) => updateStatutMutation.mutate({ id: f.id, statut: Number(e.target.value) })}
            className="w-40"
            aria-label={`${t("factures.col.statut")} — ${f.contratName}`}
          >
            {elEntries("statutFacture").map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        ) : (
          statutBadge(f.statut)
        ),
    },
  ];

  return (
    <div className="space-y-6" data-testid="factures-page">
      <PageHeader title={t("factures.title")} subtitle={t("factures.subtitle")}>
        <Button
          variant="secondary"
          data-testid="export-factures"
          onClick={() =>
            downloadCsv(
              "factures",
              [t("factures.col.contrat"), t("factures.col.client"), t("factures.col.date"), t("factures.col.montant"), t("factures.col.statut")],
              factures.map((f) => [f.contratName, f.clientName, f.dateFacture, f.montant.toFixed(2), el("statutFacture", f.statut)])
            )
          }
        >
          <DownloadIcon /> {t("action.exportCsv")}
        </Button>
      </PageHeader>
      <Table columns={columns} rows={factures} isLoading={isLoading} emptyMessage={t("factures.empty")} />
    </div>
  );
}
