import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { facturesRecurrentesApi } from "../api/endpoints";
import { StatutFacture, StatutFactureLabels, type FactureRecurrenteDto } from "../api/types";
import { Badge } from "../components/ui/Badge";
import { Select } from "../components/ui/Select";
import { Table, type Column } from "../components/ui/Table";
import { useAuth } from "../auth/AuthContext";

function statutBadge(statut: number) {
  if (statut === StatutFacture.Payee) return <Badge color="green">{StatutFactureLabels[statut]}</Badge>;
  if (statut === StatutFacture.Envoyee) return <Badge color="blue">{StatutFactureLabels[statut]}</Badge>;
  return <Badge color="amber">{StatutFactureLabels[statut]}</Badge>;
}

export function FacturesRecurrentesPage() {
  const { hasRole } = useAuth();
  const canUpdateStatut = hasRole("Admin", "GestionnaireParc", "GestionnaireIntervention", "Technicien");
  const qc = useQueryClient();
  const { data: factures = [], isLoading } = useQuery({
    queryKey: ["factures-recurrentes"],
    queryFn: () => facturesRecurrentesApi.getAll(),
  });

  const updateStatutMutation = useMutation({
    mutationFn: ({ id, statut }: { id: number; statut: number }) =>
      facturesRecurrentesApi.updateStatut(id, { statut }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["factures-recurrentes"] }),
  });

  const columns: Column<FactureRecurrenteDto>[] = [
    { header: "Contrat", render: (f) => f.contratName },
    { header: "Client", render: (f) => f.clientName },
    { header: "Date", render: (f) => f.dateFacture },
    { header: "Montant", render: (f) => `${f.montant.toFixed(2)} €` },
    {
      header: "Statut",
      render: (f) =>
        canUpdateStatut ? (
          <Select
            value={f.statut}
            onChange={(e) => updateStatutMutation.mutate({ id: f.id, statut: Number(e.target.value) })}
            className="w-32"
            aria-label={`Statut de la facture du contrat ${f.contratName}`}
          >
            {Object.entries(StatutFactureLabels).map(([v, l]) => (
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
    <div className="space-y-4">
      <h1 className="font-heading text-lg font-semibold text-slate-800">Factures récurrentes</h1>
      <Table columns={columns} rows={factures} isLoading={isLoading} emptyMessage="Aucune facture pour le moment." />
    </div>
  );
}
