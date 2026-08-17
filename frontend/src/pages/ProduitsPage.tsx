import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { produitsApi } from "../api/endpoints";
import type { CreateProduitDto, ProduitDto } from "../api/types";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { FormField } from "../components/ui/FormField";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Table, type Column } from "../components/ui/Table";
import { PlusIcon, TrashIcon } from "../components/ui/Icons";
import { useAuth } from "../auth/AuthContext";

const emptyForm: CreateProduitDto = { name: "", reference: "", prixUnitaire: 0, isActive: true };

export function ProduitsPage() {
  const { hasRole } = useAuth();
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
    { header: "Nom", render: (p) => p.name },
    { header: "Référence", render: (p) => p.reference ?? "-" },
    { header: "Prix unitaire", render: (p) => `${p.prixUnitaire.toFixed(2)} €` },
    { header: "Statut", render: (p) => <Badge color={p.isActive ? "green" : "slate"}>{p.isActive ? "Actif" : "Inactif"}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-lg font-semibold text-slate-800">Produits</h1>
        {canManage && (
          <Button onClick={openCreate}>
            <PlusIcon /> Nouveau produit
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        rows={produits}
        isLoading={isLoading}
        emptyMessage="Aucun produit pour le moment."
        onRowClick={canManage ? openEdit : undefined}
        actions={
          canManage
            ? (p) => (
                <Button
                  variant="danger"
                  onClick={() => {
                    if (confirm(`Supprimer ${p.name} ?`)) deleteMutation.mutate(p.id);
                  }}
                >
                  <TrashIcon /> Suppr.
                </Button>
              )
            : undefined
        }
      />

      {showForm && (
        <Modal title={editing ? "Modifier le produit" : "Nouveau produit"} onClose={closeForm}>
          <form onSubmit={onSubmit} className="space-y-3">
            <FormField label="Nom">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </FormField>
            <FormField label="Référence">
              <Input value={form.reference ?? ""} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
            </FormField>
            <FormField label="Prix unitaire (€)">
              <Input
                type="number"
                step="0.01"
                value={form.prixUnitaire}
                onChange={(e) => setForm({ ...form, prixUnitaire: Number(e.target.value) })}
                required
              />
            </FormField>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 accent-[var(--color-primary)] cursor-pointer"
              />
              Actif
            </label>
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
