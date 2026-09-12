'use strict';

// Import existing services across all 9 modules (Zero duplication)
const marketPriceService = require('./marketPrice.service');
const jobsService = require('./jobs.service');
const equipmentService = require('./equipment.service');
const hatcheryService = require('./hatchery.service');
const diseaseAiService = require('./diseaseAi.service');
const preventionEngineService = require('./preventionEngine.service');
const expertConsultationService = require('./expertConsultation.service');
const suppliesService = require('./supplies.service');
const seafoodService = require('./seafood.service');

// Default demo farmer ponds
const DEMO_PONDS = [
  {
    id: 'pond-demo-01',
    name: 'Pond 1 (North Vannamei)',
    species: 'Vannamei Shrimp',
    species_key: 'vannamei_shrimp',
    district: 'West Godavari',
    size_acres: 2.5,
    stocking_density: 60,
    stocked_count: 607000,
    days_of_culture: 68,
    status: 'active',
    health_score: 92,
    water_parameters: {
      pH: 7.9,
      dissolved_oxygen: 5.4,
      temperature: 28.5,
      salinity: 15,
      ammonia: 0.04,
      nitrite: 0.02
    }
  },
  {
    id: 'pond-demo-02',
    name: 'Pond 2 (South Brackish)',
    species: 'Black Tiger Prawn',
    species_key: 'tiger_prawn',
    district: 'West Godavari',
    size_acres: 3.0,
    stocking_density: 30,
    stocked_count: 364000,
    days_of_culture: 82,
    status: 'active',
    health_score: 84,
    water_parameters: {
      pH: 8.2,
      dissolved_oxygen: 4.8,
      temperature: 29.1,
      salinity: 22,
      ammonia: 0.08,
      nitrite: 0.05
    }
  },
  {
    id: 'pond-demo-03',
    name: 'Pond 3 (Nursery Seabass)',
    species: 'Asian Seabass',
    species_key: 'asian_seabass',
    district: 'West Godavari',
    size_acres: 1.2,
    stocking_density: 15,
    stocked_count: 72000,
    days_of_culture: 45,
    status: 'active',
    health_score: 95,
    water_parameters: {
      pH: 7.6,
      dissolved_oxygen: 6.2,
      temperature: 27.8,
      salinity: 12,
      ammonia: 0.02,
      nitrite: 0.01
    }
  }
];

// In-memory notifications store
let notifications = [
  {
    id: 'notif-1',
    category: 'water_quality',
    title: 'Optimal Dissolved Oxygen',
    title_te: 'సరైన ఆక్సిజన్ స్థాయిలు',
    message: 'Pond 1 morning DO is stable at 5.4 ppm. Aeration routine optimal.',
    message_te: 'చెరువు 1 లో ఉదయం DO 5.4 ppm వద్ద స్థిరంగా ఉంది.',
    severity: 'success',
    is_read: false,
    created_at: new Date(Date.now() - 30 * 60000).toISOString(),
    action_path: '/ponds'
  },
  {
    id: 'notif-2',
    category: 'market_price',
    title: 'Bhimavaram Mandi Price Surge',
    title_te: 'భీమవరం మార్కెట్ ధర పెరుగుదల',
    message: '30-Count Vannamei shrimp surged +₹15/kg to ₹430/kg today.',
    message_te: '30-కౌంట్ వెన్నామి రొయ్యల ధర నేడు ₹15 పెరిగి ₹430కి చేరింది.',
    severity: 'info',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    action_path: '/market-prices'
  },
  {
    id: 'notif-3',
    category: 'buyer_inquiry',
    title: 'New Commercial Buyer Offer',
    title_te: 'కొత్త కొనుగోలుదారుని ఆఫర్',
    message: 'Bay of Bengal Exporters offered ₹415/kg for 4,500 kg from Pond 1.',
    message_te: 'బే ఆఫ్ బెంగాల్ ఎక్స్‌పోర్టర్స్ చెరువు 1 నుండి 4.5 టన్నులకు ₹415 ఆఫర్ చేశారు.',
    severity: 'warning',
    is_read: false,
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    action_path: '/seafood'
  },
  {
    id: 'notif-4',
    category: 'consultation',
    title: 'Doctor Murthy Prescribed Action Plan',
    title_te: 'డాక్టర్ మూర్తి గారి సలహా పత్రం',
    message: 'Review completed for suspected WSSV. Prophylactic aeration protocol issued.',
    message_te: 'రొయ్యల వ్యాధి నివారణకు ఏరియేషన్ ప్రోటోకాల్ జారీ చేయబడింది.',
    severity: 'success',
    is_read: true,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    action_path: '/consultations'
  }
];

