import { screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import ProtectedRoute from "../components/ProtectedRoute";
import { renderWithProviders } from "./render";

describe("ProtectedRoute", () => {
  it("redirects anonymous users to login with next param", async () => {
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<p>login page</p>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<p>checkout page</p>} />
        </Route>
      </Routes>,
      { route: "/checkout" },
    );
    await waitFor(() => expect(screen.getByText("login page")).toBeInTheDocument());
    expect(screen.queryByText("checkout page")).not.toBeInTheDocument();
  });
});
