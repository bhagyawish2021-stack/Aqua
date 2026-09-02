'use strict';
// gen_ai_service.js — writes a clean ai.service.js without PowerShell quote mangling
const fs = require('fs');
const path = require('path');

const TARGET = path.join(__dirname, '../../src/services/ai.service.js');

// ─── Knowledge base entries ──────────────────────────────────────────────────
const KNOWLEDGE_BASE = [
  {
    keywords: ['ammonia', 'nh3', 'tan', 'nitrogen', 'toxic'],
    answer: [
      'High ammonia (above 0.1 mg/L) is one of the most dangerous water quality issues in shrimp ponds.',
      'It damages gills, suppresses immunity, and causes mass mortality if left untreated.',
      '',
      'Immediate steps:',
      '1. Stop or significantly reduce feeding — uneaten feed is the primary ammonia source.',
      '2. Perform a 20–30% water exchange with clean, tested water.',
      '3. Increase aeration — dissolved oxygen above 5 mg/L speeds up bacterial nitrification.',
      '4. Apply zeolite (5–10 kg/acre) to adsorb ammonia from the water column.',
      '5. Remove any dead shrimp or organic debris from the pond floor.',
      '6. Check and correct pH — nitrifying bacteria work best at pH 7.5–8.5.',
      '',
      'Target: ammonia should be below 0.1 mg/L for safe shrimp growth.',
    ].join('\n'),
  },
  {
    keywords: ['ph', 'acidic', 'alkaline', 'acid', 'alkalinity', 'lime', 'ph low', 'ph high', 'ph drop'],
    answer: [
      'pH is a critical water quality parameter. Ideal range for shrimp ponds is 7.5–8.5.',
      '',
      'If pH is LOW (below 7.5):',
      '- Apply agricultural lime (CaCO3) at 50–100 kg/acre in the evening.',
      '- Increase aeration to drive off excess CO2.',
      '- Check alkalinity — low alkalinity (below 80 mg/L) makes pH unstable.',
      '',
      'If pH is HIGH (above 8.5):',
      '- This usually indicates a heavy algal bloom (algae consume CO2).',
      '- Reduce fertilisation immediately.',
      '- Perform a partial water exchange (20–25%).',
      '- Consider plankton management using alum or organic acids if bloom is severe.',
      '',
      'pH naturally swings during the day — lowest at dawn, highest at dusk.',
      'A swing greater than 0.5 units/day is a warning sign.',
    ].join('\n'),
  },
  {
    keywords: ['temperature', 'temp', 'hot', 'cold', 'heat', 'warm', 'cool', 'overheating'],
    answer: [
      'Water temperature directly controls shrimp metabolism, feed intake, and disease resistance.',
      'Ideal range for Vannamei shrimp is 26–30°C.',
      '',
      'If temperature is TOO HIGH (above 32°C):',
      '- Increase paddlewheel aeration to cool surface water.',
      '- Add shade netting over part of the pond surface.',
      '- Perform partial water exchange with cooler, deeper water.',
      '- Reduce feeding rate — digestion stress increases at high temperatures.',
      '',
      'If temperature is TOO LOW (below 24°C):',
      '- Reduce feeding — shrimp appetite drops sharply below 24°C.',
      '- Monitor for slow growth and susceptibility to Vibrio.',
      '- Avoid stocking new batches until temperature recovers.',
      '',
      'Temperature also affects dissolved oxygen levels — warmer water holds less oxygen.',
    ].join('\n'),
  },
  {
    keywords: ['dissolved oxygen', 'do level', 'oxygen', 'aeration', 'aerator', 'suffocation', 'low oxygen'],
    answer: [
      'Dissolved oxygen (DO) is the single most critical parameter for shrimp survival.',
      'Maintain DO above 5 mg/L at all times; shrimp begin to stress below 4 mg/L and die below 2 mg/L.',
      '',
      'If DO is LOW:',
      '1. Turn on all available aerators immediately.',
      '2. Stop feeding at once — decomposition of feed consumes oxygen.',
      '3. Reduce stocking density if the problem is chronic.',
      '4. Check for algal crash — a sudden phytoplankton die-off consumes large amounts of oxygen.',
      '5. Perform a 20–30% water exchange with well-oxygenated water.',
      '',
      'Good practices:',
      '- Run aerators from 10 PM to 8 AM when natural photosynthesis stops.',
      '- Target 1 HP of aeration per 500 kg of expected shrimp biomass.',
      '- Monitor DO at dawn (4–6 AM) — this is when it is lowest.',
    ].join('\n'),
  },
  {
    keywords: ['salinity', 'salt', 'saline', 'brackish', 'freshwater', 'ppt', 'osmosis'],
    answer: [
      'Salinity affects shrimp osmoregulation — the energy shrimp use to maintain internal salt balance.',
      'Ideal salinity for Vannamei is 10–25 ppt.',
      '',
      'If salinity is TOO LOW (below 10 ppt):',
      '- Shrimp must work harder to retain salts — growth slows.',
      '- Add pre-mixed saline water or sea water to raise salinity gradually.',
      '- Avoid sudden salinity changes — change by no more than 3–5 ppt per day.',
      '',
      'If salinity is TOO HIGH (above 25 ppt):',
      '- Dilute with clean freshwater — slowly, over 2–3 days.',
      '- Monitor shrimp behaviour for lethargy or surface crowding.',
      '',
      'Sudden salinity changes (rain events or freshwater inflow) are a common stress trigger.',
      'Always acclimatize shrimp gradually.',
    ].join('\n'),
  },
  {
    keywords: ['feed', 'feeding', 'food', 'pellet', 'feed rate', 'overfeeding', 'feed tray', 'fcr', 'feed conversion'],
    answer: [
      'Proper feeding is crucial for profitability and water quality.',
      'Overfeeding is the number-one cause of poor water quality.',
      '',
      'Best practices:',
      '- Feed 3–4 times daily at fixed times (e.g. 6 AM, 12 PM, 6 PM, 10 PM).',
      '- Use feed trays — check 1 hour after feeding; if feed remains, reduce next meal by 10–20%.',
      '- FCR target: 1.2–1.5 for well-managed Vannamei ponds.',
      '- Reduce feeding rate when:',
      '  - DO drops below 4 mg/L',
      '  - Temperature exceeds 32°C or drops below 24°C',
      '  - Ammonia rises above 0.05 mg/L',
      '  - Shrimp show reduced appetite on feed trays',
      '',
      '- Use quality certified feed. Check manufacturing and expiry dates.',
      '- Store feed in a dry, cool, ventilated area — damp feed causes mycotoxin problems.',
    ].join('\n'),
  },
  {
    keywords: ['growth', 'weight', 'slow growth', 'abw', 'average body weight', 'biomass', 'harvest'],
    answer: [
      'Shrimp growth depends on water quality, feed quality, stocking density, and disease management.',
      '',
      'Typical Vannamei growth targets (DOC = Days of Culture):',
      '- DOC 30: 3–5g average body weight',
      '- DOC 60: 10–14g',
      '- DOC 90: 20–25g',
      '- DOC 120: 30–35g',
      '',
      'If growth is SLOW:',
      '1. Check water quality — poor DO, high ammonia, or extreme pH stunts growth.',
      '2. Review feed quality and feeding frequency.',
      '3. Check for disease or parasites — slow growth with soft shell is a warning sign.',
      '4. Reduce stocking density if overcrowding is suspected.',
      '5. Consider mid-crop harvest (thinning) to improve growth rates.',
      '',
      'Sample weekly to track growth and compare to expected ABW curves.',
    ].join('\n'),
  },
  {
    keywords: ['disease', 'sick', 'mortality', 'dead', 'wssv', 'ems', 'white spot', 'vibrio', 'infection', 'bacteria', 'virus', 'prevention'],
    answer: [
      'Disease prevention is far more effective and cheaper than treatment in shrimp farming.',
      '',
      'Key prevention practices:',
      '1. Source certified, SPF (Specific Pathogen Free) seed from reputable hatcheries.',
      '2. Properly prepare ponds — dry, till, lime, and refill.',
      '3. Maintain good water quality at all times — stress makes shrimp vulnerable.',
      '4. Practice biosecurity: limit visitor access, use separate equipment per pond.',
      '5. Monitor daily for early signs: surface crowding, reduced feed intake, shell softening, discolouration.',
      '',
      'Common diseases:',
      '- WSSV (White Spot): caused by virus. No cure — prevention and early pond closure are critical.',
      '- EMS/AHPND: caused by Vibrio bacteria. Linked to poor water quality. Manage DO and organic load.',
      '- Running mortality: often linked to low DO at night. Increase aeration.',
      '',
      'At first sign of mortality: stop feeding, increase aeration, collect samples for lab diagnosis.',
    ].join('\n'),
  },
  {
    keywords: ['water quality', 'water change', 'water exchange', 'pond water', 'test water', 'turbid'],
    answer: [
      'Good water quality is the foundation of successful shrimp farming.',
      '',
      'Daily monitoring targets:',
      '- Transparency (Secchi depth): 25–40 cm — indicates healthy plankton density',
      '- Color: light green or golden-brown (healthy phytoplankton); black/dark = organic overload',
      '- DO: above 5 mg/L throughout the day',
      '- pH: 7.5–8.5',
      '- Temperature: 26–30°C',
      '',
      'Water exchange guidelines:',
      '- Routine exchange: 5–10% per week after DOC 30',
      '- Emergency exchange: 20–30% for ammonia spikes, algal crash, or poor color',
      '- Always test incoming water before adding to the pond',
      '- Never exchange more than 30% at once — it stresses shrimp',
      '',
      'Probiotics (Bacillus species) added weekly help break down organic matter and maintain healthy plankton.',
    ].join('\n'),
  },
  {
    keywords: ['pond preparation', 'pond setup', 'liming', 'tilling', 'drying', 'prepare pond', 'new pond'],
    answer: [
      'Proper pond preparation is the most important factor for a successful crop.',
      '',
      'Standard preparation steps:',
      '1. Drain and dry the pond completely for 10–14 days (crack the soil).',
      '2. Remove sludge and black soil from the pond bottom.',
      '3. Apply quicklime (CaO) at 500–1000 kg/acre — kills pathogens and raises pH.',
      '4. Till the soil to aerate and expose remaining pathogens to sun.',
      '5. Apply agricultural lime (CaCO3) at 200 kg/acre to stabilise pH.',
      '6. Fill with filtered water (use mesh 40–60 to keep wild fish and crabs out).',
      '7. Fertilise water to develop plankton bloom before stocking.',
      '8. Acclimatize seed for 15–30 minutes before releasing.',
      '',
      'Target water parameters before stocking: pH 7.5–8.3, DO above 5, Salinity 15–20 ppt, Ammonia: 0.',
    ].join('\n'),
  },
  {
    keywords: ['alkalinity', 'carbonate', 'bicarbonate', 'buffer', 'hardness'],
    answer: [
      'Alkalinity (measured as mg/L CaCO3) is the buffering capacity of water.',
      'It stabilises pH and supports healthy plankton growth.',
      '',
      'Target alkalinity: 100–150 mg/L',
      '',
      'If alkalinity is LOW (below 80 mg/L):',
      '- Apply sodium bicarbonate (baking soda) at 5–10 kg/acre or agricultural lime.',
      '- Low alkalinity causes unstable pH swings and poor plankton growth.',
      '',
      'If alkalinity is HIGH (above 200 mg/L):',
      '- Usually not harmful — monitor pH and plankton density.',
      '- Partial water exchange can dilute it.',
      '',
      'Check alkalinity weekly, especially after heavy rain.',
    ].join('\n'),
  },
  {
    keywords: ['moult', 'moulting', 'shell', 'soft shell', 'exoskeleton', 'ecdysis'],
    answer: [
      'Moulting is when shrimp shed their exoskeleton to grow.',
      'Shrimp are very vulnerable during and immediately after moulting.',
      '',
      'Signs of moulting:',
      '- Empty shells on pond bottom or feed trays',
      '- Reduced feed intake 1–2 days before moulting',
      '',
      'During moulting periods:',
      '- Maintain DO above 5 mg/L at all times',
      '- Keep salinity stable — sudden changes stress moulting shrimp',
      '- Reduce aeration turbulence slightly to prevent physical damage',
      '- Ensure adequate calcium and phosphorus in feed for shell hardening',
      '',
      'Soft shell syndrome is linked to:',
      '- Low alkalinity / calcium deficiency',
      '- Poor water quality (high ammonia or low DO)',
      '- Nutritional deficiency in feed',
    ].join('\n'),
  },
  {
    keywords: ['plankton', 'algae', 'bloom', 'phytoplankton', 'zooplankton', 'transparency', 'secchi'],
    answer: [
      'Healthy phytoplankton (green/brown plankton bloom) is essential.',
      'It produces oxygen, absorbs ammonia, and provides natural feed for shrimp larvae.',
      '',
      'Target Secchi depth: 25–40 cm',
      '',
      'If water is TOO CLEAR (Secchi above 50 cm):',
      '- Apply organic fertiliser (cow dung, rice bran) to promote plankton growth.',
      '- Poor plankton means less oxygen production and more UV penetration.',
      '',
      'If water is TOO TURBID (Secchi below 20 cm):',
      '- Apply 5–10 kg/acre alum to settle particles.',
      '- Reduce fertiliser inputs.',
      '',
      'Algal crash (sudden plankton die-off):',
      '- DO drops sharply overnight; water turns grey/brown and smells bad.',
      '- Response: emergency aeration, 30% water exchange, probiotics.',
    ].join('\n'),
  },
  {
    keywords: ['probiotic', 'bacillus', 'beneficial bacteria', 'microbe'],
    answer: [
      'Probiotics (beneficial bacteria, mainly Bacillus species) are widely used in modern shrimp farming to:',
      '- Break down organic matter (uneaten feed, faeces) and reduce ammonia',
      '- Compete with harmful Vibrio bacteria',
      '- Stabilise plankton blooms',
      '- Improve gut health and immunity when mixed into feed',
      '',
      'Application guidelines:',
      '- Water application: 1–2 kg/acre/week, broadcast in the morning',
      '- Feed mixing: 5–10 ml per kg of feed (liquid probiotics)',
      '- Increase dosage after heavy rain, water exchange, or antibiotic use',
      '',
      'Probiotics work best when combined with good aeration and organic matter management.',
      'They are not a substitute for good water quality management.',
    ].join('\n'),
  },
];

