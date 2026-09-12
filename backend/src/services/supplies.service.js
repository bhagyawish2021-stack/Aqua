'use strict';

const CATEGORIES = [
  {
    id: 'probiotics',
    name: 'Probiotics',
    telugu: 'ప్రోబయోటిక్స్',
    icon: '🦠',
    description: 'Beneficial bacterial strains (Bacillus, Nitrosomonas) for benthic sludge reduction and gut flora balance.'
  },
  {
    id: 'water_treatment',
    name: 'Water-treatment products',
    telugu: 'నీటి శుద్ధి రసాయనాలు',
    icon: '💧',
    description: 'Dissolved oxygen boosters, zeolite, ammonia binders, and alkalinity buffers.'
  },
  {
    id: 'disinfectants',
    name: 'Disinfectants',
    telugu: 'క్రిమిసంహారకాలు',
    icon: '🛡️',
    description: 'Regulated bio-iodine, potassium monopersulfate, and pond sanitizers for pathogen control.'
  },
  {
    id: 'supplements',
    name: 'Supplements',
    telugu: 'ఖనిజ మరియు విటమిన్ పోషకాలు',
    icon: '🧪',
    description: 'Ionic calcium, magnesium, potassium formulations for post-molt exoskeleton hardening.'
  },
  {
    id: 'feed_additives',
    name: 'Feed additives',
    telugu: 'దాణా సంకలనాలు & బైండర్లు',
    icon: '🌾',
    description: 'Nutritional gel binders, hepatopancreas tonics, gut acidifiers, and digestive enzymes.'
  },
  {
    id: 'farm_hygiene',
    name: 'Farm hygiene products',
    telugu: 'ఫామ్ బయోసెక్యూరిటీ పరిశుభ్రత',
    icon: '🧼',
    description: 'Foot-dip sanitizers, bird-net cleaners, aeration paddlewheel disinfectants.'
  },
  {
    id: 'approved_health',
    name: 'Approved aquaculture health products',
    telugu: 'ఆమోదిత ఆక్వా ఆరోగ్య ఉత్పత్తులు',
    icon: '✨',
    description: 'Botanical stress relievers, beta-glucan immunostimulants, and CAA-registered natural wellness tonics.'
  },
  {
    id: 'other_supplies',
    name: 'Other farm supplies',
    telugu: 'ఇతర ఆక్వా పరికరాలు & టెస్ట్ కిట్లు',
    icon: '📦',
    description: 'Pond water testing titration reagents, dissolved oxygen test kits, Secchi discs, and sampling nets.'
  }
];

