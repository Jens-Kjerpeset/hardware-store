export const REQUIRED_BUILD_CATEGORIES = ['CPU', 'CPU Cooler', 'Motherboard', 'GPU', 'RAM', 'Power Supply', 'Case', 'OS'];

export const CATEGORY_BRAND_MAP: Record<string, string[]> = {
  'CPU': ['Intel', 'AMD'],
  'Motherboard': ['ASUS', 'MSI', 'Gigabyte', 'ASRock'],
  'RAM': ['Corsair', 'G.Skill', 'Crucial', 'Kingston'],
  'GPU': ['NVIDIA', 'AMD', 'ASUS', 'MSI', 'Gigabyte', 'Sapphire', 'XFX', 'ASRock'],
  'Storage': ['Samsung', 'Western Digital', 'Crucial', 'Seagate', 'Toshiba'],
  'Power Supply': ['Corsair', 'EVGA', 'Seasonic', 'Thermaltake'],
  'Case': ['NZXT', 'Corsair', 'Fractal Design', 'Lian Li'],
  'CPU Cooler': ['Noctua', 'NZXT', 'Corsair', 'Be Quiet!'],
  'OS': ['Microsoft']
};

export const CPU_MIN_SPEED = 4.0;
export const CPU_MAX_SPEED = 6.5;
export const CPU_MIN_CORES = 6;
export const CPU_MAX_CORES = 24;
export const CPU_MAX_TDP = 200;
export const CPU_SOCKETS = ['AM5', 'LGA1700', 'LGA1851'];

export const GPU_MIN_VRAM = 4;
export const GPU_MAX_VRAM = 24;
export const GPU_MIN_PSU = 400;
export const GPU_MAX_PSU = 1200;
export const GPU_INTERFACES = ['PCIe 3.0', 'PCIe 4.0', 'PCIe 5.0'];
export const GPU_CHIPSETS = ['NVIDIA', 'AMD', 'Intel'];
export const GPU_MAX_LENGTH = 450;

// Motherboard Filters
export const MOTHERBOARD_FORM_FACTORS = ['ATX', 'mATX', 'ITX', 'E-ATX'];
export const MOTHERBOARD_MEMORY_TYPES = ['DDR4', 'DDR5'];
export const MOTHERBOARD_SOCKETS = ['AM4', 'AM5', 'LGA1700', 'LGA1851'];
export const MOTHERBOARD_CHIPSETS = ['Z890', 'Z790', 'B760', 'B650E', 'B650', 'B550'];

// RAM Filters
export const RAM_MIN_SPEED = 2133;
export const RAM_MAX_SPEED = 8400;
export const RAM_MAX_CAS = 50;
export const RAM_CAPACITIES = [8, 16, 32, 64, 96];
export const RAM_MODULES = ['2x8GB', '2x16GB', '2x24GB', '2x32GB', '4x8GB', '4x16GB'];

// Shared Filter Constants
export const STORAGE_CAPACITIES = [500, 1000, 2000, 4000, 8000, 14000, 20000];

// Storage Filters
export const STORAGE_INTERFACES = ['PCIe 3.0', 'PCIe 4.0', 'PCIe 5.0', 'SATA'];
export const STORAGE_MIN_READ_SPEED = 500;
export const STORAGE_MAX_READ_SPEED = 15000;
export const STORAGE_TYPES = ['HDD', 'SSD'];
export const STORAGE_FORM_FACTORS = ['M.2 2280', '2.5"', '3.5"'];

// Power Supply Filters
export const PSU_MIN_WATTAGE = 400;
export const PSU_MAX_WATTAGE = 1600;
export const PSU_EFFICIENCIES = ['80+ White', '80+ Bronze', '80+ Gold', '80+ Platinum', '80+ Titanium'];
export const PSU_MODULARITIES = ['Full', 'Semi', 'Non-Modular'];
export const PSU_FORM_FACTORS = ['ATX', 'SFX', 'SFX-L'];

// Case Filters
export const CASE_FORM_FACTORS = ['Full Tower', 'Mid Tower', 'Mini-ITX'];
export const CASE_MAX_MAINBOARDS = ['E-ATX', 'ATX', 'Micro-ATX', 'Mini-ITX'];
export const CASE_COLORS = ['Black', 'White'];
export const CASE_SIDE_PANELS = ['Tempered Glass', 'Mesh', 'Solid'];

// CPU Cooler Filters
export const COOLER_TYPES = ['Air', 'Liquid'];
export const COOLER_RADIATOR_SIZES = [120, 240, 280, 360, 420];
export const COOLER_COLORS = ['Black', 'White', 'Brown/Silver'];
export const MIN_COOLER_NOISE = 0;
export const MAX_COOLER_NOISE = 50;
export const MIN_COOLER_HEIGHT = 0;
export const MAX_COOLER_HEIGHT = 200;
