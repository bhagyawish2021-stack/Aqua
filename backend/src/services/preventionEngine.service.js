'use strict';

// ─── DEFAULT CHECKLIST DEFINITIONS (English & Telugu) ────────────────────────
const DEFAULT_DAILY_TASKS = [
  {
    task_key: 'morning_do_check',
    title: 'Dawn Dissolved Oxygen (DO) Measurement at 5:00 AM',
    telugu_title: 'ఉదయం 5:00 గంటలకు కరిగి ఉన్న ఆక్సిజన్ (DO) కొలత',
    description: 'Check DO at pond corners and center bottom before sunrise when photosynthesis is zero.'
  },
  {
    task_key: 'check_tray_inspection',
    title: 'Check-Tray Feed Inspection (2 Hours Post-Feeding)',
    telugu_title: 'ఫీడింగ్ ట్రే తనిఖీ (మేత వేసిన 2 గంటల తర్వాత)',
    description: 'Inspect 4 check trays across pond. Observe pellet remnants, gut fullness, and fecal string color.'
  },
  {
    task_key: 'secchi_transparency_check',
    title: 'Secchi Disk Water Transparency & Color Inspection',
    telugu_title: 'సెక్కీ డిస్క్ నీటి పారదర్శకత & రంగు పరిశీలన',
    description: 'Measure plankton bloom density at noon. Optimal reading is 25–35 cm light penetration.'
  },
  {
    task_key: 'sludge_drain_siphon',
    title: 'Central Sump / Toilet Drain Bottom Sludge Purge',
    telugu_title: 'చెరువు మధ్య డ్రెయిన్ నుండి వ్యర్థాలు తొలగించడం',
    description: 'Purge anaerobic black muck and molts for 2–3 minutes to prevent hydrogen sulfide build-up.'
  },
  {
    task_key: 'paddlewheel_maintenance',
    title: 'Aerator Mechanical & Amperage Load Verification',
    telugu_title: 'ఏరియేటర్ మోటార్లు & కరెంట్ లోడ్ తనిఖీ',
    description: 'Inspect motor bearings, grease levels, and ensure proper water throw height on all paddlewheels.'
  }
];

const DEFAULT_WEEKLY_TASKS = [
  {
    task_key: 'alkalinity_hardness_titration',
    title: 'Total Alkalinity & Calcium Hardness Titration',
    telugu_title: 'క్షారత (Alkalinity) & క్యాల్షియం కాఠిన్యత పరీక్ష',
    description: 'Target: Alkalinity > 120 mg/L (as CaCO3) and Calcium > 150 mg/L for regular exoskeleton molting.'
  },
  {
    task_key: 'tcbs_vibrio_plating',
    title: 'TCBS Agar Bacterial Plating (Green vs Yellow Colony Count)',
    telugu_title: 'విబ్రియో బ్యాక్టీరియా పరీక్ష (ఆకుపచ్చ & పసుపు కాలనీలు)',
    description: 'Check hepatopancreas and pond water for pathogenic green colonies (V. parahaemolyticus < 1x10^2 CFU/mL).'
  },
  {
    task_key: 'bottom_soil_redox',
    title: 'Benthic Soil pH & Oxidation-Reduction Potential (ORP)',
    telugu_title: 'చెరువు నేల pH & రిడాక్స్ పొటెన్షియల్ పరీక్ష',
    description: 'Sample pond bottom core soil. ORP should remain above -100 mV to ensure aerobic conditions.'
  },
  {
    task_key: 'biosecurity_perimeter_audit',
    title: 'Bird Scaring Lines & Crab Fence Integrity Audit',
    telugu_title: 'పక్షుల వలలు & పీతల ఫెన్సింగ్ తనిఖీ',
    description: 'Repair torn overhead lines and inspect perimeter crab fences to prevent external vector transmission.'
  }
];

