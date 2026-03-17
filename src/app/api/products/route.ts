import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  CPU_MIN_SPEED, CPU_MAX_SPEED, CPU_MIN_CORES, CPU_MAX_CORES, CPU_MAX_TDP,
  GPU_MIN_VRAM, GPU_MAX_VRAM, GPU_MIN_PSU, GPU_MAX_PSU, GPU_MAX_LENGTH,
  RAM_MIN_SPEED, RAM_MAX_SPEED, RAM_MAX_CAS,
  STORAGE_MIN_READ_SPEED, STORAGE_MAX_READ_SPEED,
  PSU_MIN_WATTAGE, PSU_MAX_WATTAGE,
  MIN_COOLER_NOISE, MAX_COOLER_NOISE, MIN_COOLER_HEIGHT, MAX_COOLER_HEIGHT
} from '@/lib/constants';
export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const q = searchParams.get('q') || '';
  const categoriesParam = searchParams.get('category');
  const brandsParam = searchParams.get('brand');
  const sort = searchParams.get('sort'); // price_asc, price_desc
  const minSpeed = parseFloat(searchParams.get('minSpeed') || CPU_MIN_SPEED.toString());
  const maxSpeed = parseFloat(searchParams.get('maxSpeed') || CPU_MAX_SPEED.toString());
  const minCores = parseInt(searchParams.get('minCores') || CPU_MIN_CORES.toString(), 10);
  const maxCores = parseInt(searchParams.get('maxCores') || CPU_MAX_CORES.toString(), 10);
  const maxTDP = parseInt(searchParams.get('maxTDP') || CPU_MAX_TDP.toString(), 10);
  const socketsParam = searchParams.get('sockets');

  const minVram = parseInt(searchParams.get('minVram') || GPU_MIN_VRAM.toString(), 10);
  const maxVram = parseInt(searchParams.get('maxVram') || GPU_MAX_VRAM.toString(), 10);
  const minPsu = parseInt(searchParams.get('minPsu') || GPU_MIN_PSU.toString(), 10);
  const maxPsu = parseInt(searchParams.get('maxPsu') || GPU_MAX_PSU.toString(), 10);
  const interfacesParam = searchParams.get('interfaces');
  const chipsetsParam = searchParams.get('chipsets');
  const maxLength = parseInt(searchParams.get('maxLength') || GPU_MAX_LENGTH.toString(), 10);
  
  const categories = categoriesParam ? categoriesParam.split(',').map(s => s.trim()).filter(Boolean) : [];
  const brands = brandsParam ? brandsParam.split(',').map(s => s.trim()).filter(Boolean) : [];
  const sockets = socketsParam ? socketsParam.split(',').map(s => s.trim()).filter(Boolean) : [];
  const interfaces = interfacesParam ? interfacesParam.split(',').map(s => s.trim()).filter(Boolean) : [];
  const chipsets = chipsetsParam ? chipsetsParam.split(',').map(s => s.trim()).filter(Boolean) : [];
  
  // Motherboards & RAM
  const formFactorParam = searchParams.get('formFactor');
  const memoryTypeParam = searchParams.get('memoryType');
  const formFactors = formFactorParam ? formFactorParam.split(',').map(s => s.trim()).filter(Boolean) : [];
  const memoryTypes = memoryTypeParam ? memoryTypeParam.split(',').map(s => s.trim()).filter(Boolean) : [];
  const minMemorySlots = parseInt(searchParams.get('minMemorySlots') || '0', 10);
  const maxMemorySlots = parseInt(searchParams.get('maxMemorySlots') || '16', 10);
  const minMaxMemory = parseInt(searchParams.get('minMaxMemory') || '0', 10);
  
  // RAM specifics
  const minRamSpeed = parseInt(searchParams.get('minRamSpeed') || RAM_MIN_SPEED.toString(), 10);
  const maxRamSpeed = parseInt(searchParams.get('maxRamSpeed') || RAM_MAX_SPEED.toString(), 10);
  const maxCasLatency = parseInt(searchParams.get('maxCasLatency') || RAM_MAX_CAS.toString(), 10);
  const capacitiesParam = searchParams.get('capacities');
  const modulesParam = searchParams.get('modules');
  const capacities = capacitiesParam ? capacitiesParam.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n)) : [];
  const modules = modulesParam ? modulesParam.split(',').map(s => s.trim()).filter(Boolean) : [];
  
  // Storage specifics
  const storageInterfacesParam = searchParams.get('storageInterfaces');
  const storageCapacitiesParam = searchParams.get('storageCapacities');
  const storageInterfaces = storageInterfacesParam ? storageInterfacesParam.split(',').map(s => s.trim()).filter(Boolean) : [];
  const storageCapacities = storageCapacitiesParam ? storageCapacitiesParam.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n)) : [];
  const minReadSpeed = parseInt(searchParams.get('minReadSpeed') || STORAGE_MIN_READ_SPEED.toString(), 10);
  const maxReadSpeed = parseInt(searchParams.get('maxReadSpeed') || STORAGE_MAX_READ_SPEED.toString(), 10);

  const storageTypesParam = searchParams.get('storageTypes');
  const storageFormFactorsParam = searchParams.get('storageFormFactors');
  const storageTypes = storageTypesParam ? storageTypesParam.split(',').map(s => s.trim()).filter(Boolean) : [];
  const storageFormFactors = storageFormFactorsParam ? storageFormFactorsParam.split(',').map(s => s.trim()).filter(Boolean) : [];
  
  const minWattage = parseInt(searchParams.get('minWattage') || PSU_MIN_WATTAGE.toString(), 10);
  const maxWattage = parseInt(searchParams.get('maxWattage') || PSU_MAX_WATTAGE.toString(), 10);
  const psuEfficienciesParam = searchParams.get('psuEfficiencies');
  const psuModularitiesParam = searchParams.get('psuModularities');
  const psuFormFactorsParam = searchParams.get('psuFormFactors');
  const psuEfficiencies = psuEfficienciesParam ? psuEfficienciesParam.split(',').map(s => s.trim()).filter(Boolean) : [];
  const psuModularities = psuModularitiesParam ? psuModularitiesParam.split(',').map(s => s.trim()).filter(Boolean) : [];
  const psuFormFactors = psuFormFactorsParam ? psuFormFactorsParam.split(',').map(s => s.trim()).filter(Boolean) : [];
  
  const caseFormFactorsParam = searchParams.get('caseFormFactors');
  const caseMaxMainboardsParam = searchParams.get('caseMaxMainboards');
  const caseColorsParam = searchParams.get('caseColors');
  const caseSidePanelsParam = searchParams.get('caseSidePanels');
  const caseFormFactors = caseFormFactorsParam ? caseFormFactorsParam.split(',').map(s => s.trim()).filter(Boolean) : [];
  const caseMaxMainboards = caseMaxMainboardsParam ? caseMaxMainboardsParam.split(',').map(s => s.trim()).filter(Boolean) : [];
  const caseColors = caseColorsParam ? caseColorsParam.split(',').map(s => s.trim()).filter(Boolean) : [];
  const caseSidePanels = caseSidePanelsParam ? caseSidePanelsParam.split(',').map(s => s.trim()).filter(Boolean) : [];

  const coolerTypesParam = searchParams.get('coolerTypes');
  const coolerRadiatorSizesParam = searchParams.get('coolerRadiatorSizes');
  const coolerColorsParam = searchParams.get('coolerColors');
  const coolerTypes = coolerTypesParam ? coolerTypesParam.split(',').map(s => s.trim()).filter(Boolean) : [];
  const coolerRadiatorSizes = coolerRadiatorSizesParam ? coolerRadiatorSizesParam.split(',').map(Number).filter(n => !isNaN(n)) : [];
  const coolerColors = coolerColorsParam ? coolerColorsParam.split(',').map(s => s.trim()).filter(Boolean) : [];
  const minCoolerNoise = parseInt(searchParams.get('minCoolerNoise') || MIN_COOLER_NOISE.toString(), 10);
  const maxCoolerNoise = parseInt(searchParams.get('maxCoolerNoise') || MAX_COOLER_NOISE.toString(), 10);
  const minCoolerHeight = parseInt(searchParams.get('minCoolerHeight') || MIN_COOLER_HEIGHT.toString(), 10);
  const maxCoolerHeight = parseInt(searchParams.get('maxCoolerHeight') || MAX_COOLER_HEIGHT.toString(), 10);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = {};
  
  if (q) {
    whereClause.OR = [
      { name: { contains: q } },
      { description: { contains: q } }
    ];
  }
  
  if (brands.length > 0) {
    whereClause.brand = { in: brands };
  }
  
  if (categories.length > 0) {
    whereClause.category = {
      name: { in: categories }
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any = {};
  if (sort === 'price_asc') {
    orderBy = { price: 'asc' };
  } else if (sort === 'price_desc') {
    orderBy = { price: 'desc' };
  }

  try {
    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: Object.keys(orderBy).length ? orderBy : undefined,
      include: {
        category: true
      }
    });

    let filtered = products;

    // Apply JSON-based deep filtering in memory
    if (minSpeed > CPU_MIN_SPEED || maxSpeed < CPU_MAX_SPEED || minCores > CPU_MIN_CORES || maxCores < CPU_MAX_CORES || maxTDP < CPU_MAX_TDP || sockets.length > 0 || minVram > GPU_MIN_VRAM || maxVram < GPU_MAX_VRAM || minPsu > GPU_MIN_PSU || maxPsu < GPU_MAX_PSU || interfaces.length > 0 || maxLength < GPU_MAX_LENGTH || minRamSpeed > RAM_MIN_SPEED || maxRamSpeed < RAM_MAX_SPEED || maxCasLatency < RAM_MAX_CAS || capacities.length > 0 || modules.length > 0 || formFactors.length > 0 || memoryTypes.length > 0 || minMemorySlots > 0 || maxMemorySlots < 16 || minMaxMemory > 0 || chipsets.length > 0 || storageInterfaces.length > 0 || storageCapacities.length > 0 || minReadSpeed > STORAGE_MIN_READ_SPEED || maxReadSpeed < STORAGE_MAX_READ_SPEED || storageTypes.length > 0 || storageFormFactors.length > 0 || minWattage > PSU_MIN_WATTAGE || maxWattage < PSU_MAX_WATTAGE || psuEfficiencies.length > 0 || psuModularities.length > 0 || psuFormFactors.length > 0 || caseFormFactors.length > 0 || caseMaxMainboards.length > 0 || caseColors.length > 0 || caseSidePanels.length > 0 || coolerTypes.length > 0 || coolerRadiatorSizes.length > 0 || coolerColors.length > 0 || minCoolerNoise > MIN_COOLER_NOISE || maxCoolerNoise < MAX_COOLER_NOISE || minCoolerHeight > MIN_COOLER_HEIGHT || maxCoolerHeight < MAX_COOLER_HEIGHT) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered = products.filter((p: any) => {
        try {
          const specs = JSON.parse(p.specsJson || '{}');
          
          if (specs.type === 'cpu') {
            if (minSpeed > CPU_MIN_SPEED && (specs.speedGhz || 0) < minSpeed) return false;
            if (maxSpeed < CPU_MAX_SPEED && (specs.speedGhz || CPU_MAX_SPEED) > maxSpeed) return false;
            if (minCores > CPU_MIN_CORES && (specs.cores || 0) < minCores) return false;
            if (maxCores < CPU_MAX_CORES && (specs.cores || CPU_MAX_CORES) > maxCores) return false;
            if (maxTDP < CPU_MAX_TDP && (specs.tdp || CPU_MAX_TDP) > maxTDP) return false;
            if (sockets.length > 0 && !sockets.includes(specs.socket)) return false;
          }
          
          if (specs.type === 'gpu') {
            const vram = specs.memory ? parseInt(specs.memory) : 0;
            if (minVram > GPU_MIN_VRAM && vram < minVram) return false;
            if (maxVram < GPU_MAX_VRAM && vram > maxVram) return false;
            
            const psu = specs.recommendedPsu || 0;
            if (minPsu > GPU_MIN_PSU && psu < minPsu) return false;
            if (maxPsu < GPU_MAX_PSU && psu > maxPsu) return false;
            
            if (interfaces.length > 0 && !interfaces.includes(specs.interface)) return false;
            if (chipsets.length > 0 && !chipsets.includes(specs.chipset)) return false;
            
            const lengthMm = specs.lengthMm || 0;
            if (maxLength < GPU_MAX_LENGTH && lengthMm > maxLength) return false;
          }

          if (specs.type === 'motherboard') {
            if (sockets.length > 0 && !sockets.includes(specs.socket)) return false;
            if (formFactors.length > 0 && !formFactors.includes(specs.formFactor)) return false;
            if (memoryTypes.length > 0 && !memoryTypes.includes(specs.memoryType)) return false;
            
            const slots = specs.memorySlots || 0;
            if (minMemorySlots > 0 && slots < minMemorySlots) return false;
            if (maxMemorySlots < 16 && slots > maxMemorySlots) return false;

            const maxCap = specs.maxMemory || 0;
            if (minMaxMemory > 0 && maxCap < minMaxMemory) return false;

            if (chipsets.length > 0 && !chipsets.includes(specs.chipset)) return false;
          }

          if (specs.type === 'ram') {
            if (memoryTypes.length > 0 && !memoryTypes.includes(specs.memoryType)) return false;
            if (capacities.length > 0 && !capacities.includes(specs.capacity)) return false;
            
            const rSpeed = specs.speed || 0;
            if (minRamSpeed > RAM_MIN_SPEED && rSpeed < minRamSpeed) return false;
            if (maxRamSpeed < RAM_MAX_SPEED && rSpeed > maxRamSpeed) return false;
            
            const cl = specs.casLatency || 0;
            if (maxCasLatency < RAM_MAX_CAS && cl > maxCasLatency) return false;
            
            if (modules.length > 0 && !modules.includes(specs.modules)) return false;
          }

          if (specs.type === 'primary_storage' || specs.type === 'storage' || specs.type === 'additional_storage') {
            if (storageInterfaces.length > 0 && !storageInterfaces.includes(specs.interface)) return false;
            if (storageCapacities.length > 0 && !storageCapacities.includes(specs.capacity)) return false;
            if (storageTypes.length > 0 && !storageTypes.includes(specs.storageType)) return false;
            if (storageFormFactors.length > 0 && !storageFormFactors.includes(specs.formFactor)) return false;

            const readSpeed = specs.readSpeed || 0;
            if (minReadSpeed > STORAGE_MIN_READ_SPEED && readSpeed < minReadSpeed) return false;
            if (maxReadSpeed < STORAGE_MAX_READ_SPEED && readSpeed > maxReadSpeed) return false;
          }

          if (specs.type === 'psu') {
            const wattage = specs.wattage || 0;
            if (minWattage > PSU_MIN_WATTAGE && wattage < minWattage) return false;
            if (maxWattage < PSU_MAX_WATTAGE && wattage > maxWattage) return false;
            if (psuEfficiencies.length > 0 && !psuEfficiencies.includes(specs.efficiency)) return false;
            if (psuModularities.length > 0 && !psuModularities.includes(specs.modular)) return false;
            if (psuFormFactors.length > 0 && !psuFormFactors.includes(specs.formFactor)) return false;
          }

          if (specs.type === 'case') {
            if (caseFormFactors.length > 0 && !caseFormFactors.includes(specs.formFactor)) return false;
            if (caseMaxMainboards.length > 0 && !caseMaxMainboards.includes(specs.maxMainboard)) return false;
            if (caseColors.length > 0 && !caseColors.includes(specs.color)) return false;
            if (caseSidePanels.length > 0 && !caseSidePanels.includes(specs.sidePanel)) return false;
          }

          if (specs.type === 'cooler') {
            if (coolerTypes.length > 0 && !coolerTypes.includes(specs.coolerType)) return false;
            if (coolerRadiatorSizes.length > 0 && !coolerRadiatorSizes.includes(specs.radiatorSize)) return false;
            if (coolerColors.length > 0 && !coolerColors.includes(specs.color)) return false;
            if (sockets.length > 0 && (!specs.compatibleSockets || !specs.compatibleSockets.some((s: string) => sockets.includes(s)))) return false;
            if (specs.maxNoise > maxCoolerNoise || (specs.minNoise || specs.maxNoise) < minCoolerNoise) return false;
            if (specs.coolerType === 'Air' && (specs.height > maxCoolerHeight || specs.height < minCoolerHeight)) return false;
          }
        } catch {
          // ignore parsing errs
        }
        return true;
      });
    }

    if (sort === 'cores_desc') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered.sort((a: any, b: any) => {
        const specsA = JSON.parse(a.specsJson || '{}');
        const specsB = JSON.parse(b.specsJson || '{}');
        return (specsB.cores || 0) - (specsA.cores || 0);
      });
    } else if (sort === 'speed_desc') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered.sort((a: any, b: any) => {
        const specsA = JSON.parse(a.specsJson || '{}');
        const specsB = JSON.parse(b.specsJson || '{}');
        return (specsB.speedGhz || 0) - (specsA.speedGhz || 0);
      });
    } else if (sort === 'tdp_desc') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered.sort((a: any, b: any) => {
        const specsA = JSON.parse(a.specsJson || '{}');
        const specsB = JSON.parse(b.specsJson || '{}');
        return (specsB.tdp || 0) - (specsA.tdp || 0);
      });
    } else if (sort === 'vram_desc') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered.sort((a: any, b: any) => {
        const specsA = JSON.parse(a.specsJson || '{}');
        const specsB = JSON.parse(b.specsJson || '{}');
        const vramA = specsA.memory ? parseInt(specsA.memory) : 0;
        const vramB = specsB.memory ? parseInt(specsB.memory) : 0;
        return vramB - vramA;
      });
    } else if (sort === 'psu_desc') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered.sort((a: any, b: any) => {
        const specsA = JSON.parse(a.specsJson || '{}');
        const specsB = JSON.parse(b.specsJson || '{}');
        return (specsB.recommendedPsu || 0) - (specsA.recommendedPsu || 0);
      });
    } else if (sort === 'length_desc') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered.sort((a: any, b: any) => {
        const specsA = JSON.parse(a.specsJson || '{}');
        const specsB = JSON.parse(b.specsJson || '{}');
        const lenA = specsA.lengthMm || 0;
        const lenB = specsB.lengthMm || 0;
        return lenB - lenA;
      });
    } else if (sort === 'length_asc') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered.sort((a: any, b: any) => {
        const specsA = JSON.parse(a.specsJson || '{}');
        const specsB = JSON.parse(b.specsJson || '{}');
        const lenA = specsA.lengthMm || 0;
        const lenB = specsB.lengthMm || 0;
        return lenA - lenB;
      });
    } else if (sort === 'memory_slots_desc') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered.sort((a: any, b: any) => {
        const specsA = JSON.parse(a.specsJson || '{}');
        const specsB = JSON.parse(b.specsJson || '{}');
        return (specsB.memorySlots || 0) - (specsA.memorySlots || 0);
      });
    } else if (sort === 'cores_desc') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered.sort((a: any, b: any) => {
        const specsA = JSON.parse(a.specsJson || '{}');
        const specsB = JSON.parse(b.specsJson || '{}');
        return (specsB.cores || 0) - (specsA.cores || 0);
      });
    } else if (sort === 'speed_desc') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered.sort((a: any, b: any) => {
        const specsA = JSON.parse(a.specsJson || '{}');
        const specsB = JSON.parse(b.specsJson || '{}');
        return (specsB.speedGhz || 0) - (specsA.speedGhz || 0);
      });
    } else if (sort === 'tdp_desc') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered.sort((a: any, b: any) => {
        const specsA = JSON.parse(a.specsJson || '{}');
        const specsB = JSON.parse(b.specsJson || '{}');
        return (specsB.tdp || 0) - (specsA.tdp || 0);
      });
    } else if (sort === 'vram_desc') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered.sort((a: any, b: any) => {
        const specsA = JSON.parse(a.specsJson || '{}');
        const specsB = JSON.parse(b.specsJson || '{}');
        return (specsB.memoryGb || 0) - (specsA.memoryGb || 0);
      });
    } else if (sort === 'psu_desc') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered.sort((a: any, b: any) => {
        const specsA = JSON.parse(a.specsJson || '{}');
        const specsB = JSON.parse(b.specsJson || '{}');
        return (specsB.recommendedPsu || 0) - (specsA.recommendedPsu || 0);
      });
    } else if (sort === 'max_memory_desc') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered.sort((a: any, b: any) => {
        const specsA = JSON.parse(a.specsJson || '{}');
        const specsB = JSON.parse(b.specsJson || '{}');
        return (specsB.maxMemory || 0) - (specsA.maxMemory || 0);
      });
    } else if (sort === 'ram_speed_desc') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered.sort((a: any, b: any) => {
        const specsA = JSON.parse(a.specsJson || '{}');
        const specsB = JSON.parse(b.specsJson || '{}');
        return (specsB.speed || 0) - (specsA.speed || 0);
      });
    } else if (sort === 'ram_capacity_desc') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered.sort((a: any, b: any) => {
        const specsA = JSON.parse(a.specsJson || '{}');
        const specsB = JSON.parse(b.specsJson || '{}');
        return (specsB.capacity || 0) - (specsA.capacity || 0);
      });
    } else if (sort === 'cas_latency_asc') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered.sort((a: any, b: any) => {
        const specsA = JSON.parse(a.specsJson || '{}');
        const specsB = JSON.parse(b.specsJson || '{}');
        return (specsA.casLatency || 999) - (specsB.casLatency || 999);
      });
    } else if (sort === 'storage_capacity_desc') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered.sort((a: any, b: any) => {
        const specsA = JSON.parse(a.specsJson || '{}');
        const specsB = JSON.parse(b.specsJson || '{}');
        return (specsB.capacity || 0) - (specsA.capacity || 0);
      });
    } else if (sort === 'read_speed_desc') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered.sort((a: any, b: any) => {
        const specsA = JSON.parse(a.specsJson || '{}');
        const specsB = JSON.parse(b.specsJson || '{}');
        return (specsB.readSpeed || 0) - (specsA.readSpeed || 0);
      });
    } else if (sort === 'wattage_desc') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered.sort((a: any, b: any) => {
        const specsA = JSON.parse(a.specsJson || '{}');
        const specsB = JSON.parse(b.specsJson || '{}');
        return (specsB.wattage || 0) - (specsA.wattage || 0);
      });
    } else if (sort === 'cooler_noise_asc') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered.sort((a: any, b: any) => {
        const specsA = JSON.parse(a.specsJson || '{}');
        const specsB = JSON.parse(b.specsJson || '{}');
        return (specsA.minNoise || 999) - (specsB.minNoise || 999);
      });
    } else if (sort === 'cooler_height_asc') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered.sort((a: any, b: any) => {
        const specsA = JSON.parse(a.specsJson || '{}');
        const specsB = JSON.parse(b.specsJson || '{}');
        return (specsA.height || 999) - (specsB.height || 999);
      });
    }

    return NextResponse.json(filtered);
  } catch (error: unknown) {
    if (error instanceof Error) {
       console.error("Products API Error:", error.message);
    }
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
