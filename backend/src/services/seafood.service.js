'use strict';

const SPECIES_TAXONOMY = [
  { id: 'all', name: 'All Species', telugu: 'అన్ని రకాలు', icon: '🌊' },
  { id: 'vannamei_shrimp', name: 'Penaeus Vannamei Shrimp', telugu: 'వెన్నామి రొయ్యలు', icon: '🦐' },
  { id: 'tiger_prawn', name: 'Black Tiger Prawn', telugu: 'టైగర్ రొయ్యలు', icon: '🦐' },
  { id: 'asian_seabass', name: 'Asian Seabass (Barramundi)', telugu: 'పండుగప్ప (సీబాస్)', icon: '🐟' },
  { id: 'tilapia', name: 'GIFT Tilapia', telugu: 'తిలాపియా చేప', icon: '🐟' },
  { id: 'rohu_catla', name: 'Freshwater Carp (Rohu/Catla)', telugu: 'రొహు / బొచ్చె చేపలు', icon: '🐟' },
  { id: 'mud_crab', name: 'Live Green Mud Crab', telugu: 'మడ్ క్రాబ్ (పీతలు)', icon: '🦀' },
  { id: 'freshwater_scampi', name: 'Giant Freshwater Scampi', telugu: 'స్కాంపి రొయ్యలు', icon: '🦞' }
];

const BUYER_TYPES = [
  { id: 'exporter', label: 'Seafood Exporter (EU / US FDA)', icon: '🚢' },
  { id: 'processor', label: 'Processing & IQF Plant', icon: '🏭' },
  { id: 'wholesaler', label: 'Wholesale Seafood Distributor', icon: '🏢' },
  { id: 'retailer', label: 'Retail Chain / Supermarket', icon: '🏪' },
  { id: 'restaurant', label: 'Restaurant & Hospitality Chain', icon: '🍽️' },
  { id: 'local_buyer', label: 'Local Mandi / Seafood Buyer', icon: '🚚' }
];

