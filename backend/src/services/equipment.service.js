'use strict';

/**
 * equipment.service.js — Service & Provider for Aquaculture Machinery & Equipment Marketplace.
 * OLX-style classified marketplace connecting equipment buyers and sellers in aquaculture.
 */

// ─── 13 Standard Categories ──────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'aerators',          name: 'Aerators & Paddlewheels', telugu_name: 'ఏరియేటర్లు & వీల్స్', icon: '🌀' },
  { id: 'water_pumps',       name: 'Water Pumps & Submersibles', telugu_name: 'వాటర్ పంపులు', icon: '💧' },
  { id: 'motors',            name: 'Electric Motors', telugu_name: 'ఎలక్ట్రిక్ మోటార్లు', icon: '⚡' },
  { id: 'generators',        name: 'Generators (DG Sets)', telugu_name: 'జనరేటర్లు (DG సెట్లు)', icon: '🔋' },
  { id: 'feeding_machines',  name: 'Auto Feeding Machines', telugu_name: 'ఆటో ఫీడింగ్ యంత్రాలు', icon: '🤖' },
  { id: 'testing_equipment', name: 'Water Testing Equipment (DO/pH)', telugu_name: 'వాటర్ టెస్టింగ్ కిట్లు', icon: '🔬' },
  { id: 'nets',              name: 'Nets & Harvesting Gear', telugu_name: 'వలలు & హార్వెస్టింగ్ గేర్', icon: '🕸️' },
  { id: 'pipes',             name: 'Pipes & Fittings (HDPE/PVC)', telugu_name: 'పైపులు & ఫిట్టింగులు', icon: '🚰' },
  { id: 'tanks',             name: 'Nursery & Biofloc Tanks', telugu_name: 'ట్యాంకులు', icon: '🛁' },
  { id: 'boats',             name: 'Feeding Boats & Floats', telugu_name: 'ఫీడింగ్ పడవలు', icon: '🛶' },
  { id: 'pond_equipment',    name: 'Pond Accessories & Siphons', telugu_name: 'చెరువు ఉపకరణాలు', icon: '🛠️' },
  { id: 'electrical',        name: 'Starters & Phase Controllers', telugu_name: 'ఎలక్ట్రికల్ స్టార్టర్లు', icon: '🔌' },
  { id: 'other',             name: 'Other Machinery', telugu_name: 'ఇతర యంత్రాలు', icon: '⚙️' },
];