// Pre-seeded tasks storage per pond
let pondTasks = [
  {
    id: 'tsk-001',
    farmer_id: 'farmer-demo',
    pond_id: 'pond-01',
    task_type: 'daily',
    task_key: 'morning_do_check',
    title: 'Dawn Dissolved Oxygen (DO) Measurement at 5:00 AM',
    telugu_title: 'ఉదయం 5:00 గంటలకు కరిగి ఉన్న ఆక్సిజన్ (DO) కొలత',
    description: 'Check DO at pond corners and center bottom before sunrise when photosynthesis is zero.',
    is_completed: true,
    completed_at: '2026-09-12T05:15:00Z',
    due_date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'tsk-002',
    farmer_id: 'farmer-demo',
    pond_id: 'pond-01',
    task_type: 'daily',
    task_key: 'check_tray_inspection',
    title: 'Check-Tray Feed Inspection (2 Hours Post-Feeding)',
    telugu_title: 'ఫీడింగ్ ట్రే తనిఖీ (మేత వేసిన 2 గంటల తర్వాత)',
    description: 'Inspect 4 check trays across pond. Observe pellet remnants, gut fullness, and fecal string color.',
    is_completed: true,
    completed_at: '2026-09-12T09:30:00Z',
    due_date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'tsk-003',
    farmer_id: 'farmer-demo',
    pond_id: 'pond-01',
    task_type: 'daily',
    task_key: 'secchi_transparency_check',
    title: 'Secchi Disk Water Transparency & Color Inspection',
    telugu_title: 'సెక్కీ డిస్క్ నీటి పారదర్శకత & రంగు పరిశీలన',
    description: 'Measure plankton bloom density at noon. Optimal reading is 25–35 cm light penetration.',
    is_completed: false,
    completed_at: null,
    due_date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'tsk-004',
    farmer_id: 'farmer-demo',
    pond_id: 'pond-01',
    task_type: 'weekly',
    task_key: 'alkalinity_hardness_titration',
    title: 'Total Alkalinity & Calcium Hardness Titration',
    telugu_title: 'క్షారత (Alkalinity) & క్యాల్షియం కాఠిన్యత పరీక్ష',
    description: 'Target: Alkalinity > 120 mg/L (as CaCO3) and Calcium > 150 mg/L for regular exoskeleton molting.',
    is_completed: false,
    completed_at: null,
    due_date: new Date().toISOString().split('T')[0]
  }
];

// Pre-seeded Health Assessments
let healthAssessments = [
  {
    id: 'hlth-001',
    farmer_id: 'farmer-demo',
    pond_id: 'pond-01',
    pond_name: 'Pond 1 — Nursery & Grow-out',
    species: 'vannamei_shrimp',
    doc_days: 62,
    stocking_density: 55,
    water_parameters: {
      ph: 7.9,
      temperature: 28.5,
      dissolved_oxygen: 5.4,
      salinity: 20,
      ammonia: 0.02,
      nitrite: 0.03
    },
    feeding_pattern: 'normal',
    weather_condition: 'sunny_clear',
    previous_disease_history: 'none',
    health_score: 92,
    risk_score: 12,
    risk_level: 'Low',
    water_warnings: [],
    biosecurity_recommendations: [
      'Maintain footbath potassium permanganate / chlorine dip at pond gate',
      'Inspect perimeter bird scaring lines to prevent avian viral vector entry',
      'Ensure dedicated cast nets and sampling trays for Pond 1 only'
    ],
    feeding_recommendations: [
      'Current feed clearance is optimal (100% in 2 hours). Maintain standard biomass feed schedule.',
      'Split daily feed into 4 balanced meals: 25% at 6 AM, 20% at 11 AM, 25% at 4 PM, 30% at 9 PM.'
    ],
    pond_prep_guidance: [
      'Pond is in active grow-out stage. Maintain regular application of soil probiotics (Bacillus subtilis) at 500g/acre weekly.',
      'Maintain mineral supplementation (Magnesium, Potassium, Calcium) during upcoming new-moon molt cycle.'
    ],
    early_warning_signs: [
      'Check for soft shell retention beyond 12 hours post-molt',
      'Observe antenna integrity and uropod coloration during routine netting'
    ],
    prevention_tips: [
      'Supplement feed with Vitamin C (3g/kg) and Beta-glucans to bolster natural immune resistance.',
      'Operate aerators continuously from 11 PM to 6 AM to safeguard dawn dissolved oxygen.'
    ],
    created_at: '2026-09-11T08:00:00Z'
  }
];

