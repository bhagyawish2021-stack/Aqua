'use strict';

// Aquaculture Farmer Hub Coordinates for distance calculation
const FARMER_HUBS = {
  'bhimavaram': { name: 'Bhimavaram (West Godavari)', district: 'West Godavari', lat: 16.5449, lng: 81.5212 },
  'nellore': { name: 'Nellore', district: 'Nellore', lat: 14.4426, lng: 79.9865 },
  'kakinada': { name: 'Kakinada (East Godavari)', district: 'East Godavari', lat: 16.9891, lng: 82.2475 },
  'machilipatnam': { name: 'Machilipatnam (Krishna)', district: 'Krishna', lat: 16.1875, lng: 81.1389 },
  'bapatla': { name: 'Bapatla / Chirala', district: 'Bapatla', lat: 15.9042, lng: 80.4674 },
  'surat': { name: 'Surat (Olpad / Hazira)', district: 'Surat', lat: 21.1702, lng: 72.8311 },
  'balasore': { name: 'Balasore', district: 'Balasore', lat: 21.4934, lng: 86.9135 },
  'chennai': { name: 'Chennai / Marakkanam', district: 'Chennai', lat: 13.0827, lng: 80.2707 },
  'kochi': { name: 'Kochi', district: 'Ernakulam', lat: 9.9312, lng: 76.2673 }
};

