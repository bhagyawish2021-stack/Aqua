'use strict';

const DISCLAIMER_TEXT =
  '⚠️ AI-Assisted Screening Tool — Preliminary Screening Only: This assessment is an AI-assisted screening aid based on visual symptom matching and pond water parameters. It is NOT a definitive medical or veterinary diagnosis. Never treat this prediction as a guaranteed diagnosis. Always verify with certified aquatic health pathologists (CIBA / MPEDA) or certified veterinary laboratories before administering chemical treatments, antibiotics, or undertaking emergency pond harvests.';

// In-memory storage for screening logs
let diseaseAnalyses = [
  {
    id: 'ana-001',
    farmer_id: 'farmer-demo',
    pond_id: 'pond-01',
    pond_name: 'Pond 1 — Nursery & Grow-out',
    species: 'vannamei_shrimp',
    image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    symptoms: ['White spots on carapace', 'Lethargic surface swimming', 'Reddish discoloration'],
    water_parameters: {
      ph: 7.3,
      temperature: 31.5,
      dissolved_oxygen: 3.6,
      salinity: 18,
      ammonia: 0.08,
      nitrite: 0.12,
      turbidity: 22
    },
    farmer_notes: 'Observed slow feeding during morning check. A few shrimp gathered near the water inlet.',
    ai_result: {
      possible_disease: 'White Spot Syndrome Virus (WSSV)',
      scientific_name: 'Whispovirus (Nimaviridae)',
      confidence: 91.4,
      risk_level: 'Critical',
      detected_symptoms: [
        'Distinct 0.5–2.0 mm white calcified spots on cephalothorax/carapace',
        'Pink-to-reddish body discoloration',
        'Lethargic surface swimming and congregation near dykes'
      ],
      affected_species: 'Penaeus vannamei (Pacific White Shrimp)',
      key_observations: [
        'Visual indicators strongly match classical WSSV viral infection',
        'Low dissolved oxygen (3.6 mg/L) significantly elevates viral replication rate',
        'Elevated ammonia (0.08 mg/L) and nitrite (0.12 mg/L) aggravate respiratory distress'
      ],
      recommended_next_steps: [
        'Immediately quarantine the pond — stop all inter-pond water transfers and sharing of nets',
        'Turn on all aerators (paddlewheels + aspirators) to raise DO above 5.0 mg/L',
        'Cease feeding by 50–70% immediately to prevent organic load spike',
        'Collect 10 moribund specimens in 95% ethanol for emergency RT-PCR confirmation',
        'Contact certified aquatic pathologist or local CIBA/MPEDA center for bio-secure advice'
      ],
      water_quality_correlation:
        'CRITICAL HAZARD: Dissolved Oxygen (3.6 mg/L) is below safe threshold (<4.0). Elevated Ammonia (0.08 mg/L) damages gill lamellae, accelerating WSSV morbidity.',
      expert_consultation_recommended: true
    },
    risk_level: 'Critical',
    confidence: 91.4,
    expert_status: 'requested',
    expert_notes: 'Farmer requested urgent tele-consultation with CIBA pathologist.',
    disclaimer: DISCLAIMER_TEXT,
    created_at: '2026-09-10T14:30:00Z',
    updated_at: '2026-09-10T15:00:00Z'
  },
  {
    id: 'ana-002',
    farmer_id: 'farmer-demo',
    pond_id: 'pond-02',
    pond_name: 'Pond 2 — Tiger Prawn Semi-Intensive',
    species: 'tiger_prawn',
    image_url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80',
    symptoms: ['Brownish gill filaments', 'Fouling on appendages'],
    water_parameters: {
      ph: 7.9,
      temperature: 28.5,
      dissolved_oxygen: 4.8,
      salinity: 22,
      ammonia: 0.04,
      nitrite: 0.05,
      turbidity: 32
    },
    farmer_notes: 'Checking routine sample at DOC 65. Prawns active, minor gill discoloration.',
    ai_result: {
      possible_disease: 'Black / Brown Gill Disease (Environmental Melanin Accumulation)',
      scientific_name: 'Fusarium solani / Vibrio alginolyticus secondary to organic sludge',
      confidence: 82.5,
      risk_level: 'Medium',
      detected_symptoms: ['Melanized brownish gill lamellae', 'Minor epicommensal protozoan fouling'],
      affected_species: 'Penaeus monodon (Black Tiger Prawn)',
      key_observations: [
        'Brown discoloration indicates accumulated organic debris and bacterial attachment on gills',
        'Dissolved oxygen (4.8 mg/L) is acceptable but near the warning threshold',
        'Ammonia and nitrite are within manageable ranges'
      ],
      recommended_next_steps: [
        'Apply high-grade pond bottom probiotics (Bacillus subtilis/licheniformis) to decompose organic sludge',
        'Conduct a 15–20% bottom water siphon or partial exchange with treated reservoir water',
        'Clean central pond drain sump where anaerobic muck accumulates',
        'Maintain continuous aeration during night hours (10 PM – 6 AM)'
      ],
      water_quality_correlation:
        'MODERATE CONCERN: Organic suspension in water column is irritating gill surfaces. Dissolved oxygen should be maintained > 5.0 mg/L to prevent secondary hypoxia.',
      expert_consultation_recommended: false
    },
    risk_level: 'Medium',
    confidence: 82.5,
    expert_status: 'none',
    expert_notes: null,
    disclaimer: DISCLAIMER_TEXT,
    created_at: '2026-09-11T09:15:00Z',
    updated_at: '2026-09-11T09:15:00Z'
  }
];

