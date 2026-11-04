import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";
import { product } from "./server";
import { renderWithProviders } from "./render";

describe("ProductCard", () => {
  it("shows price and low-stock badge", () => {
    renderWithProviders(<ProductCard product={product} />);
    expect(screen.getByText("$49.00")).toBeInTheDocument();
    expect(screen.getByText("Only 3 left")).toBeInTheDocument();
  });

  it("disables add when out of stock", () => {
    renderWithProviders(<ProductCard product={{ ...product, stock_quantity: 0, in_stock: false }} />);
    expect(screen.getByRole("button", { name: "Out of stock" })).toBeDisabled();
    expect(screen.getByText("Sold out")).toBeInTheDocument();
  });

  it("adds to guest cart and updates navbar badge", async () => {
    renderWithProviders(<><Navbar /><ProductCard product={product} /></>);
    await userEvent.click(screen.getAllByRole("button", { name: "Add to bag" })[0]);
    await waitFor(() => expect(screen.getByTestId("cart-badge")).toHaveTextContent("1"));
  });
});