// Haversine formula for distance in kilometers
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Pre-seeded authentic hatcheries
let hatcheries = [
  {
    id: 'hat-001',
    owner_id: 'user-hat-01',
    name: 'Apex Coastal SPF Broodstock Hatchery',
    registration_number: 'AP/EG/CAA/2018/042',
    caa_license_number: 'CAA/REG/2021/APP/00492',
    contact_person: 'Dr. R. K. Varma',
    phone: '+91 98480 12345',
    whatsapp: '+91 98480 12345',
    email: 'contact@apexcoastalhatchery.in',
    website: 'https://apexcoastalhatchery.in',
    address: 'Survey No. 44/2, Coastal Beach Road, Uppada, Near Kakinada Port',
    location_name: 'Uppada Coast, Kakinada',
    district: 'East Godavari',
    state: 'Andhra Pradesh',
    latitude: 17.0784,
    longitude: 82.3259,
    experience_years: 14,
    bio: 'Premier CAA-licensed Vannamei SPF hatchery equipped with bio-secure state-of-the-art quarantine, RT-PCR disease testing lab, and imported SIS Hawaii broodstock.',
    certifications: ['CAA Approved', 'SPF Broodstock Certified', 'MPEDA Registered', 'ISO 9001:2015', 'Biosecure Level-3'],
    quality_standards: [
      '100% WSSV, EHP, IHHNV, IMNV Negative by Real-Time PCR',
      'SIS Hawaii SPF Certified Broodstock F1 Nauplii',
      'Salinity Stress & Formalin Dip Tested (98% Survival)',
      'Acclimatized to 12-32 ppt salinity'
    ],
    is_verified: true, // Verified by admin
    verification_status: 'verified',
    verified_by: 'admin-mpeda-officer',
    verified_at: '2024-01-15T10:00:00Z',
    rating: 4.88,
    reviews_count: 42,
    images: [
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=900&q=80'
    ],
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'hat-002',
    owner_id: 'user-hat-02',
    name: 'Bapatla Marine Bio-Seed Farms & Nursery',
    registration_number: 'AP/BAP/CAA/2019/118',
    caa_license_number: 'CAA/REG/2022/APP/00781',
    contact_person: 'M. Venkateswarlu Naidu',
    phone: '+91 94401 55678',
    whatsapp: '+91 94401 55678',
    email: 'orders@bapatlamarinebio.com',
    website: 'https://bapatlamarinebio.com',
    address: 'Suryalanka Beach Road, Near Marine Research Station',
    location_name: 'Suryalanka Coast, Bapatla',
    district: 'Bapatla',
    state: 'Andhra Pradesh',
    latitude: 15.8569,
    longitude: 80.5283,
    experience_years: 18,
    bio: 'Dedicated multi-species marine seed facility providing robust Tiger Prawn (Monodon) and Vannamei PL seeds with proven farm survival rates over 90%.',
    certifications: ['CAA Approved', 'MPEDA Certified', 'RGCA Partner'],
    quality_standards: [
      'Multi-pathogen PCR cleared before dispatch',
      'High osmotic resistance stress test certified',
      'Optimal lipid body reserve & dark gut fullness (>95%)'
    ],
    is_verified: true, // Verified by admin
    verification_status: 'verified',
    verified_by: 'admin-caa-director',
    verified_at: '2024-02-10T14:30:00Z',
    rating: 4.75,
    reviews_count: 28,
    images: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80'
    ],
    created_at: '2024-01-05T00:00:00Z'
  },
  {
    id: 'hat-003',
    owner_id: 'user-hat-03',
    name: 'Nellore Coastal Seed Tech & Breeding Park',
    registration_number: 'AP/NLR/CAA/2020/089',
    caa_license_number: 'CAA/REG/2021/APP/00612',
    contact_person: 'S. Chandrasekhar Reddy',
    phone: '+91 98492 44321',
    whatsapp: '+91 98492 44321',
    email: 'seedtech@nelloreaqua.com',
    website: 'https://nelloreseedtech.com',
    address: 'Coast Road, Maipadu Beach, Indukurpet Mandal',
    location_name: 'Maipadu, Nellore',
    district: 'Nellore',
    state: 'Andhra Pradesh',
    latitude: 14.5022,
    longitude: 80.1746,
    experience_years: 22,
    bio: 'Pioneers in South Andhra coastal aquaculture. Supplies high-density SPF Vannamei PL-10/PL-12 and Scampi seeds backed by 24/7 technical pond stocking advisory.',
    certifications: ['CAA Approved', 'ISO 9001:2015', 'SPF Broodstock Certified'],
    quality_standards: [
      'Double RT-PCR tested for WSSV, EHP, AHPND/EMS',
      'Uniform size grading (CV < 4%)',
      'Survival rate guarantee: 96% at delivery'
    ],
    is_verified: true, // Verified by admin
    verification_status: 'verified',
    verified_by: 'admin-caa-director',
    verified_at: '2024-01-20T11:00:00Z',
    rating: 4.92,
    reviews_count: 53,
    images: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1509783236416-c9ad59bae472?auto=format&fit=crop&w=900&q=80'
    ],
    created_at: '2024-01-08T00:00:00Z'
  },
  {
    id: 'hat-004',
    owner_id: 'user-hat-04',
    name: 'Godavari Marine Seed Center & Crab Nursery',
    registration_number: 'AP/KRI/CAA/2021/054',
    caa_license_number: 'CAA/REG/2023/APP/00914',
    contact_person: 'P. Nageswara Rao',
    phone: '+91 99890 77123',
    whatsapp: '+91 99890 77123',
    email: 'info@godavariseeds.org',
    website: 'https://godavariseeds.org',
    address: 'Manginapudi Beach Road, Machilipatnam',
    location_name: 'Manginapudi, Machilipatnam',
    district: 'Krishna',
    state: 'Andhra Pradesh',
    latitude: 16.2397,
    longitude: 81.2336,
    experience_years: 12,
    bio: 'Specialized brackishwater hatchery pioneering Mud Crab (Scylla serrata) crablet rearing, Asian Seabass (Barramundi / Bhetki) fingerlings, and Vannamei seed.',
    certifications: ['CAA Approved', 'CIBA Technical Collaborator', 'MPEDA'],
    quality_standards: [
      'Vigorously fed with enriched Artemia and spirulina',
      'Grade-sorted crablets and fingerlings with zero cannibalism',
      'Vaccinated seabass fry available'
    ],
    is_verified: true, // Verified by admin
    verification_status: 'verified',
    verified_by: 'admin-ciba-inspector',
    verified_at: '2024-03-01T09:15:00Z',
    rating: 4.65,
    reviews_count: 22,
    images: [
      'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=900&q=80'
    ],
    created_at: '2024-01-12T00:00:00Z'
  },
  {
    id: 'hat-005',
    owner_id: 'user-hat-05',
    name: 'Marakkanam Marine Biosecure Hatchery',
    registration_number: 'TN/VIL/CAA/2017/023',
    caa_license_number: 'CAA/REG/2020/APP/00341',
    contact_person: 'K. Balasubramanian',
    phone: '+91 94440 98765',
    whatsapp: '+91 94440 98765',
    email: 'orders@marakkanam-aqua.com',
    website: 'https://marakkanam-aqua.com',
    address: 'East Coast Road (ECR), Near Salt Pans, Marakkanam',
    location_name: 'Marakkanam Coast, ECR',
    district: 'Chennai',
    state: 'Tamil Nadu',
    latitude: 12.1963,
    longitude: 79.9535,
    experience_years: 25,
    bio: 'One of the oldest biosecure aquaculture hatcheries on the Coromandel coast with deep sea water intake, ozone sterilization, and high-health Vannamei lines.',
    certifications: ['CAA Approved', 'MPEDA Registered', 'USFDA Inspection Passed', 'ISO 22000'],
    quality_standards: [
      'Deep-sea microfiltered & ozonated seawater intake',
      'Tested negative for 12 OIE listed crustacean viral pathogens',
      '100% active swimming response against water current'
    ],
    is_verified: true, // Verified by admin
    verification_status: 'verified',
    verified_by: 'admin-mpeda-officer',
    verified_at: '2024-01-10T16:00:00Z',
    rating: 4.82,
    reviews_count: 67,
    images: [
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80'
    ],
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'hat-006',
    owner_id: 'user-hat-06',
    name: 'Gujarat Coastal Shrimp Seed Station',
    registration_number: 'GJ/SUR/CAA/2021/077',
    caa_license_number: 'CAA/REG/2022/APP/00822',
    contact_person: 'Bhavesh Patel',
    phone: '+91 98251 33210',
    whatsapp: '+91 98251 33210',
    email: 'info@gujaratcoastalshrimp.in',
    website: 'https://gujaratcoastalshrimp.in',
    address: 'Dandi Coastal Highway, Olpad Taluka',
    location_name: 'Olpad Coast, Surat',
    district: 'Surat',
    state: 'Gujarat',
    latitude: 21.3324,
    longitude: 72.7486,
    experience_years: 10,
    bio: 'Specializing in robust Vannamei shrimp seed acclimatized to Gujarat fluctuating salinity and temperature gradients with oxygen packing for 24-hour transit.',
    certifications: ['CAA Approved', 'MPEDA Registered'],
    quality_standards: [
      'Stress resistance tested for high temperature tolerance (up to 34°C)',
      'PCR certified negative for EHP and WSSV',
      'Oxygenated multi-layer polythene carton delivery'
    ],
    is_verified: true, // Verified by admin
    verification_status: 'verified',
    verified_by: 'admin-caa-director',
    verified_at: '2024-02-18T12:00:00Z',
    rating: 4.70,
    reviews_count: 19,
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1509783236416-c9ad59bae472?auto=format&fit=crop&w=900&q=80'
    ],
    created_at: '2024-01-20T00:00:00Z'
  },
  {
    // UNVERIFIED HATCHERY DEMO - Strictly respects "Do not show a hatchery as verified unless verification is actually completed by an admin"
    id: 'hat-007',
    owner_id: 'user-hat-07',
    name: 'Prakasam Coastal Prawns & Fish Breeding Center',
    registration_number: 'AP/PRA/APP/2026/012',
    caa_license_number: 'CAA/APP/2026/PENDING',
    contact_person: 'G. Subba Rao',
    phone: '+91 97012 34567',
    whatsapp: '+91 97012 34567',
    email: 'prakasamseed@gmail.com',
    website: '',
    address: 'Kothapatnam Beach Road, Near Ongole',
    location_name: 'Kothapatnam, Ongole',
    district: 'Prakasam',
    state: 'Andhra Pradesh',
    latitude: 15.4526,
    longitude: 80.1165,
    experience_years: 3,
    bio: 'Newly established seed nursery offering Freshwater Scampi and Tilapia fingerlings. Undergoing official Coastal Aquaculture Authority inspection.',
    certifications: ['Applied for CAA License', 'Local Fishery Dept Registered'],
    quality_standards: [
      'Microscope examined nauplii',
      'Chlorinated fresh water rearing tanks'
    ],
    is_verified: false, // NOT VERIFIED! Must show as pending
    verification_status: 'pending',
    verified_by: null,
    verified_at: null,
    rating: 4.10,
    reviews_count: 5,
    images: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80'
    ],
    created_at: '2026-02-01T00:00:00Z'
  },
  {
    // UNVERIFIED HATCHERY DEMO - Freshwater Hatchery
    id: 'hat-008',
    owner_id: 'user-hat-08',
    name: 'Konaseema GIFT Tilapia & Murrel Hatchery',
    registration_number: 'AP/KON/FISH/2025/098',
    caa_license_number: '',
    contact_person: 'V. Satyanarayana',
    phone: '+91 98481 88990',
    whatsapp: '+91 98481 88990',
    email: 'tilapiakonaseema@gmail.com',
    website: '',
    address: 'Canal Bund Road, Peruru Village, Amalapuram',
    location_name: 'Peruru, Amalapuram',
    district: 'Dr. B.R. Ambedkar Konaseema',
    state: 'Andhra Pradesh',
    latitude: 16.5786,
    longitude: 82.0061,
    experience_years: 5,
    bio: 'High-density freshwater fish breeding farm specializing in 99% Monosex GIFT Tilapia fry and Murrel fingerlings.',
    certifications: ['State Fishery Dept Certified'],
    quality_standards: [
      '100% Hormonally Sex-Reversed Male Tilapia (GIFT strain)',
      'Uniform size grading (1.5 to 2.0 inches)'
    ],
    is_verified: false, // NOT VERIFIED!
    verification_status: 'pending',
    verified_by: null,
    verified_at: null,
    rating: 4.30,
    reviews_count: 8,
    images: [
      'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=900&q=80'
    ],
    created_at: '2026-01-25T00:00:00Z'
  }
];