// In-memory storage for active disease alerts
let diseaseAlerts = [
  {
    id: 'alt-001',
    farmer_id: 'farmer-demo',
    pond_id: 'pond-01',
    pond_name: 'Pond 1 — Nursery & Grow-out',
    analysis_id: 'ana-001',
    alert_type: 'high_risk_disease',
    severity: 'critical',
    title: '🚨 CRITICAL RISK: White Spot Syndrome Virus (WSSV) Detected in Pond 1',
    message: 'AI screening flagged 91.4% match for WSSV. Immediate biosecurity quarantine and aeration boost required.',
    is_read: false,
    created_at: '2026-09-10T14:30:00Z'
  },
  {
    id: 'alt-002',
    farmer_id: 'farmer-demo',
    pond_id: 'pond-01',
    pond_name: 'Pond 1 — Nursery & Grow-out',
    analysis_id: 'ana-001',
    alert_type: 'abnormal_water_parameters',
    severity: 'danger',
    title: '⚠️ Severe Hypoxia & Ammonia Spike in Pond 1',
    message: 'Dissolved Oxygen dropped to 3.6 mg/L (normal: >5.0) and Ammonia elevated to 0.08 mg/L.',
    is_read: false,
    created_at: '2026-09-10T14:31:00Z'
  }
];

