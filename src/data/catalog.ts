import { Product } from '../types';

export const CATALOG_PRODUCTS: Product[] = [
  {
    sku: 'RAC-ELEC-001',
    title: 'AuraPods Pro ANC Earbuds',
    category: 'electronics',
    price_inr: 3499.0,
    stock_quantity: 42,
    description: 'True wireless earbuds with 42dB Active Noise Cancellation, spatial audio, and 36-hour total battery life.',
    specs: {
      driver: '11mm Dynamic Bass Boost',
      connectivity: 'Bluetooth 5.3',
      battery: '36 hrs with case (USB-C Fast Charge)',
      water_resistance: 'IPX5 water & sweat resistant',
      color: 'Matte Obsidian Black'
    }
  },
  {
    sku: 'RAC-ELEC-002',
    title: 'NovaTrack Smart Fitness Watch 2',
    category: 'electronics',
    price_inr: 2999.0,
    stock_quantity: 28,
    description: '1.78-inch AMOLED display smartwatch with continuous SpO2, 24/7 heart rate monitoring, and 100+ sports modes.',
    specs: {
      display: '1.78-inch AMOLED 368x448, 600 nits',
      sensors: 'Optical Heart Rate, SpO2, Accelerometer',
      battery_life: 'Up to 10 days standard usage',
      strap: 'Liquid Silicone 22mm Quick-Release',
      color: 'Titanium Grey'
    }
  },
  {
    sku: 'RAC-ELEC-003',
    title: 'VoltBeam 65W GaN Fast Charger',
    category: 'electronics',
    price_inr: 1899.0,
    stock_quantity: 75,
    description: 'Ultra-compact 3-port GaN III wall charger capable of powering MacBooks, iPads, and iPhones simultaneously.',
    specs: {
      ports: '2x USB-C (PD 3.0), 1x USB-A (QC 4.0)',
      max_output: '65W Max Power Delivery',
      protection: 'Over-voltage, thermal throttling protection',
      dimensions: '42 x 36 x 32 mm (110g)',
      color: 'Glacier White'
    }
  },
  {
    sku: 'RAC-ELEC-004',
    title: 'SonicPulse 24W Bluetooth Speaker',
    category: 'electronics',
    price_inr: 2499.0,
    stock_quantity: 18,
    description: 'Dual passive radiators delivering room-filling 360-degree sound with custom EQ and 18-hour playtime.',
    specs: {
      audio_power: '24W RMS Stereo Output',
      playtime: '18 hours at 60% volume',
      pairing: 'TWS Dual-Speaker Pairing',
      rating: 'IPX7 Full Submersion Waterproof',
      color: 'Forest Camo'
    }
  },
  {
    sku: 'RAC-ELEC-005',
    title: 'AeroCharge MagSafe 10000mAh Power Bank',
    category: 'electronics',
    price_inr: 2299.0,
    stock_quantity: 35,
    description: 'Slim magnetic wireless power bank with strong N52 neodymium magnets and 20W bidirectional wired charging.',
    specs: {
      capacity: '10000mAh (37Wh Li-Polymer)',
      wireless_output: '15W Max MagSafe compatible',
      wired_output: '20W PD Type-C In/Out',
      weight: '195 grams',
      color: 'Graphite Black'
    }
  },
  {
    sku: 'RAC-APPR-001',
    title: 'Supima Classic Heavyweight Tee',
    category: 'apparel',
    price_inr: 999.0,
    stock_quantity: 120,
    description: '240 GSM 100% American Supima combed cotton t-shirt with bio-washed anti-pilling finish and relaxed drop-shoulder cut.',
    specs: {
      fabric: '100% Long-Staple Supima Cotton',
      gsm: '240 GSM Heavyweight Jersey',
      fit: 'Relaxed Boxy Fit',
      care: 'Machine wash cold, air dry flat',
      sizes_available: 'S, M, L, XL, XXL'
    }
  },
  {
    sku: 'RAC-APPR-002',
    title: 'Apex Minimalist Fleece Hoodie',
    category: 'apparel',
    price_inr: 2199.0,
    stock_quantity: 50,
    description: 'French terry fleece pullover featuring double-layered hood, hidden kangaroo zip security pocket, and ribbed cuffs.',
    specs: {
      material: '80% Organic Cotton, 20% Recycled Poly',
      weight: '380 GSM Brushed Interior',
      features: 'Concealed YKK tech zip pocket',
      color: 'Charcoal Melange',
      sizes_available: 'M, L, XL'
    }
  },
  {
    sku: 'RAC-APPR-003',
    title: 'CommutePro Water-Repellent Cargo Pants',
    category: 'apparel',
    price_inr: 2799.0,
    stock_quantity: 30,
    description: 'Technical 4-way stretch utility pants with DWR coating, articulated knee panels, and 6 functional tactical pockets.',
    specs: {
      fabric: '92% Ripstop Nylon, 8% Spandex',
      coating: 'Fluorocarbon-free DWR water repellent',
      closure: 'Cobrax snap button with internal drawstring',
      pockets: '6 ergonomics pockets with RFID protection',
      color: 'Olive Drab'
    }
  },
  {
    sku: 'RAC-APPR-004',
    title: 'CloudLoft Merino Wool Beanie',
    category: 'apparel',
    price_inr: 799.0,
    stock_quantity: 65,
    description: '100% Australian Merino wool rib-knit watch cap offering natural thermal regulation and itch-free comfort.',
    specs: {
      yarn: '100% Extra-fine Merino Wool (19.5 micron)',
      knit: '7-gauge fisherman rib knit',
      odor_resistance: 'Naturally antimicrobial & breathable',
      color: 'Oatmeal Heather',
      size: 'One Size Fits All (Stretchy)'
    }
  },
  {
    sku: 'RAC-APPR-005',
    title: 'UrbanShield 26L Waterproof Roll-Top Backpack',
    category: 'apparel',
    price_inr: 3299.0,
    stock_quantity: 22,
    description: 'Ergonomic commuter backpack constructed from 900D ballistic cordura with dedicated 16-inch suspended laptop cradle.',
    specs: {
      capacity: '26 Liters expandable roll-top',
      laptop_sleeve: 'Suspended padded slot fits up to 16" MacBook',
      hardware: 'Fidlock magnetic quick-release buckles',
      harness: 'EVA moulded ventilated back channel',
      color: 'Stealth Black'
    }
  },
  {
    sku: 'RAC-HOME-001',
    title: 'BaristaPro Precision Gooseneck Kettle',
    category: 'home',
    price_inr: 3899.0,
    stock_quantity: 15,
    description: 'Electric pour-over kettle with 1-degree temperature adjustment, real-time LCD display, and 60-minute keep-warm mode.',
    specs: {
      capacity: '0.9 Liters',
      heating_element: '1200W Strix Rapid Heating Core',
      spout: 'Counterbalanced 0.8cm precision gooseneck',
      material: 'Food-grade 304 Stainless Steel',
      finish: 'Matte Black with Walnut Handle'
    }
  },
  {
    sku: 'RAC-HOME-002',
    title: 'AromaLoom Ultrasonic Ceramic Diffuser',
    category: 'home',
    price_inr: 1699.0,
    stock_quantity: 40,
    description: 'Handcrafted bisque ceramic essential oil diffuser with ambient warm-halo LED glow and whisper-quiet ultrasonic mist.',
    specs: {
      tank_capacity: '180 ml (up to 8 hours run time)',
      coverage: 'Up to 300 sq. ft. room size',
      noise_level: '< 20 dB quiet operation',
      auto_off: 'Waterless shutoff sensor',
      finish: 'Artisanal Terracotta Ceramic'
    }
  },
  {
    sku: 'RAC-HOME-003',
    title: 'LuxeWeave Bamboo Cotton Bedsheet Set',
    category: 'home',
    price_inr: 2599.0,
    stock_quantity: 25,
    description: '400 thread count blend of organic bamboo viscose and long-staple cotton with silky drape and hypoallergenic cool touch.',
    specs: {
      composition: '60% Organic Bamboo, 40% Long-Staple Cotton',
      thread_count: '400 TC Sateen Weave',
      includes: '1 Fitted Sheet, 1 Flat Sheet, 2 Pillowcases',
      fit_depth: 'Deep pockets fit mattresses up to 16"',
      color: 'Sage Mist'
    }
  },
  {
    sku: 'RAC-HOME-004',
    title: 'ChefForge 3-Ply Clad Stainless Steel Skillet 26cm',
    category: 'home',
    price_inr: 2199.0,
    stock_quantity: 33,
    description: 'Professional tri-ply frypan with aluminum core sandwiched between 18/10 stainless steel for uniform thermal conductivity.',
    specs: {
      construction: 'Tri-Ply (SS 304 - Aluminum - SS 430 Induction)',
      compatibility: 'Gas, Induction, Electric, Oven safe to 260°C',
      handle: 'Stay-cool hollow cast stainless handle',
      diameter: '26 cm / 10.2 inch',
      coating: '100% Toxin-Free Uncoated Stainless'
    }
  },
  {
    sku: 'RAC-HOME-005',
    title: 'Nordic Wood & Steel Ergonomic Monitor Stand',
    category: 'home',
    price_inr: 1499.0,
    stock_quantity: 45,
    description: 'Solid walnut timber desk riser on matte powder-coated steel legs with integrated cable management slot and keyboard tuck.',
    specs: {
      dimensions: '52 x 22 x 9.5 cm',
      weight_capacity: 'Supports up to 25 kg (dual displays or iMac)',
      timber: 'FSC-certified solid American Walnut',
      base: 'Laser-cut 2mm steel with cork scratch pads',
      clearance: 'Underneath 7.5cm clearance for full keyboard'
    }
  }
];