// Pre-seeded Seed Products / Inventory
let seedProducts = [
  // Apex Coastal (hat-001)
  {
    id: 'prod-001',
    hatchery_id: 'hat-001',
    species_category: 'vannamei_shrimp',
    species_name: 'Pacific White Shrimp (Vannamei)',
    variety: 'SIS Hawaii SPF Line',
    stage: 'PL-10',
    price_per_unit: 340, // ₹340 per 1,000 seeds (i.e. ₹34,000 per Lakh)
    unit_label: 'per 1,000 PL',
    min_order_quantity: 50000, // 50,000 PL (0.5 Lakh)
    stock_status: 'in_stock',
    current_stock_quantity: 1800000, // 18 Lakhs available
    survival_guarantee_rate: 98.5,
    salinity_tolerance: '12-32 ppt',
    pcr_tested: true,
    broodstock_origin: 'SIS Hawaii SPF (Certified F1)'
  },
  {
    id: 'prod-002',
    hatchery_id: 'hat-001',
    species_category: 'vannamei_shrimp',
    species_name: 'Pacific White Shrimp (Vannamei)',
    variety: 'Fast Growth SPF Line',
    stage: 'PL-12',
    price_per_unit: 370,
    unit_label: 'per 1,000 PL',
    min_order_quantity: 50000,
    stock_status: 'in_stock',
    current_stock_quantity: 1200000, // 12 Lakhs available
    survival_guarantee_rate: 99.0,
    salinity_tolerance: '10-35 ppt',
    pcr_tested: true,
    broodstock_origin: 'SIS Hawaii SPF (Certified F1)'
  },

  // Bapatla Marine Bio (hat-002)
  {
    id: 'prod-003',
    hatchery_id: 'hat-002',
    species_category: 'tiger_prawn',
    species_name: 'Black Tiger Prawn (Penaeus monodon)',
    variety: 'RGCA Andaman SPF Broodstock',
    stage: 'PL-15',
    price_per_unit: 580, // ₹580 per 1,000 PL (₹58k per Lakh)
    unit_label: 'per 1,000 PL',
    min_order_quantity: 30000,
    stock_status: 'limited',
    current_stock_quantity: 450000, // 4.5 Lakhs available
    survival_guarantee_rate: 96.0,
    salinity_tolerance: '15-30 ppt',
    pcr_tested: true,
    broodstock_origin: 'RGCA SPF Domestication Center'
  },
  {
    id: 'prod-004',
    hatchery_id: 'hat-002',
    species_category: 'vannamei_shrimp',
    species_name: 'Pacific White Shrimp (Vannamei)',
    variety: 'High Salinity Resistant',
    stage: 'PL-11',
    price_per_unit: 330,
    unit_label: 'per 1,000 PL',
    min_order_quantity: 50000,
    stock_status: 'in_stock',
    current_stock_quantity: 900000,
    survival_guarantee_rate: 97.5,
    salinity_tolerance: '15-40 ppt',
    pcr_tested: true,
    broodstock_origin: 'Kona Bay Marine SPF'
  },

  // Nellore Seed Tech (hat-003)
  {
    id: 'prod-005',
    hatchery_id: 'hat-003',
    species_category: 'vannamei_shrimp',
    species_name: 'Pacific White Shrimp (Vannamei)',
    variety: 'Ultra Bio-Secure SPF',
    stage: 'PL-10',
    price_per_unit: 350,
    unit_label: 'per 1,000 PL',
    min_order_quantity: 50000,
    stock_status: 'in_stock',
    current_stock_quantity: 2500000, // 25 Lakhs
    survival_guarantee_rate: 98.8,
    salinity_tolerance: '10-35 ppt',
    pcr_tested: true,
    broodstock_origin: 'American Penaeid SPF'
  },
  {
    id: 'prod-006',
    hatchery_id: 'hat-003',
    species_category: 'other',
    species_name: 'Freshwater Giant Prawn (Scampi)',
    variety: 'CIFA Macrobrachium rosenbergii',
    stage: 'PL-20',
    price_per_unit: 850,
    unit_label: 'per 1,000 PL',
    min_order_quantity: 20000,
    stock_status: 'pre_order_only',
    current_stock_quantity: 200000,
    survival_guarantee_rate: 95.0,
    salinity_tolerance: '0-10 ppt',
    pcr_tested: true,
    broodstock_origin: 'CIFA Scampi Breeding Unit'
  },

  // Godavari Marine Seed Center & Crab (hat-004)
  {
    id: 'prod-007',
    hatchery_id: 'hat-004',
    species_category: 'crab',
    species_name: 'Green Mud Crab (Scylla serrata)',
    variety: 'CIBA Hatchery Reared',
    stage: 'Crablet Stage 2 (1.0 cm)',
    price_per_unit: 9.50, // ₹9.50 per crablet
    unit_label: 'per crablet',
    min_order_quantity: 2000,
    stock_status: 'limited',
    current_stock_quantity: 15000,
    survival_guarantee_rate: 92.0,
    salinity_tolerance: '15-32 ppt',
    pcr_tested: true,
    broodstock_origin: 'CIBA Wild Female Berried Broodstock'
  },
  {
    id: 'prod-008',
    hatchery_id: 'hat-004',
    species_category: 'fish',
    species_name: 'Asian Seabass (Barramundi / Bhetki)',
    variety: 'Lates calcarifer Nursery Grade',
    stage: 'Fingerling (2.5 inch)',
    price_per_unit: 14.00, // ₹14 per fingerling
    unit_label: 'per fingerling',
    min_order_quantity: 1000,
    stock_status: 'in_stock',
    current_stock_quantity: 35000,
    survival_guarantee_rate: 95.0,
    salinity_tolerance: '5-35 ppt',
    pcr_tested: true,
    broodstock_origin: 'RGCA Marine Finfish Broodstock Facility'
  },

  // Marakkanam Marine (hat-005)
  {
    id: 'prod-009',
    hatchery_id: 'hat-005',
    species_category: 'vannamei_shrimp',
    species_name: 'Pacific White Shrimp (Vannamei)',
    variety: 'Deep Sea Biosecure SPF',
    stage: 'PL-9',
    price_per_unit: 320,
    unit_label: 'per 1,000 PL',
    min_order_quantity: 100000,
    stock_status: 'in_stock',
    current_stock_quantity: 3000000, // 30 Lakhs
    survival_guarantee_rate: 98.0,
    salinity_tolerance: '12-35 ppt',
    pcr_tested: true,
    broodstock_origin: 'SIS Hawaii SPF'
  },

  // Gujarat Coastal (hat-006)
  {
    id: 'prod-010',
    hatchery_id: 'hat-006',
    species_category: 'vannamei_shrimp',
    species_name: 'Pacific White Shrimp (Vannamei)',
    variety: 'High Heat Tolerance Line',
    stage: 'PL-10',
    price_per_unit: 360,
    unit_label: 'per 1,000 PL',
    min_order_quantity: 50000,
    stock_status: 'in_stock',
    current_stock_quantity: 1400000,
    survival_guarantee_rate: 97.0,
    salinity_tolerance: '18-42 ppt',
    pcr_tested: true,
    broodstock_origin: 'Moana Technologies SPF'
  },

  // Prakasam Center (hat-007 - unverified)
  {
    id: 'prod-011',
    hatchery_id: 'hat-007',
    species_category: 'fish',
    species_name: 'Indian Major Carp (Rohu / Catla Mix)',
    variety: 'Jayanti Rohu Improved Line',
    stage: 'Fingerling (3 inch)',
    price_per_unit: 2.80,
    unit_label: 'per fingerling',
    min_order_quantity: 5000,
    stock_status: 'in_stock',
    current_stock_quantity: 80000,
    survival_guarantee_rate: 90.0,
    salinity_tolerance: '0-5 ppt',
    pcr_tested: false,
    broodstock_origin: 'CIFA Jayanti Rohu Broodstock'
  },

  // Konaseema Tilapia (hat-008 - unverified)
  {
    id: 'prod-012',
    hatchery_id: 'hat-008',
    species_category: 'fish',
    species_name: 'GIFT Tilapia (Monosex All-Male)',
    variety: 'Genetically Improved Farmed Tilapia',
    stage: 'Fry (1.5 inch)',
    price_per_unit: 1.90,
    unit_label: 'per fry',
    min_order_quantity: 10000,
    stock_status: 'in_stock',
    current_stock_quantity: 150000,
    survival_guarantee_rate: 96.0,
    salinity_tolerance: '0-15 ppt',
    pcr_tested: false,
    broodstock_origin: 'WorldFish GIFT Strain'
  }
];

