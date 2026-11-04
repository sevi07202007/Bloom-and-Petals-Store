import { describe, expect, it } from "vitest";
import { shippingSchema } from "../pages/checkoutSchema";

describe("shipping schema", () => {
  it("rejects missing required fields", () => {
    const r = shippingSchema.safeParse({ shipping_name: "", shipping_country: "USA" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const paths = r.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("shipping_address1");
      expect(paths).toContain("shipping_country");
    }
  });

  it("accepts a valid address", () => {
    expect(shippingSchema.safeParse({
      shipping_name: "Jane Doe", shipping_address1: "1 Main St", shipping_city: "Town",
      shipping_postal_code: "12345", shipping_country: "US",
    }).success).toBe(true);
  });
});
