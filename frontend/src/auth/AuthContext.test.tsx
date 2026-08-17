import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import { authApi } from "../api/endpoints";

vi.mock("../api/endpoints", () => ({
  authApi: { login: vi.fn(), register: vi.fn() },
}));

function Probe() {
  const { auth, hasRole, isClientOnly } = useAuth();
  return (
    <div>
      <span data-testid="email">{auth?.email ?? "anonyme"}</span>
      <span data-testid="staff">{hasRole("Admin") ? "oui" : "non"}</span>
      <span data-testid="client-only">{isClientOnly ? "oui" : "non"}</span>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("demarre anonyme sans token stocke", () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    expect(screen.getByTestId("email").textContent).toBe("anonyme");
  });

  it("expose les roles apres login", async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      token: "abc",
      expiresAtUtc: new Date().toISOString(),
      email: "client1@demo-it.fr",
      roles: ["Client"],
      clientId: 1,
      technicienId: null,
    });

    let ctx: ReturnType<typeof useAuth> | undefined;
    function Capture() {
      ctx = useAuth();
      return <Probe />;
    }

    render(
      <AuthProvider>
        <Capture />
      </AuthProvider>
    );

    await act(async () => {
      await ctx!.login({ email: "client1@demo-it.fr", password: "x" });
    });

    expect(screen.getByTestId("email").textContent).toBe("client1@demo-it.fr");
    expect(screen.getByTestId("staff").textContent).toBe("non");
    expect(screen.getByTestId("client-only").textContent).toBe("oui");
    expect(localStorage.getItem("token")).toBe("abc");
  });
});