const FALLBACK_ANSWER = [
  'Thank you for your question. As an AquaMitra aquaculture assistant, I can help with:',
  '',
  '- Water quality: pH, dissolved oxygen, ammonia, temperature, salinity, alkalinity',
  '- Feeding practices and FCR improvement',
  '- Shrimp growth monitoring and harvest planning',
  '- Disease prevention and early warning signs',
  '- Pond preparation and plankton management',
  '- Moulting, probiotics, and biosecurity',
  '',
  'Please try rephrasing your question with one of the above topics.',
  'For urgent issues (mass mortality, DO crash): increase aeration, stop feeding,',
  'and perform a 20–30% water exchange immediately.',
].join('\n');

const RANGES = {
  temperature:      { low: 26,  high: 30,  unit: 'C',    label: 'Temperature' },
  ph:               { low: 7.5, high: 8.5, unit: '',     label: 'pH' },
  dissolved_oxygen: { low: 5,   high: 12,  unit: 'mg/L', label: 'Dissolved Oxygen' },
  salinity:         { low: 10,  high: 25,  unit: 'ppt',  label: 'Salinity' },
  ammonia:          { low: 0,   high: 0.1, unit: 'mg/L', label: 'Ammonia', higherIsBad: true },
};

function scoreEntry(entry, lower) {
  let score = 0;
  for (const kw of entry.keywords) {
    if (lower.includes(kw)) score += kw.includes(' ') ? 2 : 1;
  }
  return score;
}

