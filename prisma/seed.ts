import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const url =
  process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "file:./dev.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const adapter = new PrismaLibSql({ url, authToken });

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.discountCode.deleteMany();
  await prisma.storeSettings.deleteMany();
  await prisma.expenditure.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();

  const categories = [
    { name: "CPU" },
    { name: "Motherboard" },
    { name: "RAM" },
    { name: "GPU" },
    { name: "Power Supply" },
    { name: "Case" },
    { name: "Storage" },
    { name: "CPU Cooler" },
    { name: "OS" },
  ];

  const categoryMap = new Map();
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    categoryMap.set(cat.name, created.id);
  }

  const products = [
    // CPUs
    {
      name: "Intel Core i9-14900K",
      description:
        "24 cores (8 P-cores + 16 E-cores), 32 threads, up to 6.0 GHz.",
      price: 589.99,
      imageUrl: "/placeholder.svg",
      brand: "Intel",
      categoryId: categoryMap.get("CPU"),
      specsJson: JSON.stringify({
        socket: "LGA1700",
        tdp: 125,
        type: "cpu",
        cores: 24,
        speedGhz: 6.0,
      }),
    },
    {
      name: "AMD Ryzen 9 7950X3D",
      description:
        "16-core, 32-thread Desktop Processor with AMD 3D V-Cache Technology.",
      price: 649.99,
      imageUrl: "/placeholder.svg",
      brand: "AMD",
      categoryId: categoryMap.get("CPU"),
      specsJson: JSON.stringify({
        socket: "AM5",
        tdp: 120,
        type: "cpu",
        cores: 16,
        speedGhz: 5.7,
      }),
    },
    {
      name: "Intel Core i5-13600K",
      description:
        "14 cores (6 P-cores + 8 E-cores), 20 threads, up to 5.1 GHz.",
      price: 319.99,
      imageUrl: "/placeholder.svg",
      brand: "Intel",
      categoryId: categoryMap.get("CPU"),
      specsJson: JSON.stringify({
        socket: "LGA1700",
        tdp: 125,
        type: "cpu",
        cores: 14,
        speedGhz: 5.1,
      }),
    },
    {
      name: "AMD Ryzen 7 7800X3D",
      description:
        "8-core, 16-thread Desktop Processor with AMD 3D V-Cache Technology. The ultimate gaming CPU.",
      price: 399.99,
      imageUrl: "/placeholder.svg",
      brand: "AMD",
      categoryId: categoryMap.get("CPU"),
      specsJson: JSON.stringify({
        socket: "AM5",
        tdp: 120,
        type: "cpu",
        cores: 8,
        speedGhz: 5.0,
      }),
    },
    {
      name: "AMD Ryzen 5 7600X",
      description:
        "6-core, 12-thread unlocked desktop processor. Built for high framerate gaming.",
      price: 229.99,
      imageUrl: "/placeholder.svg",
      brand: "AMD",
      categoryId: categoryMap.get("CPU"),
      specsJson: JSON.stringify({
        socket: "AM5",
        tdp: 105,
        type: "cpu",
        cores: 6,
        speedGhz: 5.3,
      }),
    },
    {
      name: "AMD Ryzen 9 9950X",
      description:
        "16-core, 32-thread flagship Zen 5 processor for creators and gamers.",
      price: 649.99,
      imageUrl: "/placeholder.svg",
      brand: "AMD",
      categoryId: categoryMap.get("CPU"),
      specsJson: JSON.stringify({
        socket: "AM5",
        tdp: 170,
        type: "cpu",
        cores: 16,
        speedGhz: 5.7,
      }),
    },
    {
      name: "Intel Core i7-14700K",
      description:
        "20 cores (8 P-cores + 12 E-cores), 28 threads, up to 5.6 GHz. Phenomenal multitasking.",
      price: 399.99,
      imageUrl: "/placeholder.svg",
      brand: "Intel",
      categoryId: categoryMap.get("CPU"),
      specsJson: JSON.stringify({
        socket: "LGA1700",
        tdp: 125,
        type: "cpu",
        cores: 20,
        speedGhz: 5.6,
      }),
    },
    {
      name: "Intel Core Ultra 9 285K",
      description:
        "Next-gen desktop processor with NPU, unlocking advanced AI and elite performance.",
      price: 589.99,
      imageUrl: "/placeholder.svg",
      brand: "Intel",
      categoryId: categoryMap.get("CPU"),
      specsJson: JSON.stringify({
        socket: "LGA1851",
        tdp: 125,
        type: "cpu",
        cores: 24,
        speedGhz: 5.7,
      }),
    },
    {
      name: "Intel Core Ultra 5 245K",
      description:
        "14-core desktop processor built for efficient, high-performance gaming.",
      price: 309.99,
      imageUrl: "/placeholder.svg",
      brand: "Intel",
      categoryId: categoryMap.get("CPU"),
      specsJson: JSON.stringify({
        socket: "LGA1851",
        tdp: 125,
        type: "cpu",
        cores: 14,
        speedGhz: 5.2,
      }),
    },

    // Motherboards
    {
      name: "ASUS ROG Maximus Z790 Hero",
      description:
        "Intel Z790 ATX motherboard with 20+1 power stages, PCIe 5.0, DDR5, Wi-Fi 6E.",
      price: 599.99,
      imageUrl: "/placeholder.svg",
      brand: "ASUS",
      categoryId: categoryMap.get("Motherboard"),
      specsJson: JSON.stringify({
        socket: "LGA1700",
        formFactor: "ATX",
        memoryType: "DDR5",
        memorySlots: 4,
        maxMemory: 192,
        chipset: "Z790",
        type: "motherboard",
      }),
    },
    {
      name: "MSI MAG B650 TOMAHAWK WIFI",
      description: "AMD B650 ATX Motherboard with Wi-Fi 6E, DDR5.",
      price: 219.99,
      imageUrl: "/placeholder.svg",
      brand: "MSI",
      categoryId: categoryMap.get("Motherboard"),
      specsJson: JSON.stringify({
        socket: "AM5",
        formFactor: "ATX",
        memoryType: "DDR5",
        memorySlots: 4,
        maxMemory: 192,
        chipset: "B650",
        type: "motherboard",
      }),
    },
    {
      name: "Gigabyte Z790 AORUS ELITE AX",
      description:
        "Premium Intel Z790 motherboard with advanced thermal design.",
      price: 259.99,
      imageUrl: "/placeholder.svg",
      brand: "Gigabyte",
      categoryId: categoryMap.get("Motherboard"),
      specsJson: JSON.stringify({
        socket: "LGA1700",
        formFactor: "ATX",
        memoryType: "DDR5",
        memorySlots: 4,
        maxMemory: 192,
        chipset: "Z790",
        type: "motherboard",
      }),
    },
    {
      name: "ASUS ROG Maximus Z890 Hero",
      description:
        "Extreme enthusiast Intel Core Ultra motherboard. E-ATX form factor featuring massive heatsinks and WiFi 7.",
      price: 699.99,
      imageUrl: "/placeholder.svg",
      brand: "ASUS",
      categoryId: categoryMap.get("Motherboard"),
      specsJson: JSON.stringify({
        socket: "LGA1851",
        formFactor: "E-ATX",
        memoryType: "DDR5",
        memorySlots: 4,
        maxMemory: 256,
        chipset: "Z890",
        type: "motherboard",
      }),
    },
    {
      name: "ASUS ROG Strix B650E-I Gaming WiFi",
      description:
        "Compact mini-ITX powerhouse for Ryzen 7000 processors. Features PCIe 5.0 and DDR5 in a tiny footprint.",
      price: 329.99,
      imageUrl: "/placeholder.svg",
      brand: "ASUS",
      categoryId: categoryMap.get("Motherboard"),
      specsJson: JSON.stringify({
        socket: "AM5",
        formFactor: "ITX",
        memoryType: "DDR5",
        memorySlots: 2,
        maxMemory: 96,
        chipset: "B650E",
        type: "motherboard",
      }),
    },
    {
      name: "Gigabyte B550 AORUS ELITE",
      description: "AMD B550 AM4 ATX Motherboard for classic older builds.",
      price: 149.99,
      imageUrl: "/placeholder.svg",
      brand: "Gigabyte",
      categoryId: categoryMap.get("Motherboard"),
      specsJson: JSON.stringify({
        socket: "AM4",
        formFactor: "ATX",
        memoryType: "DDR4",
        memorySlots: 4,
        maxMemory: 128,
        chipset: "B550",
        type: "motherboard",
      }),
    },
    {
      name: "ASRock B760M-HDV/M.2 D4",
      description:
        "Affordable Micro ATX board for Intel 13th & 12th Gen. Supports DDR4 memory and dual M.2 slots.",
      price: 94.99,
      imageUrl: "/placeholder.svg",
      brand: "ASRock",
      categoryId: categoryMap.get("Motherboard"),
      specsJson: JSON.stringify({
        socket: "LGA1700",
        formFactor: "mATX",
        memoryType: "DDR4",
        memorySlots: 2,
        maxMemory: 64,
        chipset: "B760",
        type: "motherboard",
      }),
    },

    // RAM
    {
      name: "Corsair Vengeance 32GB (2 x 16GB) DDR5-6000",
      description: "High performance DDR5 memory kit for the latest builds.",
      price: 114.99,
      imageUrl: "/placeholder.svg",
      brand: "Corsair",
      categoryId: categoryMap.get("RAM"),
      specsJson: JSON.stringify({
        memoryType: "DDR5",
        capacity: 32,
        speed: 6000,
        casLatency: 36,
        modules: "2x16GB",
        type: "ram",
      }),
    },
    {
      name: "G.Skill Ripjaws V 16GB (2 x 8GB) DDR4-3600",
      description: "Classic reliable DDR4 memory kit.",
      price: 45.99,
      imageUrl: "/placeholder.svg",
      brand: "G.Skill",
      categoryId: categoryMap.get("RAM"),
      specsJson: JSON.stringify({
        memoryType: "DDR4",
        capacity: 16,
        speed: 3600,
        casLatency: 16,
        modules: "2x8GB",
        type: "ram",
      }),
    },
    {
      name: "G.Skill Trident Z5 Neo RGB 64GB (2 x 32GB) DDR5-6000",
      description:
        "Ultra high capacity, low latency DDR5 memory engineered for AMD EXPO.",
      price: 219.99,
      imageUrl: "/placeholder.svg",
      brand: "G.Skill",
      categoryId: categoryMap.get("RAM"),
      specsJson: JSON.stringify({
        memoryType: "DDR5",
        capacity: 64,
        speed: 6000,
        casLatency: 30,
        modules: "2x32GB",
        type: "ram",
      }),
    },
    {
      name: "Crucial Pro 32GB (2 x 16GB) DDR4-3200",
      description: "Plug-and-play DDR4 memory for stable, no-fuss performance.",
      price: 65.99,
      imageUrl: "/placeholder.svg",
      brand: "Crucial",
      categoryId: categoryMap.get("RAM"),
      specsJson: JSON.stringify({
        memoryType: "DDR4",
        capacity: 32,
        speed: 3200,
        casLatency: 22,
        modules: "2x16GB",
        type: "ram",
      }),
    },
    {
      name: "Corsair Dominator Titanium 32GB (2 x 16GB) DDR5-7200",
      description:
        "Push your system to the limit with ultra-fast premium memory.",
      price: 189.99,
      imageUrl: "/placeholder.svg",
      brand: "Corsair",
      categoryId: categoryMap.get("RAM"),
      specsJson: JSON.stringify({
        memoryType: "DDR5",
        capacity: 32,
        speed: 7200,
        casLatency: 34,
        modules: "2x16GB",
        type: "ram",
      }),
    },
    {
      name: "Kingston FURY Beast 16GB (2 x 8GB) DDR5-5200",
      description: "Affordable entry into DDR5 performance.",
      price: 59.99,
      imageUrl: "/placeholder.svg",
      brand: "Kingston",
      categoryId: categoryMap.get("RAM"),
      specsJson: JSON.stringify({
        memoryType: "DDR5",
        capacity: 16,
        speed: 5200,
        casLatency: 40,
        modules: "2x8GB",
        type: "ram",
      }),
    },

    // GPU
    {
      name: "NVIDIA GeForce RTX 4090 Founders Edition",
      description:
        "The ultimate GeForce GPU. It brings an enormous leap in performance, efficiency, and AI-powered graphics.",
      price: 1599.99,
      imageUrl: "/placeholder.svg",
      brand: "NVIDIA",
      categoryId: categoryMap.get("GPU"),
      specsJson: JSON.stringify({
        chipset: "NVIDIA",
        memory: "24",
        interface: "PCIe 4.0",
        recommendedPsu: 850,
        lengthMm: 304,
        formFactor: "ATX",
        type: "gpu",
      }),
    },
    {
      name: "AMD Radeon RX 7900 XTX Reference",
      description:
        "Experience unprecedented performance, visuals, and efficiency at 4K and beyond with AMD RDNA 3 architecture.",
      price: 999.99,
      imageUrl: "/placeholder.svg",
      brand: "AMD",
      categoryId: categoryMap.get("GPU"),
      specsJson: JSON.stringify({
        chipset: "AMD",
        memory: "24",
        interface: "PCIe 4.0",
        recommendedPsu: 800,
        lengthMm: 287,
        formFactor: "ATX",
        type: "gpu",
      }),
    },
    {
      name: "ASUS ROG Strix GeForce RTX 4080 SUPER OC",
      description:
        "Buffed-up design with chart-topping thermal performance and massive heat sink.",
      price: 1199.99,
      imageUrl: "/placeholder.svg",
      brand: "ASUS",
      categoryId: categoryMap.get("GPU"),
      specsJson: JSON.stringify({
        chipset: "NVIDIA",
        memory: "16",
        interface: "PCIe 4.0",
        recommendedPsu: 850,
        lengthMm: 357,
        formFactor: "ATX",
        type: "gpu",
      }),
    },
    {
      name: "MSI Gaming X Trio GeForce RTX 4070 Ti",
      description:
        "Play with style. GAMING is upgraded with TRI FROZR 3 to sustain intense performance.",
      price: 849.99,
      imageUrl: "/placeholder.svg",
      brand: "MSI",
      categoryId: categoryMap.get("GPU"),
      specsJson: JSON.stringify({
        chipset: "NVIDIA",
        memory: "12",
        interface: "PCIe 4.0",
        recommendedPsu: 700,
        lengthMm: 337,
        formFactor: "ATX",
        type: "gpu",
      }),
    },
    {
      name: "Gigabyte Radeon RX 7800 XT GAMING OC",
      description:
        "Powered by Radeon RX 7800 XT, integrated with 16GB GDDR256-bit memory interface, WINDFORCE cooling system.",
      price: 499.99,
      imageUrl: "/placeholder.svg",
      brand: "Gigabyte",
      categoryId: categoryMap.get("GPU"),
      specsJson: JSON.stringify({
        chipset: "AMD",
        memory: "16",
        interface: "PCIe 4.0",
        recommendedPsu: 700,
        lengthMm: 302,
        formFactor: "ATX",
        type: "gpu",
      }),
    },
    {
      name: "ASUS Dual GeForce RTX 4060 OC",
      description:
        "2x Axial-tech fans. 2x Fun. ASUS Dual delivers a plug-and-play premium gaming experience.",
      price: 299.99,
      imageUrl: "/placeholder.svg",
      brand: "ASUS",
      categoryId: categoryMap.get("GPU"),
      specsJson: JSON.stringify({
        chipset: "NVIDIA",
        memory: "8",
        interface: "PCIe 4.0",
        recommendedPsu: 550,
        lengthMm: 227,
        formFactor: "mATX",
        type: "gpu",
      }),
    },
    {
      name: "MSI Radeon RX 7600 MECH 2X Classic",
      description:
        "Arm yourself for the latest games with the sleek, sharp MECH styling engineered for reliability.",
      price: 269.99,
      imageUrl: "/placeholder.svg",
      brand: "MSI",
      categoryId: categoryMap.get("GPU"),
      specsJson: JSON.stringify({
        chipset: "AMD",
        memory: "8",
        interface: "PCIe 4.0",
        recommendedPsu: 550,
        lengthMm: 235,
        formFactor: "mATX",
        type: "gpu",
      }),
    },
    {
      name: "Gigabyte GeForce RTX 4070 SUPER WINDFORCE OC",
      description:
        "Supercharged for stellar 1440p gaming. Powered by the ultra-efficient NVIDIA Ada Lovelace architecture.",
      price: 599.99,
      imageUrl: "/placeholder.svg",
      brand: "Gigabyte",
      categoryId: categoryMap.get("GPU"),
      specsJson: JSON.stringify({
        chipset: "NVIDIA",
        memory: "12",
        interface: "PCIe 4.0",
        recommendedPsu: 700,
        lengthMm: 261,
        formFactor: "ATX",
        type: "gpu",
      }),
    },
    {
      name: "ASUS TUF Gaming GeForce RTX 4070 Ti SUPER OC",
      description:
        "Built TUF. The RTX 4070 Ti SUPER gets a massive memory upgrade to 16GB for elite 4K performance.",
      price: 849.99,
      imageUrl: "/placeholder.svg",
      brand: "ASUS",
      categoryId: categoryMap.get("GPU"),
      specsJson: JSON.stringify({
        chipset: "NVIDIA",
        memory: "16",
        interface: "PCIe 4.0",
        recommendedPsu: 750,
        lengthMm: 305,
        formFactor: "ATX",
        type: "gpu",
      }),
    },
    {
      name: "Sapphire PULSE AMD Radeon RX 7900 XT",
      description:
        "Breakthrough AMD RDNA 3 architecture with chiplet technology for next-gen performance and visuals.",
      price: 699.99,
      imageUrl: "/placeholder.svg",
      brand: "Sapphire",
      categoryId: categoryMap.get("GPU"),
      specsJson: JSON.stringify({
        chipset: "AMD",
        memory: "20",
        interface: "PCIe 4.0",
        recommendedPsu: 750,
        lengthMm: 313,
        formFactor: "ATX",
        type: "gpu",
      }),
    },
    {
      name: "XFX Speedster QICK 319 Radeon RX 7700 XT Black",
      description:
        "Incredible 1440p performance. Streamlined triple-fan design for maximum cooling efficiency.",
      price: 419.99,
      imageUrl: "/placeholder.svg",
      brand: "XFX",
      categoryId: categoryMap.get("GPU"),
      specsJson: JSON.stringify({
        chipset: "AMD",
        memory: "12",
        interface: "PCIe 4.0",
        recommendedPsu: 700,
        lengthMm: 335,
        formFactor: "ATX",
        type: "gpu",
      }),
    },
    {
      name: "ASRock Intel Arc A770 Phantom Gaming D",
      description:
        "Intel enters the game. Delivering high-performance hardware ray tracing and XeSS AI upscaling.",
      price: 289.99,
      imageUrl: "/placeholder.svg",
      brand: "ASRock",
      categoryId: categoryMap.get("GPU"),
      specsJson: JSON.stringify({
        chipset: "Intel",
        memory: "16",
        interface: "PCIe 4.0",
        recommendedPsu: 650,
        lengthMm: 305,
        formFactor: "ATX",
        type: "gpu",
      }),
    },
    {
      name: "NVIDIA GeForce RTX 5090 Founders Edition",
      description:
        "The monumental Blackwell architecture arrives. 32GB of ultra-fast GDDR7 memory for unmatched 4K and AI performance.",
      price: 1999.99,
      imageUrl: "/placeholder.svg",
      brand: "NVIDIA",
      categoryId: categoryMap.get("GPU"),
      specsJson: JSON.stringify({
        chipset: "NVIDIA",
        memory: "32",
        interface: "PCIe 5.0",
        recommendedPsu: 1000,
        lengthMm: 310,
        formFactor: "ATX",
        type: "gpu",
      }),
    },
    {
      name: "NVIDIA GeForce RTX 5080 Founders Edition",
      description:
        "Next-generation elite performance. Delivering unprecedented frame-rates powered by the Blackwell architecture.",
      price: 1199.99,
      imageUrl: "/placeholder.svg",
      brand: "NVIDIA",
      categoryId: categoryMap.get("GPU"),
      specsJson: JSON.stringify({
        chipset: "NVIDIA",
        memory: "16",
        interface: "PCIe 5.0",
        recommendedPsu: 850,
        lengthMm: 305,
        formFactor: "ATX",
        type: "gpu",
      }),
    },

    // Power Supply
    {
      name: "Corsair RM1000x",
      description: "1000 Watt 80 PLUS Gold Certified Fully Modular PSU.",
      price: 189.99,
      imageUrl: "/placeholder.svg",
      brand: "Corsair",
      categoryId: categoryMap.get("Power Supply"),
      specsJson: JSON.stringify({
        wattage: 1000,
        modular: "Full",
        formFactor: "ATX",
        type: "psu",
        efficiency: "80+ Gold",
      }),
    },
    {
      name: "EVGA SuperNOVA 750 G6",
      description: "750W 80 Plus Gold Power Supply, fully modular.",
      price: 119.99,
      imageUrl: "/placeholder.svg",
      brand: "EVGA",
      categoryId: categoryMap.get("Power Supply"),
      specsJson: JSON.stringify({
        wattage: 750,
        modular: "Full",
        formFactor: "ATX",
        type: "psu",
        efficiency: "80+ Gold",
      }),
    },
    {
      name: "Corsair SF750",
      description:
        "750 Watt 80 PLUS Platinum Certified High Performance SFX PSU.",
      price: 184.99,
      imageUrl: "/placeholder.svg",
      brand: "Corsair",
      categoryId: categoryMap.get("Power Supply"),
      specsJson: JSON.stringify({
        wattage: 750,
        modular: "Full",
        formFactor: "SFX",
        type: "psu",
        efficiency: "80+ Platinum",
      }),
    },
    {
      name: "Seasonic FOCUS GX-850",
      description:
        "850W 80+ Gold, Full-Modular, Fan Control in Fanless, Silent, and Cooling Mode.",
      price: 139.99,
      imageUrl: "/placeholder.svg",
      brand: "Seasonic",
      categoryId: categoryMap.get("Power Supply"),
      specsJson: JSON.stringify({
        wattage: 850,
        modular: "Full",
        formFactor: "ATX",
        type: "psu",
        efficiency: "80+ Gold",
      }),
    },
    {
      name: "Thermaltake Smart 500W",
      description: "500W 80+ White Certified PSU, Continuous Power.",
      price: 39.99,
      imageUrl: "/placeholder.svg",
      brand: "Thermaltake",
      categoryId: categoryMap.get("Power Supply"),
      specsJson: JSON.stringify({
        wattage: 500,
        modular: "Non-Modular",
        formFactor: "ATX",
        type: "psu",
        efficiency: "80+ White",
      }),
    },
    {
      name: "Cosair CX650M",
      description: "650 Watt 80 PLUS Bronze Semi-Modular ATX PSU.",
      price: 79.99,
      imageUrl: "/placeholder.svg",
      brand: "Corsair",
      categoryId: categoryMap.get("Power Supply"),
      specsJson: JSON.stringify({
        wattage: 650,
        modular: "Semi",
        formFactor: "ATX",
        type: "psu",
        efficiency: "80+ Bronze",
      }),
    },
    {
      name: "be quiet! Dark Power 13 1000W",
      description: "1000W ATX 3.0 Power Supply, 80 PLUS Titanium efficiency.",
      price: 289.9,
      imageUrl: "/placeholder.svg",
      brand: "be quiet!",
      categoryId: categoryMap.get("Power Supply"),
      specsJson: JSON.stringify({
        wattage: 1000,
        modular: "Full",
        formFactor: "ATX",
        type: "psu",
        efficiency: "80+ Titanium",
      }),
    },

    // Case
    {
      name: "NZXT H5 Flow",
      description:
        "Compact ATX Mid-Tower PC Gaming Case with excellent airflow.",
      price: 94.99,
      imageUrl: "/placeholder.svg",
      brand: "NZXT",
      categoryId: categoryMap.get("Case"),
      specsJson: JSON.stringify({
        type: "case",
        formFactor: "Mid Tower",
        maxMainboard: "ATX",
        color: "Black",
        sidePanel: "Tempered Glass",
      }),
    },
    {
      name: "Corsair 4000D Airflow",
      description:
        "A mid-tower ATX case with exceptional airflow, featuring a steel front panel.",
      price: 104.99,
      imageUrl: "/placeholder.svg",
      brand: "Corsair",
      categoryId: categoryMap.get("Case"),
      specsJson: JSON.stringify({
        type: "case",
        formFactor: "Mid Tower",
        maxMainboard: "E-ATX",
        color: "White",
        sidePanel: "Tempered Glass",
      }),
    },
    {
      name: "Fractal Design North",
      description:
        "Features real walnut or oak wood on the front panel with excellent airflow.",
      price: 139.99,
      imageUrl: "/placeholder.svg",
      brand: "Fractal Design",
      categoryId: categoryMap.get("Case"),
      specsJson: JSON.stringify({
        type: "case",
        formFactor: "Mid Tower",
        maxMainboard: "ATX",
        color: "Black",
        sidePanel: "Mesh",
      }),
    },
    {
      name: "Lian Li O11 Dynamic EVO",
      description:
        "Dual-chamber chassis with a completely reversible design. Supports massive cooling setups.",
      price: 159.99,
      imageUrl: "/placeholder.svg",
      brand: "Lian Li",
      categoryId: categoryMap.get("Case"),
      specsJson: JSON.stringify({
        type: "case",
        formFactor: "Full Tower",
        maxMainboard: "E-ATX",
        color: "White",
        sidePanel: "Tempered Glass",
      }),
    },
    {
      name: "Cooler Master NR200P",
      description:
        "Small form factor mini-ITX case with premium features and immense cooling support.",
      price: 99.99,
      imageUrl: "/placeholder.svg",
      brand: "Cooler Master",
      categoryId: categoryMap.get("Case"),
      specsJson: JSON.stringify({
        type: "case",
        formFactor: "Mini-ITX",
        maxMainboard: "Mini-ITX",
        color: "Black",
        sidePanel: "Solid",
      }),
    },

    // Storage
    {
      name: "Samsung 990 PRO 2TB",
      description:
        "Internal PCIe Gen 4.0 x4, NVMe 2.0 SSD for ultimate performance.",
      price: 169.99,
      imageUrl: "/placeholder.svg",
      brand: "Samsung",
      categoryId: categoryMap.get("Storage"),
      specsJson: JSON.stringify({
        formFactor: "M.2 2280",
        capacity: 2000,
        interface: "PCIe 4.0",
        readSpeed: 7450,
        writeSpeed: 6900,
        type: "storage",
        storageType: "SSD",
      }),
    },
    {
      name: "Western Digital WD_BLACK SN850X 1TB",
      description: "High-speed NVMe SSD with insane load times for gamers.",
      price: 84.99,
      imageUrl: "/placeholder.svg",
      brand: "Western Digital",
      categoryId: categoryMap.get("Storage"),
      specsJson: JSON.stringify({
        formFactor: "M.2 2280",
        capacity: 1000,
        interface: "PCIe 4.0",
        readSpeed: 7300,
        writeSpeed: 6300,
        type: "storage",
        storageType: "SSD",
      }),
    },
    {
      name: "Crucial T700 2TB Gen5",
      description:
        "Extreme performance PCIe Gen5 NVMe SSD. Blazing fast sequential speeds.",
      price: 269.99,
      imageUrl: "/placeholder.svg",
      brand: "Crucial",
      categoryId: categoryMap.get("Storage"),
      specsJson: JSON.stringify({
        formFactor: "M.2 2280",
        capacity: 2000,
        interface: "PCIe 5.0",
        readSpeed: 12400,
        writeSpeed: 11800,
        type: "storage",
        storageType: "SSD",
      }),
    },
    {
      name: "Corsair MP700 PRO 2TB Gen5",
      description:
        "The pinnacle of storage performance with a massive heatsink for PCIe 5.0 speeds.",
      price: 299.99,
      imageUrl: "/placeholder.svg",
      brand: "Corsair",
      categoryId: categoryMap.get("Storage"),
      specsJson: JSON.stringify({
        formFactor: "M.2 2280",
        capacity: 2000,
        interface: "PCIe 5.0",
        readSpeed: 12400,
        writeSpeed: 11800,
        type: "storage",
        storageType: "SSD",
      }),
    },
    {
      name: "Kingston FURY Renegade 2TB",
      description:
        "Incredible PCIe 4.0 performance for gaming and demanding workloads.",
      price: 154.99,
      imageUrl: "/placeholder.svg",
      brand: "Kingston",
      categoryId: categoryMap.get("Storage"),
      specsJson: JSON.stringify({
        formFactor: "M.2 2280",
        capacity: 2000,
        interface: "PCIe 4.0",
        readSpeed: 7300,
        writeSpeed: 7000,
        type: "storage",
        storageType: "SSD",
      }),
    },
    {
      name: "Samsung 980 PRO 1TB",
      description: "The reliable and wildly popular Gen4 workhorse.",
      price: 89.99,
      imageUrl: "/placeholder.svg",
      brand: "Samsung",
      categoryId: categoryMap.get("Storage"),
      specsJson: JSON.stringify({
        formFactor: "M.2 2280",
        capacity: 1000,
        interface: "PCIe 4.0",
        readSpeed: 7000,
        writeSpeed: 5000,
        type: "storage",
        storageType: "SSD",
      }),
    },

    {
      name: "Seagate IronWolf Pro 20TB",
      description:
        "High-capacity 7200 RPM SATA 6Gb/s HDD for massive storage arrays.",
      price: 369.99,
      imageUrl: "/placeholder.svg",
      brand: "Seagate",
      categoryId: categoryMap.get("Storage"),
      specsJson: JSON.stringify({
        formFactor: '3.5"',
        capacity: 20000,
        type: "storage",
        storageType: "HDD",
        interface: "SATA",
        cache: 256,
        rpm: 7200,
      }),
    },
    {
      name: "Western Digital WD Blue 4TB",
      description:
        "Reliable 5400 RPM HDD for bulk storage of movies, games, and photos.",
      price: 79.99,
      imageUrl: "/placeholder.svg",
      brand: "Western Digital",
      categoryId: categoryMap.get("Storage"),
      specsJson: JSON.stringify({
        formFactor: '3.5"',
        capacity: 4000,
        type: "storage",
        storageType: "HDD",
        interface: "SATA",
        cache: 256,
        rpm: 5400,
      }),
    },
    {
      name: "Crucial MX500 2TB",
      description:
        "Reliable 2.5-inch SATA SSD for secondary storage and game libraries.",
      price: 119.99,
      imageUrl: "/placeholder.svg",
      brand: "Crucial",
      categoryId: categoryMap.get("Storage"),
      specsJson: JSON.stringify({
        formFactor: '2.5"',
        capacity: 2000,
        type: "storage",
        storageType: "SSD",
        interface: "SATA",
        readSpeed: 560,
        writeSpeed: 510,
      }),
    },
    {
      name: "Samsung 870 EVO 4TB",
      description:
        "Industry-leading reliability and performance in a SATA SSD.",
      price: 249.99,
      imageUrl: "/placeholder.svg",
      brand: "Samsung",
      categoryId: categoryMap.get("Storage"),
      specsJson: JSON.stringify({
        formFactor: '2.5"',
        capacity: 4000,
        type: "storage",
        storageType: "SSD",
        interface: "SATA",
        readSpeed: 560,
        writeSpeed: 530,
      }),
    },
    {
      name: "Seagate Barracuda 8TB",
      description:
        "Versatile HDDs for all your PC needs bring you industry-leading excellence in personal computing.",
      price: 129.99,
      imageUrl: "/placeholder.svg",
      brand: "Seagate",
      categoryId: categoryMap.get("Storage"),
      specsJson: JSON.stringify({
        formFactor: '3.5"',
        capacity: 8000,
        type: "storage",
        storageType: "HDD",
        interface: "SATA",
        cache: 256,
        rpm: 5400,
      }),
    },
    {
      name: "Toshiba X300 14TB",
      description:
        "Performance hard drive designed for professional or gaming PC builders.",
      price: 269.99,
      imageUrl: "/placeholder.svg",
      brand: "Toshiba",
      categoryId: categoryMap.get("Storage"),
      specsJson: JSON.stringify({
        formFactor: '3.5"',
        capacity: 14000,
        type: "storage",
        storageType: "HDD",
        interface: "SATA",
        cache: 512,
        rpm: 7200,
      }),
    },

    // CPU Coolers
    {
      name: "Noctua NH-D15",
      description: "Premium dual-tower CPU cooler with two quiet NF-A15 fans.",
      price: 119.99,
      imageUrl: "/placeholder.svg",
      brand: "Noctua",
      categoryId: categoryMap.get("CPU Cooler"),
      specsJson: JSON.stringify({
        type: "cooler",
        coolerType: "Air",
        compatibleSockets: ["AM4", "AM5", "LGA1700"],
        height: 165,
        minRPM: 300,
        maxRPM: 1500,
        minNoise: 19.2,
        maxNoise: 24.6,
        color: "Brown/Silver",
      }),
    },
    {
      name: "NZXT Kraken Elite 360 RGB",
      description: "360mm AIO Liquid Cooler with LCD Display and RGB fans.",
      price: 289.99,
      imageUrl: "/placeholder.svg",
      brand: "NZXT",
      categoryId: categoryMap.get("CPU Cooler"),
      specsJson: JSON.stringify({
        type: "cooler",
        coolerType: "Liquid",
        radiatorSize: 360,
        compatibleSockets: ["AM4", "AM5", "LGA1700", "LGA1851"],
        minRPM: 500,
        maxRPM: 1500,
        minNoise: 17.9,
        maxNoise: 30.6,
        color: "Black",
      }),
    },
    {
      name: "Corsair iCUE H150i ELITE CAPELLIX XT",
      description:
        "High-performance 360mm liquid CPU cooler with ultra-bright CAPELLIX RGB LEDs.",
      price: 219.99,
      imageUrl: "/placeholder.svg",
      brand: "Corsair",
      categoryId: categoryMap.get("CPU Cooler"),
      specsJson: JSON.stringify({
        type: "cooler",
        coolerType: "Liquid",
        radiatorSize: 360,
        compatibleSockets: ["AM4", "AM5", "LGA1700"],
        minRPM: 400,
        maxRPM: 2100,
        minNoise: 5.0,
        maxNoise: 34.1,
        color: "White",
      }),
    },
    {
      name: "be quiet! Dark Rock Pro 4",
      description:
        "No compromise silence and performance with two virtually inaudible Silent Wings PWM fans.",
      price: 89.9,
      imageUrl: "/placeholder.svg",
      brand: "Be Quiet!",
      categoryId: categoryMap.get("CPU Cooler"),
      specsJson: JSON.stringify({
        type: "cooler",
        coolerType: "Air",
        compatibleSockets: ["AM4", "AM5", "LGA1700"],
        height: 163,
        minRPM: 0,
        maxRPM: 1500,
        minNoise: 11.9,
        maxNoise: 24.3,
        color: "Black",
      }),
    },
    {
      name: "NZXT Kraken 240",
      description: "240mm AIO Liquid Cooler with a 1.54” square LCD screen.",
      price: 139.99,
      imageUrl: "/placeholder.svg",
      brand: "NZXT",
      categoryId: categoryMap.get("CPU Cooler"),
      specsJson: JSON.stringify({
        type: "cooler",
        coolerType: "Liquid",
        radiatorSize: 240,
        compatibleSockets: ["AM4", "AM5", "LGA1700"],
        minRPM: 500,
        maxRPM: 1800,
        minNoise: 17.9,
        maxNoise: 30.6,
        color: "Black",
      }),
    },

    // OS
    {
      name: "Windows 11 Home",
      description: "Microsoft OS - 64-bit OEM USB Flash Drive.",
      price: 139.99,
      imageUrl: "/placeholder.svg",
      brand: "Microsoft",
      categoryId: categoryMap.get("OS"),
      specsJson: JSON.stringify({ type: "os" }),
    },
    {
      name: "Windows 11 Pro",
      description: "Microsoft OS for professionals and businesses.",
      price: 159.99,
      imageUrl: "/placeholder.svg",
      brand: "Microsoft",
      categoryId: categoryMap.get("OS"),
      specsJson: JSON.stringify({ type: "os" }),
    },
  ];

  const createdProducts = [];

  for (const product of products) {
    // Convert USD prices roughly to realistic Norwegian retail prices (incl. VAT)
    // Roughly 11.5x USD, rounded to the nearest 10, minus 1 for psychological pricing
    const rawNok = product.price * 11.5;
    const nokPrice = Math.max(99, Math.round(rawNok / 10) * 10 - 1);

    // Simulate cost (60% to 85% of retail price)
    const costMultiplier = 0.6 + Math.random() * 0.25;
    const cost = Math.round(nokPrice * costMultiplier);

    // Simulate stock
    const stock = Math.floor(Math.random() * 95) + 5; // 5 to 100

    // New Schema Fields
    const sku =
      "SKU-" +
      product.brand.substring(0, 3).toUpperCase() +
      "-" +
      Math.floor(Math.random() * 90000 + 10000);
    const suppliers = [
      "TechData Nordic",
      "Ingram Micro",
      "Also Norway",
      "Exertis",
    ];
    const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
    const isActive = Math.random() > 0.15; // 85% active
    const lowStockThreshold = [5, 10, 20][Math.floor(Math.random() * 3)];

    // Intercept specsJson to dynamically add the newly requested architectural compatibility constraints
    const specs = JSON.parse(product.specsJson);
    const catName =
      Array.from(categoryMap.entries()).find(
        ([, v]) => v === product.categoryId,
      )?.[0] || "";

    if (catName === "Case") {
      specs.maxGpuLength = 400;
      specs.maxCoolerHeight = 165;
    } else if (catName === "GPU") {
      specs.slotWidth = specs.formFactor === "mATX" ? "2-slot" : "3-slot";
      delete specs.formFactor;
    } else if (catName === "CPU Cooler") {
      if (specs.compatibleSockets) {
        specs.socketCompatibility = specs.compatibleSockets.join(", ");
        delete specs.compatibleSockets;
      }
    } else if (catName.includes("Storage")) {
      if (specs.interface === "PCIe 4.0") specs.interface = "NVMe PCIe 4.0";
      if (specs.interface === "PCIe 5.0") specs.interface = "NVMe PCIe 5.0";
      if (specs.interface === "SATA") specs.interface = "SATA III";
      if (specs.formFactor === "M.2 2280") specs.formFactor = "M.2";
    }

    const hasDiscount = Math.random() > 0.8;
    const discountPercent = hasDiscount
      ? Math.floor(Math.random() * 20 + 5)
      : null; // 5% to 24%
    const discountEndsAt = hasDiscount
      ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000)
      : null;

    const dbProduct = await prisma.product.create({
      data: {
        ...product,
        specsJson: JSON.stringify(specs),
        price: nokPrice,
        cost,
        stock,
        sku,
        supplier,
        isActive,
        lowStockThreshold,
        discountPercent,
        discountEndsAt,
      },
    });

    createdProducts.push(dbProduct);
  }

  console.log("Generating realistic Norwegian customers...");

  const noNames = [
    "Lars",
    "Ole",
    "Kristian",
    "Magnus",
    "Henrik",
    "Filip",
    "Jonas",
    "Emil",
    "Tobias",
    "Mathias",
    "Nora",
    "Emma",
    "Sofie",
    "Linnea",
    "Sara",
    "Maja",
    "Vilde",
    "Amalie",
    "Ingrid",
    "Thea",
  ];
  const noSurnames = [
    "Hansen",
    "Johansen",
    "Olsen",
    "Larsen",
    "Andersen",
    "Pedersen",
    "Nilsen",
    "Kristiansen",
    "Jensen",
    "Karlsen",
    "Johnsen",
    "Pettersen",
    "Eriksen",
    "Berg",
    "Haugen",
    "Hagen",
    "Johannessen",
    "Andreassen",
    "Jacobsen",
    "Halvorsen",
  ];
  const noCities = [
    "Oslo",
    "Bergen",
    "Trondheim",
    "Stavanger",
    "Kristiansand",
    "Tromsø",
    "Drammen",
    "Sandnes",
    "Fredrikstad",
    "Bodø",
  ];

  const createdCustomers = [];

  for (let i = 0; i < 75; i++) {
    const firstName = noNames[Math.floor(Math.random() * noNames.length)];
    const lastName = noSurnames[Math.floor(Math.random() * noSurnames.length)];
    const fullName = `${firstName} ${lastName}`;

    const emailStr = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 99)}@example.no`;
    const phoneStr = `+47 ${Math.floor(Math.random() * 90000000 + 10000000)}`;
    const zipCode = Math.floor(Math.random() * 9000 + 1000).toString();
    const city = noCities[Math.floor(Math.random() * noCities.length)];
    const streetNum = Math.floor(Math.random() * 150 + 1);
    const addressStr = `Storgata ${streetNum}, ${zipCode} ${city}, Norway`;

    // Customers joined anywhere uniformly in the last 480 days
    const joinedAt = new Date(
      Date.now() - Math.random() * 480 * 24 * 60 * 60 * 1000,
    );

    const cust = await prisma.customer.create({
      data: {
        name: fullName,
        email: emailStr,
        phone: phoneStr,
        address: addressStr,
        createdAt: joinedAt,
        updatedAt: joinedAt,
      },
    });
    createdCustomers.push(cust);
  }

  console.log("Generating dummy historical orders...");

  // Generate ~1300 dummy orders evenly distributed back to roughly Dec 2024
  const now = new Date();
  let orderDayOffset = 0;
  const orderDayIncrement = 480 / 1300; // Evenly space orders across 480 days

  for (let i = 0; i < 1300; i++) {
    // Deterministic date backwards in time with randomized varied spacing
    const pastDate = new Date(
      now.getTime() - orderDayOffset * 24 * 60 * 60 * 1000,
    );
    orderDayOffset += orderDayIncrement * (0.5 + Math.random()); // Add random noise to gaps

    // Random number of items in this order (1 to 5)
    const numItems = Math.floor(Math.random() * 5) + 1;
    const orderItemsData = [];
    let totalAmount = 0;

    for (let j = 0; j < numItems; j++) {
      // Pick random product
      const product =
        createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const quantity = Math.floor(Math.random() * 2) + 1; // 1 or 2 of this item

      orderItemsData.push({
        productId: product.id,
        quantity,
        priceAtTime: product.price,
        costAtTime: product.cost,
      });
      totalAmount += product.price * quantity;
    }

    // Only create a Customer relation for ~80% of orders, remaining 20% are 'guests'
    const isGuest = Math.random() > 0.8;
    const customer = isGuest
      ? null
      : createdCustomers[Math.floor(Math.random() * createdCustomers.length)];

    // Shipping data
    const statuses = ["processing", "shipped", "delivered"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const hasShipped = status === "shipped" || status === "delivered";
    const trackingNumber = hasShipped
      ? `TRK-${Math.floor(Math.random() * 9000000000 + 1000000000)}`
      : null;

    const shippingAddress = customer
      ? customer.address
      : "Storgata 1, 0155 Oslo, Norway"; // default guest address

    await prisma.order.create({
      data: {
        totalAmount,
        status: Math.random() > 0.1 ? "completed" : "pending",
        shippingStatus: status,
        trackingNumber: trackingNumber,
        shippingAddress: shippingAddress,
        customerId: customer?.id || null,
        createdAt: pastDate,
        updatedAt: pastDate,
        items: {
          create: orderItemsData,
        },
      },
    });
  }

  console.log("Generating dummy company expenditures...");

  const expenditureCategories = [
    "rent",
    "marketing",
    "server hosting",
    "restock",
  ];
  // Generate ~185 dummy expenditures evenly distributed over the last ~480 days
  let expDayOffset = 0;
  const expDayIncrement = 480 / 185;

  for (let i = 0; i < 185; i++) {
    // Deterministic date backwards in time with randomized varied spacing
    const pastDate = new Date(
      now.getTime() - expDayOffset * 24 * 60 * 60 * 1000,
    );
    expDayOffset += expDayIncrement * (0.5 + Math.random()); // Add random noise to gaps
    const category =
      expenditureCategories[
        Math.floor(Math.random() * expenditureCategories.length)
      ];

    // Rent is high, marketing/servers are medium, restock is variable
    let amount = 0;
    let description = "";

    switch (category) {
      case "rent":
        amount = 15000 + Math.random() * 5000; // 15k - 20k NOK
        description = "Monthly Warehouse & Office Rent";
        break;
      case "marketing":
        amount = 2000 + Math.random() * 8000; // 2k - 10k NOK
        description = "Facebook / Google Ad Spend";
        break;
      case "server hosting":
        amount = 800 + Math.random() * 400; // 800 - 1200 NOK
        description = "AWS / Vercel Cloud Architecture";
        break;
      case "restock":
        amount = 25000 + Math.random() * 75000; // 25k - 100k NOK
        description = "Wholesale Bulk Inventory Restock";
        break;
    }

    await prisma.expenditure.create({
      data: {
        amount,
        description,
        category,
        createdAt: pastDate,
        updatedAt: pastDate,
      },
    });
  }

  console.log("Generating global store settings & promotions...");

  await prisma.storeSettings.create({
    data: {
      storeName: "Premium PC Parts Norway",
      contactEmail: "support@premiumpc.no",
      taxRate: 0.25,
      shippingFlatRate: 149.0,
    },
  });

  await prisma.discountCode.createMany({
    data: [
      {
        code: "WINTER26",
        discountPercent: 15,
        isActive: true,
        usedCount: 142,
        maxUses: null,
      },
      {
        code: "WELCOME10",
        discountPercent: 10,
        isActive: true,
        usedCount: 89,
        maxUses: null,
      },
      {
        code: "FLASH50",
        discountPercent: 50,
        isActive: false,
        usedCount: 50,
        maxUses: 50,
      },
      {
        code: "BUILDER5",
        discountPercent: 5,
        isActive: true,
        usedCount: 12,
        maxUses: 100,
      },
    ],
  });

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