// Seed Orders
let seedOrders = [
  {
    id: 'ord-1001',
    order_number: 'AQM-SEED-2026-001',
    farmer_id: 'farmer-bhimavaram-01',
    farmer_name: 'K. Ramana Murthy',
    farmer_phone: '+91 98480 99887',
    hatchery_id: 'hat-001',
    hatchery_name: 'Apex Coastal SPF Broodstock Hatchery',
    product_id: 'prod-001',
    species_name: 'Pacific White Shrimp (Vannamei)',
    stage: 'PL-10',
    quantity: 200000, // 2 Lakhs
    unit_label: 'per 1,000 PL',
    unit_price: 340,
    total_amount: 68000,
    required_date: '2026-09-20',
    delivery_location: 'Pond No. 3, Gollavanitippa Village, Bhimavaram Mandal, West Godavari',
    pond_salinity_ppt: 18,
    notes: 'Please pack in 1,000 PL per bag with 20 hours oxygen. Water temperature 26°C.',
    status: 'accepted',
    rejection_reason: null,
    created_at: '2026-09-10T08:30:00Z',
    updated_at: '2026-09-10T11:00:00Z'
  },
  {
    id: 'ord-1002',
    order_number: 'AQM-SEED-2026-002',
    farmer_id: 'farmer-nellore-02',
    farmer_name: 'M. Sridhar Reddy',
    farmer_phone: '+91 94401 11223',
    hatchery_id: 'hat-003',
    hatchery_name: 'Nellore Coastal Seed Tech & Breeding Park',
    product_id: 'prod-005',
    species_name: 'Pacific White Shrimp (Vannamei)',
    stage: 'PL-10',
    quantity: 300000, // 3 Lakhs
    unit_label: 'per 1,000 PL',
    unit_price: 350,
    total_amount: 105000,
    required_date: '2026-09-25',
    delivery_location: 'Farm Block B, Mypadu Sea Highway, Indukurpet, Nellore',
    pond_salinity_ppt: 24,
    notes: 'Need morning 5 AM farm gate delivery.',
    status: 'pending',
    rejection_reason: null,
    created_at: '2026-09-11T14:15:00Z',
    updated_at: '2026-09-11T14:15:00Z'
  }
];