function matchAnswer(question) {
  const lower = question.toLowerCase().trim();
  let best = 0;
  let answer = null;
  for (const entry of KNOWLEDGE_BASE) {
    const s = scoreEntry(entry, lower);
    if (s > best) { best = s; answer = entry.answer; }
  }
  return best > 0 ? answer : null;
}

function buildParameterWarnings(wq) {
  if (!wq) return [];
  const warnings = [];
  for (const [key, range] of Object.entries(RANGES)) {
    const value = wq[key];
    if (value == null) continue;
    if (range.higherIsBad) {
      if (value > range.high) {
        warnings.push(
          `${range.label} is ${value} ${range.unit} — above the safe limit of ${range.high} ${range.unit}. Immediate action needed.`
        );
      }
    } else {
      if (value < range.low) {
        warnings.push(`${range.label} is ${value} ${range.unit} — below the ideal minimum of ${range.low} ${range.unit}.`);
      } else if (value > range.high) {
        warnings.push(`${range.label} is ${value} ${range.unit} — above the ideal maximum of ${range.high} ${range.unit}.`);
      }
    }
  }
  return warnings;
}

function buildContextSuffix(ctx) {
  const { pond, latestWaterQuality, mlPrediction } = ctx;
  const parts = [];

  if (pond) {
    parts.push(
      `\n\nYour pond: "${pond.name}" — ${pond.species || 'shrimp'} pond, ` +
      `${pond.size_acres ? pond.size_acres + ' acres' : 'size unknown'}, ` +
      `status: ${pond.status || 'active'}.`
    );
  }

  if (latestWaterQuality) {
    const warnings = buildParameterWarnings(latestWaterQuality);
    if (warnings.length > 0) {
      parts.push('\nBased on your latest readings, the following parameters need attention:');
      parts.push(warnings.map((w) => `  ⚠ ${w}`).join('\n'));
    } else {
      parts.push('\nYour latest water quality readings are all within safe ranges. Keep up the good work!');
    }
  }

  if (mlPrediction) {
    const label = { LOW: 'LOW RISK', MODERATE: 'MODERATE RISK', HIGH: 'HIGH RISK' };
    parts.push(
      `\nML Risk Assessment: ${label[mlPrediction.risk_level] || mlPrediction.risk_level} ` +
      `(confidence: ${Math.round((mlPrediction.confidence || 0) * 100)}%)`
    );
    if (
      mlPrediction.risk_level === 'HIGH' &&
      mlPrediction.recommendations &&
      mlPrediction.recommendations.length > 0
    ) {
      parts.push(`Priority action: ${mlPrediction.recommendations[0]}`);
    }
  }

  return parts.join('\n');
}

/**
 * @param {string} question - Farmer's question
 * @param {Object} contextData - { pond, latestWaterQuality, mlPrediction }
 * @returns {Promise<string>} Answer text
 */
async function askAssistant(question, contextData) {
  const ctx = contextData || {};
  const base = matchAnswer(question) || FALLBACK_ANSWER;
  return base + buildContextSuffix(ctx);
}

module.exports = { askAssistant };

// ─── Self-test (runs once when invoked directly) ──────────────────────────────
if (require.main === module) {
  const testQ = process.argv[2] || 'What should I do if ammonia is high?';
  askAssistant(testQ).then((a) => {
    console.log('\nQuestion:', testQ);
    console.log('\nAnswer:\n', a);
  });
}