module.exports = {
  // 1. Comprehensive Personalized Dashboard Overview (All 16 Elements)
  async getFarmerOverview(preferences = {}) {
    const {
      district = 'West Godavari',
      species = 'vannamei_shrimp',
      pond_id = 'pond-demo-01',
      lat = 16.5449,
      lng = 81.5212
    } = preferences;

    // A. Active Pond Selection
    const activePond = DEMO_PONDS.find(p => p.id === pond_id) || DEMO_PONDS[0];

    // B. Ponds & Stocking Summary
    const totalPonds = DEMO_PONDS.length;
    const totalStocked = DEMO_PONDS.reduce((sum, p) => sum + p.stocked_count, 0);
    const avgHealthScore = Math.round(
      DEMO_PONDS.reduce((sum, p) => sum + p.health_score, 0) / totalPonds
    );

    // C. Live Water Quality (Active Pond)
    const waterQuality = {
      pond_id: activePond.id,
      pond_name: activePond.name,
      ...activePond.water_parameters,
      overall_status: activePond.health_score >= 85 ? 'optimal' : 'warning',
      parameters_status: {
        dissolved_oxygen: activePond.water_parameters.dissolved_oxygen >= 5.0 ? 'optimal' : 'alert',
        pH: (activePond.water_parameters.pH >= 7.5 && activePond.water_parameters.pH <= 8.5) ? 'optimal' : 'warning',
        ammonia: activePond.water_parameters.ammonia <= 0.05 ? 'optimal' : 'warning',
        salinity: 'optimal',
        temperature: 'optimal'
      }
    };

    // D. Disease Risk (Phase 6 Engine)
    const diseaseRisk = {
      risk_level: activePond.health_score >= 88 ? 'low' : 'moderate',
      health_score: activePond.health_score,
      vulnerability_factors: [
        'Cloudy sky forecast (Monitor pre-dawn DO levels)',
        'Full-moon molting cycle approaching in 4 days'
      ],
      active_warnings: [
        {
          id: 'warn-1',
          parameter: 'DO',
          message: 'Ensure 6 paddlewheel aerators run between 02:00 AM - 06:00 AM',
          severity: 'info'
        }
      ]
    };

    // E. Recent AI Disease Screenings (Phase 5)
    const recentAiReports = [
      {
        id: 'ai-scr-01',
        pond_name: activePond.name,
        suspected_condition: 'Healthy Exoskeleton (Minor Gut Emptiness)',
        risk_level: 'Low',
        confidence_pct: 94.2,
        recommendation: 'Increase probiotic binder dressing in morning ration.',
        date: '2026-09-11'
      }
    ];

    // F. Preventive Actions & Daily Checklist (Phase 6)
    const preventiveActions = {
      daily_tasks: [
        { id: 'task-1', task: 'Check check-tray feed consumption (Tray 1-4)', completed: true },
        { id: 'task-2', task: 'Pre-dawn DO measurement (Target >= 5.0 ppm)', completed: true },
        { id: 'task-3', task: 'Apply 1kg EcoBact Soil Probiotic fermented mix', completed: false },
        { id: 'task-4', task: 'Evening paddlewheel aerator inspection', completed: false }
      ],
      weekly_milestones: [
        { id: 'wm-1', task: 'Lab water test for Ammonia, Nitrite, Alkalinity', completed: true },
        { id: 'wm-2', task: 'Carapace molting hardness check', completed: false }
      ]
    };

    // G. Live Seafood Spot Prices & Mandi Rates (Phase 1)
    let marketPrices = [];
    try {
      marketPrices = marketPriceService.getLivePrices({ market: 'Bhimavaram', species: 'Vannamei' });
    } catch (e) {
      marketPrices = [
        { count: 30, price: 430, change_24h: 15, trend: 'up' },
        { count: 40, price: 375, change_24h: 10, trend: 'up' },
        { count: 50, price: 320, change_24h: 5, trend: 'stable' },
        { count: 60, price: 290, change_24h: 0, trend: 'stable' },
        { count: 100, price: 235, change_24h: -5, trend: 'down' }
      ];
    }

    // H. Price Trends
    const priceTrends = {
      top_market: 'Bhimavaram Mandi (West Godavari)',
      overall_market_sentiment: 'Bullish (+3.8% week-on-week for 30-40 counts)',
      highest_rate_species: 'Black Tiger Prawn (₹680/kg @ 20ct)'
    };

    // I. Nearby Hatcheries & Seed Availability (Phase 4)
    let nearbyHatcheries = [];
    try {
      const filtered = hatcheryService.getHatcheries({ district }, lat, lng);
      if (filtered && filtered.length > 0) {
        nearbyHatcheries = filtered.slice(0, 3);
      } else {
        nearbyHatcheries = hatcheryService.getHatcheries({}, lat, lng).slice(0, 3);
      }
    } catch (e) {
      nearbyHatcheries = [];
    }

    // J. Available Farm Workers & Technicians (Phase 2)
    let availableWorkers = [];
    try {
      const workersRes = await jobsService.getWorkers({ district });
      availableWorkers = Array.isArray(workersRes) ? workersRes.slice(0, 3) : [];
    } catch (e) {
      availableWorkers = [];
    }

    // K. Machinery & Equipment Highlights (Phase 3)
    let machineryHighlights = [];
    try {
      const equipRes = await equipmentService.getListings({ district });
      machineryHighlights = Array.isArray(equipRes) ? equipRes.slice(0, 3) : [];
    } catch (e) {
      machineryHighlights = [];
    }

    // L. Verified Expert Consultation (Phase 7)
    let expertConsultations = [];
    try {
      expertConsultations = expertConsultationService.getExperts({ verified_only: true }).slice(0, 3);
    } catch (e) {
      expertConsultations = [];
    }

    // M. Farm Supplies & Medicines (Phase 8)
    let farmSupplies = [];
    try {
      farmSupplies = suppliesService.getProducts({ in_stock_only: true }).slice(0, 4);
    } catch (e) {
      farmSupplies = [];
    }

    // N. My Seafood Listings & Buyer Offers (Phase 9)
    let mySeafoodListings = [];
    let buyerOffers = [];
    try {
      mySeafoodListings = seafoodService.getListings({ district }).slice(0, 2);
      const directOffers = seafoodService.getFarmerOffers('farmer-demo');
      if (directOffers && directOffers.length > 0) {
        buyerOffers = directOffers.slice(0, 3);
      } else {
        buyerOffers = [
          {
            id: 'offer-demo-1',
            buyerName: 'Bay of Bengal Seafood Exporters',
            buyerLocation: 'Visakhapatnam / Kakinada',
            offeredPrice: 425,
            quantityRequested: '3,500',
            status: 'offer_made',
            message: 'Ready for night harvest inspection with insulated reefer container.'
          },
          {
            id: 'offer-demo-2',
            buyerName: 'Godavari Cold Chain Logistics',
            buyerLocation: 'Bhimavaram, West Godavari',
            offeredPrice: 418,
            quantityRequested: '5,000',
            status: 'offer_made',
            message: 'Prompt 24-hr payment on pond weighment slip.'
          }
        ];
      }
    } catch (e) {
      mySeafoodListings = [];
      buyerOffers = [];
    }

    return {
      success: true,
      role: 'farmer',
      timestamp: new Date().toISOString(),
      farmer_profile: {
        name: 'Aqua Farmer (Bhimavaram)',
        district: district,
        state: 'Andhra Pradesh',
        primary_species: species,
        active_pond: activePond.name
      },
      preferences: {
        district,
        species,
        pond_id
      },
      summary: {
        totalPonds,
        activePonds: DEMO_PONDS.filter(p => p.status === 'active').length,
        totalStocked,
        avgHealthScore,
        unreadNotifications: notifications.filter(n => !n.is_read).length
      },
      ponds_summary: {
        total_ponds: totalPonds,
        active_ponds: DEMO_PONDS.filter(p => p.status === 'active').length,
        total_stocked: totalStocked,
        avg_health_score: avgHealthScore,
        ponds_list: DEMO_PONDS
      },
      myPonds: DEMO_PONDS,
      water_quality: waterQuality,
      waterQuality: waterQuality,
      disease_risk: diseaseRisk,
      diseaseRisk: diseaseRisk,
      ai_disease_reports: recentAiReports,
      aiDiseaseReports: recentAiReports,
      preventive_actions: preventiveActions,
      preventiveActions: preventiveActions,
      market_prices: marketPrices,
      currentPrices: marketPrices,
      price_trends: priceTrends,
      priceTrends: priceTrends,
      nearby_hatcheries: nearbyHatcheries,
      nearbyHatcheries: nearbyHatcheries,
      available_seed: nearbyHatcheries.flatMap(h => h.available_species || []),
      availableSeed: [
        { species: 'Vannamei Shrimp', stage: '12', pricePerThousand: 420, availableStock: 2500000 },
        { species: 'Black Tiger Prawn', stage: '15', pricePerThousand: 650, availableStock: 800000 }
      ],
      available_workers: availableWorkers,
      availableWorkers: availableWorkers,
      machinery_marketplace: machineryHighlights,
      machineryMarketplace: machineryHighlights,
      expert_consultations: expertConsultations,
      expertConsultation: { upcoming: false, availableExperts: expertConsultations },
      farm_supplies: farmSupplies,
      farmSupplies: farmSupplies,
      seafood_listings: mySeafoodListings,
      mySeafoodListings: mySeafoodListings,
      buyer_offers: buyerOffers,
      interestedBuyers: buyerOffers,
      notifications: notifications.map(n => ({ ...n, read: n.is_read }))
    };
  },

  // 2. Specialized Role-Based Dashboards
  async getRoleDashboard(role = 'farmer', district = 'West Godavari') {
    switch (role.toLowerCase()) {
      case 'worker':
        let workerJobs = [];
        try {
          const res = await jobsService.getJobs({ district });
          workerJobs = Array.isArray(res) ? res.slice(0, 4) : [];
        } catch (e) {}
        return {
          role: 'worker',
          role_label: 'Aquaculture Farm Worker & Technician',
          kpis: [
            { label: 'Active Job Openings', value: '42 Openings', icon: '💼', color: '#0284c7' },
            { label: 'Average Daily Wage', value: '₹750 - ₹900 / Day', icon: '💰', color: '#047857' },
            { label: 'My Applications', value: '2 Pending', icon: '📋', color: '#d97706' },
            { label: 'Skills Badge', value: 'Pond Feeding & Aeration Certified', icon: '⭐', color: '#7c3aed' }
          ],
          recommended_jobs: workerJobs,
          notifications: [
            { message: 'Your application for Senior Feeder at Godavari Ponds was reviewed.', time: '2 hours ago' }
          ]
        };

      case 'hatchery':
        return {
          role: 'hatchery',
          role_label: 'Commercial SPF Hatchery Operator',
          kpis: [
            { label: 'Active Seed Batches', value: '8 Batches (PL-10/12)', icon: '🧬', color: '#047857' },
            { label: 'Available Stock', value: '4.2 Million Nauplii/PL', icon: '🦐', color: '#0284c7' },
            { label: 'Incoming Seed Orders', value: '6 Pending Verification', icon: '📬', color: '#d97706' },
            { label: 'PCR Quality Status', value: '100% WSSV/EHP Negative', icon: '✅', color: '#16a34a' }
          ],
          recent_orders: [
            { order_id: 'SEED-ORD-991', farmer: 'V. Satyanarayana', species: 'Vannamei PL-10', quantity: '500,000 PL', status: 'confirmed' },
            { order_id: 'SEED-ORD-992', farmer: 'K. Mahendra', species: 'Tiger Prawn PL-12', quantity: '250,000 PL', status: 'requested' }
          ]
        };

      case 'seller':
        return {
          role: 'seller',
          role_label: 'Machinery & Farm Supplies Vendor',
          kpis: [
            { label: 'Live Catalog Items', value: '28 Products', icon: '⚙️', color: '#0284c7' },
            { label: 'Pending Dispatches', value: '3 Orders to Pack', icon: '📦', color: '#d97706' },
            { label: 'Monthly Revenue', value: '₹1,48,500', icon: '💰', color: '#047857' },
            { label: 'Seller Rating', value: '4.92 ★ (88 Reviews)', icon: '⭐', color: '#eab308' }
          ],
          pending_orders: suppliesService.getSellerOrders('seller-godavari-01').slice(0, 3)
        };

      case 'buyer':
        return {
          role: 'buyer',
          role_label: 'Commercial Seafood Exporter & Processor',
          kpis: [
            { label: 'Available Farm Catches', value: '18 Active Ponds', icon: '🦐', color: '#0284c7' },
            { label: 'Open Contract Offers', value: '4 In Negotiation', icon: '🤝', color: '#d97706' },
            { label: 'Locked Harvest Tonnage', value: '14.5 MT This Week', icon: '⚖️', color: '#047857' },
            { label: 'MPEDA Export Code', value: 'EXP-AP-4890 (Active)', icon: '🚢', color: '#7c3aed' }
          ],
          active_trades: seafoodService.getBuyerOffers('buyer-vizag-exp').slice(0, 3)
        };

      case 'expert':
        return {
          role: 'expert',
          role_label: 'Aquatic Pathologist & Aquaculture Veterinarian',
          kpis: [
            { label: 'Assigned Consultations', value: '5 Appointments', icon: '🩺', color: '#047857' },
            { label: 'Lab PCR Reviews Pending', value: '2 Diagnostic Reports', icon: '🔬', color: '#0284c7' },
            { label: 'Consultation Rating', value: '4.95 ★ (84 Reviews)', icon: '⭐', color: '#eab308' },
            { label: 'Prescriptions Issued', value: '142 Protocol Plans', icon: '📋', color: '#7c3aed' }
          ],
          patient_queue: expertConsultationService.getExpertAppointments('exp-001').slice(0, 3)
        };

      case 'admin':
        return {
          role: 'admin',
          role_label: 'AquaMitra State & Ecosystem Administrator',
          kpis: [
            { label: 'Total Verified Farms', value: '1,240 Farms', icon: '🌾', color: '#047857' },
            { label: 'Verified Hatcheries', value: '86 CAA Licensed', icon: '🧬', color: '#0284c7' },
            { label: 'Monthly Trade Volume', value: '₹4.82 Crores', icon: '💰', color: '#16a34a' },
            { label: 'Ecosystem Health', value: 'All 9 Modules 100% Operational', icon: '🛡️', color: '#7c3aed' }
          ],
          verification_queue: [
            { type: 'Hatchery License', applicant: 'Sri Balaji SPF Hatchery', caa_no: 'CAA/REG/2026/099', date: 'Today' },
            { type: 'Commercial Exporter', applicant: 'Godavari Delta Cold Chain Ltd', mpeda_no: 'MPEDA/EXP/2026', date: 'Yesterday' }
          ]
        };

      case 'farmer':
      default:
        return this.getFarmerOverview({ district });
    }
  },

  // 3. Mark notification as read
  markNotificationRead(notificationId) {
    const notif = notifications.find(n => n.id === notificationId);
    if (notif) {
      notif.is_read = true;
      notif.read = true;
      return notif;
    }
    return null;
  }
};