// Helper: Correlate water quality with disease virulence
function evaluateWaterQuality(params) {
  const flags = [];
  let waterRiskFactor = 0; // 0 to 30 points added to risk

  const ph = parseFloat(params.ph);
  const temp = parseFloat(params.temperature);
  const doLevel = parseFloat(params.dissolved_oxygen);
  const ammonia = parseFloat(params.ammonia);
  const nitrite = parseFloat(params.nitrite);
  const salinity = parseFloat(params.salinity);
  const turbidity = parseFloat(params.turbidity);

  // pH checks (Ideal: 7.5 - 8.5)
  if (!isNaN(ph)) {
    if (ph < 7.2) {
      flags.push(`Low pH (${ph}) — Acidic stress weakens exoskeleton & mucosal barriers.`);
      waterRiskFactor += 8;
    } else if (ph > 8.8) {
      flags.push(`High pH (${ph}) — Enhances unionized toxic ammonia (NH3) fraction.`);
      waterRiskFactor += 10;
    }
  }

  // Temperature checks (Ideal: 26 - 30°C)
  if (!isNaN(temp)) {
    if (temp > 32.0) {
      flags.push(`High water temperature (${temp}°C) accelerates Vibrio and bacterial proliferation.`);
      waterRiskFactor += 8;
    } else if (temp < 24.0) {
      flags.push(`Low temperature (${temp}°C) suppresses immune defense and enzyme kinetics.`);
      waterRiskFactor += 6;
    }
  }

  // Dissolved Oxygen (Ideal: > 5.0 mg/L)
  if (!isNaN(doLevel)) {
    if (doLevel < 3.5) {
      flags.push(`CRITICAL HYPOXIA: DO is ${doLevel} mg/L (critical threshold < 3.5). Severe mortality risk.`);
      waterRiskFactor += 20;
    } else if (doLevel < 4.5) {
      flags.push(`Sub-optimal DO (${doLevel} mg/L) induces chronic respiratory stress.`);
      waterRiskFactor += 10;
    }
  }

  // Ammonia TAN (Ideal: < 0.05 mg/L)
  if (!isNaN(ammonia)) {
    if (ammonia > 0.1) {
      flags.push(`ACUTE AMMONIA TOXICITY: ${ammonia} mg/L (safe limit < 0.05). Causes gill necrosis.`);
      waterRiskFactor += 18;
    } else if (ammonia > 0.05) {
      flags.push(`Elevated Ammonia (${ammonia} mg/L) stresses gill tissues.`);
      waterRiskFactor += 8;
    }
  }

  // Nitrite NO2 (Ideal: < 0.1 mg/L)
  if (!isNaN(nitrite)) {
    if (nitrite > 0.2) {
      flags.push(`High Nitrite (${nitrite} mg/L) converts hemocyanin/hemoglobin, causing tissue asphyxiation.`);
      waterRiskFactor += 14;
    } else if (nitrite > 0.1) {
      flags.push(`Borderline Nitrite (${nitrite} mg/L) above recommended limit.`);
      waterRiskFactor += 6;
    }
  }

  // Turbidity (Secchi depth: Ideal 25 - 40 cm)
  if (!isNaN(turbidity)) {
    if (turbidity < 20) {
      flags.push(`High turbidity (${turbidity} cm) indicates dense algal bloom or suspended sediment.`);
      waterRiskFactor += 5;
    } else if (turbidity > 50) {
      flags.push(`Clear water (${turbidity} cm) indicates algal crash; sunlight penetrates to pond bottom.`);
      waterRiskFactor += 5;
    }
  }

  return { flags, waterRiskFactor };
}

