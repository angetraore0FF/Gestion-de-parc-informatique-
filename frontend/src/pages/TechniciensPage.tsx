import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { techniciensApi } from "../api/endpoints";
import type { CreateTechnicienDto, TechnicienDto } from "../api/types";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { FormField } from "../components/ui/FormField";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Table, type Column } from "../components/ui/Table";
import { PlusIcon, TrashIcon } from "../components/ui/Icons";
import { useAuth } from "../auth/AuthContext";

const emptyForm: CreateTechnicienDto = { name: "", email: "", phone: "", isActive: true };

export function TechniciensPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole("Admin", "GestionnaireParc");
  const qc = useQueryClient();
  const { data: techniciens = [], isLoading } = useQuery({ queryKey: ["techniciens"], queryFn: techniciensApi.getAll });

  const [editing, setEditing] = useState<TechnicienDto | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateTechnicienDto>(emptyForm);

  const createMutation = useMutation({
    mutationFn: techniciensApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["techniciens"] });
      closeForm();
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: CreateTechnicienDto }) => techniciensApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["techniciens"] });
      closeForm();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: techniciensApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["techniciens"] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };
  const openEdit = (t: TechnicienDto) => {
    setEditing(t);
    setForm({ name: t.name, email: t.email, phone: t.phone, isActive: t.isActive });
    setShowForm(true);
  };
  const closeForm = () => setShowForm(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, dto: form });
    else createMutation.mutate(form);
  };

  const columns: Column<TechnicienDto>[] = [
    { header: "Nom", render: (t) => t.name },
    { header: "Email", render: (t) => t.email ?? "-" },
    { header: "Téléphone", render: (t) => t.phone ?? "-" },
    { header: "Statut", render: (t) => <Badge color={t.isActive ? "green" : "slate"}>{t.isActive ? "Actif" : "Inactif"}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-lg font-semibold text-slate-800">Techniciens</h1>
        {canManage && (
          <Button onClick={openCreate}>
            <PlusIcon /> Nouveau technicien
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        rows={techniciens}
        isLoading={isLoading}
        emptyMessage="Aucun technicien pour le moment."
        onRowClick={canManage ? openEdit : undefined}
        actions={
          canManage
            ? (t) => (
                <Button
                  variant="danger"
                  onClick={() => {
                    if (confirm(`Supprimer ${t.name} ?`)) deleteMutation.mutate(t.id);
                  }}
                >
                  <TrashIcon /> Suppr.
                </Button>
              )
            : undefined
        }
      />

      {showForm && (
        <Modal title={editing ? "Modifier le technicien" : "Nouveau technicien"} onClose={closeForm}>
          <form onSubmit={onSubmit} className="space-y-3">
            <FormField label="Nom">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </FormField>
            <FormField label="Email">
              <Input
                type="email"
                value={form.email ?? ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </FormField>
            <FormField label="Téléphone">
              <Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
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