// Hatchery Reviews
let hatcheryReviews = [
  {
    id: 'rev-001',
    hatchery_id: 'hat-001',
    farmer_id: 'farmer-01',
    farmer_name: 'V. Prabhakar Rao',
    farmer_location: 'Bhimavaram, WG',
    rating: 5,
    seed_survival_rate: 98.2,
    review_text: 'Stocked 2.5 Lakhs PL-10 in March. Excellent gut fullness and zero disease incidents throughout 105 days DOC. Harvested 32 count average.',
    created_at: '2026-06-15T10:00:00Z'
  },
  {
    id: 'rev-002',
    hatchery_id: 'hat-001',
    farmer_id: 'farmer-02',
    farmer_name: 'K. Srinivasa Raju',
    farmer_location: 'Kakinada, EG',
    rating: 5,
    seed_survival_rate: 97.5,
    review_text: 'Very professional PCR reports provided along with the batch delivery. Zero mortality during transit.',
    created_at: '2026-07-20T14:30:00Z'
  },
  {
    id: 'rev-003',
    hatchery_id: 'hat-003',
    farmer_id: 'farmer-03',
    farmer_name: 'S. Naresh',
    farmer_location: 'Indukurpet, Nellore',
    rating: 5,
    seed_survival_rate: 98.9,
    review_text: 'Consistent high quality Vannamei seed. Acclimatization instructions from Dr. Reddy were extremely helpful.',
    created_at: '2026-08-05T09:20:00Z'
  },
  {
    id: 'rev-004',
    hatchery_id: 'hat-004',
    farmer_id: 'farmer-04',
    farmer_name: 'B. Jagannadham',
    farmer_location: 'Machilipatnam',
    rating: 5,
    seed_survival_rate: 94.0,
    review_text: 'Purchased 4,000 mud crab crablets. Healthy and vigorous appetite. Good survival in brackish polyculture pond.',
    created_at: '2026-08-18T16:45:00Z'
  }
];