// Pathology Knowledge Engine & Screening Model
function runPathologyScreening(species, symptoms = [], waterParams = {}, farmerNotes = '') {
  const lowerSymptoms = symptoms.map(s => s.toLowerCase());
  const notesText = (farmerNotes || '').toLowerCase();
  const allText = lowerSymptoms.join(' ') + ' ' + notesText;

  const { flags: waterFlags, waterRiskFactor } = evaluateWaterQuality(waterParams);

  let diseaseMatch = null;

  // 1. SHRIMP & PRAWN DISEASES
  if (species === 'vannamei_shrimp' || species === 'tiger_prawn' || species === 'shrimp') {
    if (
      allText.includes('white spot') ||
      allText.includes('spots on carapace') ||
      allText.includes('calcified spots') ||
      (allText.includes('red') && allText.includes('lethargic'))
    ) {
      diseaseMatch = {
        name: 'White Spot Syndrome Virus (WSSV)',
        scientific: 'Whispovirus (Nimaviridae)',
        baseRisk: 'Critical',
        baseConfidence: 91.5,
        symptomsDetected: [
          'Distinct 0.5–2.0 mm white spots embedded on the carapace and cuticles',
          'Pink to reddish body coloration',
          'Lethargic surface swimming and slow gathering near dykes'
        ],
        observations: [
          'Pathological signs are highly characteristic of WSSV in penaeid shrimp',
          'Rapid onset disease capable of up to 100% mortality in 3–5 days if unmitigated',
          waterFlags.length > 0 ? waterFlags.join(' ') : 'Water quality within typical range.'
        ],
        steps: [
          'Immediately quarantine the pond: halt all discharge or intake to contain transmission',
          'Maximize paddlewheel and aspirator aeration to keep DO above 5.5 mg/L at all times',
          'Suspend feeding by 50% immediately to prevent anaerobic organic deposition',
          'Apply immune stimulants (Vitamin C + Beta-glucans) in residual feed trays',
          'Dispatch moribund shrimp samples in 95% ethanol for mandatory lab RT-PCR confirmation',
          'Contact regional MPEDA-NACS/CIBA diagnostic laboratory immediately'
        ],
        expertRecommended: true
      };
    } else if (
      allText.includes('empty gut') ||
      allText.includes('pale hepatopancreas') ||
      allText.includes('shrunken') ||
      allText.includes('ahpnd') ||
      allText.includes('early mortality')
    ) {
      diseaseMatch = {
        name: 'Early Mortality Syndrome / AHPND',
        scientific: 'Vibrio parahaemolyticus carrying PirAB toxin genes',
        baseRisk: 'Critical',
        baseConfidence: 88.0,
        symptomsDetected: [
          'Pale, atrophied, or darkened hepatopancreas (digestive gland)',
          'Empty digestive tract (gut void of feed particles)',
          'Soft shell and erratic corkscrew swimming'
        ],
        observations: [
          'Acute hepatopancreatic necrosis disease is virulent in early DOC (10–40 days)',
          'Vibrio toxins damage hepatopancreatic tubule epithelial cells rapidly',
          waterFlags.length > 0 ? waterFlags.join(' ') : 'Pond bottom condition requires immediate review.'
        ],
        steps: [
          'Halt all standard chemical disinfectants that destroy beneficial pond microbes',
          'Dose verified multi-strain gut and water probiotics (Bacillus + Lactobacillus)',
          'Perform central sludge drain discharge twice daily',
          'Apply organic acids in feed to lower gut pH below 6.0 and inhibit Vibrio PirAB colonization',
          'Verify with TCBS agar bacterial plating and PCR for PirAB genes'
        ],
        expertRecommended: true
      };
    } else if (
      allText.includes('white feces') ||
      allText.includes('fecal strings') ||
      allText.includes('floating feces') ||
      allText.includes('wfd')
    ) {
      diseaseMatch = {
        name: 'White Feces Disease (WFD)',
        scientific: 'Vermiform gregarine-like bodies (ATM) & Enterocytozoon / Vibrio complex',
        baseRisk: 'High',
        baseConfidence: 86.0,
        symptomsDetected: [
          'Floating white/cream fecal vermiform strings on feeding trays and pond corners',
          'Darkened hepatopancreas with loose shell',
          'Gradual decline in daily feed consumption'
        ],
        observations: [
          'Transformation of transformed microvilli into gregarine-like aggregations',
          'Causes severe growth stunting and secondary mortality if untreated'
        ],
        steps: [
          'Reduce feeding by 30–40% immediately',
          'Apply dietary organic acid blends and phytogenic gut protectors (garlic extract)',
          'Increase bottom aeration to prevent organic sludge fermentation',
          'Use gut probiotics with Bacillus subtilis and yeast cell wall extracts'
        ],
        expertRecommended: true
      };
    } else if (
      allText.includes('stunted') ||
      allText.includes('size variation') ||
      allText.includes('ehp') ||
      allText.includes('slow growth')
    ) {
      diseaseMatch = {
        name: 'Enterocytozoon hepatopenaei (EHP) Microsporidiosis',
        scientific: 'Enterocytozoon hepatopenaei (EHP)',
        baseRisk: 'High',
        baseConfidence: 84.5,
        symptomsDetected: [
          'Severe growth retardation and wide size disparity among same-batch shrimp',
          'Soft shell and opaque abdominal musculature',
          'Normal survival rate but severely depressed FCR (Feed Conversion Ratio)'
        ],
        observations: [
          'Intracellular microsporidian spore infection targeting hepatopancreas tubules',
          'Does not cause acute mass mortality but devastates economic harvest yield'
        ],
        steps: [
          'Conduct nested PCR test of hepatopancreas tissue to confirm spore burden',
          'Maintain rigorous pond bottom cleanliness; remove accumulated molts',
          'Apply gut acidifiers and antimicrobial peptides to suppress spore germination',
          'Plan early harvest if size distribution is severely compromised'
        ],
        expertRecommended: true
      };
    } else if (
      allText.includes('black gill') ||
      allText.includes('brown gill') ||
      allText.includes('gill discoloration')
    ) {
      diseaseMatch = {
        name: 'Black Gill / Brown Gill Syndrome',
        scientific: 'Fusarium solani / Epicommensal ciliates & heavy organic sludge precipitation',
        baseRisk: 'Medium',
        baseConfidence: 82.0,
        symptomsDetected: [
          'Brownish-to-black melanized gill filaments',
          'Labored respiration and congregation near water inflow'
        ],
        observations: [
          'Result of accumulated particulate organic detritus, hydrogen sulfide or fungal attachment',
          'Exacerbated significantly by high ammonia or low dissolved oxygen'
        ],
        steps: [
          'Siphon pond center bottom sludge and flush accumulation',
          'Increase night aeration to maintain DO > 5.0 mg/L',
          'Apply Yucca extract or zeolite to bind noxious bottom gases',
          'Administer bio-remediating nitrifying bacterial inoculants'
        ],
        expertRecommended: false
      };
    }
  }

  // 2. FISH DISEASES (Tilapia, Seabass, Carp)
  if (species === 'tilapia' || species === 'seabass' || species === 'carp' || species === 'fish') {
    if (
      allText.includes('ulcer') ||
      allText.includes('red spot') ||
      allText.includes('wound') ||
      allText.includes('bleeding') ||
      allText.includes('eus')
    ) {
      diseaseMatch = {
        name: 'Epizootic Ulcerative Syndrome (EUS / Red Spot Disease)',
        scientific: 'Aphanomyces invadans (Oomycete fungus)',
        baseRisk: 'Critical',
        baseConfidence: 89.0,
        symptomsDetected: [
          'Deep necrotic circular ulcers exposing underlying red muscle tissues',
          'Invasive mycelial fungal hyphae penetration',
          'Sluggish swimming and loss of equilibrium'
        ],
        observations: [
          'Severe dermal ulceration triggered commonly after heavy rainfall or sudden water temperature drop',
          'OIE notifiable finfish disease with high cross-species virulence in freshwater/brackish fish'
        ],
        steps: [
          'Apply agricultural lime (CaCO3 / CaO) at 50–100 kg/acre to buffer pH and inhibit fungal spore motility',
          'Conduct emergency partial water exchange with treated reservoir water',
          'Bath treatment of infected specimens with potassium permanganate (KMnO4) or salt (2–3 ppt)',
          'Isolate heavily ulcerated fish to prevent cannibalism and secondary Aeromonas septicemia',
          'Notify local state fishery extension officer immediately'
        ],
        expertRecommended: true
      };
    } else if (
      allText.includes('fin rot') ||
      allText.includes('columnaris') ||
      allText.includes('frayed fin') ||
      allText.includes('cotton mouth')
    ) {
      diseaseMatch = {
        name: 'Columnaris Disease / Bacterial Fin Rot',
        scientific: 'Flavobacterium columnare',
        baseRisk: 'High',
        baseConfidence: 85.0,
        symptomsDetected: [
          'Frayed, eroded dorsal, pectoral, and caudal fin margins',
          'White, yellowish or cotton-like lesions around mouth, head, and body flanks',
          'Saddleback lesion pattern across dorsal ridge'
        ],
        observations: [
          'Ubiquitous aquatic bacterium that turns pathogenic when fish are stressed by poor water or high density',
          waterFlags.length > 0 ? waterFlags.join(' ') : 'Elevated temperature and high organic load promote rapid infection.'
        ],
        steps: [
          'Improve water exchange to drop organic matter and bacterial count in water column',
          'Apply oxytetracycline medicated feed under certified aquaculture veterinarian guidance',
          'Dip treatment in potassium permanganate (2–4 ppm) for 30 minutes in treatment tank',
          'Add salt (3–5 g/L) to minimize osmotic stress'
        ],
        expertRecommended: true
      };
    } else if (
      allText.includes('tilv') ||
      allText.includes('sunken eye') ||
      allText.includes('dropsy') ||
      allText.includes('cloudy eye')
    ) {
      diseaseMatch = {
        name: 'Tilapia Lake Virus (TiLV)',
        scientific: 'Tilapia tilapinevirus (Amnoonviridae)',
        baseRisk: 'Critical',
        baseConfidence: 88.5,
        symptomsDetected: [
          'Skin erosions and epidermal peeling',
          'Cloudy cataract lenses or sunken eyes (endophthalmitis)',
          'Swollen abdominal cavity (ascites / dropsy) and internal organ congestion'
        ],
        observations: [
          'Highly contagious emerging viral disease specific to Oreochromis niloticus / GIFT Tilapia',
          'Capable of causing up to 80–90% mortality in nursery and grow-out stocks'
        ],
        steps: [
          'Impose strict biosecurity quarantine on the farm — prohibit moving fingerlings between ponds',
          'Boost aeration and cease live feeding',
          'Collect liver, brain, and spleen tissues for RT-qPCR testing at authorized ICAR-NBFGR/CIFA center',
          'Implement safe disposal (burial with lime) of all dead specimens'
        ],
        expertRecommended: true
      };
    }
  }

  // 3. CRAB DISEASES
  if (species === 'mud_crab' || species === 'crab') {
    if (allText.includes('sleeping') || allText.includes('paralysis') || allText.includes('weak legs')) {
      diseaseMatch = {
        name: 'Mud Crab Sleeping Disease / Viral Encephalopathy',
        scientific: 'Mud Crab Reovirus (MCRV)',
        baseRisk: 'High',
        baseConfidence: 85.0,
        symptomsDetected: [
          'Flaccid paralysis of walking legs and chelipeds',
          'Inability to flip upright when turned onto back',
          'Opaque, non-clotting hemolymph'
        ],
        observations: [
          'Affects Scylla serrata in intensive crab fattening and polyculture ponds',
          'Transmission occurs through cannibalism of infected weak crabs'
        ],
        steps: [
          'Immediately separate all paralyzed or sluggish crabs into isolated quarantine boxes',
          'Feed crabs individually on artificial shelter trays to prevent cannibalistic transmission',
          'Exchange water with high-salinity filtered seawater (20–28 ppt)',
          'Disinfect crab holding cages and shelters with iodine solution'
        ],
        expertRecommended: true
      };
    }
  }

  // 4. DEFAULT / GENERAL ABNORMALITY SCREENING
  if (!diseaseMatch) {
    if (symptoms.length > 0 || notesText.length > 0) {
      diseaseMatch = {
        name: 'Unspecified Aquatic Pathological Abnormality',
        scientific: 'Secondary opportunistic bacterial or environmental stress condition',
        baseRisk: waterRiskFactor > 15 ? 'High' : 'Medium',
        baseConfidence: 72.0,
        symptomsDetected: symptoms.length > 0 ? symptoms : ['Unspecified visual stress/discoloration'],
        observations: [
          'Visual indicators suggest physiological stress or early-stage opportunistic infection',
          waterFlags.length > 0 ? waterFlags.join(' ') : 'Water quality parameters within standard tolerances.'
        ],
        steps: [
          'Perform a 20% water exchange with clean, well-aerated water',
          'Check dissolved oxygen and ammonia levels twice daily (early morning & late evening)',
          'Temporarily reduce feeding rate by 25% and observe feeding tray consumption',
          'Monitor the pond daily for any progression of visual abnormalities',
          'Consult an aquaculture specialist if abnormalities persist past 48 hours'
        ],
        expertRecommended: waterRiskFactor > 15
      };
    } else {
      // Clean / Healthy specimen
      diseaseMatch = {
        name: 'No Significant Disease Detected (Healthy Specimen Profile)',
        scientific: 'Physiologically normal aquaculture specimen',
        baseRisk: 'Low',
        baseConfidence: 94.0,
        symptomsDetected: ['Normal cuticle / skin integrity', 'Clear digestive tract / gills', 'No visible lesions or parasites'],
        observations: [
          'Specimen displays standard anatomical morphology and healthy pigmentation',
          waterFlags.length > 0 ? waterFlags.join(' ') : 'Water quality parameters remain within optimal ranges.'
        ],
        steps: [
          'Continue regular daily feeding schedules as per pond biomass calculations',
          'Maintain standard water quality monitoring (pH, DO, Ammonia, Salinity)',
          'Continue biosecurity protocols and preventative probiotic maintenance'
        ],
        expertRecommended: false
      };
    }
  }

  // Adjust Risk Level according to Water Quality Stress Factor
  let finalRisk = diseaseMatch.baseRisk;
  let finalConfidence = diseaseMatch.baseConfidence;

  if (waterRiskFactor >= 15) {
    if (finalRisk === 'Low') finalRisk = 'Medium';
    else if (finalRisk === 'Medium') finalRisk = 'High';
    else if (finalRisk === 'High') finalRisk = 'Critical';
    finalConfidence = Math.min(98.5, parseFloat((finalConfidence + 2.5).toFixed(1)));
  }

  const waterCorrelationText =
    waterFlags.length > 0
      ? `WATER QUALITY STRESS DETECTED (${waterFlags.length} deviations): ${waterFlags.join(' ')}`
      : 'Water parameters are within normal aquaculture ranges and not exacerbating disease vulnerability.';

  return {
    possible_disease: diseaseMatch.name,
    scientific_name: diseaseMatch.scientific,
    confidence: finalConfidence,
    risk_level: finalRisk,
    detected_symptoms: diseaseMatch.symptomsDetected,
    affected_species: species.replace('_', ' ').toUpperCase(),
    key_observations: diseaseMatch.observations,
    recommended_next_steps: diseaseMatch.steps,
    water_quality_correlation: waterCorrelationText,
    expert_consultation_recommended: diseaseMatch.expertRecommended || finalRisk === 'Critical' || finalRisk === 'High'
  };
}

