import { describe, expect, it } from "vitest";
import { addToLocal, cartStorage, setLocalQuantity } from "../cart/cartStorage";

describe("local cart helpers", () => {
  it("adds and increments", () => {
    let items = addToLocal([], 1, 2);
    items = addToLocal(items, 1, 3);
    items = addToLocal(items, 2, 1);
    expect(items).toEqual([{ product_id: 1, quantity: 5 }, { product_id: 2, quantity: 1 }]);
  });

  it("sets quantity and removes at zero", () => {
    const items = [{ product_id: 1, quantity: 2 }, { product_id: 2, quantity: 1 }];
    expect(setLocalQuantity(items, 1, 7)[0].quantity).toBe(7);
    expect(setLocalQuantity(items, 2, 0)).toEqual([{ product_id: 1, quantity: 2 }]);
  });

  it("persists to localStorage in the merge payload shape", () => {
    cartStorage.write([{ product_id: 9, quantity: 4 }]);
    expect(cartStorage.read()).toEqual([{ product_id: 9, quantity: 4 }]);
    cartStorage.clear();
    expect(cartStorage.read()).toEqual([]);
  });
});
