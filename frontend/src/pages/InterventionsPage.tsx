import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientsApi, equipementsApi, interventionsApi, produitsApi, techniciensApi } from "../api/endpoints";
import {
  StatutIntervention,
  StatutInterventionLabels,
  type CreateInterventionDto,
  type CreateInterventionMaterielDto,
  type InterventionDto,
} from "../api/types";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { FormField } from "../components/ui/FormField";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Select } from "../components/ui/Select";
import { Table, type Column } from "../components/ui/Table";
import { AlertIcon, CheckIcon, InvoiceIcon, PlusIcon, TrashIcon, WrenchIcon } from "../components/ui/Icons";
import { useAuth } from "../auth/AuthContext";

const emptyForm: CreateInterventionDto = {
  name: "",
  clientId: 0,
  equipementId: 0,
  dateIntervention: null,
  description: "",
  technicienId: null,
  statut: StatutIntervention.Nouveau,
  contactReferent: "",
  dateDebutPanne: null,
  descriptionResolution: "",
  intervenantResolution: "",
  materiels: [],
};

function statutBadge(statut: number) {
  if (statut === StatutIntervention.Termine) return <Badge color="green">{StatutInterventionLabels[statut]}</Badge>;
  if (statut === StatutIntervention.Annule) return <Badge color="red">{StatutInterventionLabels[statut]}</Badge>;
  if (statut === StatutIntervention.EnCours) return <Badge color="blue">{StatutInterventionLabels[statut]}</Badge>;
  return <Badge color="amber">{StatutInterventionLabels[statut]}</Badge>;
}

