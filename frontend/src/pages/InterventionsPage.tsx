import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientsApi, equipementsApi, interventionsApi, produitsApi, techniciensApi } from "../api/endpoints";
import { StatutIntervention, type CreateInterventionDto, type CreateInterventionMaterielDto, type InterventionDto } from "../api/types";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { FormField } from "../components/ui/FormField";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import { Select } from "../components/ui/Select";
import { Table, type Column } from "../components/ui/Table";
import { AlertIcon, CheckIcon, InvoiceIcon, PlusIcon, PrinterIcon, TrashIcon, WrenchIcon } from "../components/ui/Icons";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { usePrint } from "../components/ui/PrintReport";

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

export function InterventionsPage() {
  const { hasRole } = useAuth();
  const { t, el, elEntries } = useI18n();
  const { printReport } = usePrint();
  const canManage = hasRole("Admin", "GestionnaireParc", "GestionnaireIntervention", "Technicien");
  const canManagers = hasRole("Admin", "GestionnaireParc");
  const qc = useQueryClient();
  const { data: interventions = [], isLoading } = useQuery({ queryKey: ["interventions"], queryFn: () => interventionsApi.getAll() });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: clientsApi.getAll });
  const { data: equipements = [] } = useQuery({ queryKey: ["equipements"], queryFn: () => equipementsApi.getAll() });
  const { data: techniciens = [] } = useQuery({ queryKey: ["techniciens"], queryFn: techniciensApi.getAll, enabled: canManage });
  const { data: produits = [] } = useQuery({ queryKey: ["produits"], queryFn: produitsApi.getAll, enabled: canManage });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<InterventionDto | null>(null);
  const [form, setForm] = useState<CreateInterventionDto>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const statutBadge = (statut: number) => {
    if (statut === StatutIntervention.Termine) return <Badge color="green">{el("statutIntervention", statut)}</Badge>;
    if (statut === StatutIntervention.Annule) return <Badge color="red">{el("statutIntervention", statut)}</Badge>;
    if (statut === StatutIntervention.EnCours) return <Badge color="blue">{el("statutIntervention", statut)}</Badge>;
    return <Badge color="amber">{el("statutIntervention", statut)}</Badge>;
  };

  const createMutation = useMutation({
    mutationFn: interventionsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["interventions"] });
      setFeedback(t("interventions.fb.created"));
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
      setFeedback(updated?.statut === StatutIntervention.Termine ? t("interventions.fb.resolved") : t("interventions.fb.updated"));
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
      setFeedback(t("interventions.fb.invoice", { amount: `${facture.montantTotal.toFixed(2)} €` }));
      qc.invalidateQueries({ queryKey: ["interventions"] });
    },
    onError: (e: any) => setFeedback(e?.response?.data?.message ?? t("interventions.fb.invoiceError")),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, clientId: clients[0]?.id ?? 0 });
    setError(null);
    setShowForm(true);
  };

  const openEdit = (i: InterventionDto, forceResolution = false) => {
    setEditing(i);
    setForm({
      name: i.name,
      clientId: i.clientId,
      equipementId: i.equipementId,
      dateIntervention: i.dateIntervention,
      description: i.description,
      technicienId: i.technicienId,
      statut: forceResolution && i.statut === StatutIntervention.Nouveau ? StatutIntervention.EnCours : i.statut,
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
    const onError = (err: any) => setError(err?.response?.data?.message ?? t("equipements.error"));
    if (editing) updateMutation.mutate({ id: editing.id, dto: form }, { onError });
    else createMutation.mutate(form, { onError });
  };

  const showResolution = canManage && (form.statut === StatutIntervention.EnCours || form.statut === StatutIntervention.Termine);
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
    { header: t("interventions.col.titre"), render: (i) => i.name },
    { header: t("interventions.col.client"), render: (i) => i.clientName },
    { header: t("interventions.col.equipement"), render: (i) => i.equipementName },
    { header: t("interventions.col.technicien"), render: (i) => i.technicienName ?? t("common.none") },
    { header: t("interventions.col.date"), render: (i) => new Date(i.dateIntervention).toLocaleDateString() },
    { header: t("interventions.col.statut"), render: (i) => statutBadge(i.statut) },
    {
      header: t("interventions.col.resolution"),
      render: (i) =>
        i.descriptionResolution ? (
          <span className="inline-flex items-center gap-1 text-slate-600">
            <CheckIcon className="h-3.5 w-3.5 text-[var(--color-status-good)]" />
            <span className="line-clamp-1 max-w-48">{i.descriptionResolution}</span>
          </span>
        ) : (
          <span className="text-slate-400">{t("common.none")}</span>
        ),
    },
  ];

  const sectionTitle = (label: string) => (
    <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-brand dark:text-lime">{label}</h3>
  );

  const printIntervention = (i: InterventionDto) => {
    printReport({
      title: t("report.panneTitle"),
      reference: i.name,
      meta: [
        { label: t("interventions.col.client"), value: i.clientName },
        { label: t("interventions.col.equipement"), value: i.equipementName },
        { label: t("interventions.col.date"), value: new Date(i.dateIntervention).toLocaleDateString() },
        { label: t("interventions.col.statut"), value: el("statutIntervention", i.statut) },
      ],
      sections: [
        {
          heading: t("interventions.sec.signalement"),
          fields: [
            { label: t("interventions.f.anomalie"), value: i.description ?? "" },
            { label: t("interventions.f.contact"), value: i.contactReferent ?? "" },
            { label: t("interventions.f.debut"), value: i.dateDebutPanne ? new Date(i.dateDebutPanne).toLocaleString() : "" },
          ],
        },
        {
          heading: t("interventions.sec.priseEnCharge"),
          fields: [{ label: t("interventions.f.technicien"), value: i.technicienName ?? "" }],
        },
        {
          heading: t("interventions.sec.resolution"),
          fields: [
            { label: t("interventions.f.actions"), value: i.descriptionResolution ?? "" },
            { label: t("interventions.f.intervenant"), value: i.intervenantResolution ?? "" },
          ],
        },
        {
          heading: t("interventions.sec.materiel"),
          items: (i.materiels ?? []).map((m) => `${m.produitName} × ${m.quantite} — ${m.montantTotal.toFixed(2)} €`),
        },
      ],
    });
  };

  return (
    <div className="space-y-6" data-testid="interventions-page">
      <PageHeader title={t("interventions.title")} subtitle={t("interventions.subtitle")}>
        <Button onClick={openCreate} data-testid="declare-panne-button">
          <PlusIcon /> {t("interventions.declare")}
        </Button>
      </PageHeader>

      {feedback && (
        <div
          role="status"
          className="flex items-center justify-between gap-2 rounded-lg border border-lime/40 bg-lime-light px-3 py-2.5 text-sm text-brand-darker dark:border-lime/30 dark:bg-lime/10 dark:text-lime"
        >
          <span className="font-medium">{feedback}</span>
          <button onClick={() => setFeedback(null)} className="cursor-pointer text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white" aria-label={t("action.close")}>
            ×
          </button>
        </div>
      )}

      <Table
        columns={columns}
        rows={interventions}
        isLoading={isLoading}
        emptyMessage={t("interventions.empty")}
        onRowClick={(i) => openEdit(i)}
        actions={(i) => (
          <div className="flex justify-end gap-1.5">
            <Button variant="ghost" onClick={() => printIntervention(i)} aria-label={`${t("report.print")} — ${i.name}`}>
              <PrinterIcon />
            </Button>
            {canManage && i.statut !== StatutIntervention.Termine && (
              <Button variant="primary" onClick={() => openEdit(i, true)}>
                <WrenchIcon /> {t("interventions.resolve")}
              </Button>
            )}
            {canManagers && !i.factureInterventionId && (
              <Button variant="secondary" onClick={() => genererFactureMutation.mutate(i.id)}>
                <InvoiceIcon /> {t("interventions.facturer")}
              </Button>
            )}
            {canManagers && (
              <Button
                variant="danger"
                onClick={() => {
                  if (confirm(t("common.confirmDelete", { name: i.name }))) deleteMutation.mutate(i.id);
                }}
              >
                <TrashIcon />
              </Button>
            )}
          </div>
        )}
      />

      {showForm && (
        <Modal title={editing ? t("interventions.panneTitle", { name: editing.name }) : t("interventions.declare")} onClose={closeForm}>
          <form onSubmit={onSubmit} className="space-y-5" data-testid="intervention-form">
            <section className="space-y-3">
              {sectionTitle(t("interventions.sec.signalement"))}
              <FormField label={t("interventions.f.titre")} hint={t("interventions.f.titreHint")}>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder={t("interventions.f.titrePlaceholder")} />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label={t("interventions.f.client")}>
                  <Select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: Number(e.target.value) })} required>
                    <option value={0} disabled>
                      {t("interventions.f.select")}
                    </option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField label={t("interventions.f.equipement")}>
                  <Select value={form.equipementId} onChange={(e) => setForm({ ...form, equipementId: Number(e.target.value) })} required>
                    <option value={0} disabled>
                      {t("interventions.f.select")}
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
              <FormField label={t("interventions.f.anomalie")}>
                <Input value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t("interventions.f.anomaliePlaceholder")} />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label={t("interventions.f.contact")} hint={t("interventions.f.contactHint")}>
                  <Input value={form.contactReferent ?? ""} onChange={(e) => setForm({ ...form, contactReferent: e.target.value })} />
                </FormField>
                <FormField label={t("interventions.f.debut")}>
                  <Input type="datetime-local" value={form.dateDebutPanne ?? ""} onChange={(e) => setForm({ ...form, dateDebutPanne: e.target.value || null })} />
                </FormField>
              </div>
            </section>

            {canManage && (
              <section className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                {sectionTitle(t("interventions.sec.priseEnCharge"))}
                <div className="grid grid-cols-2 gap-3">
                  <FormField label={t("interventions.f.statut")}>
                    <Select value={form.statut} onChange={(e) => setForm({ ...form, statut: Number(e.target.value) })}>
                      {elEntries("statutIntervention").map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                  <FormField label={t("interventions.f.technicien")}>
                    <Select value={form.technicienId ?? ""} onChange={(e) => setForm({ ...form, technicienId: e.target.value ? Number(e.target.value) : null })}>
                      <option value="">{t("interventions.f.nonAssigne")}</option>
                      {techniciens.map((tc) => (
                        <option key={tc.id} value={tc.id}>
                          {tc.name}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </div>
              </section>
            )}

            {showResolution && (
              <section className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                {sectionTitle(t("interventions.sec.resolution"))}
                <FormField label={t("interventions.f.actions")} hint={t("interventions.f.actionsHint")}>
                  <Input
                    value={form.descriptionResolution ?? ""}
                    onChange={(e) => setForm({ ...form, descriptionResolution: e.target.value })}
                    required={form.statut === StatutIntervention.Termine}
                  />
                </FormField>
                <FormField label={t("interventions.f.intervenant")} hint={t("interventions.f.intervenantHint")}>
                  <Input value={form.intervenantResolution ?? ""} onChange={(e) => setForm({ ...form, intervenantResolution: e.target.value })} />
                </FormField>
              </section>
            )}

            {canManage && !editing && (
              <fieldset className="border-t border-slate-100 pt-4 dark:border-slate-800">
                <div className="mb-2 flex items-center justify-between">
                  <legend>{sectionTitle(t("interventions.sec.materiel"))}</legend>
                  <Button type="button" variant="secondary" onClick={addMateriel}>
                    <PlusIcon /> {t("action.add")}
                  </Button>
                </div>
                {(form.materiels ?? []).length === 0 && <p className="text-sm text-slate-400">{t("interventions.noMateriel")}</p>}
                <div className="space-y-2">
                  {(form.materiels ?? []).map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Select value={m.produitId} onChange={(e) => updateMateriel(idx, { produitId: Number(e.target.value) })} className="flex-1" aria-label={`materiel ${idx + 1}`}>
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
                        aria-label={`quantite ${idx + 1}`}
                      />
                      <Button type="button" variant="danger" onClick={() => removeMateriel(idx)} aria-label={`remove ${idx + 1}`}>
                        <TrashIcon />
                      </Button>
                    </div>
                  ))}
                </div>
              </fieldset>
            )}

            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <Button type="button" variant="secondary" onClick={closeForm}>
                {t("action.cancel")}
              </Button>
              <Button type="submit" disabled={isSaving} data-testid="intervention-save-button">
                {isSaving ? t("interventions.saving") : form.statut === StatutIntervention.Termine ? t("interventions.markResolved") : t("action.save")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
