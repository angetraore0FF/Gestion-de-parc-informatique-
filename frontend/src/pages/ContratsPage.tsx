import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientsApi, contratsApi, equipementsApi } from "../api/endpoints";
import {
  RecurrenceContrat,
  RecurrenceContratLabels,
  StatutContrat,
  StatutContratLabels,
  type ContratDto,
  type CreateContratDto,
} from "../api/types";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { FormField } from "../components/ui/FormField";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Select } from "../components/ui/Select";
import { Table, type Column } from "../components/ui/Table";
import { DownloadIcon, PlusIcon, TrashIcon } from "../components/ui/Icons";
import { useAuth } from "../auth/AuthContext";

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm: CreateContratDto = {
  clientId: 0,
  dateDebut: today(),
  dateFin: today(),
  statut: StatutContrat.Brouillon,
  montant: 0,
  recurrence: RecurrenceContrat.Mois,
  prochaineFacture: today(),
  equipementIds: [],
};

function statutBadge(statut: number) {
  if (statut === StatutContrat.Actif) return <Badge color="green">{StatutContratLabels[statut]}</Badge>;
  if (statut === StatutContrat.Termine) return <Badge color="slate">{StatutContratLabels[statut]}</Badge>;
  return <Badge color="amber">{StatutContratLabels[statut]}</Badge>;
}

export function ContratsPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole("Admin", "GestionnaireParc");
  const qc = useQueryClient();
  const { data: contrats = [], isLoading } = useQuery({ queryKey: ["contrats"], queryFn: () => contratsApi.getAll() });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: clientsApi.getAll, enabled: canManage });
  const { data: equipements = [] } = useQuery({
    queryKey: ["equipements"],
    queryFn: () => equipementsApi.getAll(),
    enabled: canManage,
  });

  const [editing, setEditing] = useState<ContratDto | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateContratDto>(emptyForm);

  const createMutation = useMutation({
    mutationFn: contratsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contrats"] });
      closeForm();
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: CreateContratDto }) =>
      contratsApi.update(id, { ...dto, prochaineFacture: dto.prochaineFacture ?? today() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contrats"] });
      closeForm();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: contratsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contrats"] }),
  });
  const genererFacturesMutation = useMutation({
    mutationFn: contratsApi.genererFactures,
    onSuccess: (r) => {
      alert(`${r.facturesGenerees} facture(s) générée(s).`);
      qc.invalidateQueries({ queryKey: ["contrats"] });
      qc.invalidateQueries({ queryKey: ["factures-recurrentes"] });
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, clientId: clients[0]?.id ?? 0 });
    setShowForm(true);
  };
  const openEdit = (contrat: ContratDto) => {
    setEditing(contrat);
    setForm({
      clientId: contrat.clientId,
      dateDebut: contrat.dateDebut,
      dateFin: contrat.dateFin,
      statut: contrat.statut,
      montant: contrat.montant,
      recurrence: contrat.recurrence,
      prochaineFacture: contrat.prochaineFacture,
      equipementIds: contrat.equipementIds,
    });
    setShowForm(true);
  };
  const closeForm = () => setShowForm(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, dto: form });
    else createMutation.mutate(form);
  };

  const toggleEquipement = (id: number) => {
    const ids = form.equipementIds ?? [];
    setForm({
      ...form,
      equipementIds: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    });
  };

  const columns: Column<ContratDto>[] = [
    { header: "Référence", render: (c) => c.name },
    { header: "Client", render: (c) => c.clientName },
    { header: "Période", render: (c) => `${c.dateDebut} → ${c.dateFin}` },
    { header: "Statut", render: (c) => statutBadge(c.statut) },
    { header: "Montant", render: (c) => `${c.montant.toFixed(2)} €` },
    { header: "Récurrence", render: (c) => RecurrenceContratLabels[c.recurrence] },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-lg font-semibold text-slate-800">Contrats</h1>
        <div className="flex gap-2">
          {canManage && (
            <Button variant="secondary" onClick={() => genererFacturesMutation.mutate()}>
              Générer factures récurrentes
            </Button>
          )}
          {canManage && (
            <Button onClick={openCreate}>
              <PlusIcon /> Nouveau contrat
            </Button>
          )}
        </div>
      </div>

      <Table
        columns={columns}
        rows={contrats}
        isLoading={isLoading}
        emptyMessage="Aucun contrat pour le moment."
        onRowClick={canManage ? openEdit : undefined}
        actions={(c) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                fetch(contratsApi.pdfUrl(c.id), {
                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                })
                  .then((r) => r.blob())
                  .then((blob) => window.open(URL.createObjectURL(blob), "_blank"));
              }}
              aria-label={`Télécharger le PDF du contrat ${c.name}`}
            >
              <DownloadIcon /> PDF
            </Button>
            {canManage && (
              <Button
                variant="danger"
                onClick={() => {
                  if (confirm(`Supprimer ${c.name} ?`)) deleteMutation.mutate(c.id);
                }}
              >
                <TrashIcon /> Suppr.
              </Button>
            )}
          </div>
        )}
      />

      {showForm && (
        <Modal title={editing ? "Modifier le contrat" : "Nouveau contrat"} onClose={closeForm}>
          <form onSubmit={onSubmit} className="space-y-3">
            <FormField label="Client">
              <Select
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: Number(e.target.value) })}
                required
              >
                <option value={0} disabled>
                  Sélectionner un client
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Date de début">
                <Input
                  type="date"
                  value={form.dateDebut}
                  onChange={(e) => setForm({ ...form, dateDebut: e.target.value })}
                  required
                />
              </FormField>
              <FormField label="Date de fin">
                <Input
                  type="date"
                  value={form.dateFin}
                  onChange={(e) => setForm({ ...form, dateFin: e.target.value })}
                  required
                />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Statut">
                <Select value={form.statut} onChange={(e) => setForm({ ...form, statut: Number(e.target.value) })}>
                  {Object.entries(StatutContratLabels).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Récurrence">
                <Select
                  value={form.recurrence}
                  onChange={(e) => setForm({ ...form, recurrence: Number(e.target.value) })}
                >
                  {Object.entries(RecurrenceContratLabels).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Montant (€)">
                <Input
                  type="number"
                  step="0.01"
                  value={form.montant}
                  onChange={(e) => setForm({ ...form, montant: Number(e.target.value) })}
                  required
                />
              </FormField>
              <FormField label="Prochaine facture">
                <Input
                  type="date"
                  value={form.prochaineFacture ?? ""}
                  onChange={(e) => setForm({ ...form, prochaineFacture: e.target.value })}
                />
              </FormField>
            </div>
            <fieldset className="border rounded-md p-2">
              <legend className="text-sm font-medium text-slate-700 px-1">Équipements couverts</legend>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {equipements.map((eq) => (
                  <label key={eq.id} className="flex items-center gap-2 text-sm py-0.5">
                    <input
                      type="checkbox"
                      checked={form.equipementIds?.includes(eq.id) ?? false}
                      onChange={() => toggleEquipement(eq.id)}
                      className="w-4 h-4 accent-[var(--color-primary)] cursor-pointer"
                    />
                    {eq.name}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={closeForm}>
                Annuler
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                Enregistrer
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