// ─── In-Memory Store & Baseline Seed Data ─────────────────────────────────────
let memoryListings = [
  {
    id: 'eq-001',
    seller_id: '00000000-0000-0000-0000-000000000001',
    seller_name: 'Sri Krishna Aqua Traders',
    seller_phone: '+91 98480 34567',
    seller_rating: 4.9,
    seller_reviews_count: 18,
    seller_is_verified: true,
    title: 'Tai Yih Sun 4-Paddlewheel Aerator Set (2 HP)',
    category: 'aerators',
    condition: 'like_new', // 'new', 'like_new', 'good', 'fair'
    price: 28500,
    is_negotiable: true,
    description: 'Used for only 1 culture crop (90 days). Comes with original Taiwan bevel gear box, stainless steel frame, virgin plastic impellers and 2 HP Crompton motor. Working condition 100%.',
    location: 'Palakollu Road, Bhimavaram',
    state: 'Andhra Pradesh',
    district: 'West Godavari',
    contact_phone: '+91 98480 34567',
    contact_whatsapp: '+919848034567',
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'active', // 'active', 'sold', 'reserved'
    views_count: 142,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'eq-002',
    seller_id: '00000000-0000-0000-0000-000000000002',
    seller_name: 'Coastal Agro Engineering',
    seller_phone: '+91 94401 56789',
    seller_rating: 4.8,
    seller_reviews_count: 24,
    seller_is_verified: true,
    title: 'Kirloskar 15 HP Diesel Engine Water Pump Set',
    category: 'water_pumps',
    condition: 'good',
    price: 42000,
    is_negotiable: true,
    description: '15 HP Kirloskar water-cooled diesel engine coupled with 6x6 high volume centrifugal pump. Ideal for quick pond filling and water exchange during salinity management.',
    location: 'Mypadu Highway, Nellore',
    state: 'Andhra Pradesh',
    district: 'Nellore',
    contact_phone: '+91 94401 56789',
    contact_whatsapp: '+919440156789',
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'active',
    views_count: 215,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'eq-003',
    seller_id: '00000000-0000-0000-0000-000000000003',
    seller_name: 'Gujarat Aqua Tech',
    seller_phone: '+91 98250 89012',
    seller_rating: 5.0,
    seller_reviews_count: 12,
    seller_is_verified: true,
    title: 'Solar Auto Shrimp Feeder Machine (100 kg Capacity)',
    category: 'feeding_machines',
    condition: 'new',
    price: 36000,
    is_negotiable: false,
    description: 'Brand new automated shrimp feeder with digital timer controller and solar battery backup. 360-degree feed throw radius up to 15 meters. Saves up to 20% labor and improves FCR.',
    location: 'Olpad Industrial Area, Surat',
    state: 'Gujarat',
    district: 'Surat',
    contact_phone: '+91 98250 89012',
    contact_whatsapp: '+919825089012',
    images: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'active',
    views_count: 98,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'eq-004',
    seller_id: '00000000-0000-0000-0000-000000000004',
    seller_name: 'Marine Lab Solutions',
    seller_phone: '+91 98660 12345',
    seller_rating: 4.9,
    seller_reviews_count: 31,
    seller_is_verified: true,
    title: 'Hanna HI98193 Professional Optical DO Meter',
    category: 'testing_equipment',
    condition: 'like_new',
    price: 31500,
    is_negotiable: true,
    description: 'Used for laboratory spot checks only. Comes with 4-meter cable, replacement membrane caps, calibration solution, and waterproof rugged field carrying case. Accurate up to 50 ppm DO.',
    location: 'Suryaraopeta, Kakinada',
    state: 'Andhra Pradesh',
    district: 'East Godavari',
    contact_phone: '+91 98660 12345',
    contact_whatsapp: '+919866012345',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'active',
    views_count: 310,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: 'eq-005',
    seller_id: '00000000-0000-0000-0000-000000000005',
    seller_name: 'Bapatla Pipe Distributors',
    seller_phone: '+91 94410 67890',
    seller_rating: 4.7,
    seller_reviews_count: 8,
    seller_is_verified: true,
    title: '1,000 Meters 3-Inch Heavy Duty HDPE Coil Pipe',
    category: 'pipes',
    condition: 'new',
    price: 18500,
    is_negotiable: false,
    description: 'High-density polyethylene PN6 grade black UV stabilized coil pipe. Best for aerator venturi airline tubing and freshwater intake lines. Full roll available with brass joiners.',
    location: 'Nizampatnam Road, Bapatla',
    state: 'Andhra Pradesh',
    district: 'Bapatla',
    contact_phone: '+91 94410 67890',
    contact_whatsapp: '+919441067890',
    images: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'active',
    views_count: 82,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'eq-006',
    seller_id: '00000000-0000-0000-0000-000000000006',
    seller_name: 'Balaji Heavy Power',
    seller_phone: '+91 98401 23456',
    seller_rating: 4.8,
    seller_reviews_count: 15,
    seller_is_verified: true,
    title: 'Mahindra 25 kVA Silent Diesel Generator Set',
    category: 'generators',
    condition: 'good',
    price: 185000,
    is_negotiable: true,
    description: 'Soundproof acoustic canopy with 3-phase alternator. Recently serviced with new fuel injection pump and filters. Can power up to 12 aerator motors simultaneously.',
    location: 'Kasimedu Coastal, Chennai',
    state: 'Tamil Nadu',
    district: 'Chennai',
    contact_phone: '+91 98401 23456',
    contact_whatsapp: '+919840123456',
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'active',
    views_count: 177,
    inquiries_count: 14,
    badge: 'HEAVY POWER',
    delivery_available: true,
    estimated_transport_cost: 3500,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'eq-007',
    seller_id: '00000000-0000-0000-0000-000000000007',
    seller_name: 'Vijayawada Electric Works',
    seller_phone: '+91 98492 44556',
    seller_rating: 4.9,
    seller_reviews_count: 28,
    seller_is_verified: true,
    title: 'Crompton Greaves 5 HP 3-Phase TEFC Aerator Motor',
    category: 'motors',
    condition: 'new',
    price: 14500,
    is_negotiable: true,
    description: 'Brand new 5 HP (3.7 kW) 1440 RPM 3-Phase cast iron body induction motor. Copper wound stator with Class F insulation and double lip seal for coastal salinity and high humidity durability. Tested for continuous 24-hour aerator load.',
    location: 'Autonagar Industrial Area, Vijayawada',
    state: 'Andhra Pradesh',
    district: 'Krishna',
    contact_phone: '+91 98492 44556',
    contact_whatsapp: '+919849244556',
    images: [
      'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'active',
    views_count: 156,
    inquiries_count: 12,
    badge: 'TOP RATED',
    delivery_available: true,
    estimated_transport_cost: 800,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'eq-008',
    seller_id: '00000000-0000-0000-0000-000000000008',
    seller_name: 'Bandar Marine Net Makers',
    seller_phone: '+91 94403 77889',
    seller_rating: 4.8,
    seller_reviews_count: 19,
    seller_is_verified: true,
    title: 'Monofilament 40-Mesh Shrimp Harvesting Drag Net (120 Feet)',
    category: 'nets',
    condition: 'new',
    price: 12800,
    is_negotiable: false,
    description: 'Professional knotless nylon drag harvest net. 120-foot length, 8-foot depth with galvanized lead sinker bottom line and heavy-duty EVA bullet floats. Ensures zero stress harvest without gill scratches.',
    location: 'Port Road, Machilipatnam',
    state: 'Andhra Pradesh',
    district: 'Krishna',
    contact_phone: '+91 94403 77889',
    contact_whatsapp: '+919440377889',
    images: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'active',
    views_count: 94,
    inquiries_count: 8,
    badge: 'VERIFIED DEAL',
    delivery_available: true,
    estimated_transport_cost: 650,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'eq-009',
    seller_id: '00000000-0000-0000-0000-000000000009',
    seller_name: 'Godavari Nursery Tech',
    seller_phone: '+91 99890 22334',
    seller_rating: 5.0,
    seller_reviews_count: 11,
    seller_is_verified: true,
    title: '10,000 Liter Heavy-Duty Nursery Tank with Central Drain',
    category: 'tanks',
    condition: 'like_new',
    price: 38000,
    is_negotiable: true,
    description: 'Corrugated zinc-coated steel outer wall with heavy 0.85mm anti-algae virgin PVC tarpaulin. Built-in central slope bottom and 4-inch flush drain valve for easy sludge clearing. Used for 2 PL nursery batches.',
    location: 'Peddapuram Road, Kakinada',
    state: 'Andhra Pradesh',
    district: 'East Godavari',
    contact_phone: '+91 99890 22334',
    contact_whatsapp: '+919989022334',
    images: [
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'active',
    views_count: 204,
    inquiries_count: 17,
    badge: 'HOT',
    delivery_available: true,
    estimated_transport_cost: 1800,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'eq-010',
    seller_id: '00000000-0000-0000-0000-000000000010',
    seller_name: 'Konaseema Fiber Crafts',
    seller_phone: '+91 94411 99001',
    seller_rating: 4.6,
    seller_reviews_count: 7,
    seller_is_verified: true,
    title: '14-Foot Fiberglass (FRP) Aqua Feeding & Inspection Boat',
    category: 'boats',
    condition: 'good',
    price: 22000,
    is_negotiable: true,
    description: 'Double-walled unsinkable marine fiberglass construction. Flat bottom design offers supreme stability in shallow aqua ponds. Accommodates 3 workers or 250 kg feed bags easily. Includes 2 wooden paddle oars.',
    location: 'Peruru Aqua Junction, Amalapuram',
    state: 'Andhra Pradesh',
    district: 'Dr. B.R. Ambedkar Konaseema',
    contact_phone: '+91 94411 99001',
    contact_whatsapp: '+919441199001',
    images: [
      'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'active',
    views_count: 188,
    inquiries_count: 15,
    badge: 'DISTRESS SALE',
    delivery_available: true,
    estimated_transport_cost: 1400,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'eq-011',
    seller_id: '00000000-0000-0000-0000-000000000011',
    seller_name: 'Vizag Industrial Tools',
    seller_phone: '+91 98481 66778',
    seller_rating: 4.9,
    seller_reviews_count: 22,
    seller_is_verified: true,
    title: 'Submersible Sludge Suction Pump with Cutter Impeller (3 HP)',
    category: 'pond_equipment',
    condition: 'like_new',
    price: 26500,
    is_negotiable: true,
    description: 'High torque 3 HP cast-iron submersible cutter pump designed specifically to evacuate pond bottom organic waste, black soil accumulation, and dead algae between harvests. 3-inch discharge diameter.',
    location: 'Woodpeta, Anakapalli',
    state: 'Andhra Pradesh',
    district: 'Anakapalli',
    contact_phone: '+91 98481 66778',
    contact_whatsapp: '+919848166778',
    images: [
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'active',
    views_count: 139,
    inquiries_count: 11,
    badge: 'VERIFIED DEAL',
    delivery_available: true,
    estimated_transport_cost: 1100,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'eq-012',
    seller_id: '00000000-0000-0000-0000-000000000012',
    seller_name: 'Guntur Automation Panels',
    seller_phone: '+91 98665 33445',
    seller_rating: 5.0,
    seller_reviews_count: 36,
    seller_is_verified: true,
    title: 'GSM SMS 3-Phase Smart Timer Starter Panel (8-Aerator Channels)',
    category: 'electrical',
    condition: 'new',
    price: 16200,
    is_negotiable: false,
    description: 'Microcontroller cyclic timer with GSM modem. Sends instant SMS and phone ring whenever 3-phase power trips or dry run occurs at the pond during the night. Auto alternates between aerator sets to save power.',
    location: 'Industrial Estate, Guntur',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    contact_phone: '+91 98665 33445',
    contact_whatsapp: '+919866533445',
    images: [
      'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'active',
    views_count: 247,
    inquiries_count: 29,
    badge: 'HOT',
    delivery_available: true,
    estimated_transport_cost: 500,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'eq-013',
    seller_id: '00000000-0000-0000-0000-000000000013',
    seller_name: 'Surat Marine Oxygenation',
    seller_phone: '+91 98251 11223',
    seller_rating: 4.8,
    seller_reviews_count: 14,
    seller_is_verified: true,
    title: 'Microbubble Vortex Nanobubble Oxygen Diffuser System',
    category: 'other',
    condition: 'new',
    price: 44000,
    is_negotiable: true,
    description: 'High efficiency vortex nanobubble generator with ceramic membrane diffuser. Creates sub-200nm microbubbles that remain suspended in the water column for hours. Ideal for super-intensive nursery tanks.',
    location: 'Hazira Marine Road, Surat',
    state: 'Gujarat',
    district: 'Surat',
    contact_phone: '+91 98251 11223',
    contact_whatsapp: '+919825111223',
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'active',
    views_count: 162,
    inquiries_count: 13,
    badge: 'TOP RATED',
    delivery_available: true,
    estimated_transport_cost: 2100,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'eq-014',
    seller_id: '00000000-0000-0000-0000-000000000014',
    seller_name: 'Eluru Aqua Fabrication',
    seller_phone: '+91 94405 66778',
    seller_rating: 4.7,
    seller_reviews_count: 9,
    seller_is_verified: true,
    title: 'Heavy-Duty SS-316 Sluice Gate Screen Filters (Set of 6)',
    category: 'pond_equipment',
    condition: 'good',
    price: 9500,
    is_negotiable: true,
    description: 'Set of 6 stainless steel 316 mesh sluice gate screens with marine-coated structural aluminum frames (3x2 ft). Keeps predatory fish out during pond filling and prevents shrimp escaping at water discharge.',
    location: 'Gudivada Highway, Eluru',
    state: 'Andhra Pradesh',
    district: 'Eluru',
    contact_phone: '+91 94405 66778',
    contact_whatsapp: '+919440566778',
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'active',
    views_count: 118,
    inquiries_count: 10,
    badge: 'BUDGET PICK',
    delivery_available: true,
    estimated_transport_cost: 700,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];

let memoryFavorites = new Map(); // userId -> Set of listingIds
let memoryReviews = [];
let memoryReports = [];
let memoryInquiries = [];

// Initialize demo favorites
memoryFavorites.set('00000000-0000-0000-0000-000000000001', new Set(['eq-001', 'eq-003', 'eq-007']));

// ─── Service Methods ─────────────────────────────────────────────────────────

function getCategories() {
  return CATEGORIES;
}

/**
 * Get equipment listings with filters & sorting
 */
async function getListings(filters = {}) {
  const {
    category,
    condition,
    state,
    district,
    min_price,
    max_price,
    search,
    sort = 'newest',
    seller_id,
    favorites_only,
    current_user_id,
  } = filters;

  let list = [...memoryListings];

  // Filter out sold/inactive items for general buyers (unless viewing own listings)
  if (!seller_id) {
    list = list.filter(item => item.status !== 'deleted');
  } else {
    list = list.filter(item => item.seller_id === seller_id);
  }

  if (favorites_only === 'true' && current_user_id) {
    const userFavs = memoryFavorites.get(current_user_id) || new Set();
    list = list.filter(item => userFavs.has(item.id));
  }

  if (category && category !== 'all') {
    list = list.filter(item => item.category === category);
  }

  if (condition && condition !== 'all') {
    list = list.filter(item => item.condition === condition);
  }

  if (state && state !== 'all') {
    list = list.filter(item => item.state.toLowerCase() === state.toLowerCase());
  }

  if (district && district !== 'all') {
    list = list.filter(item => item.district.toLowerCase() === district.toLowerCase());
  }

  if (min_price) {
    list = list.filter(item => item.price >= parseFloat(min_price));
  }

  if (max_price) {
    list = list.filter(item => item.price <= parseFloat(max_price));
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.district.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sort === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else {
    // Default: newest first
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const userFavs = memoryFavorites.get(current_user_id) || new Set();

  return list.map(item => {
    const inquiries = item.inquiries_count ?? (Math.floor(((item.views_count || 10) * 7) % 25) + 3);
    const liveViewers = item.live_viewers ?? (Math.floor(((item.views_count || 5) % 6) + 2));
    const badge = item.badge || (item.condition === 'new' ? 'BRAND NEW' : item.is_negotiable ? 'NEGOTIABLE' : 'VERIFIED DEAL');

    return {
      ...item,
      categoryInfo: CATEGORIES.find(c => c.id === item.category) || { name: item.category, icon: '⚙️' },
      isFavorited: userFavs.has(item.id),
      inquiries_count: inquiries,
      live_viewers: liveViewers,
      delivery_available: item.delivery_available ?? true,
      estimated_transport_cost: item.estimated_transport_cost || 1200,
      badge,
    };
  });
}

/**
 * Record a buyer inquiry dynamically
 */
async function recordInquiry(id, buyerName, buyerPhone) {
  const item = memoryListings.find(l => l.id === id);
  if (!item) return null;
  item.inquiries_count = (item.inquiries_count || 0) + 1;
  item.views_count = (item.views_count || 0) + 1;

  const inquiryEntry = {
    id: `inq-${Date.now()}`,
    listing_id: id,
    buyer_name: buyerName || 'Farmer',
    buyer_phone: buyerPhone || '',
    created_at: new Date().toISOString(),
  };
  memoryInquiries.push(inquiryEntry);

  return {
    success: true,
    message: 'Inquiry recorded.',
    inquiries_count: item.inquiries_count,
    views_count: item.views_count,
  };
}

/**
 * Get listing by ID & increment view count
 */
async function getListingById(id, currentUserId) {
  const item = memoryListings.find(l => l.id === id);
  if (!item) return null;

  item.views_count += 1;

  const userFavs = memoryFavorites.get(currentUserId) || new Set();
  const sellerReviews = memoryReviews.filter(r => r.seller_id === item.seller_id);

  return {
    ...item,
    categoryInfo: CATEGORIES.find(c => c.id === item.category) || { name: item.category, icon: '⚙️' },
    isFavorited: userFavs.has(item.id),
    sellerReviews,
  };
}

/**
 * Create new equipment listing
 */
async function createListing(sellerId, sellerName, sellerPhone, listingData) {
  const {
    title,
    category,
    condition = 'used',
    price,
    is_negotiable = false,
    description,
    location,
    state,
    district,
    contact_phone,
    contact_whatsapp,
    images = [],
  } = listingData;

  const newListing = {
    id: `eq-${Date.now()}`,
    seller_id: sellerId,
    seller_name: sellerName || 'Verified Seller',
    seller_phone: contact_phone || sellerPhone || '+91 98480 00000',
    seller_rating: 5.0,
    seller_reviews_count: 0,
    seller_is_verified: true,
    title,
    category: category || listingData.category_id,
    condition,
    price: parseFloat(price),
    is_negotiable: Boolean(is_negotiable),
    description,
    location,
    state,
    district,
    contact_phone: contact_phone || sellerPhone || '+91 98480 00000',
    contact_whatsapp: contact_whatsapp || contact_phone || sellerPhone,
    images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'],
    status: 'active',
    views_count: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  memoryListings.unshift(newListing);
  return getListingById(newListing.id, sellerId);
}

/**
 * Update listing
 */
async function updateListing(id, sellerId, updates) {
  const item = memoryListings.find(l => l.id === id && l.seller_id === sellerId);
  if (!item) throw new Error('Listing not found or unauthorized.');

  Object.assign(item, {
    ...updates,
    updated_at: new Date().toISOString(),
  });

  return getListingById(id, sellerId);
}

/**
 * Change status ('active', 'sold', 'reserved')
 */
async function markListingStatus(id, sellerId, status) {
  const item = memoryListings.find(l => l.id === id && l.seller_id === sellerId);
  if (!item) throw new Error('Listing not found or unauthorized.');

  item.status = status;
  item.updated_at = new Date().toISOString();
  return item;
}

/**
 * Delete listing
 */
async function deleteListing(id, sellerId) {
  const index = memoryListings.findIndex(l => l.id === id && l.seller_id === sellerId);
  if (index === -1) throw new Error('Listing not found or unauthorized.');

  memoryListings.splice(index, 1);
  return { success: true };
}

/**
 * Favorites / Wishlist
 */
async function getUserFavorites(userId) {
  const favSet = memoryFavorites.get(userId) || new Set();
  const list = memoryListings
    .filter(l => favSet.has(l.id))
    .map(item => ({
      ...item,
      categoryInfo: CATEGORIES.find(c => c.id === item.category) || { name: item.category, icon: '⚙️' },
      isFavorited: true,
    }));
  return list;
}

async function addFavorite(userId, listingId) {
  if (!memoryFavorites.has(userId)) {
    memoryFavorites.set(userId, new Set());
  }
  memoryFavorites.get(userId).add(listingId);
  return { success: true, isFavorited: true };
}

async function removeFavorite(userId, listingId) {
  if (memoryFavorites.has(userId)) {
    memoryFavorites.get(userId).delete(listingId);
  }
  return { success: true, isFavorited: false };
}

/**
 * Reviews & Ratings
 */
async function submitSellerReview(reviewerId, reviewerName, reviewData) {
  const { listing_id, seller_id, rating, review_text } = reviewData;

  const newReview = {
    id: `eq-rev-${Date.now()}`,
    listing_id: listing_id || null,
    reviewer_id: reviewerId,
    reviewer_name: reviewerName || 'Verified Buyer',
    seller_id,
    rating: parseInt(rating, 10),
    review_text,
    created_at: new Date().toISOString(),
  };

  memoryReviews.unshift(newReview);

  // Recalculate seller rating across all listings
  const sellerReviews = memoryReviews.filter(r => r.seller_id === seller_id);
  const avg = sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length;
  const newRating = Math.round(avg * 10) / 10;

  memoryListings
    .filter(l => l.seller_id === seller_id)
    .forEach(l => {
      l.seller_rating = newRating;
      l.seller_reviews_count = sellerReviews.length;
    });

  return newReview;
}

/**
 * Report Listing
 */
async function submitListingReport(reporterId, reportData) {
  const { listing_id, reason } = reportData;

  const newReport = {
    id: `eq-rep-${Date.now()}`,
    reporter_id: reporterId,
    listing_id,
    reason,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  memoryReports.push(newReport);
  return { success: true, message: 'Listing reported to marketplace moderators.' };
}

module.exports = {
  CATEGORIES,
  getCategories,
  getListings,
  getListingById,
  createListing,
  updateListing,
  markListingStatus,
  deleteListing,
  getUserFavorites,
  addFavorite,
  removeFavorite,
  submitSellerReview,
  submitListingReport,
  recordInquiry,
};
