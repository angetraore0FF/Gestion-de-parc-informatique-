import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Table, type Column } from "./Table";

interface Row {
  id: number;
  name: string;
}

const columns: Column<Row>[] = [{ header: "Nom", render: (r) => r.name }];

describe("Table", () => {
  it("affiche un message quand vide", () => {
    render(<Table columns={columns} rows={[]} />);
    expect(screen.getByText("Aucune donnée pour le moment.")).toBeInTheDocument();
  });

  it("affiche les lignes fournies", () => {
    render(<Table columns={columns} rows={[{ id: 1, name: "Client A" }]} />);
    expect(screen.getByText("Client A")).toBeInTheDocument();
  });

  it("déclenche onRowClick", async () => {
    const onRowClick = vi.fn();
    render(<Table columns={columns} rows={[{ id: 1, name: "Client A" }]} onRowClick={onRowClick} />);
    screen.getByText("Client A").click();
    expect(onRowClick).toHaveBeenCalledWith({ id: 1, name: "Client A" });
  });
});