// Pre-seeded legally permitted aquaculture products with manufacturer guidelines
let products = [
  {
    id: 'prod-001',
    seller_id: 'seller-godavari-01',
    seller_name: 'Godavari Aqua Health Depot',
    seller_location: 'Bhimavaram, West Godavari',
    seller_rating: 4.92,
    seller_contact: '+91 98480 11223',
    name: 'EcoBact Pro-Soil Probiotic',
    category: 'probiotics',
    category_label: 'Probiotics',
    manufacturer: 'Novozymes BioAg India / Approved by CAA',
    brand_name: 'EcoBact',
    purpose: 'Rapid digestion of black pond benthic sludge, decomposition of excess organic waste, and reduction of toxic H2S/Ammonia.',
    target_species: ['Vannamei Shrimp', 'Black Tiger Shrimp', 'Tilapia'],
    composition_active_ingredients: 'Consortium of Bacillus subtilis, Bacillus licheniformis, Bacillus megaterium (Minimum 5 x 10^9 CFU/g).',
    dosage_guidelines: 'Culture days 1-30: 500g per hectare every 10 days. Culture days 31-90: 1kg per hectare weekly. Aerate thoroughly during application.',
    application_method: 'Mix 1 kg with 20L pond water and 2kg jaggery. Ferment for 2 hours with gentle aeration, then broadcast uniformly across pond surface at 08:00 AM.',
    safety_precautions: '100% biological. Non-toxic to aquatic fauna. Store in cool, dry location away from direct sunlight.',
    withdrawal_period_days: 0,
    caa_or_govt_approval_no: 'CAA/REG/PROB/2023/0488',
    requires_professional_guidance: false,
    guidance_warning_note: null,
    price: 1350,
    unit: '1 kg container',
    stock_quantity: 48,
    is_in_stock: true,
    batch_number: 'EBP-2026-08',
    manufacture_date: '2026-06-15',
    expiry_date: '2028-06-14',
    image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80',
    rating: 4.95,
    reviews_count: 36,
    status: 'active',
    created_at: '2026-07-01T10:00:00Z',
    updated_at: '2026-07-01T10:00:00Z'
  },
  {
    id: 'prod-002',
    seller_id: 'seller-godavari-01',
    seller_name: 'Godavari Aqua Health Depot',
    seller_location: 'Bhimavaram, West Godavari',
    seller_rating: 4.92,
    seller_contact: '+91 98480 11223',
    name: 'OxyGran Emergency Oxygen Granules',
    category: 'water_treatment',
    category_label: 'Water-treatment products',
    manufacturer: 'Apex Aqua Technologies / MPEDA Registered',
    brand_name: 'OxyGran',
    purpose: 'Instant bottom oxygen enrichment during sudden hypoxia, cloudy weather, power failure, or pre-dawn drop in DO.',
    target_species: ['Vannamei Shrimp', 'Tiger Prawn', 'Catla', 'Rohu', 'Seabass'],
    composition_active_ingredients: 'Coated Sodium Percarbonate granules liberating active nascent oxygen at benthic layer (Available Oxygen >= 13.5%).',
    dosage_guidelines: 'Emergency hypoxia: 2 kg to 3 kg per acre. Routine maintenance: 1 kg per acre every 4 days during peak biomass.',
    application_method: 'Broadcast directly over bottom areas where shrimp congregate or near aerator dead zones.',
    safety_precautions: 'Do not touch with wet hands. Keep away from combustible materials. Wear protective gloves when handling.',
    withdrawal_period_days: 0,
    caa_or_govt_approval_no: 'CAA/REG/WAT/2024/0112',
    requires_professional_guidance: false,
    guidance_warning_note: null,
    price: 980,
    unit: '5 kg bucket',
    stock_quantity: 65,
    is_in_stock: true,
    batch_number: 'OXG-26-09A',
    manufacture_date: '2026-07-01',
    expiry_date: '2027-12-31',
    image_url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80',
    rating: 4.88,
    reviews_count: 42,
    status: 'active',
    created_at: '2026-07-05T12:00:00Z',
    updated_at: '2026-07-05T12:00:00Z'
  },
  {
    id: 'prod-003',
    seller_id: 'seller-nellore-02',
    seller_name: 'Coastal Biosecurity & Feed Center',
    seller_location: 'Nellore, Andhra Pradesh',
    seller_rating: 4.85,
    seller_contact: '+91 94400 22334',
    name: 'AquaGuard PVP-Iodine 20% Complex',
    category: 'disinfectants',
    category_label: 'Disinfectants',
    manufacturer: 'VetCare India Aquatic Biocides / Drug License Compliant',
    brand_name: 'AquaGuard',
    purpose: 'Broad-spectrum water sanitization against external protozoans, Vibrio parahaemolyticus bacteria, and gill fouling microorganisms.',
    target_species: ['Vannamei Shrimp', 'Tiger Prawn', 'Finfish'],
    composition_active_ingredients: 'Polyvinylpyrrolidone-Iodine complex yielding 20% available elemental iodine in aqueous vehicle.',
    dosage_guidelines: '1 Litre to 1.5 Litres per hectare in 1 metre water depth. Do NOT exceed 2 Litres per hectare under high temperature.',
    application_method: 'Dilute 1 Litre of AquaGuard in 50 Litres of pond water. Broadcast evenly during sunny morning with aerators running for 1 hour.',
    safety_precautions: 'Corrosive in concentrate form. Avoid contact with eyes and skin. Do not apply during active molting period or within 48 hours of probiotic inoculation.',
    withdrawal_period_days: 3,
    caa_or_govt_approval_no: 'CAA/REG/DIS/2022/0781',
    requires_professional_guidance: true,
    guidance_warning_note: '⚠️ Professional Guidance Required: Iodine applications may stress freshly molted shrimp or strip natural plankton blooms. Consult an aquaculture pathologist or verify molting cycle before dosage.',
    price: 850,
    unit: '1 Litre bottle',
    stock_quantity: 32,
    is_in_stock: true,
    batch_number: 'AGI-2026-03',
    manufacture_date: '2026-05-10',
    expiry_date: '2028-05-09',
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    rating: 4.79,
    reviews_count: 28,
    status: 'active',
    created_at: '2026-07-08T09:30:00Z',
    updated_at: '2026-07-08T09:30:00Z'
  },
  {
    id: 'prod-004',
    seller_id: 'seller-godavari-01',
    seller_name: 'Godavari Aqua Health Depot',
    seller_location: 'Bhimavaram, West Godavari',
    seller_rating: 4.92,
    seller_contact: '+91 98480 11223',
    name: 'MinerHard Ultra Ionic Mineral Matrix',
    category: 'supplements',
    category_label: 'Supplements',
    manufacturer: 'Marine Nutritional Systems / CAA Approved',
    brand_name: 'MinerHard',
    purpose: 'Replenishes essential bioavailable Calcium, Magnesium, and Potassium to prevent soft-shell syndrome and promote synchronous hardening.',
    target_species: ['Vannamei Shrimp', 'Black Tiger Shrimp', 'Mud Crab'],
    composition_active_ingredients: 'Chelated Magnesium (11%), Calcium (24%), Potassium (8%), Phosphorus (3%), Zinc & Selenium trace ions.',
    dosage_guidelines: 'Pond water application: 10 kg to 15 kg per hectare during full moon and new moon molting phases. Feed top dressing: 10g per kg of feed.',
    application_method: 'Dissolve in pond water and broadcast across edges 24 hours prior to anticipated peak molting.',
    safety_precautions: 'Safe eco-friendly mineral salts. Keep sack tightly tied to prevent moisture absorption.',
    withdrawal_period_days: 0,
    caa_or_govt_approval_no: 'CAA/REG/MIN/2023/0942',
    requires_professional_guidance: false,
    guidance_warning_note: null,
    price: 1850,
    unit: '25 kg bag',
    stock_quantity: 40,
    is_in_stock: true,
    batch_number: 'MHR-2026-11',
    manufacture_date: '2026-08-01',
    expiry_date: '2028-07-31',
    image_url: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=800&q=80',
    rating: 4.93,
    reviews_count: 51,
    status: 'active',
    created_at: '2026-07-12T14:00:00Z',
    updated_at: '2026-07-12T14:00:00Z'
  },
  {
    id: 'prod-005',
    seller_id: 'seller-nellore-02',
    seller_name: 'Coastal Biosecurity & Feed Center',
    seller_location: 'Nellore, Andhra Pradesh',
    seller_rating: 4.85,
    seller_contact: '+91 94400 22334',
    name: 'HepaShield Herbal Hepatopancreas Tonic & Binder',
    category: 'feed_additives',
    category_label: 'Feed additives',
    manufacturer: 'AyurAqua Bioceuticals / MPEDA Registered',
    brand_name: 'HepaShield',
    purpose: 'Protects shrimp hepatopancreas against feed mycotoxins, stimulates digestive lipid absorption, and binds therapeutic additives to pelleted feed.',
    target_species: ['Vannamei Shrimp', 'Monodon', 'Asian Seabass', 'Murrel'],
    composition_active_ingredients: 'Andrographis paniculata, Phyllanthus niruri extract, Silymarin, fortified with natural alginate gel binder.',
    dosage_guidelines: '15ml to 20ml per kg of commercial pelleted feed for 7 consecutive days, twice a month.',
    application_method: 'Coat pellets uniformly with HepaShield liquid. Air dry in shade for 20 minutes before broadcasting to pond.',
    safety_precautions: '100% botanical extract. Zero antibiotic residues. Shake well before use.',
    withdrawal_period_days: 0,
    caa_or_govt_approval_no: 'CAA/REG/FAD/2024/0315',
    requires_professional_guidance: false,
    guidance_warning_note: null,
    price: 720,
    unit: '1 Litre bottle',
    stock_quantity: 55,
    is_in_stock: true,
    batch_number: 'HPS-2026-04',
    manufacture_date: '2026-07-15',
    expiry_date: '2028-07-14',
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    rating: 4.90,
    reviews_count: 23,
    status: 'active',
    created_at: '2026-07-15T11:00:00Z',
    updated_at: '2026-07-15T11:00:00Z'
  },
  {
    id: 'prod-006',
    seller_id: 'seller-kakinada-03',
    seller_name: 'Eastern Delta Farm Supplies',
    seller_location: 'Kakinada, East Godavari',
    seller_rating: 4.88,
    seller_contact: '+91 98850 44556',
    name: 'Peroxisan Farm & Gear Sterilizer',
    category: 'farm_hygiene',
    category_label: 'Farm hygiene products',
    manufacturer: 'SterilTech Sanitation Systems',
    brand_name: 'Peroxisan',
    purpose: 'Sterilization of dip nets, sampling trays, harvesting nets, boot wash basins, and aerator paddlewheels to prevent viral cross-contamination.',
    target_species: ['Biosecurity Equipment & Farm Facilities'],
    composition_active_ingredients: 'Buffered Peracetic Acid (15%) + Hydrogen Peroxide (23%) equilibrium solution.',
    dosage_guidelines: 'Disinfection baths: Dilute 50ml in 10 Litres of water. Surface spray: Dilute 20ml in 10 Litres of water.',
    application_method: 'Dip nets for 5 minutes and air dry. Spray aerator frame and floats between crop cycles.',
    safety_precautions: 'Corrosive. Wear rubber gloves and goggles during dilution. Do NOT pour concentrated liquid directly into culture water containing live stock.',
    withdrawal_period_days: 0,
    caa_or_govt_approval_no: 'CAA/REG/HYG/2023/1105',
    requires_professional_guidance: true,
    guidance_warning_note: '⚠️ Biosecurity Precaution: Strong oxidizing agent designed strictly for equipment and facility sanitation. Do not apply directly to stocked pond water without specialist clearance.',
    price: 640,
    unit: '1 Litre can',
    stock_quantity: 24,
    is_in_stock: true,
    batch_number: 'PXS-2026-09',
    manufacture_date: '2026-06-01',
    expiry_date: '2027-11-30',
    image_url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80',
    rating: 4.82,
    reviews_count: 17,
    status: 'active',
    created_at: '2026-07-20T16:00:00Z',
    updated_at: '2026-07-20T16:00:00Z'
  },
  {
    id: 'prod-007',
    seller_id: 'seller-godavari-01',
    seller_name: 'Godavari Aqua Health Depot',
    seller_location: 'Bhimavaram, West Godavari',
    seller_rating: 4.92,
    seller_contact: '+91 98480 11223',
    name: 'ImmunoStim Beta-Glucan & Vit-C Complex',
    category: 'approved_health',
    category_label: 'Approved aquaculture health products',
    manufacturer: 'Adisseo Aquatic Nutrition / Approved Formulation',
    brand_name: 'ImmunoStim',
    purpose: 'Activates hemocyte prophenoloxidase immune cascade, bolsters resistance against white spot syndrome virus (WSSV), and counters environmental stress.',
    target_species: ['Vannamei Shrimp', 'Tiger Prawn', 'Freshwater Scampi'],
    composition_active_ingredients: 'Purified Yeast 1,3/1,6 Beta-Glucan (50%), Stay-C Phosphorylated Vitamin C (30%), Vitamin E (5%).',
    dosage_guidelines: '5g to 8g per kg of feed administered during transition weather, low salinity swings, or surrounding farm disease outbreaks.',
    application_method: 'Mix with feed binder gel, coat pellets thoroughly, and feed once daily in morning ration.',
    safety_precautions: '100% natural nutritional immunostimulant. No withdrawal period or export restrictions.',
    withdrawal_period_days: 0,
    caa_or_govt_approval_no: 'CAA/REG/HLT/2024/0277',
    requires_professional_guidance: false,
    guidance_warning_note: null,
    price: 1450,
    unit: '1 kg jar',
    stock_quantity: 38,
    is_in_stock: true,
    batch_number: 'IMS-26-07',
    manufacture_date: '2026-07-10',
    expiry_date: '2028-07-09',
    image_url: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=80',
    rating: 4.96,
    reviews_count: 45,
    status: 'active',
    created_at: '2026-07-25T10:30:00Z',
    updated_at: '2026-07-25T10:30:00Z'
  },
  {
    id: 'prod-008',
    seller_id: 'seller-kakinada-03',
    seller_name: 'Eastern Delta Farm Supplies',
    seller_location: 'Kakinada, East Godavari',
    seller_rating: 4.88,
    seller_contact: '+91 98850 44556',
    name: 'AquaMaster DO & Ammonia Titration Kit',
    category: 'other_supplies',
    category_label: 'Other farm supplies',
    manufacturer: 'Chemetrics Scientific Supplies / ISO 9001 Certified',
    brand_name: 'AquaMaster',
    purpose: 'Field-level colorimetric and drop-titration analysis for Dissolved Oxygen (Winkler method) and Total Ammonia Nitrogen (TAN).',
    target_species: ['All Aquaculture Ponds'],
    composition_active_ingredients: 'Manganese sulfate, Alkaline iodide-azide, Sulfuric acid, Starch indicator, Nessler reagent (100 tests each).',
    dosage_guidelines: 'Perform water testing twice daily: 05:30 AM (pre-dawn DO minimum) and 03:00 PM (peak pH/ammonia).',
    application_method: 'Follow calibrated test tube instructions. Collect subsurface pond sample (30cm depth).',
    safety_precautions: 'Contains analytical acid and alkali reagents. Keep out of reach of children. Wear nitrile gloves when handling.',
    withdrawal_period_days: 0,
    caa_or_govt_approval_no: 'CAA/REG/KIT/2022/0199',
    requires_professional_guidance: false,
    guidance_warning_note: null,
    price: 2100,
    unit: 'Complete Box (100 Tests)',
    stock_quantity: 19,
    is_in_stock: true,
    batch_number: 'AMK-2026-10',
    manufacture_date: '2026-05-20',
    expiry_date: '2028-05-19',
    image_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
    rating: 4.89,
    reviews_count: 31,
    status: 'active',
    created_at: '2026-07-28T15:00:00Z',
    updated_at: '2026-07-28T15:00:00Z'
  }
];

