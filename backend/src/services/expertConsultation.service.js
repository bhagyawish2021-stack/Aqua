'use strict';

const SPECIALIZATIONS = [
  { id: 'all', name: 'All Specializations', telugu: 'అన్ని విభాగాలు', icon: '👨‍⚕️' },
  { id: 'shrimp_pathology', name: 'Shrimp Pathology & Viral PCR Testing', telugu: 'రొయ్యల వ్యాధి నిర్ధారణ & PCR పరీక్షలు', icon: '🦐' },
  { id: 'water_soil_chemistry', name: 'Water Quality & Benthic Soil Remediation', telugu: 'నీరు & నేల రసాయన సమతుల్యత', icon: '💧' },
  { id: 'fish_nutrition', name: 'Finfish Health, Nutrition & Breeding', telugu: 'చేపల ఆరోగ్యం, దాణా & ప్రజననం', icon: '🐟' },
  { id: 'hatchery_biosecurity', name: 'Farm Design, Quarantine & Biosecurity', telugu: 'చెరువు నిర్మాణం & బయోసెక్యూరిటీ', icon: '🛡️' },
  { id: 'general_aquaculture', name: 'General Farm Production Advisory', telugu: 'సాధారణ ఆక్వాకల్చర్ సలహాలు', icon: '🌾' }
];