export function InterventionsPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole("Admin", "GestionnaireParc", "GestionnaireIntervention", "Technicien");
  const canManagers = hasRole("Admin", "GestionnaireParc");
  const qc = useQueryClient();
  const { data: interventions = [], isLoading } = useQuery({
    queryKey: ["interventions"],
    queryFn: () => interventionsApi.getAll(),
  });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: clientsApi.getAll });
  const { data: equipements = [] } = useQuery({ queryKey: ["equipements"], queryFn: () => equipementsApi.getAll() });
  const { data: techniciens = [] } = useQuery({
    queryKey: ["techniciens"],
    queryFn: techniciensApi.getAll,
    enabled: canManage,
  });
  const { data: produits = [] } = useQuery({ queryKey: ["produits"], queryFn: produitsApi.getAll, enabled: canManage });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<InterventionDto | null>(null);
  const [form, setForm] = useState<CreateInterventionDto>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: interventionsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["interventions"] });
      setFeedback("Panne enregistrée.");
      closeForm();
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: CreateInterventionDto }) =>
      interventionsApi.update(id, {
        name: dto.name,
        clientId: dto.clientId,
        equipementId: dto.equipementId,
        dateIntervention: dto.dateIntervention ?? new Date().toISOString(),
        description: dto.description,
        technicienId: dto.technicienId,
        statut: dto.statut,
        contactReferent: dto.contactReferent,
        dateDebutPanne: dto.dateDebutPanne,
        descriptionResolution: dto.descriptionResolution,
        intervenantResolution: dto.intervenantResolution,
      }),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["interventions"] });
      qc.invalidateQueries({ queryKey: ["equipements"] });
      setFeedback(
        updated?.statut === StatutIntervention.Termine
          ? "Panne marquée comme résolue."
          : "Intervention mise à jour."
      );
      closeForm();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: interventionsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["interventions"] }),
  });
  const genererFactureMutation = useMutation({
    mutationFn: interventionsApi.genererFacture,
    onSuccess: (facture) => {
      setFeedback(`Facture générée : ${facture.montantTotal.toFixed(2)} €`);
      qc.invalidateQueries({ queryKey: ["interventions"] });
    },
    onError: (e: any) => setFeedback(e?.response?.data?.message ?? "Erreur lors de la génération de la facture."),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, clientId: clients[0]?.id ?? 0 });
    setError(null);
    setShowForm(true);
  };

  // Ouvre la fiche existante. `forceResolution` bascule d'emblée sur le statut
  // "En cours" pour révéler le bloc Résolution depuis l'action "Résoudre".
  const openEdit = (i: InterventionDto, forceResolution = false) => {
    setEditing(i);
    setForm({
      name: i.name,
      clientId: i.clientId,
      equipementId: i.equipementId,
      dateIntervention: i.dateIntervention,
      description: i.description,
      technicienId: i.technicienId,
      statut:
        forceResolution && i.statut === StatutIntervention.Nouveau ? StatutIntervention.EnCours : i.statut,
      contactReferent: i.contactReferent,
      dateDebutPanne: i.dateDebutPanne ? i.dateDebutPanne.slice(0, 16) : null,
      descriptionResolution: i.descriptionResolution,
      intervenantResolution: i.intervenantResolution,
      materiels: [],
    });
    setError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const onError = (err: any) => setError(err?.response?.data?.message ?? "Erreur lors de l'enregistrement.");
    if (editing) updateMutation.mutate({ id: editing.id, dto: form }, { onError });
    else createMutation.mutate(form, { onError });
  };

  // Divulgation progressive : le bloc Résolution n'apparaît qu'une fois la panne
  // prise en charge — inutile de le montrer à la déclaration.
  const showResolution =
    canManage && (form.statut === StatutIntervention.EnCours || form.statut === StatutIntervention.Termine);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const addMateriel = () => {
    if (produits.length === 0) return;
    const materiel: CreateInterventionMaterielDto = { produitId: produits[0].id, quantite: 1, description: "" };
    setForm({ ...form, materiels: [...(form.materiels ?? []), materiel] });
  };
  const updateMateriel = (idx: number, patch: Partial<CreateInterventionMaterielDto>) => {
    const materiels = [...(form.materiels ?? [])];
    materiels[idx] = { ...materiels[idx], ...patch };
    setForm({ ...form, materiels });
  };
  const removeMateriel = (idx: number) => {
    setForm({ ...form, materiels: (form.materiels ?? []).filter((_, i) => i !== idx) });
  };

  const columns: Column<InterventionDto>[] = [
    { header: "Titre", render: (i) => i.name },
    { header: "Client", render: (i) => i.clientName },
    { header: "Équipement", render: (i) => i.equipementName },
    { header: "Technicien", render: (i) => i.technicienName ?? "-" },
    { header: "Date", render: (i) => new Date(i.dateIntervention).toLocaleDateString() },
    { header: "Statut", render: (i) => statutBadge(i.statut) },
    {
      header: "Résolution",
      render: (i) =>
        i.descriptionResolution ? (
          <span className="inline-flex items-center gap-1 text-slate-600">
            <CheckIcon className="w-3.5 h-3.5 text-[var(--color-status-good)]" />
            <span className="line-clamp-1 max-w-48">{i.descriptionResolution}</span>
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-lg font-semibold text-slate-800">Pannes &amp; interventions</h1>
        <Button onClick={openCreate}>
          <PlusIcon /> Déclarer une panne
        </Button>
      </div>

      {feedback && (
        <div
          role="status"
          className="flex items-center justify-between gap-2 text-sm text-slate-700 bg-teal-50 border border-teal-200 rounded-md px-3 py-2"
        >
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer" aria-label="Fermer">
            ×
          </button>
        </div>
      )}

      <Table
        columns={columns}
        rows={interventions}
        isLoading={isLoading}
        emptyMessage="Aucune panne déclarée pour le moment."
        onRowClick={(i) => openEdit(i)}
        actions={(i) => (
          <div className="flex justify-end gap-2">
            {canManage && i.statut !== StatutIntervention.Termine && (
              <Button variant="primary" onClick={() => openEdit(i, true)}>
                <WrenchIcon /> Résoudre
              </Button>
            )}
            {canManagers && !i.factureInterventionId && (
              <Button variant="secondary" onClick={() => genererFactureMutation.mutate(i.id)}>
                <InvoiceIcon /> Facturer
              </Button>
            )}
            {canManagers && (
              <Button
                variant="danger"
                onClick={() => {
                  if (confirm(`Supprimer ${i.name} ?`)) deleteMutation.mutate(i.id);
                }}
              >
                <TrashIcon /> Suppr.
              </Button>
            )}
          </div>
        )}
      />

      {showForm && (
        <Modal
          title={editing ? `Panne — ${editing.name}` : "Déclarer une panne"}
          onClose={closeForm}
        >
          <form onSubmit={onSubmit} className="space-y-5">
            <section className="space-y-3">
              <h3 className="font-heading text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Signalement
              </h3>
            <FormField label="Titre" hint="Résumez la panne en quelques mots">
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Ex. Écran noir au démarrage"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Client">
                <Select
                  value={form.clientId}
                  onChange={(e) => setForm({ ...form, clientId: Number(e.target.value) })}
                  required
                >
                  <option value={0} disabled>
                    Sélectionner
                  </option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Équipement">
                <Select
                  value={form.equipementId}
                  onChange={(e) => setForm({ ...form, equipementId: Number(e.target.value) })}
                  required
                >
                  <option value={0} disabled>
                    Sélectionner
                  </option>
                  {equipements
                    .filter((eq) => !form.clientId || eq.clientId === form.clientId)
                    .map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.name}
                      </option>
                    ))}
                </Select>
              </FormField>
            </div>
            <FormField label="Anomalie constatée">
              <Input
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ce que l'utilisateur observe"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Contact référent" hint="Personne à joindre sur site">
                <Input
                  value={form.contactReferent ?? ""}
                  onChange={(e) => setForm({ ...form, contactReferent: e.target.value })}
                />
              </FormField>
              <FormField label="Début de la panne">
                <Input
                  type="datetime-local"
                  value={form.dateDebutPanne ?? ""}
                  onChange={(e) => setForm({ ...form, dateDebutPanne: e.target.value || null })}
                />
              </FormField>
            </div>
            </section>

            {canManage && (
              <section className="space-y-3 border-t pt-4">
                <h3 className="font-heading text-sm font-semibold text-slate-500 uppercase tracking-wide">
                  Prise en charge
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Statut">
                    <Select
                      value={form.statut}
                      onChange={(e) => setForm({ ...form, statut: Number(e.target.value) })}
                    >
                      {Object.entries(StatutInterventionLabels).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                  <FormField label="Technicien">
                    <Select
                      value={form.technicienId ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, technicienId: e.target.value ? Number(e.target.value) : null })
                      }
                    >
                      <option value="">Non assigné</option>
                      {techniciens.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </div>
              </section>
            )}

            {showResolution && (
              <section className="space-y-3 border-t pt-4">
                <h3 className="font-heading text-sm font-semibold text-slate-500 uppercase tracking-wide">
                  Résolution
                </h3>
                <FormField
                  label="Actions effectuées"
                  hint="Décrivez ce qui a été fait pour rétablir le service"
                >
                  <Input
                    value={form.descriptionResolution ?? ""}
                    onChange={(e) => setForm({ ...form, descriptionResolution: e.target.value })}
                    required={form.statut === StatutIntervention.Termine}
                  />
                </FormField>
                <FormField label="Intervenant" hint="Personne ayant résolu la panne">
                  <Input
                    value={form.intervenantResolution ?? ""}
                    onChange={(e) => setForm({ ...form, intervenantResolution: e.target.value })}
                  />
                </FormField>
              </section>
            )}

            {canManage && !editing && (
              <fieldset className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <legend className="font-heading text-sm font-semibold text-slate-500 uppercase tracking-wide">
                    Matériel utilisé
                  </legend>
                  <Button type="button" variant="secondary" onClick={addMateriel}>
                    <PlusIcon /> Ajouter
                  </Button>
                </div>
                {(form.materiels ?? []).length === 0 && (
                  <p className="text-sm text-slate-400">
                    Aucun matériel. Ajoutez-en si des pièces sont consommées (nécessaire pour facturer).
                  </p>
                )}
                <div className="space-y-2">
                  {(form.materiels ?? []).map((m, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Select
                        value={m.produitId}
                        onChange={(e) => updateMateriel(idx, { produitId: Number(e.target.value) })}
                        className="flex-1"
                        aria-label={`Produit matériel ${idx + 1}`}
                      >
                        {produits.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </Select>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={m.quantite}
                        onChange={(e) => updateMateriel(idx, { quantite: Number(e.target.value) })}
                        className="w-20"
                        aria-label={`Quantité matériel ${idx + 1}`}
                      />
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => removeMateriel(idx)}
                        aria-label={`Retirer le matériel ${idx + 1}`}
                      >
                        <TrashIcon />
                      </Button>
                    </div>
                  ))}
                </div>
              </fieldset>
            )}

            {error && (
              <div role="alert" className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                <AlertIcon className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="secondary" onClick={closeForm}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving
                  ? "Enregistrement…"
                  : form.statut === StatutIntervention.Termine
                    ? "Marquer comme résolue"
                    : "Enregistrer"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