// Initial farm supplies orders
let orders = [
  {
    id: 'ord-1001',
    order_number: 'AQM-SUP-882341',
    farmer_id: 'farmer-demo',
    farmer_name: 'Ravi Kumar',
    farmer_phone: '+91 98480 12345',
    delivery_address: 'Survey No. 44, Near Godavari Canal, Undi Road',
    district: 'West Godavari',
    state: 'Andhra Pradesh',
    items: [
      {
        product_id: 'prod-001',
        product_name: 'EcoBact Pro-Soil Probiotic',
        category: 'probiotics',
        unit_price: 1350,
        quantity: 2,
        subtotal: 2700,
        seller_id: 'seller-godavari-01'
      },
      {
        product_id: 'prod-004',
        product_name: 'MinerHard Ultra Ionic Mineral Matrix',
        category: 'supplements',
        unit_price: 1850,
        quantity: 1,
        subtotal: 1850,
        seller_id: 'seller-godavari-01'
      }
    ],
    subtotal_amount: 4550,
    shipping_fee: 0,
    total_amount: 4550,
    payment_method: 'cash_on_delivery',
    status: 'shipped',
    tracking_number: 'EKART-AP-992144',
    courier_partner: 'AquaLogistics Express',
    estimated_delivery_date: '2026-09-15',
    order_notes: 'Please deliver early morning to avoid peak sun.',
    created_at: '2026-09-10T11:20:00Z',
    updated_at: '2026-09-11T09:15:00Z'
  }
];

