export interface ProductSpec {
  type: string;
  socket?: string;
  tdp?: number; // CPU maximum power draw
  memoryType?: string; // e.g. DDR4 or DDR5
  memorySlots?: number;
  memory?: string; // GPU VRAM
  formFactor?: string; // ATX, Micro-ATX, Mini-ITX, etc.
  wattage?: number; // PSU output capacity
  recommendedPsu?: number; // Minimum recommended for a GPU
  maxMainboard?: string; // Case clearance
  capacity?: number;
  coolerType?: string;
  compatibleSockets?: string[];
  radiatorSize?: number;
  height?: number;
  lengthMm?: number; // GPU length
}

export interface SelectedProduct {
  id: string;
  name: string;
  brand: string;
  categoryId: string;
  specsJson: string; // JSON string
}

// Map form factors to an integer scale for easy physical clearance comparisons
const FORM_FACTOR_SCALE: Record<string, number> = {
  "e-atx": 4,
  atx: 3,
  "micro-atx": 2,
  matx: 2,
  "mini-itx": 1,
  itx: 1,
};

export function checkCompatibility(products: SelectedProduct[]): string[] {
  const warnings: string[] = [];

  // Parse all specs
  const specs = products.map((p) => ({
    productName: p.name,
    ...JSON.parse(p.specsJson),
  })) as (ProductSpec & { productName: string })[];

  const cpu = specs.find((s) => s.type === "cpu");
  const motherboard = specs.find((s) => s.type === "motherboard");
  const ramList = specs.filter((s) => s.type === "ram");
  const gpu = specs.find((s) => s.type === "gpu");
  const psu = specs.find((s) => s.type === "psu");
  const caseItem = specs.find((s) => s.type === "case");
  const cooler = specs.find((s) => s.type === "cooler");

  // 1. CPU & Motherboard Socket Compatibility
  if (cpu && motherboard) {
    if (cpu.socket !== motherboard.socket) {
      warnings.push(
        `Incompatible Socket: CPU ${cpu.productName} uses ${cpu.socket}, but Motherboard ${motherboard.productName} uses ${motherboard.socket}.`,
      );
    }
  }

  // 2. RAM & Motherboard Memory Type Compatibility
  if (motherboard && ramList.length > 0) {
    for (const ram of ramList) {
      if (ram.memoryType !== motherboard.memoryType) {
        warnings.push(
          `Incompatible RAM: Motherboard ${motherboard.productName} uses ${motherboard.memoryType}, but ${ram.productName} is ${ram.memoryType}.`,
        );
      }
    }
  }

  // 3. CPU Cooler Socket Compatibility
  if (cooler && cooler.compatibleSockets && (motherboard || cpu)) {
    const targetSocket = motherboard?.socket || cpu?.socket;
    if (targetSocket && !cooler.compatibleSockets.includes(targetSocket)) {
      warnings.push(
        `Incompatible Cooler: ${cooler.productName} does not support the ${targetSocket} socket.`,
      );
    }
  }

  // 4. Power Constraints (GPU vs PSU or CPU vs PSU)
  if (psu && psu.wattage) {
    if (gpu && gpu.recommendedPsu) {
      if (psu.wattage < gpu.recommendedPsu) {
        warnings.push(
          `Insufficient Power: GPU ${gpu.productName} recommends ${gpu.recommendedPsu}W, but PSU ${psu.productName} only provides ${psu.wattage}W.`,
        );
      }
    } else if (cpu && cpu.tdp) {
      // If no GPU is present, add a 100W buffer to the CPU TDP requirement
      const minRequired = cpu.tdp + 100;
      if (psu.wattage < minRequired) {
        warnings.push(
          `Insufficient Power: System requires at least ${minRequired}W, but PSU ${psu.productName} provides ${psu.wattage}W.`,
        );
      }
    }
  }

  // 5. Motherboard/PSU Form Factor vs Case Physical Dimensions
  if (
    motherboard &&
    caseItem &&
    motherboard.formFactor &&
    caseItem.maxMainboard
  ) {
    const moboSize =
      FORM_FACTOR_SCALE[motherboard.formFactor.toLowerCase()] || 99;
    const caseMaxSize =
      FORM_FACTOR_SCALE[caseItem.maxMainboard.toLowerCase()] || 99;

    if (moboSize > caseMaxSize) {
      warnings.push(
        `Incompatible Dimensions: Motherboard ${motherboard.productName} is ${motherboard.formFactor}, but Case ${caseItem.productName} only supports up to ${caseItem.maxMainboard}.`,
      );
    }
  }

  // 5.5 PSU Form Factor vs Case Support
  if (psu && caseItem && psu.formFactor && caseItem.maxMainboard) {
    // If the case is ITX, it generally requires SFX PSUs unless stated otherwise.
    if (
      caseItem.maxMainboard.toLowerCase() === "mini-itx" &&
      psu.formFactor.toLowerCase() === "atx"
    ) {
      warnings.push(
        `Incompatible PSU: Case ${caseItem.productName} is an ITX case, but Power Supply ${psu.productName} is a full ATX form factor. This case requires an SFX power supply.`,
      );
    }
  }

  // 6. Generic Small Form Factor Notice
  if (caseItem && caseItem.formFactor?.includes("ITX")) {
    warnings.push(
      `Notice: Small Form Factor (Mini-ITX) cases have strict limits on GPU length and often require SFX Power Supplies. Double check clearance before building.`,
    );
  }

  return warnings;
}

