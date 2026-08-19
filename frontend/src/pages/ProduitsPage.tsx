import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { produitsApi } from "../api/endpoints";
import type { CreateProduitDto, ProduitDto } from "../api/types";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { FormField } from "../components/ui/FormField";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import { Table, type Column } from "../components/ui/Table";
import { EditIcon, PlusIcon, TrashIcon } from "../components/ui/Icons";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext";

const emptyForm: CreateProduitDto = { name: "", reference: "", prixUnitaire: 0, isActive: true };

export function ProduitsPage() {
  const { hasRole } = useAuth();
  const { t } = useI18n();
  const canManage = hasRole("Admin", "GestionnaireParc");
  const qc = useQueryClient();
  const { data: produits = [], isLoading } = useQuery({ queryKey: ["produits"], queryFn: produitsApi.getAll });

  const [editing, setEditing] = useState<ProduitDto | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateProduitDto>(emptyForm);

  const createMutation = useMutation({
    mutationFn: produitsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["produits"] });
      closeForm();
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: CreateProduitDto }) => produitsApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["produits"] });
      closeForm();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: produitsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["produits"] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };
  const openEdit = (p: ProduitDto) => {
    setEditing(p);
    setForm({ name: p.name, reference: p.reference, prixUnitaire: p.prixUnitaire, isActive: p.isActive });
    setShowForm(true);
  };
  const closeForm = () => setShowForm(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, dto: form });
    else createMutation.mutate(form);
  };

  const columns: Column<ProduitDto>[] = [
    { header: t("produits.col.name"), render: (p) => p.name },
    { header: t("produits.col.ref"), render: (p) => p.reference ?? t("common.none") },
    { header: t("produits.col.prix"), render: (p) => `${p.prixUnitaire.toFixed(2)} €` },
    {
      header: t("produits.col.statut"),
      render: (p) => <Badge color={p.isActive ? "green" : "slate"}>{p.isActive ? t("common.active") : t("common.inactive")}</Badge>,
    },
  ];

  return (
    <div className="space-y-6" data-testid="produits-page">
      <PageHeader title={t("produits.title")} subtitle={t("produits.subtitle")}>
        {canManage && (
          <Button onClick={openCreate} data-testid="new-produit-button">
            <PlusIcon /> {t("produits.new")}
          </Button>
        )}
      </PageHeader>

      <Table
        columns={columns}
        rows={produits}
        isLoading={isLoading}
        emptyMessage={t("produits.empty")}
        onRowClick={canManage ? openEdit : undefined}
        actions={
          canManage
            ? (p) => (
                <div className="flex justify-end gap-1.5">
                  <Button variant="ghost" onClick={() => openEdit(p)} aria-label={t("produits.edit")}>
                    <EditIcon />
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      if (confirm(t("common.confirmDelete", { name: p.name }))) deleteMutation.mutate(p.id);
                    }}
                  >
                    <TrashIcon /> {t("action.delete")}
                  </Button>
                </div>
              )
            : undefined
        }
      />

      {showForm && (
        <Modal title={editing ? t("produits.edit") : t("produits.new")} onClose={closeForm}>
          <form onSubmit={onSubmit} className="space-y-4" data-testid="produit-form">
            <FormField label={t("produits.f.name")}>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </FormField>
            <FormField label={t("produits.f.ref")}>
              <Input value={form.reference ?? ""} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
            </FormField>
            <FormField label={t("produits.f.prix")}>
              <Input
                type="number"
                step="0.01"
                value={form.prixUnitaire}
                onChange={(e) => setForm({ ...form, prixUnitaire: Number(e.target.value) })}
                required
              />
            </FormField>
            <label className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="h-4 w-4 accent-brand cursor-pointer"
              />
              {t("produits.f.active")}
            </label>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="secondary" onClick={closeForm}>
                {t("action.cancel")}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="produit-save-button">
                {t("action.save")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