module.exports = {
  DISCLAIMER_TEXT,

  // Analyze specimen image + parameters + symptoms
  analyzeDiseaseScreening(payload, farmerId = 'farmer-demo') {
    const {
      pond_id = 'pond-01',
      pond_name = 'Pond 1',
      species = 'vannamei_shrimp',
      image_url,
      symptoms = [],
      water_parameters = {},
      farmer_notes = ''
    } = payload;

    if (!image_url) {
      throw new Error('Specimen image URL or image data is required for screening');
    }

    // Run AI Pathology & Computer Vision Screening Simulation Engine
    const aiResult = runPathologyScreening(species, symptoms, water_parameters, farmer_notes);

    const newAnalysis = {
      id: `ana-${Date.now()}`,
      farmer_id: farmerId,
      pond_id,
      pond_name,
      species,
      image_url,
      symptoms,
      water_parameters,
      farmer_notes,
      ai_result: aiResult,
      risk_level: aiResult.risk_level,
      confidence: aiResult.confidence,
      expert_status: 'none',
      expert_notes: null,
      disclaimer: DISCLAIMER_TEXT,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save to historical logs
    diseaseAnalyses.unshift(newAnalysis);

    // Auto-generate alerts based on screening results
    this.evaluateAndGenerateAlerts(newAnalysis, farmerId);

    return newAnalysis;
  },

  // Alert generation rules
  evaluateAndGenerateAlerts(analysis, farmerId) {
    const { pond_id, pond_name, risk_level, ai_result, water_parameters, id } = analysis;

    // Alert Rule 1: High or Critical Risk Disease Alert
    if (risk_level === 'High' || risk_level === 'Critical') {
      const isCritical = risk_level === 'Critical';
      diseaseAlerts.unshift({
        id: `alt-${Date.now()}-1`,
        farmer_id: farmerId,
        pond_id,
        pond_name,
        analysis_id: id,
        alert_type: 'high_risk_disease',
        severity: isCritical ? 'critical' : 'danger',
        title: `${isCritical ? '🚨 CRITICAL' : '⚠️ HIGH RISK'}: Possible ${ai_result.possible_disease} in ${pond_name}`,
        message: `AI screening flagged ${ai_result.confidence}% correlation. Risk is evaluated as ${risk_level}. Immediate bio-security and expert evaluation advised.`,
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    // Alert Rule 2: Repeated Abnormalities in Same Pond (2+ abnormal screenings in last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recentPondAbnormalities = diseaseAnalyses.filter(
      a =>
        a.pond_id === pond_id &&
        a.id !== id &&
        (a.risk_level === 'Medium' || a.risk_level === 'High' || a.risk_level === 'Critical') &&
        a.created_at >= sevenDaysAgo
    );

    if (recentPondAbnormalities.length >= 1 && (risk_level === 'Medium' || risk_level === 'High' || risk_level === 'Critical')) {
      diseaseAlerts.unshift({
        id: `alt-${Date.now()}-2`,
        farmer_id: farmerId,
        pond_id,
        pond_name,
        analysis_id: id,
        alert_type: 'repeated_abnormality',
        severity: 'danger',
        title: `🔁 Repeated Disease Abnormality Pattern in ${pond_name}`,
        message: `${recentPondAbnormalities.length + 1} abnormal screening assessments detected in ${pond_name} within the last 7 days. Persistent stress indicates systemic pond pathogen reservoir.`,
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    // Alert Rule 3: Abnormal Water Parameters
    const { flags } = evaluateWaterQuality(water_parameters);
    if (flags.length > 0) {
      diseaseAlerts.unshift({
        id: `alt-${Date.now()}-3`,
        farmer_id: farmerId,
        pond_id,
        pond_name,
        analysis_id: id,
        alert_type: 'abnormal_water_parameters',
        severity: flags.some(f => f.includes('CRITICAL')) ? 'danger' : 'warning',
        title: `💧 Water Quality Stress Detected in ${pond_name}`,
        message: flags.slice(0, 2).join(' '),
        is_read: false,
        created_at: new Date().toISOString()
      });
    }
  },

  // Get complete screening history for farmer
  getAllDiseaseHistory(farmerId) {
    if (!farmerId) return diseaseAnalyses;
    return diseaseAnalyses.filter(a => a.farmer_id === farmerId || a.farmer_id === 'farmer-demo');
  },

  // Get pond-specific disease history
  getPondDiseaseHistory(pondId, farmerId) {
    let list = diseaseAnalyses;
    if (farmerId) list = list.filter(a => a.farmer_id === farmerId || a.farmer_id === 'farmer-demo');
    if (pondId && pondId !== 'all') list = list.filter(a => a.pond_id === pondId);
    return list;
  },

  // Request Expert Pathologist Consultation
  requestExpertConsultation(analysisId, contactDetails = {}) {
    const analysis = diseaseAnalyses.find(a => a.id === analysisId);
    if (!analysis) return null;

    analysis.expert_status = 'requested';
    analysis.expert_notes = `Consultation requested by farmer ${contactDetails.farmer_name || ''} (${contactDetails.phone || ''}). Assigned to regional ICAR-CIBA / MPEDA emergency tele-pathology desk.`;
    analysis.updated_at = new Date().toISOString();

    return analysis;
  },

  // Get Active Alerts
  getDiseaseAlerts(farmerId) {
    if (!farmerId) return diseaseAlerts;
    return diseaseAlerts.filter(a => a.farmer_id === farmerId || a.farmer_id === 'farmer-demo');
  },

  // Mark alert as read/dismissed
  markAlertAsRead(alertId) {
    const alert = diseaseAlerts.find(a => a.id === alertId);
    if (!alert) return null;
    alert.is_read = true;
    return alert;
  }
};