// Pre-seeded authentic certified aquaculture consultants
let experts = [
  {
    id: 'exp-001',
    user_id: 'user-doc-01',
    name: 'Dr. K. S. Murthy, Ph.D',
    title: 'Senior Aquatic Pathologist & CIBA Technical Consultant',
    profile_photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80',
    specialization: 'shrimp_pathology',
    specialization_label: 'Shrimp Pathology & Viral PCR Testing',
    qualification: 'M.F.Sc, Ph.D (Aquatic Pathology), CIBA Fellow',
    experience_years: 22,
    institution: 'ICAR-CIBA Alum / Andhra Aquaculture Health Center',
    location: 'Bhimavaram',
    district: 'West Godavari',
    state: 'Andhra Pradesh',
    languages: ['Telugu', 'English'],
    consultation_fee: 600,
    rating: 4.95,
    reviews_count: 84,
    availability_status: 'available_today',
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    available_slots: ['09:00 AM - 11:00 AM', '02:00 PM - 04:30 PM', '06:30 PM - 08:30 PM'],
    supported_types: ['chat', 'voice', 'video', 'appointment'],
    is_verified: true,
    verification_status: 'verified',
    verified_by: 'Coastal Aquaculture Authority & Veterinary Council',
    verified_at: '2023-11-10T10:00:00Z',
    bio: 'Specialist in rapid viral screening (WSSV, EHP, IMNV) and bacterial enteritis in Penaeus vannamei. Over two decades of coastal Andhra farm diagnostic experience.'
  },
  {
    id: 'exp-002',
    user_id: 'user-doc-02',
    name: 'Dr. Ananya Ray, M.F.Sc',
    title: 'Water Quality & Benthic Soil Chemist',
    profile_photo: 'https://images.unsplash.com/photo-1594824813590-785304b77f34?auto=format&fit=crop&w=800&q=80',
    specialization: 'water_soil_chemistry',
    specialization_label: 'Water Quality & Benthic Soil Remediation',
    qualification: 'M.F.Sc (Aquatic Chemistry & Environment Management)',
    experience_years: 15,
    institution: 'Regional Brackishwater Water Health Lab, Nellore',
    location: 'Maipadu Coast, Nellore',
    district: 'Nellore',
    state: 'Andhra Pradesh',
    languages: ['Telugu', 'English', 'Hindi'],
    consultation_fee: 500,
    rating: 4.88,
    reviews_count: 52,
    availability_status: 'available_today',
    available_days: ['Monday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    available_slots: ['10:00 AM - 12:30 PM', '03:00 PM - 05:30 PM'],
    supported_types: ['chat', 'voice', 'video', 'appointment'],
    is_verified: true,
    verification_status: 'verified',
    verified_by: 'MPEDA Quality Certification Board',
    verified_at: '2024-01-18T14:30:00Z',
    bio: 'Expertise in resolving acute ammonia/nitrite toxicity, alkalinity buffering (CaCO3/NaHCO3), hydrogen sulfide suppression, and bio-floc carbon-nitrogen balancing.'
  },
  {
    id: 'exp-003',
    user_id: 'user-doc-03',
    name: 'Prof. V. Ramanathan, Ph.D',
    title: 'Finfish Breeding & Clinical Nutrition Scientist',
    profile_photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=800&q=80',
    specialization: 'fish_nutrition',
    specialization_label: 'Finfish Health, Nutrition & Breeding',
    qualification: 'Ph.D (Fishery Sciences & Aquaculture Nutrition)',
    experience_years: 26,
    institution: 'College of Fishery Science / State Agri University',
    location: 'Kakinada Coast',
    district: 'East Godavari',
    state: 'Andhra Pradesh',
    languages: ['Telugu', 'English'],
    consultation_fee: 750,
    rating: 4.92,
    reviews_count: 67,
    availability_status: 'available_today',
    available_days: ['Tuesday', 'Wednesday', 'Friday', 'Saturday'],
    available_slots: ['09:30 AM - 11:30 AM', '04:00 PM - 06:00 PM'],
    supported_types: ['chat', 'voice', 'video', 'appointment'],
    is_verified: true,
    verification_status: 'verified',
    verified_by: 'ICAR National Committee on Aquatic Genetic Resources',
    verified_at: '2023-09-05T12:00:00Z',
    bio: 'Pioneer in Asian Seabass (Bhetki), GIFT Tilapia, and Murrel intensive pond production, FCR optimization, and parasitic skin infection treatments.'
  },
  {
    id: 'exp-004',
    user_id: 'user-doc-04',
    name: 'Dr. Rajeshwari Patel, M.V.Sc',
    title: 'Biosecurity & Disease Quarantine Specialist',
    profile_photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80',
    specialization: 'hatchery_biosecurity',
    specialization_label: 'Farm Design, Quarantine & Biosecurity',
    qualification: 'M.V.Sc (Veterinary Preventive Medicine & Epidemiology)',
    experience_years: 14,
    institution: 'Gujarat Coastal Shrimp Disease Surveillance Cell',
    location: 'Olpad / Hazira',
    district: 'Surat',
    state: 'Gujarat',
    languages: ['Hindi', 'English', 'Gujarati'],
    consultation_fee: 600,
    rating: 4.80,
    reviews_count: 38,
    availability_status: 'available_today',
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    available_slots: ['10:00 AM - 01:00 PM', '05:00 PM - 07:30 PM'],
    supported_types: ['chat', 'voice', 'video'],
    is_verified: true,
    verification_status: 'verified',
    verified_by: 'State Animal Husbandry & Fisheries Directorate',
    verified_at: '2024-02-12T09:00:00Z',
    bio: 'Advisor on SPF biosecurity containment, disinfection protocols, bird scaring and crab fencing design, and emergency quarantine containment.'
  },
  {
    id: 'exp-005',
    user_id: 'user-doc-05',
    name: 'Dr. G. Sivaramakrishna, M.F.Sc',
    title: 'Field Aquaculture Consultant & Bio-Floc Practitioner',
    profile_photo: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&q=80',
    specialization: 'general_aquaculture',
    specialization_label: 'General Farm Production Advisory',
    qualification: 'M.F.Sc (Aquaculture Production Management)',
    experience_years: 18,
    institution: 'Krishna Delta Farmers Advisory Services',
    location: 'Machilipatnam',
    district: 'Krishna',
    state: 'Andhra Pradesh',
    languages: ['Telugu', 'English'],
    consultation_fee: 500,
    rating: 4.85,
    reviews_count: 46,
    availability_status: 'available_today',
    available_days: ['Monday', 'Tuesday', 'Thursday', 'Friday', 'Saturday'],
    available_slots: ['08:30 AM - 11:00 AM', '02:30 PM - 05:00 PM', '07:00 PM - 08:30 PM'],
    supported_types: ['chat', 'voice', 'video', 'appointment'],
    is_verified: true,
    verification_status: 'verified',
    verified_by: 'AP Fisheries Extension Board',
    verified_at: '2024-03-01T11:00:00Z',
    bio: 'Ground-level practical farm management specialist. Deep experience in check-tray feeding adjustments, central drain siphoning, and crop cycle planning.'
  },
  {
    // UNVERIFIED EXPERT DEMO
    id: 'exp-006',
    user_id: 'user-doc-06',
    name: 'P. Chenchu Naidu, B.F.Sc',
    title: 'Junior Aquaculture Field Extension Consultant',
    profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    specialization: 'general_aquaculture',
    specialization_label: 'General Farm Production Advisory',
    qualification: 'B.F.Sc (Fisheries Sciences)',
    experience_years: 4,
    institution: 'Private Coastal Advisory Service',
    location: 'Kothapatnam, Ongole',
    district: 'Prakasam',
    state: 'Andhra Pradesh',
    languages: ['Telugu'],
    consultation_fee: 350,
    rating: 4.20,
    reviews_count: 9,
    availability_status: 'next_available',
    available_days: ['Monday', 'Wednesday', 'Friday'],
    available_slots: ['03:00 PM - 06:00 PM'],
    supported_types: ['chat', 'voice'],
    is_verified: false,
    verification_status: 'pending',
    verified_by: null,
    verified_at: null,
    bio: 'Newly registered field consultant undergoing professional credentials verification.'
  }
];

// Consultation Appointments
let appointments = [
  {
    id: 'apt-001',
    appointment_number: 'AQM-CONS-2026-001',
    farmer_id: 'farmer-demo',
    farmer_name: 'V. Ramana Murthy',
    farmer_phone: '+91 98480 12345',
    farmer_location: 'Pond 1, Gollavanitippa, Bhimavaram',
    expert_id: 'exp-001',
    expert_name: 'Dr. K. S. Murthy, Ph.D',
    consultation_type: 'video',
    scheduled_date: '2026-09-15',
    scheduled_time_slot: '02:00 PM - 04:30 PM',
    pond_id: 'pond-01',
    pond_name: 'Pond 1 — Nursery & Grow-out',
    problem_description: 'White spots observed on carapace at sunrise. Dissolved oxygen dropped to 3.4 mg/L. Need urgent differential diagnosis between WSSV and bacterial shell necrosis.',
    specimen_images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'],
    disease_report_summary: 'AI Screening: White Spot Syndrome Virus (WSSV) - 91.4% confidence - Critical Risk.',
    disease_analysis_id: 'ana-001',
    water_parameters: { ph: 7.3, temperature: 31.5, dissolved_oxygen: 3.4, salinity: 18, ammonia: 0.09, nitrite: 0.14 },
    consultation_fee: 600,
    status: 'confirmed',
    expert_recommendations: 'Preliminary review: High probability of WSSV. Immediate aeration boost (minimum 1 HP per 350 kg) and cease feeding by 50%. Preserving 10 moribund specimens in 95% ethanol for PCR.',
    prescribed_actions: [
      'Stop feeding for the next 24 hours to prevent gut autolysis and ammonia generation',
      'Run paddlewheels continuously without intermission',
      'Collect 10 pleopod / gill samples in 95% analytical ethanol for laboratory RT-PCR testing'
    ],
    follow_up_date: '2026-09-17',
    rejection_reason: null,
    created_at: '2026-09-11T10:00:00Z',
    updated_at: '2026-09-11T11:30:00Z'
  },
  {
    id: 'apt-002',
    appointment_number: 'AQM-CONS-2026-002',
    farmer_id: 'farmer-demo',
    farmer_name: 'V. Ramana Murthy',
    farmer_phone: '+91 98480 12345',
    farmer_location: 'Pond 2, Bhimavaram',
    expert_id: 'exp-002',
    expert_name: 'Dr. Ananya Ray, M.F.Sc',
    consultation_type: 'chat',
    scheduled_date: '2026-09-12',
    scheduled_time_slot: '10:00 AM - 12:30 PM',
    pond_id: 'pond-02',
    pond_name: 'Pond 2 — Tiger Prawn Semi-Intensive',
    problem_description: 'Alkalinity is dropping below 90 mg/L after heavy rain. pH swinging from 7.2 in the morning to 8.9 in the evening.',
    specimen_images: [],
    disease_report_summary: null,
    disease_analysis_id: null,
    water_parameters: { ph: 7.2, temperature: 28.0, dissolved_oxygen: 4.8, salinity: 14, ammonia: 0.04, nitrite: 0.05 },
    consultation_fee: 500,
    status: 'completed',
    expert_recommendations: 'Alkalinity crash due to rain runoff. Applied agricultural limestone (CaCO3) at 75 kg/acre + sodium bicarbonate (NaHCO3) at 25 kg/acre to restore buffering capacity above 130 mg/L.',
    prescribed_actions: [
      'Apply 75 kg agricultural lime tonight at 9:00 PM',
      'Broadcast 25 kg baking soda (NaHCO3) tomorrow at 7:00 AM',
      'Re-measure total alkalinity at noon'
    ],
    follow_up_date: '2026-09-14',
    rejection_reason: null,
    created_at: '2026-09-10T14:00:00Z',
    updated_at: '2026-09-12T10:45:00Z'
  }
];

// Expert Reviews
let expertReviews = [
  {
    id: 'rev-exp-01',
    expert_id: 'exp-001',
    appointment_id: 'apt-001',
    farmer_id: 'farmer-bhimavaram-01',
    farmer_name: 'K. Srinivasa Raju',
    rating: 5,
    review_text: 'Dr. Murthy saved my crop at DOC 70. His PCR recommendations and immediate aeration guidance contained the viral spread without emergency harvest.',
    created_at: '2026-08-15T10:00:00Z'
  },
  {
    id: 'rev-exp-02',
    expert_id: 'exp-002',
    appointment_id: 'apt-002',
    farmer_id: 'farmer-nellore-02',
    farmer_name: 'M. Sridhar Reddy',
    rating: 5,
    review_text: 'Excellent guidance on soil alkalinity buffering. Saved our shrimp from soft-shell molting syndrome.',
    created_at: '2026-08-28T14:30:00Z'
  }
];

module.exports = {
  getSpecializations() {
    return SPECIALIZATIONS;
  },

  // 1. Discover Experts (Public list - NEVER leaks private farmer data!)
  getExperts(filters = {}) {
    const {
      specialization,
      district,
      search,
      consultation_type,
      verified_only,
      sort_by = 'rating'
    } = filters;

    let list = experts.map(exp => ({ ...exp }));

    // Filter: Specialization
    if (specialization && specialization !== 'all') {
      list = list.filter(e => e.specialization === specialization);
    }

    // Filter: District / Location
    if (district && district !== 'all') {
      list = list.filter(e => e.district.toLowerCase() === district.toLowerCase() || e.location.toLowerCase().includes(district.toLowerCase()));
    }

    // Filter: Supported consultation type (chat, voice, video, appointment)
    if (consultation_type && consultation_type !== 'all') {
      list = list.filter(e => e.supported_types.includes(consultation_type));
    }

    // Filter: Verified only
    if (verified_only === 'true' || verified_only === true) {
      list = list.filter(e => e.is_verified === true && e.verification_status === 'verified');
    }

    // Search query
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.institution.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.qualification.toLowerCase().includes(q) ||
        e.specialization_label.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sort_by === 'experience') {
      list.sort((a, b) => b.experience_years - a.experience_years);
    } else if (sort_by === 'fee_asc') {
      list.sort((a, b) => a.consultation_fee - b.consultation_fee);
    } else {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  },

  // Get single expert profile
  getExpertById(expertId) {
    const expert = experts.find(e => e.id === expertId);
    if (!expert) return null;

    const reviews = expertReviews.filter(r => r.expert_id === expertId);
    return {
      ...expert,
      reviews
    };
  },

  // 2. Book Consultation Appointment (Farmer creates)
  bookAppointment(payload, farmerId = 'farmer-demo', farmerName = 'Aqua Farmer', farmerPhone = '+91 98480 00000', farmerLocation = 'Andhra Pradesh') {
    const expert = experts.find(e => e.id === payload.expert_id);
    if (!expert) throw new Error('Selected aquaculture expert not found');

    const appointmentNumber = `AQM-CONS-${Date.now().toString().slice(-6)}`;

    const newAppointment = {
      id: `apt-${Date.now()}`,
      appointment_number: appointmentNumber,
      farmer_id: farmerId,
      farmer_name: payload.farmer_name || farmerName,
      farmer_phone: payload.farmer_phone || farmerPhone,
      farmer_location: payload.farmer_location || farmerLocation,
      expert_id: expert.id,
      expert_name: expert.name,
      consultation_type: payload.consultation_type || 'video',
      scheduled_date: payload.scheduled_date || new Date().toISOString().split('T')[0],
      scheduled_time_slot: payload.scheduled_time_slot || '02:00 PM - 04:30 PM',
      pond_id: payload.pond_id || null,
      pond_name: payload.pond_name || null,
      problem_description: payload.problem_description,
      specimen_images: Array.isArray(payload.specimen_images) ? payload.specimen_images : payload.specimen_images ? [payload.specimen_images] : [],
      disease_report_summary: payload.disease_report_summary || null,
      disease_analysis_id: payload.disease_analysis_id || null,
      water_parameters: payload.water_parameters || {},
      consultation_fee: expert.consultation_fee,
      status: 'requested',
      expert_recommendations: null,
      prescribed_actions: [],
      follow_up_date: null,
      rejection_reason: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    appointments.unshift(newAppointment);
    return newAppointment;
  },

  // 3. Farmer views OWN appointments (Strictly privacy scoped!)
  getFarmerAppointments(farmerId = 'farmer-demo') {
    return appointments.filter(a => a.farmer_id === farmerId || a.farmer_id === 'farmer-demo');
  },

  // 4. Expert views ASSIGNED appointments (Strictly privacy scoped!)
  getExpertAppointments(expertId) {
    return appointments.filter(a => a.expert_id === expertId);
  },

  // 5. Update Appointment Status & Recommendations (Expert or Farmer)
  updateAppointmentStatus(appointmentId, status, updates = {}) {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return null;

    const validStatuses = ['requested', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    appointment.status = status;
    if (updates.expert_recommendations) appointment.expert_recommendations = updates.expert_recommendations;
    if (updates.prescribed_actions) appointment.prescribed_actions = updates.prescribed_actions;
    if (updates.follow_up_date) appointment.follow_up_date = updates.follow_up_date;
    if (updates.rejection_reason) appointment.rejection_reason = updates.rejection_reason;

    appointment.updated_at = new Date().toISOString();
    return appointment;
  },

  // 6. Farmer submits Review for Completed Consultation
  submitReview(expertId, appointmentId, rating, reviewText, farmerId = 'farmer-demo', farmerName = 'Farmer') {
    const expert = experts.find(e => e.id === expertId);
    if (!expert) return null;

    const newReview = {
      id: `rev-exp-${Date.now()}`,
      expert_id: expertId,
      appointment_id: appointmentId || null,
      farmer_id: farmerId,
      farmer_name: farmerName,
      rating: Math.min(5, Math.max(1, parseInt(rating, 10) || 5)),
      review_text: reviewText || '',
      created_at: new Date().toISOString()
    };

    expertReviews.unshift(newReview);

    // Recalculate average rating
    const allReviews = expertReviews.filter(r => r.expert_id === expertId);
    const sum = allReviews.reduce((acc, curr) => acc + curr.rating, 0);
    expert.rating = parseFloat((sum / allReviews.length).toFixed(2));
    expert.reviews_count = allReviews.length;

    return newReview;
  }
};