// Notifications
let healthNotifications = [
  {
    id: 'notif-001',
    farmer_id: 'farmer-demo',
    pond_id: 'pond-01',
    pond_name: 'Pond 1 — Nursery & Grow-out',
    notification_type: 'water_warning',
    severity: 'info',
    title: '🟢 Optimal Pond Health in Pond 1',
    message: 'Health score is 92/100. All water parameters are within ideal ranges for DOC 62.',
    is_read: false,
    created_at: '2026-09-11T08:05:00Z'
  }
];

module.exports = {
  // ─── 1. Core Rule-Based Recommendation Engine ─────────────────────────────
  evaluatePondHealth(inputs, farmerId = 'farmer-demo') {
    const {
      pond_id = 'pond-01',
      pond_name = 'Pond 1',
      species = 'vannamei_shrimp',
      doc_days = 45,
      stocking_density = 50,
      water_parameters = {},
      feeding_pattern = 'normal',
      weather_condition = 'sunny_clear',
      previous_disease_history = 'none'
    } = inputs;

    const doc = parseInt(doc_days, 10) || 45;
    const density = parseFloat(stocking_density) || 50;

    const ph = parseFloat(water_parameters.ph);
    const temp = parseFloat(water_parameters.temperature);
    const doLevel = parseFloat(water_parameters.dissolved_oxygen);
    const salinity = parseFloat(water_parameters.salinity);
    const ammonia = parseFloat(water_parameters.ammonia);
    const nitrite = parseFloat(water_parameters.nitrite);

    let healthScore = 100;
    let riskPoints = 0;
    const waterWarnings = [];
    const biosecurity = [];
    const feedingRecs = [];
    const pondPrep = [];
    const earlyWarnings = [];
    const preventionTips = [];

    // ── Water Quality Rules ─────────────────────────────────────────────────
    // 1. Dissolved Oxygen (DO)
    if (!isNaN(doLevel)) {
      if (doLevel < 3.5) {
        healthScore -= 32;
        riskPoints += 35;
        waterWarnings.push({
          parameter: 'Dissolved Oxygen',
          value: `${doLevel} mg/L`,
          safe_range: '> 5.0 mg/L',
          severity: 'critical',
          warning: '🚨 CRITICAL HYPOXIA: DO is dangerously low (<3.5 mg/L). High mortality risk.',
          immediate_action: 'Turn on 100% of paddlewheel aerators, aspirators, and emergency oxygen diffusers immediately. Stop feeding.'
        });
      } else if (doLevel < 4.5) {
        healthScore -= 16;
        riskPoints += 18;
        waterWarnings.push({
          parameter: 'Dissolved Oxygen',
          value: `${doLevel} mg/L`,
          safe_range: '> 5.0 mg/L',
          severity: 'warning',
          warning: '⚠️ Sub-optimal Dissolved Oxygen (4.0–4.5 mg/L). Chronic stress threshold.',
          immediate_action: 'Increase aerator operating hours by at least 3 hours during night and dawn.'
        });
      }
    }

    // 2. Ammonia (TAN)
    if (!isNaN(ammonia)) {
      if (ammonia > 0.1) {
        healthScore -= 24;
        riskPoints += 25;
        waterWarnings.push({
          parameter: 'Ammonia (TAN)',
          value: `${ammonia} mg/L`,
          safe_range: '< 0.05 mg/L',
          severity: 'critical',
          warning: '🚨 TOXIC AMMONIA SPIKE (>0.1 mg/L): Causes gill burns, immune collapse and mass lethargy.',
          immediate_action: 'Apply zeolite (15–20 kg/acre) or Yucca extract. Reduce feed by 50% immediately. Siphon bottom sludge.'
        });
      } else if (ammonia > 0.05) {
        healthScore -= 10;
        riskPoints += 12;
        waterWarnings.push({
          parameter: 'Ammonia (TAN)',
          value: `${ammonia} mg/L`,
          safe_range: '< 0.05 mg/L',
          severity: 'warning',
          warning: '⚠️ Elevated Ammonia (>0.05 mg/L). Potential nitrogenous waste accumulation.',
          immediate_action: 'Dose nitrifying bio-remediation bacteria (Nitrosomonas / Nitrobacter) with jaggery/molasses carbon source.'
        });
      }
    }

    // 3. Nitrite (NO2)
    if (!isNaN(nitrite)) {
      if (nitrite > 0.2) {
        healthScore -= 18;
        riskPoints += 20;
        waterWarnings.push({
          parameter: 'Nitrite (NO2)',
          value: `${nitrite} mg/L`,
          safe_range: '< 0.1 mg/L',
          severity: 'critical',
          warning: '🚨 HIGH NITRITE TOXICITY (>0.2 mg/L): Induces brown blood hypoxia in aquatic species.',
          immediate_action: 'Add sodium chloride (salt) at 50–100 kg/acre to introduce chloride ions (Cl-) which block nitrite uptake into gills.'
        });
      } else if (nitrite > 0.1) {
        healthScore -= 8;
        riskPoints += 10;
        waterWarnings.push({
          parameter: 'Nitrite (NO2)',
          value: `${nitrite} mg/L`,
          safe_range: '< 0.1 mg/L',
          severity: 'warning',
          warning: '⚠️ Elevated Nitrite (0.1–0.2 mg/L).',
          immediate_action: 'Ensure vigorous bottom aeration to speed up bacterial conversion from Nitrite to harmless Nitrate.'
        });
      }
    }

    // 4. pH
    if (!isNaN(ph)) {
      if (ph < 7.2) {
        healthScore -= 14;
        riskPoints += 15;
        waterWarnings.push({
          parameter: 'pH',
          value: `${ph}`,
          safe_range: '7.5 – 8.5',
          severity: 'danger',
          warning: '⚠️ Acidic Water (pH < 7.2): Weakens exoskeleton hardening, causes soft-shell syndrome.',
          immediate_action: 'Broadcast agricultural limestone (CaCO3) at 50–100 kg/acre in split morning/evening doses.'
        });
      } else if (ph > 8.8) {
        healthScore -= 14;
        riskPoints += 15;
        waterWarnings.push({
          parameter: 'pH',
          value: `${ph}`,
          safe_range: '7.5 – 8.5',
          severity: 'danger',
          warning: '⚠️ Hyper-Alkaline Water (pH > 8.8): Exponentially elevates toxic unionized ammonia (NH3).',
          immediate_action: 'Apply fermented molasses (10–15 kg/acre) or organic fruit acids to buffer pH down. Reduce fertilizer inputs.'
        });
      }
    }

    // 5. Temperature
    if (!isNaN(temp)) {
      if (temp > 32.0) {
        healthScore -= 10;
        riskPoints += 12;
        waterWarnings.push({
          parameter: 'Temperature',
          value: `${temp}°C`,
          safe_range: '26 – 30°C',
          severity: 'warning',
          warning: '⚠️ Thermal Stress (>32°C): Accelerates pathogenic Vibrio parahaemolyticus proliferation.',
          immediate_action: 'Run paddlewheels to de-stratify surface water. Perform partial bottom water exchange with deeper reservoir water.'
        });
      } else if (temp < 24.0) {
        healthScore -= 10;
        riskPoints += 10;
        waterWarnings.push({
          parameter: 'Temperature',
          value: `${temp}°C`,
          safe_range: '26 – 30°C',
          severity: 'warning',
          warning: '⚠️ Low Water Temperature (<24°C): Drops metabolic digestion and immune response by over 40%.',
          immediate_action: 'Reduce feeding ration by 30–40% to prevent unconsumed feed rotting on pond floor.'
        });
      }
    }

    // ── Weather Impact Rules ────────────────────────────────────────────────
    if (weather_condition === 'heavy_rain') {
      healthScore -= 12;
      riskPoints += 14;
      waterWarnings.push({
        parameter: 'Weather: Heavy Rain',
        value: 'Heavy Rainfall',
        safe_range: 'Stable Weather',
        severity: 'danger',
        warning: '⚠️ Heavy Rainfall Induced Stress: Causes rapid salinity crash, temperature drop, and acidic dyke runoff.',
        immediate_action: 'Apply agricultural lime along dyke slopes. Drain low-salinity surface layer water from the sluice gate board.'
      });
      feedingRecs.push('Reduce feeding by 40–50% during and immediately after heavy rain until check-tray consumption normalizes.');
    } else if (weather_condition === 'cloudy_overcast') {
      healthScore -= 10;
      riskPoints += 12;
      waterWarnings.push({
        parameter: 'Weather: Overcast Skies',
        value: 'Cloudy / Low Sunlight',
        safe_range: 'Adequate Sunlight',
        severity: 'warning',
        warning: '⚠️ Reduced Photosynthesis: Algae consume oxygen at night without daytime recharging. High risk of dawn oxygen crash.',
        immediate_action: 'Run all aerators through the night starting at 9:00 PM without interruption.'
      });
      feedingRecs.push('Reduce feed by 20–30% due to reduced photosynthetic dissolved oxygen generation.');
    } else if (weather_condition === 'cyclonic_low_pressure') {
      healthScore -= 15;
      riskPoints += 18;
      waterWarnings.push({
        parameter: 'Weather: Cyclonic Low Pressure',
        value: 'Low Atmospheric Pressure',
        safe_range: 'Normal Pressure',
        severity: 'critical',
        warning: '🚨 Low Barometric Pressure: Triggers noxious methane and hydrogen sulfide bubbling from pond sediment.',
        immediate_action: 'Cease feeding. Siphon central sludge. Ensure continuous bottom aeration.'
      });
    }

    // ── Feeding Pattern Rules ───────────────────────────────────────────────
    if (feeding_pattern === 'overfeeding' || feeding_pattern === 'feed_left_in_check_tray') {
      healthScore -= 14;
      riskPoints += 15;
      feedingRecs.push('CRITICAL FEED ADVISORY: Significant uneaten pellets detected in check trays. Reduce current feeding rate by 40% immediately.');
      feedingRecs.push('Excess feed is the #1 trigger of toxic ammonia spikes, Vibrio blooms, and gill blackening.');
    } else if (feeding_pattern === 'underfeeding') {
      healthScore -= 5;
      feedingRecs.push('Check-trays empty in under 40 minutes. Slowly increase daily feed allowance by 5–10% while monitoring gut fullness.');
    } else {
      feedingRecs.push('Feed consumption is balanced. Maintain standard biomass feeding chart split across 4 daily meals.');
    }

    // ── Previous Disease History & Biosecurity Rules ────────────────────────
    if (previous_disease_history === 'past_wssv') {
      healthScore -= 10;
      riskPoints += 15;
      biosecurity.push('PAST WSSV HISTORY: Maintain zero-tolerance biosecurity. Disinfect all sampling nets in 200 ppm chlorine solution between ponds.');
      biosecurity.push('Enforce bird scare ribbons and crab fences. WSSV vectors (crabs, wild shrimp) can reinfect the pond.');
    } else if (previous_disease_history === 'past_ehp') {
      healthScore -= 8;
      riskPoints += 12;
      biosecurity.push('PAST EHP HISTORY: Apply dietary organic acids and medium-chain fatty acids (MCFA) to inhibit microsporidian spore germination.');
    } else if (previous_disease_history === 'white_feces_last_crop') {
      healthScore -= 8;
      riskPoints += 12;
      biosecurity.push('PAST WFD HISTORY: Supplement feed with phytogenic garlic extract and yeast cell wall beta-glucans to support gut mucosal barrier.');
    } else {
      biosecurity.push('Standard Biosecurity: Ensure dedicated pond footwear, tire spray baths at farm perimeter, and clean water intake canals.');
    }

    // ── Density & DOC Compounding Stressors ──────────────────────────────────
    if (density > 60 && doc > 60) {
      healthScore -= 6;
      riskPoints += 8;
      preventionTips.push(`High Density (${density} pcs/m²) at DOC ${doc}: High biomass requires minimum 1 HP aeration per 350 kg biomass.`);
    }

    // Multi-Stress Compounding Check: If 3 or more risk factors present, amplify risk
    if (waterWarnings.length >= 2) {
      riskPoints = Math.round(riskPoints * 1.25);
    }

    // Clamp scores
    const finalHealthScore = Math.max(10, Math.min(100, Math.round(healthScore)));
    const finalRiskScore = Math.max(5, Math.min(100, Math.round(riskPoints)));

    // Categorize Risk Level
    let riskLevel = 'Low';
    if (finalRiskScore >= 70) riskLevel = 'Critical';
    else if (finalRiskScore >= 50) riskLevel = 'High';
    else if (finalRiskScore >= 25) riskLevel = 'Moderate';

    // ── Early Warning Signs & Prevention Tips ───────────────────────────────
    if (species.includes('shrimp') || species.includes('prawn')) {
      earlyWarnings.push('Watch for shrimp swimming erratically on surface or clustering around pond edges at sunrise.');
      earlyWarnings.push('Examine hepatopancreas color — should be dark brown/black with full dark midgut, never pale or white.');
      earlyWarnings.push('Inspect antenna tips for breakage or redness (early indicator of bacterial vibriosis).');
      preventionTips.push('Apply multi-strain Bacillus probiotics (500g/acre) every 5–7 days to maintain competitive exclusion against Vibrio.');
      preventionTips.push('Do not perform sudden large water exchanges (>25%) during cloudy weather to avoid osmotic shock.');
    } else {
      earlyWarnings.push('Watch for fish piping (gasping at water surface) or congregating near aerator water plumes.');
      earlyWarnings.push('Inspect fin margins for white fraying or cottony fungal tufts.');
      preventionTips.push('Maintain water transparency at 30–40 cm to prevent benthic filamentous algal growth.');
    }

    // Pond Prep Guidance
    pondPrep.push('Post-harvest / Pre-stocking: Dry pond bottom completely until soil surface develops 2–3 cm deep cracks.');
    pondPrep.push('Liming: Apply agricultural lime (CaCO3) at 150–200 kg/acre to neutralize subsoil acidity and raise buffer capacity.');
    pondPrep.push('Chain dragging: Drag light chains across pond floor weekly during morning to release trapped anaerobic gases without muddying water.');

    const assessment = {
      id: `hlth-${Date.now()}`,
      farmer_id: farmerId,
      pond_id,
      pond_name,
      species,
      doc_days: doc,
      stocking_density: density,
      water_parameters,
      feeding_pattern,
      weather_condition,
      previous_disease_history,
      health_score: finalHealthScore,
      risk_score: finalRiskScore,
      risk_level: riskLevel,
      water_warnings: waterWarnings,
      biosecurity_recommendations: biosecurity,
      feeding_recommendations: feedingRecs,
      pond_prep_guidance: pondPrep,
      early_warning_signs: earlyWarnings,
      prevention_tips: preventionTips,
      created_at: new Date().toISOString()
    };

    // Save to historical record
    healthAssessments.unshift(assessment);

    // Auto-generate Notification if score drops or critical warning triggers
    if (finalHealthScore < 70 || waterWarnings.some(w => w.severity === 'critical' || w.severity === 'danger')) {
      healthNotifications.unshift({
        id: `notif-${Date.now()}`,
        farmer_id: farmerId,
        pond_id,
        pond_name,
        notification_type: 'health_score_drop',
        severity: finalHealthScore < 50 ? 'critical' : 'warning',
        title: `${finalHealthScore < 50 ? '🚨 Critical Health Alert' : '⚠️ Health Warning'}: ${pond_name} Score at ${finalHealthScore}/100`,
        message: waterWarnings.length > 0 ? waterWarnings[0].warning : `Disease risk evaluated as ${riskLevel}. Immediate preventive measures recommended.`,
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    return assessment;
  },

  // ─── 2. Health Assessment History ─────────────────────────────────────────
  getAllHealthHistory(farmerId) {
    if (!farmerId) return healthAssessments;
    return healthAssessments.filter(h => h.farmer_id === farmerId || h.farmer_id === 'farmer-demo');
  },

  getPondHealthHistory(pondId, farmerId) {
    let list = healthAssessments;
    if (farmerId) list = list.filter(h => h.farmer_id === farmerId || h.farmer_id === 'farmer-demo');
    if (pondId && pondId !== 'all') list = list.filter(h => h.pond_id === pondId);
    return list;
  },

  // ─── 3. Daily & Weekly Preventive Health Tasks (Checklists) ───────────────
  getPondTasks(pondId = 'pond-01', farmerId = 'farmer-demo') {
    const today = new Date().toISOString().split('T')[0];
    let tasks = pondTasks.filter(t => t.pond_id === pondId);

    // If no tasks exist for this pond yet, seed default daily & weekly tasks
    if (tasks.length === 0) {
      const newTasks = [
        ...DEFAULT_DAILY_TASKS.map((d, i) => ({
          id: `tsk-${Date.now()}-${i}`,
          farmer_id: farmerId,
          pond_id: pondId,
          task_type: 'daily',
          ...d,
          is_completed: false,
          completed_at: null,
          due_date: today
        })),
        ...DEFAULT_WEEKLY_TASKS.map((w, i) => ({
          id: `tsk-${Date.now()}-w-${i}`,
          farmer_id: farmerId,
          pond_id: pondId,
          task_type: 'weekly',
          ...w,
          is_completed: false,
          completed_at: null,
          due_date: today
        }))
      ];
      pondTasks.push(...newTasks);
      tasks = newTasks;
    }

    const completedCount = tasks.filter(t => t.is_completed).length;
    const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

    return {
      pond_id: pondId,
      tasks,
      total_count: tasks.length,
      completed_count: completedCount,
      completion_rate: completionRate
    };
  },

  // Toggle task completion
  toggleTask(taskId) {
    const task = pondTasks.find(t => t.id === taskId);
    if (!task) return null;

    task.is_completed = !task.is_completed;
    task.completed_at = task.is_completed ? new Date().toISOString() : null;

    return task;
  },

  // ─── 4. Preventive Health Notifications ───────────────────────────────────
  getNotifications(farmerId) {
    if (!farmerId) return healthNotifications;
    return healthNotifications.filter(n => n.farmer_id === farmerId || n.farmer_id === 'farmer-demo');
  },

  markNotificationRead(notificationId) {
    const notif = healthNotifications.find(n => n.id === notificationId);
    if (!notif) return null;
    notif.is_read = true;
    return notif;
  }
};
