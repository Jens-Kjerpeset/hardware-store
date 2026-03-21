import { checkCompatibility, SelectedProduct } from "./compatibility";
import { test } from "node:test";
import * as assert from "node:assert";

test("Compatible CPU and Motherboard", () => {
  const products: SelectedProduct[] = [
    {
      id: "1",
      name: "Intel CPU",
      brand: "Intel",
      categoryId: "cpu",
      specsJson: JSON.stringify({ type: "cpu", socket: "LGA1700" }),
    },
    {
      id: "2",
      name: "Z790",
      brand: "ASUS",
      categoryId: "mobo",
      specsJson: JSON.stringify({ type: "motherboard", socket: "LGA1700" }),
    },
  ];
  const warnings = checkCompatibility(products);
  assert.strictEqual(warnings.length, 0);
});

test("Incompatible CPU and Motherboard", () => {
  const products: SelectedProduct[] = [
    {
      id: "1",
      name: "AMD CPU",
      brand: "AMD",
      categoryId: "cpu",
      specsJson: JSON.stringify({ type: "cpu", socket: "AM5" }),
    },
    {
      id: "2",
      name: "Z790",
      brand: "ASUS",
      categoryId: "mobo",
      specsJson: JSON.stringify({ type: "motherboard", socket: "LGA1700" }),
    },
  ];
  const warnings = checkCompatibility(products);
  assert.strictEqual(warnings.length, 1);
  assert.match(warnings[0], /Incompatible Socket/);
});

test("Incompatible RAM and Motherboard", () => {
  const products: SelectedProduct[] = [
    {
      id: "2",
      name: "Z790",
      brand: "ASUS",
      categoryId: "mobo",
      specsJson: JSON.stringify({
        type: "motherboard",
        socket: "LGA1700",
        memoryType: "DDR5",
      }),
    },
    {
      id: "3",
      name: "DDR4 RAM",
      brand: "Corsair",
      categoryId: "ram",
      specsJson: JSON.stringify({ type: "ram", memoryType: "DDR4" }),
    },
  ];
  const warnings = checkCompatibility(products);
  assert.strictEqual(warnings.length, 1);
  assert.match(warnings[0], /Incompatible RAM/);
});

test("Insufficient PSU", () => {
  const products: SelectedProduct[] = [
    {
      id: "4",
      name: "RTX 4090",
      brand: "NVIDIA",
      categoryId: "gpu",
      specsJson: JSON.stringify({ type: "gpu", recommendedPsu: 850 }),
    },
    {
      id: "5",
      name: "600W PSU",
      brand: "EVGA",
      categoryId: "psu",
      specsJson: JSON.stringify({ type: "psu", wattage: 600 }),
    },
  ];
  const warnings = checkCompatibility(products);
  assert.strictEqual(warnings.length, 1);
  assert.match(warnings[0], /Insufficient Power/);
});