// Customer product reviews
let productReviews = [
  {
    id: 'rev-p-1',
    product_id: 'prod-001',
    farmer_id: 'farmer-demo',
    farmer_name: 'Srinivasa Rao',
    rating: 5,
    review_text: 'Excellent sludge reduction. Pond bottom was clean after 3 applications of EcoBact.',
    verified_purchase: true,
    created_at: '2026-08-20T14:30:00Z'
  },
  {
    id: 'rev-p-2',
    product_id: 'prod-004',
    farmer_id: 'farmer-demo',
    farmer_name: 'K. Venkatesh',
    rating: 5,
    review_text: 'MinerHard stopped our soft shell issue completely during new moon molt. Highly recommended!',
    verified_purchase: true,
    created_at: '2026-08-25T16:00:00Z'
  }
];

module.exports = {
  getCategories() {
    return CATEGORIES;
  },

  getProducts(filters = {}) {
    const {
      category,
      species,
      guidance_required,
      search,
      min_price,
      max_price,
      in_stock_only,
      seller_id,
      sort_by = 'rating'
    } = filters;

    let list = products.map(p => ({ ...p }));

    if (category && category !== 'all') {
      list = list.filter(p => p.category === category);
    }

    if (species && species !== 'all') {
      const spLower = species.toLowerCase();
      list = list.filter(p => p.target_species.some(s => s.toLowerCase().includes(spLower)));
    }

    if (guidance_required === 'true' || guidance_required === true) {
      list = list.filter(p => p.requires_professional_guidance === true);
    }

    if (seller_id) {
      list = list.filter(p => p.seller_id === seller_id);
    }

    if (in_stock_only === 'true' || in_stock_only === true) {
      list = list.filter(p => p.is_in_stock && p.stock_quantity > 0);
    }

    if (min_price) {
      list = list.filter(p => p.price >= parseFloat(min_price));
    }

    if (max_price) {
      list = list.filter(p => p.price <= parseFloat(max_price));
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand_name.toLowerCase().includes(q) ||
        p.manufacturer.toLowerCase().includes(q) ||
        p.purpose.toLowerCase().includes(q) ||
        p.category_label.toLowerCase().includes(q) ||
        p.composition_active_ingredients.toLowerCase().includes(q)
      );
    }

    if (sort_by === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sort_by === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sort_by === 'reviews') {
      list.sort((a, b) => b.reviews_count - a.reviews_count);
    } else {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  },

  getProductById(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return null;

    const reviews = productReviews.filter(r => r.product_id === productId);
    return {
      ...product,
      reviews
    };
  },

  createProduct(payload, sellerId = 'seller-godavari-01', sellerName = 'Aqua Mitra Authorized Vendor') {
    const categoryObj = CATEGORIES.find(c => c.id === payload.category);
    const categoryLabel = categoryObj ? categoryObj.name : 'Other farm supplies';

    const newProduct = {
      id: `prod-${Date.now()}`,
      seller_id: payload.seller_id || sellerId,
      seller_name: payload.seller_name || sellerName,
      seller_location: payload.seller_location || 'Andhra Pradesh',
      seller_rating: 4.90,
      seller_contact: payload.seller_contact || '+91 98480 00000',
      name: payload.name,
      category: payload.category,
      category_label: categoryLabel,
      manufacturer: payload.manufacturer,
      brand_name: payload.brand_name || payload.name.split(' ')[0],
      purpose: payload.purpose,
      target_species: Array.isArray(payload.target_species) ? payload.target_species : (payload.target_species ? [payload.target_species] : ['All Aquaculture']),
      composition_active_ingredients: payload.composition_active_ingredients || 'Government approved formulation',
      dosage_guidelines: payload.dosage_guidelines || 'Use strictly according to manufacturer label guidelines',
      application_method: payload.application_method || 'Broadcast evenly over water surface',
      safety_precautions: payload.safety_precautions || 'Store in dry shaded location away from children',
      withdrawal_period_days: parseInt(payload.withdrawal_period_days, 10) || 0,
      caa_or_govt_approval_no: payload.caa_or_govt_approval_no || 'CAA/REG/MED/2026/PENDING',
      requires_professional_guidance: Boolean(payload.requires_professional_guidance),
      guidance_warning_note: payload.guidance_warning_note || (payload.requires_professional_guidance ? '⚠️ Professional guidance or water testing recommended before application.' : null),
      price: parseFloat(payload.price) || 500,
      unit: payload.unit || '1 kg pack',
      stock_quantity: parseInt(payload.stock_quantity, 10) || 20,
      is_in_stock: true,
      batch_number: payload.batch_number || `BAT-${Date.now().toString().slice(-6)}`,
      manufacture_date: payload.manufacture_date || new Date().toISOString().split('T')[0],
      expiry_date: payload.expiry_date || new Date(Date.now() + 730 * 86400000).toISOString().split('T')[0],
      image_url: payload.image_url || 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80',
      rating: 5.0,
      reviews_count: 0,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    products.unshift(newProduct);
    return newProduct;
  },

  updateProductStock(productId, stockQuantity) {
    const product = products.find(p => p.id === productId);
    if (!product) return null;

    product.stock_quantity = parseInt(stockQuantity, 10);
    product.is_in_stock = product.stock_quantity > 0;
    product.updated_at = new Date().toISOString();
    return product;
  },

  // Farmer places multi-item order
  placeOrder(orderData, farmerId = 'farmer-demo', farmerName = 'Aqua Farmer', farmerPhone = '+91 98480 12345') {
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    const orderNumber = `AQM-SUP-${Date.now().toString().slice(-6)}`;
    let subtotal = 0;
    const validatedItems = [];

    // Verify each item and deduct stock
    for (const item of orderData.items) {
      const product = products.find(p => p.id === item.product_id);
      if (!product) {
        throw new Error(`Product not found: ${item.product_id}`);
      }
      const qty = parseInt(item.quantity, 10) || 1;
      if (product.stock_quantity < qty) {
        throw new Error(`Insufficient stock for '${product.name}'. Available: ${product.stock_quantity}`);
      }

      // Deduct stock
      product.stock_quantity -= qty;
      if (product.stock_quantity === 0) {
        product.is_in_stock = false;
      }

      const itemTotal = product.price * qty;
      subtotal += itemTotal;

      validatedItems.push({
        product_id: product.id,
        product_name: product.name,
        category: product.category,
        unit: product.unit,
        unit_price: product.price,
        quantity: qty,
        subtotal: itemTotal,
        seller_id: product.seller_id,
        seller_name: product.seller_name,
        requires_professional_guidance: product.requires_professional_guidance
      });
    }

    const shippingFee = subtotal >= 2000 ? 0 : 150; // Free shipping above 2000
    const totalAmount = subtotal + shippingFee;

    const newOrder = {
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
      farmer_id: farmerId,
      farmer_name: orderData.farmer_name || farmerName,
      farmer_phone: orderData.farmer_phone || farmerPhone,
      delivery_address: orderData.delivery_address || 'Pond Site, Andhra Pradesh',
      district: orderData.district || 'West Godavari',
      state: orderData.state || 'Andhra Pradesh',
      items: validatedItems,
      subtotal_amount: subtotal,
      shipping_fee: shippingFee,
      total_amount: totalAmount,
      payment_method: orderData.payment_method || 'cash_on_delivery',
      status: 'placed',
      tracking_number: `AQLOG-${Date.now().toString().slice(-6)}`,
      courier_partner: 'AquaLogistics Fleet',
      estimated_delivery_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      order_notes: orderData.order_notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    orders.unshift(newOrder);
    return newOrder;
  },

  getFarmerOrders(farmerId = 'farmer-demo') {
    return orders.filter(o => o.farmer_id === farmerId || o.farmer_id === 'farmer-demo');
  },

  getSellerOrders(sellerId = 'seller-godavari-01') {
    return orders.filter(o => o.items.some(it => it.seller_id === sellerId || sellerId === 'all'));
  },

  updateOrderStatus(orderId, status, extra = {}) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;

    const validStatuses = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    order.status = status;
    if (extra.tracking_number) order.tracking_number = extra.tracking_number;
    if (extra.courier_partner) order.courier_partner = extra.courier_partner;
    if (extra.estimated_delivery_date) order.estimated_delivery_date = extra.estimated_delivery_date;
    if (extra.cancelled_reason) order.cancelled_reason = extra.cancelled_reason;

    order.updated_at = new Date().toISOString();
    return order;
  },

  submitProductReview(productId, reviewData, farmerId = 'farmer-demo', farmerName = 'Aqua Farmer') {
    const product = products.find(p => p.id === productId);
    if (!product) return null;

    const newReview = {
      id: `rev-p-${Date.now()}`,
      product_id: productId,
      order_id: reviewData.order_id || null,
      farmer_id: farmerId,
      farmer_name: farmerName,
      rating: Math.min(5, Math.max(1, parseInt(reviewData.rating, 10) || 5)),
      review_text: reviewData.review_text || '',
      verified_purchase: true,
      created_at: new Date().toISOString()
    };

    productReviews.unshift(newReview);

    const allReviews = productReviews.filter(r => r.product_id === productId);
    const sum = allReviews.reduce((acc, curr) => acc + curr.rating, 0);
    product.rating = parseFloat((sum / allReviews.length).toFixed(2));
    product.reviews_count = allReviews.length;

    return newReview;
  }
};