const BUYER_HUBS = {
  'bhimavaram': { name: 'Bhimavaram Processing Cluster', district: 'West Godavari', lat: 16.5449, lng: 81.5212 },
  'nellore': { name: 'Nellore Coastal Hub', district: 'Nellore', lat: 14.4426, lng: 79.9865 },
  'kakinada': { name: 'Kakinada Deep Sea Port', district: 'East Godavari', lat: 16.9891, lng: 82.2475 },
  'machilipatnam': { name: 'Machilipatnam Coastal Hub', district: 'Krishna', lat: 16.1875, lng: 81.1389 },
  'visakhapatnam': { name: 'Vizag Fishing Harbour / MPEDA Export Hub', district: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  'bapatla': { name: 'Bapatla / Nizampatnam Aqua Zone', district: 'Bapatla', lat: 15.9042, lng: 80.4674 }
};

// Haversine distance in kilometers
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

// Pre-seeded authentic farmgate seafood harvest listings
let seafoodListings = [
  {
    id: 'sea-001',
    farmer_id: 'farmer-bhimavaram-01',
    farmer_name: 'V. Satyanarayana Raju',
    farmer_phone: '+91 98481 22334',
    farmer_whatsapp: '+91 98481 22334',
    pond_name: 'Pond 3 (North Aerated Vannamei)',
    species: 'vannamei_shrimp',
    species_label: 'Penaeus Vannamei Shrimp',
    quantity_kg: 4500,
    min_order_quantity_kg: 1000,
    size_grade: '30 Count (33g/pc)',
    count_per_kg: 30,
    quality_info: [
      '100% Antibiotic-Free (Pre-harvest ELISA negative)',
      'Harvested with Slush Ice at 2°C',
      'Solid Hard Shell (No molting defects)',
      'Clear Clean Gut'
    ],
    harvest_date: '2026-09-18',
    availability_date: '2026-09-18',
    is_immediate_harvest: false,
    expected_price_per_kg: 430,
    location_name: 'Undi Road, Bhimavaram',
    district: 'West Godavari',
    state: 'Andhra Pradesh',
    latitude: 16.5458,
    longitude: 81.5245,
    images: [
      'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Prime export-quality Vannamei shrimp ready for scheduled night harvest. Direct pond-side reefer truck weighment and immediate dispatch to processing plant.',
    status: 'active',
    farmer_rating: 4.95,
    reviews_count: 24,
    is_verified: true,
    verification_badge: 'CAA Registered Aquafarm (AP/WG/2021/089)',
    created_at: '2026-09-08T10:00:00Z',
    updated_at: '2026-09-08T10:00:00Z'
  },
  {
    id: 'sea-002',
    farmer_id: 'farmer-nellore-02',
    farmer_name: 'K. Mahendra Reddy',
    farmer_phone: '+91 94401 55667',
    farmer_whatsapp: '+91 94401 55667',
    pond_name: 'Coastal Pond A2 (High Salinity)',
    species: 'vannamei_shrimp',
    species_label: 'Penaeus Vannamei Shrimp',
    quantity_kg: 6200,
    min_order_quantity_kg: 1500,
    size_grade: '40 Count (25g/pc)',
    count_per_kg: 40,
    quality_info: [
      'Brackish water 22 ppt (Sweet firm taste)',
      'Export Grade A',
      'Zero Discoloration',
      'Antibiotic Free Certified'
    ],
    harvest_date: '2026-09-15',
    availability_date: '2026-09-15',
    is_immediate_harvest: true,
    expected_price_per_kg: 375,
    location_name: 'Maipadu Coast, Nellore',
    district: 'Nellore',
    state: 'Andhra Pradesh',
    latitude: 14.4452,
    longitude: 80.0125,
    images: [
      'https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'High salinity coastal Vannamei. Exceptional muscle density, firm translucent shell, ready for immediate morning harvest. All truck logistics accessible.',
    status: 'active',
    farmer_rating: 4.88,
    reviews_count: 19,
    is_verified: true,
    verification_badge: 'CAA & MPEDA Certified Farmer',
    created_at: '2026-09-09T14:30:00Z',
    updated_at: '2026-09-09T14:30:00Z'
  },
  {
    id: 'sea-003',
    farmer_id: 'farmer-kakinada-03',
    farmer_name: 'Capt. P. Veerabhadra Rao',
    farmer_phone: '+91 98850 77889',
    farmer_whatsapp: '+91 98850 77889',
    pond_name: 'Delta Mangrove Pond 1',
    species: 'tiger_prawn',
    species_label: 'Black Tiger Prawn (Penaeus monodon)',
    quantity_kg: 2800,
    min_order_quantity_kg: 500,
    size_grade: '20 Count (50g/pc Jumbo)',
    count_per_kg: 20,
    quality_info: [
      'Deep Dark Black Bands',
      'Natural Mangrove Feed Supplemented',
      'Jumbo Export Grade',
      'Tested Antibiotic Negative'
    ],
    harvest_date: '2026-09-20',
    availability_date: '2026-09-20',
    is_immediate_harvest: false,
    expected_price_per_kg: 680,
    location_name: 'Uppada Coast, Kakinada',
    district: 'East Godavari',
    state: 'Andhra Pradesh',
    latitude: 17.0784,
    longitude: 82.3259,
    images: [
      'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Magnificent Jumbo Black Tiger prawns reared with low-density sustainable practices. Target premium Japanese/European retail and luxury culinary buyers.',
    status: 'active',
    farmer_rating: 4.98,
    reviews_count: 32,
    is_verified: true,
    verification_badge: 'MPEDA Export Grade Certified',
    created_at: '2026-09-10T09:15:00Z',
    updated_at: '2026-09-10T09:15:00Z'
  },
  {
    id: 'sea-004',
    farmer_id: 'farmer-machilipatnam-04',
    farmer_name: 'D. Nageswara Rao',
    farmer_phone: '+91 97010 33445',
    farmer_whatsapp: '+91 97010 33445',
    pond_name: 'Estuarine Marine Pond B',
    species: 'asian_seabass',
    species_label: 'Asian Seabass / Barramundi (Pandugappa)',
    quantity_kg: 3500,
    min_order_quantity_kg: 500,
    size_grade: '1.2 kg to 1.8 kg / piece',
    count_per_kg: null,
    quality_info: [
      'Live Catch or Bleed-Chilled Available',
      'Clean Brackish Water Reared',
      'Thick Fillet Yield Grade',
      'FSSAI Hygiene Standards'
    ],
    harvest_date: '2026-09-16',
    availability_date: '2026-09-16',
    is_immediate_harvest: true,
    expected_price_per_kg: 440,
    location_name: 'Gilakaladindi Coast, Machilipatnam',
    district: 'Krishna',
    state: 'Andhra Pradesh',
    latitude: 16.1875,
    longitude: 81.1389,
    images: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Clean live Asian Seabass (Barramundi), premium plate size 1.5kg average. Ideal for restaurant chains, live fish transportation, and urban fresh fish markets.',
    status: 'active',
    farmer_rating: 4.90,
    reviews_count: 15,
    is_verified: true,
    verification_badge: 'Fisheries Department Registered',
    created_at: '2026-09-10T16:00:00Z',
    updated_at: '2026-09-10T16:00:00Z'
  },
  {
    id: 'sea-005',
    farmer_id: 'farmer-bapatla-05',
    farmer_name: 'M. Sridhar Chowdary',
    farmer_phone: '+91 98499 88990',
    farmer_whatsapp: '+91 98499 88990',
    pond_name: 'Biofloc Finfish Basin 2',
    species: 'tilapia',
    species_label: 'GIFT Tilapia (Genetically Improved)',
    quantity_kg: 8000,
    min_order_quantity_kg: 2000,
    size_grade: '500g to 750g / piece',
    count_per_kg: null,
    quality_info: [
      'Depurated in Clear Running Water',
      'Zero Muddy Odour',
      'Firm White Flesh',
      'Bulk Quantity Available'
    ],
    harvest_date: '2026-09-19',
    availability_date: '2026-09-19',
    is_immediate_harvest: false,
    expected_price_per_kg: 135,
    location_name: 'Nizampatnam Road, Bapatla',
    district: 'Bapatla',
    state: 'Andhra Pradesh',
    latitude: 15.9042,
    longitude: 80.4674,
    images: [
      'https://images.unsplash.com/photo-1534043464124-3be32fe00099?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Depurated GIFT Tilapia in high-volume tonnage. Pre-chilled in insulated bins for domestic wholesale market distribution across Hyderabad, Bangalore, and Chennai.',
    status: 'active',
    farmer_rating: 4.85,
    reviews_count: 28,
    is_verified: true,
    verification_badge: 'State Aquaculture Society Certified',
    created_at: '2026-09-11T08:00:00Z',
    updated_at: '2026-09-11T08:00:00Z'
  },
  {
    id: 'sea-006',
    farmer_id: 'farmer-bapatla-05',
    farmer_name: 'M. Sridhar Chowdary',
    farmer_phone: '+91 98499 88990',
    farmer_whatsapp: '+91 98499 88990',
    pond_name: 'Mangrove Tide Creek C',
    species: 'mud_crab',
    species_label: 'Live Green Mud Crab (Scylla serrata)',
    quantity_kg: 1200,
    min_order_quantity_kg: 200,
    size_grade: '350g to 500g (Medium-Large Live)',
    count_per_kg: null,
    quality_info: [
      '100% Live Tied with Clean Jute',
      'Full Meat Hard Shell (F1 Grade)',
      'Healthy Active Chelae (Claws)',
      'Air Freight Packing Ready'
    ],
    harvest_date: '2026-09-14',
    availability_date: '2026-09-14',
    is_immediate_harvest: true,
    expected_price_per_kg: 850,
    location_name: 'Nizampatnam Estuary',
    district: 'Bapatla',
    state: 'Andhra Pradesh',
    latitude: 15.8652,
    longitude: 80.6482,
    images: [
      'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Export-grade live green mud crabs caught and conditioned in estuarine pens. Ready for live air freight export to Singapore/Malaysia and luxury seafood restaurants.',
    status: 'active',
    farmer_rating: 4.94,
    reviews_count: 18,
    is_verified: true,
    verification_badge: 'CAA Registered Mud Crab Farm',
    created_at: '2026-09-11T12:00:00Z',
    updated_at: '2026-09-11T12:00:00Z'
  }
];

// Negotiation offers and trades
let seafoodOffers = [
  {
    id: 'off-101',
    listing_id: 'sea-001',
    farmer_id: 'farmer-bhimavaram-01',
    farmer_name: 'V. Satyanarayana Raju',
    buyer_id: 'buyer-vizag-exp',
    buyer_name: 'Naveen Chander (Procurement Head)',
    buyer_company: 'Bay of Bengal Frozen Foods & Exporters Ltd',
    buyer_type: 'exporter',
    buyer_phone: '+91 891 255 6789',
    buyer_location: 'Fishing Harbour, Visakhapatnam',
    buyer_district: 'Visakhapatnam',
    buyer_verified: true,
    buyer_verification_badge: 'MPEDA Export Code: EXP-AP-4890',
    initial_asking_price: 430,
    offered_price_per_kg: 415,
    requested_quantity_kg: 4500,
    proposed_harvest_date: '2026-09-18',
    pickup_terms: 'Buyer Reefer Truck (Pond-side collection with slush ice)',
    payment_terms: 'Direct RTGS Bank Transfer immediately upon gate weighing',
    status: 'negotiation',
    negotiation_history: [
      {
        sender: 'buyer',
        price_per_kg: 410,
        quantity_kg: 4500,
        message: 'We can lift the full 4.5 MT batch on 18th night. Offer ₹410/kg based on current export spot prices.',
        created_at: '2026-09-11T10:00:00Z'
      },
      {
        sender: 'farmer',
        price_per_kg: 420,
        quantity_kg: 4500,
        message: 'Count is strictly 30 count with zero soft shell. Minimum ₹420/kg acceptable for the full pond.',
        created_at: '2026-09-11T13:30:00Z'
      },
      {
        sender: 'buyer',
        price_per_kg: 415,
        quantity_kg: 4500,
        message: 'Counter offer: ₹415/kg. We will bear all icing and labor costs at pond-side.',
        created_at: '2026-09-11T15:00:00Z'
      }
    ],
    final_agreed_price_per_kg: null,
    final_agreed_quantity_kg: null,
    final_total_value: null,
    actual_weighed_quantity_kg: null,
    rejection_reason: null,
    dispatch_notes: null,
    created_at: '2026-09-11T10:00:00Z',
    updated_at: '2026-09-11T15:00:00Z'
  }
];

// Trade reviews
let seafoodReviews = [
  {
    id: 'rev-trade-1',
    offer_id: 'off-101',
    listing_id: 'sea-001',
    reviewer_id: 'buyer-vizag-exp',
    reviewer_role: 'buyer',
    reviewer_name: 'Bay of Bengal Frozen Foods Ltd',
    reviewee_id: 'farmer-bhimavaram-01',
    rating: 5,
    review_text: 'Excellent shrimp quality. Size distribution was exactly 30 count as promised, zero mud taste.',
    created_at: '2026-08-25T11:00:00Z'
  }
];

module.exports = {
  getTaxonomy() {
    return {
      species: SPECIES_TAXONOMY,
      buyer_types: BUYER_TYPES,
      buyer_hubs: Object.entries(BUYER_HUBS).map(([key, val]) => ({ key, ...val }))
    };
  },

  // 1. Discover Listings with Distance & Filters
  getListings(filters = {}, buyerLat = null, buyerLng = null) {
    const {
      species,
      min_quantity,
      max_quantity,
      min_price,
      max_price,
      count_grade,
      district,
      max_distance_km,
      search,
      verified_only,
      sort_by = 'distance' // 'distance' | 'price_asc' | 'price_desc' | 'quantity_desc' | 'rating'
    } = filters;

    let list = seafoodListings.map((item) => {
      let distanceKm = null;
      if (buyerLat && buyerLng) {
        distanceKm = calculateHaversineDistance(
          parseFloat(buyerLat),
          parseFloat(buyerLng),
          item.latitude,
          item.longitude
        );
      }
      return {
        ...item,
        distance_km: distanceKm
      };
    });

    // Filter: Species
    if (species && species !== 'all') {
      list = list.filter((l) => l.species === species);
    }

    // Filter: District
    if (district && district !== 'all') {
      list = list.filter((l) => l.district.toLowerCase() === district.toLowerCase());
    }

    // Filter: Size Count / Grade
    if (count_grade && count_grade !== 'all') {
      const qGrade = count_grade.toLowerCase();
      list = list.filter((l) => l.size_grade.toLowerCase().includes(qGrade));
    }

    // Filter: Quantity range
    if (min_quantity) {
      list = list.filter((l) => l.quantity_kg >= parseFloat(min_quantity));
    }
    if (max_quantity) {
      list = list.filter((l) => l.quantity_kg <= parseFloat(max_quantity));
    }

    // Filter: Price range
    if (min_price) {
      list = list.filter((l) => l.expected_price_per_kg >= parseFloat(min_price));
    }
    if (max_price) {
      list = list.filter((l) => l.expected_price_per_kg <= parseFloat(max_price));
    }

    // Filter: Max Distance
    if (max_distance_km && buyerLat && buyerLng) {
      const maxDist = parseFloat(max_distance_km);
      list = list.filter((l) => l.distance_km !== null && l.distance_km <= maxDist);
    }

    // Filter: Verified farmers only
    if (verified_only === 'true' || verified_only === true) {
      list = list.filter((l) => l.is_verified === true);
    }

    // Search query
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (l) =>
          l.species_label.toLowerCase().includes(q) ||
          l.farmer_name.toLowerCase().includes(q) ||
          l.location_name.toLowerCase().includes(q) ||
          l.district.toLowerCase().includes(q) ||
          l.size_grade.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sort_by === 'price_asc') {
      list.sort((a, b) => a.expected_price_per_kg - b.expected_price_per_kg);
    } else if (sort_by === 'price_desc') {
      list.sort((a, b) => b.expected_price_per_kg - a.expected_price_per_kg);
    } else if (sort_by === 'quantity_desc') {
      list.sort((a, b) => b.quantity_kg - a.quantity_kg);
    } else if (sort_by === 'rating') {
      list.sort((a, b) => b.farmer_rating - a.farmer_rating);
    } else if (sort_by === 'distance' && buyerLat && buyerLng) {
      list.sort((a, b) => (a.distance_km || 9999) - (b.distance_km || 9999));
    }

    return list;
  },

  getListingById(listingId, buyerLat = null, buyerLng = null) {
    const listing = seafoodListings.find((l) => l.id === listingId);
    if (!listing) return null;

    let distanceKm = null;
    if (buyerLat && buyerLng) {
      distanceKm = calculateHaversineDistance(
        parseFloat(buyerLat),
        parseFloat(buyerLng),
        listing.latitude,
        listing.longitude
      );
    }

    const reviews = seafoodReviews.filter((r) => r.listing_id === listingId);
    return {
      ...listing,
      distance_km: distanceKm,
      reviews
    };
  },

  // 2. Farmer Creates New Seafood Catch Listing
  createListing(payload, farmerId = 'farmer-demo', farmerName = 'Aqua Farmer', farmerPhone = '+91 98480 12345') {
    const speciesObj = SPECIES_TAXONOMY.find((s) => s.id === payload.species);
    const speciesLabel = speciesObj ? speciesObj.name : 'Commercial Seafood';

    // Default to Bhimavaram coordinates if none provided
    const lat = parseFloat(payload.latitude) || 16.5449;
    const lng = parseFloat(payload.longitude) || 81.5212;

    const newListing = {
      id: `sea-${Date.now()}`,
      farmer_id: payload.farmer_id || farmerId,
      farmer_name: payload.farmer_name || farmerName,
      farmer_phone: payload.farmer_phone || farmerPhone,
      farmer_whatsapp: payload.farmer_whatsapp || payload.farmer_phone || farmerPhone,
      pond_name: payload.pond_name || 'Main Culture Pond',
      species: payload.species,
      species_label: speciesLabel,
      quantity_kg: parseFloat(payload.quantity_kg) || 2000,
      min_order_quantity_kg: parseFloat(payload.min_order_quantity_kg) || 500,
      size_grade: payload.size_grade || '30 Count',
      count_per_kg: parseInt(payload.count_per_kg, 10) || (payload.size_grade?.match(/\d+/) ? parseInt(payload.size_grade.match(/\d+/)[0], 10) : null),
      quality_info: Array.isArray(payload.quality_info) ? payload.quality_info : (payload.quality_info ? [payload.quality_info] : ['Antibiotic-Free Certified', 'Pre-harvest Water Tested']),
      harvest_date: payload.harvest_date || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      availability_date: payload.availability_date || payload.harvest_date || new Date().toISOString().split('T')[0],
      is_immediate_harvest: Boolean(payload.is_immediate_harvest),
      expected_price_per_kg: parseFloat(payload.expected_price_per_kg) || 400,
      location_name: payload.location_name || 'Bhimavaram, Andhra Pradesh',
      district: payload.district || 'West Godavari',
      state: payload.state || 'Andhra Pradesh',
      latitude: lat,
      longitude: lng,
      images: Array.isArray(payload.images) && payload.images.length > 0 ? payload.images : ['https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80'],
      description: payload.description || 'Pristine harvest ready for commercial buyer collection.',
      status: 'active',
      farmer_rating: 4.90,
      reviews_count: 0,
      is_verified: true,
      verification_badge: 'CAA Registered Aquafarm',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    seafoodListings.unshift(newListing);
    return newListing;
  },

  // 3. Buyer Submits Inquiry / Formal Offer
  submitInquiryOrOffer(payload, buyerId = 'buyer-demo', buyerName = 'Procurement Officer', buyerCompany = 'Coastal Seafood Traders') {
    const listing = seafoodListings.find((l) => l.id === payload.listing_id);
    if (!listing) throw new Error('Seafood listing not found');

    const offeredPrice = parseFloat(payload.offered_price_per_kg) || listing.expected_price_per_kg;
    const requestedQty = parseFloat(payload.requested_quantity_kg) || listing.quantity_kg;

    const newOffer = {
      id: `off-${Date.now()}`,
      listing_id: listing.id,
      farmer_id: listing.farmer_id,
      farmer_name: listing.farmer_name,
      buyer_id: buyerId,
      buyer_name: payload.buyer_name || buyerName,
      buyer_company: payload.buyer_company || buyerCompany,
      buyer_type: payload.buyer_type || 'wholesaler',
      buyer_phone: payload.buyer_phone || '+91 98480 00000',
      buyer_location: payload.buyer_location || 'Andhra Pradesh',
      buyer_district: payload.buyer_district || 'Visakhapatnam',
      buyer_verified: true,
      buyer_verification_badge: payload.buyer_verification_badge || 'Verified Commercial Buyer',
      initial_asking_price: listing.expected_price_per_kg,
      offered_price_per_kg: offeredPrice,
      requested_quantity_kg: requestedQty,
      proposed_harvest_date: payload.proposed_harvest_date || listing.harvest_date,
      pickup_terms: payload.pickup_terms || 'Farmgate / Pond-side Reefer Truck Pickup',
      payment_terms: payload.payment_terms || 'Direct Bank Transfer upon Pond-side Weighment',
      status: payload.status || 'offer',
      negotiation_history: [
        {
          sender: 'buyer',
          price_per_kg: offeredPrice,
          quantity_kg: requestedQty,
          message: payload.message || `Initial offer of ₹${offeredPrice}/kg for ${requestedQty} kg catch.`,
          created_at: new Date().toISOString()
        }
      ],
      final_agreed_price_per_kg: null,
      final_agreed_quantity_kg: null,
      final_total_value: null,
      actual_weighed_quantity_kg: null,
      rejection_reason: null,
      dispatch_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    seafoodOffers.unshift(newOffer);
    return newOffer;
  },

  getFarmerOffers(farmerId = 'farmer-demo') {
    return seafoodOffers.filter((o) => o.farmer_id === farmerId || o.farmer_id === 'farmer-demo' || farmerId === 'all');
  },

  getBuyerOffers(buyerId = 'buyer-demo') {
    return seafoodOffers.filter((o) => o.buyer_id === buyerId || o.buyer_id === 'buyer-demo' || buyerId === 'all');
  },

  getOfferById(offerId) {
    const offer = seafoodOffers.find((o) => o.id === offerId);
    if (!offer) return null;
    const listing = seafoodListings.find((l) => l.id === offer.listing_id);
    return {
      ...offer,
      listing
    };
  },

  // 4. Negotiation Counter-Offer
  submitCounterOffer(offerId, senderRole, pricePerKg, quantityKg, message) {
    const offer = seafoodOffers.find((o) => o.id === offerId);
    if (!offer) return null;

    if (!['offer', 'negotiation'].includes(offer.status)) {
      throw new Error(`Cannot submit counter offer when status is '${offer.status}'`);
    }

    const price = parseFloat(pricePerKg) || offer.offered_price_per_kg;
    const qty = parseFloat(quantityKg) || offer.requested_quantity_kg;

    offer.status = 'negotiation';
    offer.offered_price_per_kg = price;
    offer.requested_quantity_kg = qty;
    offer.negotiation_history.push({
      sender: senderRole === 'farmer' ? 'farmer' : 'buyer',
      price_per_kg: price,
      quantity_kg: qty,
      message: message || `Counter-offer of ₹${price}/kg for ${qty} kg.`,
      created_at: new Date().toISOString()
    });
    offer.updated_at = new Date().toISOString();

    return offer;
  },

  // 5. Accept Offer -> Transitions to 'accepted'
  acceptOffer(offerId, senderRole) {
    const offer = seafoodOffers.find((o) => o.id === offerId);
    if (!offer) return null;

    offer.status = 'accepted';
    offer.final_agreed_price_per_kg = offer.offered_price_per_kg;
    offer.final_agreed_quantity_kg = offer.requested_quantity_kg;
    offer.final_total_value = offer.final_agreed_price_per_kg * offer.final_agreed_quantity_kg;

    offer.negotiation_history.push({
      sender: senderRole === 'farmer' ? 'farmer' : 'buyer',
      price_per_kg: offer.final_agreed_price_per_kg,
      quantity_kg: offer.final_agreed_quantity_kg,
      message: `Offer ACCEPTED at ₹${offer.final_agreed_price_per_kg}/kg for ${offer.final_agreed_quantity_kg} kg catch (Total: ₹${offer.final_total_value.toLocaleString()}). Trade agreement locked!`,
      created_at: new Date().toISOString()
    });

    // Update listing status to negotiating/sold
    const listing = seafoodListings.find((l) => l.id === offer.listing_id);
    if (listing) {
      listing.status = 'negotiating';
    }

    offer.updated_at = new Date().toISOString();
    return offer;
  },

  // 6. Reject Offer
  rejectOffer(offerId, senderRole, reason = 'Price terms unfeasible') {
    const offer = seafoodOffers.find((o) => o.id === offerId);
    if (!offer) return null;

    offer.status = 'rejected';
    offer.rejection_reason = reason;
    offer.negotiation_history.push({
      sender: senderRole === 'farmer' ? 'farmer' : 'buyer',
      price_per_kg: offer.offered_price_per_kg,
      quantity_kg: offer.requested_quantity_kg,
      message: `Offer DECLINED. Reason: ${reason}`,
      created_at: new Date().toISOString()
    });

    offer.updated_at = new Date().toISOString();
    return offer;
  },

  // 7. Update Trade Status ('processing' -> 'completed')
  updateTradeStatus(offerId, status, extra = {}) {
    const offer = seafoodOffers.find((o) => o.id === offerId);
    if (!offer) return null;

    const validStatuses = ['processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status transition: ${status}`);
    }

    offer.status = status;
    if (extra.actual_weighed_quantity_kg) {
      offer.actual_weighed_quantity_kg = parseFloat(extra.actual_weighed_quantity_kg);
      offer.final_total_value = (offer.final_agreed_price_per_kg || offer.offered_price_per_kg) * offer.actual_weighed_quantity_kg;
    }
    if (extra.dispatch_notes) offer.dispatch_notes = extra.dispatch_notes;
    if (extra.cancellation_reason) offer.cancellation_reason = extra.cancellation_reason;

    if (status === 'completed') {
      const listing = seafoodListings.find((l) => l.id === offer.listing_id);
      if (listing) listing.status = 'sold';
    }

    offer.updated_at = new Date().toISOString();
    return offer;
  },

  // 8. Submit Trade Review
  submitTradeReview(offerId, payload, reviewerId = 'user-demo', reviewerRole = 'buyer', reviewerName = 'Seafood Trader') {
    const offer = seafoodOffers.find((o) => o.id === offerId);
    if (!offer) return null;

    const revieweeId = reviewerRole === 'buyer' ? offer.farmer_id : offer.buyer_id;

    const newReview = {
      id: `rev-trade-${Date.now()}`,
      offer_id: offerId,
      listing_id: offer.listing_id,
      reviewer_id: reviewerId,
      reviewer_role: reviewerRole,
      reviewer_name: payload.reviewer_name || reviewerName,
      reviewee_id: revieweeId,
      rating: Math.min(5, Math.max(1, parseInt(payload.rating, 10) || 5)),
      review_text: payload.review_text || '',
      created_at: new Date().toISOString()
    };

    seafoodReviews.unshift(newReview);
    return newReview;
  }
};
