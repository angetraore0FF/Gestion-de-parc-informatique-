import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("affiche le contenu", () => {
    render(<Badge color="green">Actif</Badge>);
    expect(screen.getByText("Actif")).toBeInTheDocument();
  });
});
