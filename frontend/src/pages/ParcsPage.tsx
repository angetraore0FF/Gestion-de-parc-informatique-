import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientsApi, parcsApi } from "../api/endpoints";
import type { CreateParcDto, ParcDto } from "../api/types";
import { Button } from "../components/ui/Button";
import { FormField } from "../components/ui/FormField";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Select } from "../components/ui/Select";
import { Table, type Column } from "../components/ui/Table";
import { PlusIcon, TrashIcon } from "../components/ui/Icons";
import { useAuth } from "../auth/AuthContext";

export function ParcsPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole("Admin", "GestionnaireParc");
  const qc = useQueryClient();
  const { data: parcs = [], isLoading } = useQuery({ queryKey: ["parcs"], queryFn: () => parcsApi.getAll() });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: clientsApi.getAll, enabled: canManage });

  const [editing, setEditing] = useState<ParcDto | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateParcDto>({ name: "", description: "", clientId: 0 });

  const createMutation = useMutation({
    mutationFn: parcsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["parcs"] });
      closeForm();
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: CreateParcDto }) => parcsApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["parcs"] });
      closeForm();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: parcsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["parcs"] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", clientId: clients[0]?.id ?? 0 });
    setShowForm(true);
  };
  const openEdit = (parc: ParcDto) => {
    setEditing(parc);
    setForm({ name: parc.name, description: parc.description, clientId: parc.clientId });
    setShowForm(true);
  };
  const closeForm = () => setShowForm(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, dto: form });
    else createMutation.mutate(form);
  };

  const columns: Column<ParcDto>[] = [
    { header: "Nom", render: (p) => p.name },
    { header: "Client", render: (p) => p.clientName },
    { header: "Description", render: (p) => p.description ?? "-" },
    { header: "Équipements", render: (p) => p.equipementCount },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-lg font-semibold text-slate-800">Parcs</h1>
        {canManage && (
          <Button onClick={openCreate}>
            <PlusIcon /> Nouveau parc
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        rows={parcs}
        isLoading={isLoading}
        emptyMessage="Aucun parc pour le moment."
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
        <Modal title={editing ? "Modifier le parc" : "Nouveau parc"} onClose={closeForm}>
          <form onSubmit={onSubmit} className="space-y-3">
            <FormField label="Nom">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </FormField>
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
            <FormField label="Description">
              <Input
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </FormField>
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