export function checkPotentialCompatibility(
  buildProducts: SelectedProduct[],
  potentialProduct: SelectedProduct,
): string[] {
  const isCurrentlySelected = buildProducts.some(
    (p) => p.id === potentialProduct.id,
  );

  if (isCurrentlySelected) {
    // If the product is already in the build, the warnings it causes are the warnings
    // present in the current build that would disappear if it were removed.
    const buildWithout = buildProducts.filter(
      (p) => p.id !== potentialProduct.id,
    );
    const warningsWithout = checkCompatibility(buildWithout);
    const currentWarnings = checkCompatibility(buildProducts);

    return currentWarnings.filter(
      (w) => !warningsWithout.includes(w) && !w.startsWith("Notice:"),
    );
  }

  // Check compatibility of the build WITH the potential product replacing any existing product of same category
  const combined = [
    ...buildProducts.filter(
      (p) => p.categoryId !== potentialProduct.categoryId,
    ),
    potentialProduct,
  ];
  const allWarnings = checkCompatibility(combined);

  // Check compatibility of the build WITHOUT the potential product
  const currentWarnings = checkCompatibility(buildProducts);

  // Filter out warnings that already exist in the build so we only show warnings caused by the new product
  // Also ignore Notices
  const newWarnings = allWarnings.filter(
    (w) => !currentWarnings.includes(w) && !w.startsWith("Notice:"),
  );
  return newWarnings;
}

export function getIncompatibleFilterOptions(
  buildProducts: SelectedProduct[],
  category: string,
): Record<string, string[]> {
  const incompatible: Record<string, string[]> = {};

  const specs = buildProducts.map((p) => ({
    ...JSON.parse(p.specsJson),
  })) as ProductSpec[];

  const cpu = specs.find((s) => s.type === "cpu");
  const motherboard = specs.find((s) => s.type === "motherboard");
  const ram = specs.find((s) => s.type === "ram");
  const caseItem = specs.find((s) => s.type === "case");

  const ALL_SOCKETS = ["AM4", "AM5", "LGA1700", "LGA1851"];
  const ALL_MEMORY_TYPES = ["DDR4", "DDR5"];
  const ALL_FORM_FACTORS = [
    "E-ATX",
    "ATX",
    "Micro-ATX",
    "mATX",
    "Mini-ITX",
    "ITX",
  ];
  const ALL_CASE_MAINBOARDS = ["E-ATX", "ATX", "Micro-ATX", "Mini-ITX"];

  if (category === "CPU") {
    if (motherboard && motherboard.socket) {
      incompatible.sockets = ALL_SOCKETS.filter(
        (s) => s !== motherboard.socket,
      );
    }
  }

  if (category === "Motherboard") {
    if (cpu && cpu.socket) {
      incompatible.sockets = ALL_SOCKETS.filter((s) => s !== cpu.socket);
    }
    if (ram && ram.memoryType) {
      incompatible.memoryTypes = ALL_MEMORY_TYPES.filter(
        (m) => m !== ram.memoryType,
      );
    }
    if (caseItem && caseItem.maxMainboard) {
      const maxAllowed =
        FORM_FACTOR_SCALE[caseItem.maxMainboard.toLowerCase()] || 99;
      incompatible.formFactors = ALL_FORM_FACTORS.filter((f) => {
        const size = FORM_FACTOR_SCALE[f.toLowerCase()] || 0;
        return size > maxAllowed;
      });
    }
  }

  if (category === "RAM") {
    if (motherboard && motherboard.memoryType) {
      incompatible.memoryTypes = ALL_MEMORY_TYPES.filter(
        (m) => m !== motherboard.memoryType,
      );
    }
  }

  if (category === "Case") {
    if (motherboard && motherboard.formFactor) {
      const requiredSize =
        FORM_FACTOR_SCALE[motherboard.formFactor.toLowerCase()] || 0;
      incompatible.caseMaxMainboards = ALL_CASE_MAINBOARDS.filter((f) => {
        const maxSupported = FORM_FACTOR_SCALE[f.toLowerCase()] || 0;
        return maxSupported < requiredSize;
      });
    }
  }

  if (category === "CPU Cooler") {
    const targetSocket =
      (motherboard && motherboard.socket) || (cpu && cpu.socket);
    if (targetSocket) {
      incompatible.sockets = ALL_SOCKETS.filter((s) => s !== targetSocket);
    }
  }

  return incompatible;
}