// Available Species Taxonomy for filters
const SPECIES_CATEGORIES = [
  { id: 'all', name: 'All Seed Species', telugu: 'అన్ని రకాల విత్తనాలు', icon: '🧬' },
  { id: 'vannamei_shrimp', name: 'Vannamei Shrimp Seed', telugu: 'వెనామి రొయ్యల విత్తనం (PL)', icon: '🦐' },
  { id: 'tiger_prawn', name: 'Tiger Prawn Seed', telugu: 'టైగర్ రొయ్యల విత్తనం (మోనోడాన్)', icon: '🐅' },
  { id: 'fish', name: 'Fish Seed (Seabass, Tilapia, Carp)', telugu: 'చేప పిల్లలు (పండుగప్ప, తిలాపియా, రోహు)', icon: '🐟' },
  { id: 'crab', name: 'Crab Seed (Crablets)', telugu: 'పీతల విత్తనం (క్రాబ్‌లెట్స్)', icon: '🦀' },
  { id: 'other', name: 'Other Seed (Scampi, etc.)', telugu: 'ఇతర విత్తనాలు (స్కాంపి మొదలైనవి)', icon: '🌿' }
];

module.exports = {
  FARMER_HUBS,
  SPECIES_CATEGORIES,

  // Get Species taxonomy
  getSpeciesCategories() {
    return SPECIES_CATEGORIES;
  },

  // Get Farmer Hubs
  getFarmerHubs() {
    return Object.keys(FARMER_HUBS).map(k => ({
      key: k,
      ...FARMER_HUBS[k]
    }));
  },

  // Search, Filter & Discover Hatcheries
  getHatcheries(filters = {}) {
    const {
      species_category,
      district,
      search,
      farmer_hub,
      farmer_lat,
      farmer_lng,
      max_distance_km,
      min_rating,
      verified_only,
      in_stock_only,
      sort_by = 'rating' // 'rating', 'distance', 'experience'
    } = filters;

    // Resolve reference coordinates for distance calculation
    let refLat = null;
    let refLng = null;

    if (farmer_lat && farmer_lng) {
      refLat = parseFloat(farmer_lat);
      refLng = parseFloat(farmer_lng);
    } else if (farmer_hub && FARMER_HUBS[farmer_hub.toLowerCase()]) {
      refLat = FARMER_HUBS[farmer_hub.toLowerCase()].lat;
      refLng = FARMER_HUBS[farmer_hub.toLowerCase()].lng;
    }

    let results = hatcheries.map(h => {
      // Calculate distance if reference coordinates provided
      const distance_km = (refLat && refLng)
        ? calculateHaversineDistance(refLat, refLng, h.latitude, h.longitude)
        : null;

      // Attach available products
      const products = seedProducts.filter(p => p.hatchery_id === h.id);
      const available_categories = [...new Set(products.map(p => p.species_category))];
      const has_stock = products.some(p => p.stock_status === 'in_stock' && p.current_stock_quantity > 0);
      const min_price = products.length > 0 ? Math.min(...products.map(p => p.price_per_unit)) : null;

      return {
        ...h,
        distance_km,
        products_count: products.length,
        available_categories,
        has_stock,
        min_price,
        products
      };
    });

    // Apply Filter: Species Category
    if (species_category && species_category !== 'all') {
      results = results.filter(h => h.available_categories.includes(species_category));
    }

    // Apply Filter: District
    if (district && district !== 'all') {
      results = results.filter(h => h.district.toLowerCase() === district.toLowerCase());
    }

    // Apply Filter: Verified only
    if (verified_only === 'true' || verified_only === true) {
      // Strict rule: Only show verified if admin verification is completed!
      results = results.filter(h => h.is_verified === true && h.verification_status === 'verified');
    }

    // Apply Filter: In-Stock only
    if (in_stock_only === 'true' || in_stock_only === true) {
      results = results.filter(h => h.has_stock === true);
    }

    // Apply Filter: Minimum Rating
    if (min_rating && !isNaN(parseFloat(min_rating))) {
      results = results.filter(h => h.rating >= parseFloat(min_rating));
    }

    // Apply Filter: Max Distance
    if (max_distance_km && !isNaN(parseFloat(max_distance_km)) && refLat && refLng) {
      results = results.filter(h => h.distance_km !== null && h.distance_km <= parseFloat(max_distance_km));
    }

    // Apply Search Query (Name, Address, District, Species, License)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      results = results.filter(h =>
        h.name.toLowerCase().includes(q) ||
        h.district.toLowerCase().includes(q) ||
        h.location_name.toLowerCase().includes(q) ||
        (h.caa_license_number && h.caa_license_number.toLowerCase().includes(q)) ||
        (h.bio && h.bio.toLowerCase().includes(q)) ||
        h.products.some(p => p.species_name.toLowerCase().includes(q) || p.variety.toLowerCase().includes(q))
      );
    }

    // Apply Sorting
    if (sort_by === 'distance' && refLat && refLng) {
      results.sort((a, b) => (a.distance_km || 9999) - (b.distance_km || 9999));
    } else if (sort_by === 'experience') {
      results.sort((a, b) => b.experience_years - a.experience_years);
    } else if (sort_by === 'price_asc') {
      results.sort((a, b) => (a.min_price || 999999) - (b.min_price || 999999));
    } else {
      // Default: highest rated first
      results.sort((a, b) => b.rating - a.rating);
    }

    return results;
  },

  // Get Hatchery Profile by ID
  getHatcheryById(id, farmerCoords = {}) {
    const hatchery = hatcheries.find(h => h.id === id);
    if (!hatchery) return null;

    let distance_km = null;
    if (farmerCoords.lat && farmerCoords.lng) {
      distance_km = calculateHaversineDistance(farmerCoords.lat, farmerCoords.lng, hatchery.latitude, hatchery.longitude);
    } else if (farmerCoords.hub && FARMER_HUBS[farmerCoords.hub.toLowerCase()]) {
      const hub = FARMER_HUBS[farmerCoords.hub.toLowerCase()];
      distance_km = calculateHaversineDistance(hub.lat, hub.lng, hatchery.latitude, hatchery.longitude);
    }

    const products = seedProducts.filter(p => p.hatchery_id === id);
    const reviews = hatcheryReviews.filter(r => r.hatchery_id === id);

    return {
      ...hatchery,
      distance_km,
      products,
      reviews
    };
  },

  // Register New Hatchery (Strictly starts as pending/unverified!)
  createHatchery(data, ownerId = 'user-hat-default') {
    const newHatchery = {
      id: `hat-${Date.now()}`,
      owner_id: ownerId,
      name: data.name,
      registration_number: data.registration_number || '',
      caa_license_number: data.caa_license_number || '',
      contact_person: data.contact_person,
      phone: data.phone,
      whatsapp: data.whatsapp || data.phone,
      email: data.email || '',
      website: data.website || '',
      address: data.address,
      location_name: data.location_name || data.address,
      district: data.district,
      state: data.state || 'Andhra Pradesh',
      latitude: parseFloat(data.latitude) || 16.5,
      longitude: parseFloat(data.longitude) || 81.5,
      experience_years: parseInt(data.experience_years, 10) || 1,
      bio: data.bio || '',
      certifications: Array.isArray(data.certifications) ? data.certifications : ['Application Submitted'],
      quality_standards: Array.isArray(data.quality_standards) ? data.quality_standards : ['Under Inspection'],
      // Strict rule: DO NOT show as verified until admin approves!
      is_verified: false,
      verification_status: 'pending',
      verified_by: null,
      verified_at: null,
      rating: 5.0,
      reviews_count: 0,
      images: data.images && data.images.length > 0 ? data.images : [
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80'
      ],
      created_at: new Date().toISOString()
    };

    hatcheries.unshift(newHatchery);
    return newHatchery;
  },

  // Admin Verification Toggle
  verifyHatchery(hatcheryId, isApproved = true, adminId = 'admin-caa-officer') {
    const hatchery = hatcheries.find(h => h.id === hatcheryId);
    if (!hatchery) return null;

    if (isApproved) {
      hatchery.is_verified = true;
      hatchery.verification_status = 'verified';
      hatchery.verified_by = adminId;
      hatchery.verified_at = new Date().toISOString();
      if (!hatchery.certifications.includes('CAA Approved')) {
        hatchery.certifications.push('CAA Approved');
      }
    } else {
      hatchery.is_verified = false;
      hatchery.verification_status = 'rejected';
      hatchery.verified_by = adminId;
      hatchery.verified_at = null;
    }

    return hatchery;
  },

  // Add Product to Hatchery Seed Inventory
  addProduct(hatcheryId, data) {
    const hatchery = hatcheries.find(h => h.id === hatcheryId);
    if (!hatchery) return null;

    const newProduct = {
      id: `prod-${Date.now()}`,
      hatchery_id: hatcheryId,
      species_category: data.species_category,
      species_name: data.species_name,
      variety: data.variety || 'Standard Line',
      stage: data.stage || 'PL-10',
      price_per_unit: parseFloat(data.price_per_unit),
      unit_label: data.unit_label || 'per 1,000 seeds',
      min_order_quantity: parseInt(data.min_order_quantity, 10) || 10000,
      stock_status: data.stock_status || 'in_stock',
      current_stock_quantity: parseInt(data.current_stock_quantity, 10) || 100000,
      survival_guarantee_rate: parseFloat(data.survival_guarantee_rate) || 95.0,
      salinity_tolerance: data.salinity_tolerance || '10-35 ppt',
      pcr_tested: data.pcr_tested !== false,
      broodstock_origin: data.broodstock_origin || 'Hatchery Selected'
    };

    seedProducts.push(newProduct);
    return newProduct;
  },

  // Update Seed Product (stock, price, status)
  updateProduct(productId, updates = {}) {
    const product = seedProducts.find(p => p.id === productId);
    if (!product) return null;

    if (updates.price_per_unit !== undefined) product.price_per_unit = parseFloat(updates.price_per_unit);
    if (updates.current_stock_quantity !== undefined) product.current_stock_quantity = parseInt(updates.current_stock_quantity, 10);
    if (updates.stock_status !== undefined) product.stock_status = updates.stock_status;
    if (updates.survival_guarantee_rate !== undefined) product.survival_guarantee_rate = parseFloat(updates.survival_guarantee_rate);
    if (updates.salinity_tolerance !== undefined) product.salinity_tolerance = updates.salinity_tolerance;

    return product;
  },

  // Create Seed Order / Request
  createSeedOrder(orderData, farmerId = 'farmer-default', farmerName = 'Farmer', farmerPhone = '+91 98480 00000') {
    const product = seedProducts.find(p => p.id === orderData.product_id);
    if (!product) throw new Error('Selected seed product not found');

    const hatchery = hatcheries.find(h => h.id === product.hatchery_id);
    if (!hatchery) throw new Error('Hatchery not found');

    const quantity = parseInt(orderData.quantity, 10);
    if (isNaN(quantity) || quantity <= 0) throw new Error('Invalid seed quantity');

    // Calculate total
    let total_amount = 0;
    if (product.unit_label.includes('1,000')) {
      total_amount = Math.round((quantity / 1000) * product.price_per_unit);
    } else {
      total_amount = Math.round(quantity * product.price_per_unit);
    }

    const orderNumber = `AQM-SEED-${Date.now().toString().slice(-6)}`;

    const newOrder = {
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
      farmer_id: farmerId,
      farmer_name: orderData.farmer_name || farmerName,
      farmer_phone: orderData.farmer_phone || farmerPhone,
      hatchery_id: hatchery.id,
      hatchery_name: hatchery.name,
      product_id: product.id,
      species_name: product.species_name,
      stage: product.stage,
      quantity,
      unit_label: product.unit_label,
      unit_price: product.price_per_unit,
      total_amount,
      required_date: orderData.required_date,
      delivery_location: orderData.delivery_location || 'Farm Gate delivery',
      pond_salinity_ppt: parseFloat(orderData.pond_salinity_ppt) || 15,
      notes: orderData.notes || '',
      status: 'pending',
      rejection_reason: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    seedOrders.unshift(newOrder);
    return newOrder;
  },

  // Get Farmer's Orders
  getFarmerOrders(farmerId) {
    if (!farmerId) return seedOrders;
    return seedOrders.filter(o => o.farmer_id === farmerId);
  },

  // Get Hatchery's Incoming Orders
  getHatcheryOrders(hatcheryId) {
    return seedOrders.filter(o => o.hatchery_id === hatcheryId);
  },

  // Update Order Status (Hatchery Accepts, Rejects, Dispatches, Completes)
  updateOrderStatus(orderId, status, rejectionReason = null) {
    const order = seedOrders.find(o => o.id === orderId);
    if (!order) return null;

    const validStatuses = ['pending', 'accepted', 'rejected', 'dispatched', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    order.status = status;
    if (rejectionReason) order.rejection_reason = rejectionReason;
    order.updated_at = new Date().toISOString();

    // If order completed or accepted, optionally decrement stock quantity
    if (status === 'accepted' || status === 'completed') {
      const product = seedProducts.find(p => p.id === order.product_id);
      if (product && product.current_stock_quantity >= order.quantity) {
        product.current_stock_quantity -= order.quantity;
        if (product.current_stock_quantity <= 0) {
          product.stock_status = 'out_of_stock';
        }
      }
    }

    return order;
  },

  // Add Hatchery Review
  addReview(hatcheryId, data, farmerId = 'farmer-default', farmerName = 'Progressive Farmer') {
    const hatchery = hatcheries.find(h => h.id === hatcheryId);
    if (!hatchery) return null;

    const rating = Math.min(5, Math.max(1, parseInt(data.rating, 10) || 5));
    const newReview = {
      id: `rev-${Date.now()}`,
      hatchery_id: hatcheryId,
      farmer_id: farmerId,
      farmer_name: data.farmer_name || farmerName,
      farmer_location: data.farmer_location || 'Coastal AP',
      rating,
      seed_survival_rate: parseFloat(data.seed_survival_rate) || 96.0,
      review_text: data.review_text || '',
      created_at: new Date().toISOString()
    };

    hatcheryReviews.unshift(newReview);

    // Recalculate average rating
    const allReviews = hatcheryReviews.filter(r => r.hatchery_id === hatcheryId);
    const sum = allReviews.reduce((acc, curr) => acc + curr.rating, 0);
    hatchery.rating = parseFloat((sum / allReviews.length).toFixed(2));
    hatchery.reviews_count = allReviews.length;

    return newReview;
  }
};
