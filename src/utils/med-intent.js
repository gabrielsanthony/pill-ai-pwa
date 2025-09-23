// src/utils/med-intent.js

// --- 1) Canonical NZ medicine names (brand & generic) ---
// ⛳ Start small; you can expand this list anytime.
export const MED_NAMES = [
 // Pain & Fever
  { display: "Panadol",          key: "panadol",          generic: "paracetamol" },
  { display: "Pamol",            key: "pamol",            generic: "paracetamol" },
  { display: "Paracetamol",      key: "paracetamol",      generic: "paracetamol" },
  { display: "Ibuprofen",        key: "ibuprofen",        generic: "ibuprofen" },
  { display: "Nurofen",          key: "nurofen",          generic: "ibuprofen" },
  { display: "Diclofenac",       key: "diclofenac",       generic: "diclofenac" },
  { display: "Voltaren",         key: "voltaren",         generic: "diclofenac" },
  { display: "Naproxen",         key: "naproxen",         generic: "naproxen" },
  { display: "Aspirin",          key: "aspirin",          generic: "aspirin" },
  { display: "Codeine",          key: "codeine",          generic: "codeine" },
  { display: "Tramadol",         key: "tramadol",         generic: "tramadol" },
  { display: "Morphine",         key: "morphine",         generic: "morphine" },
  { display: "Oxycodone",        key: "oxycodone",        generic: "oxycodone" },

  // Gout
  { display: "Allopurinol",      key: "allopurinol",      generic: "allopurinol" },
  { display: "Colchicine",       key: "colchicine",       generic: "colchicine" },

  // Antibiotics (common)
  { display: "Amoxicillin",      key: "amoxicillin",      generic: "amoxicillin" },
  { display: "Augmentin",        key: "augmentin",        generic: "amoxicillin + clavulanic acid" },
  { display: "Flucloxacillin",   key: "flucloxacillin",   generic: "flucloxacillin" },
  { display: "Cefalexin",        key: "cefalexin",        generic: "cefalexin" },
  { display: "Doxycycline",      key: "doxycycline",      generic: "doxycycline" },
  { display: "Erythromycin",     key: "erythromycin",     generic: "erythromycin" },
  { display: "Azithromycin",     key: "azithromycin",     generic: "azithromycin" },
  { display: "Metronidazole",    key: "metronidazole",    generic: "metronidazole" },
  { display: "Ciprofloxacin",    key: "ciprofloxacin",    generic: "ciprofloxacin" },
  { display: "Nitrofurantoin",   key: "nitrofurantoin",   generic: "nitrofurantoin" },
  { display: "Trimethoprim",     key: "trimethoprim",     generic: "trimethoprim" },
  { display: "Co-trimoxazole",   key: "cotrimoxazole",    generic: "trimethoprim + sulfamethoxazole" },
  { display: "Phenoxymethylpenicillin", key: "phenoxymethylpenicillin", generic: "phenoxymethylpenicillin" },

  // Antivirals (common primary care)
  { display: "Aciclovir",        key: "aciclovir",        generic: "aciclovir" },
  { display: "Valaciclovir",     key: "valaciclovir",     generic: "valaciclovir" },

  // Respiratory / Asthma / COPD / Allergy
  { display: "Ventolin",         key: "ventolin",         generic: "salbutamol" },
  { display: "Salbutamol",       key: "salbutamol",       generic: "salbutamol" },
  { display: "Bricanyl",         key: "bricanyl",         generic: "terbutaline" },
  { display: "Ipratropium",      key: "ipratropium",      generic: "ipratropium" },
  { display: "Atrovent",         key: "atrovent",         generic: "ipratropium" },
  { display: "Flixotide",        key: "flixotide",        generic: "fluticasone" },
  { display: "Fluticasone",      key: "fluticasone",      generic: "fluticasone" },
  { display: "Beclomethasone",   key: "beclomethasone",   generic: "beclomethasone" },
  { display: "Budesonide",       key: "budesonide",       generic: "budesonide" },
  { display: "Seretide",         key: "seretide",         generic: "fluticasone + salmeterol" },
  { display: "Symbicort",        key: "symbicort",        generic: "budesonide + formoterol" },
  { display: "Tiotropium",       key: "tiotropium",       generic: "tiotropium" },
  { display: "Spiriva",          key: "spiriva",          generic: "tiotropium" },
  { display: "Montelukast",      key: "montelukast",      generic: "montelukast" },
  { display: "Cetirizine",       key: "cetirizine",       generic: "cetirizine" },
  { display: "Loratadine",       key: "loratadine",       generic: "loratadine" },
  { display: "Fexofenadine",     key: "fexofenadine",     generic: "fexofenadine" },
  { display: "Otrivin",          key: "otrivin",          generic: "xylometazoline" },
  { display: "Oxymetazoline",    key: "oxymetazoline",    generic: "oxymetazoline" },
  { display: "Pseudoephedrine",  key: "pseudoephedrine",  generic: "pseudoephedrine" },

  // Gastrointestinal
  { display: "Omeprazole",       key: "omeprazole",       generic: "omeprazole" },
  { display: "Losec",            key: "losec",            generic: "omeprazole" },
  { display: "Pantoprazole",     key: "pantoprazole",     generic: "pantoprazole" },
  { display: "Esomeprazole",     key: "esomeprazole",     generic: "esomeprazole" },
  { display: "Ranitidine",       key: "ranitidine",       generic: "ranitidine" }, // historically used
  { display: "Loperamide",       key: "loperamide",       generic: "loperamide" },
  { display: "Hyoscine butylbromide", key: "hyoscinebutylbromide", generic: "hyoscine butylbromide" },
  { display: "Buscopan",         key: "buscopan",         generic: "hyoscine butylbromide" },
  { display: "Metoclopramide",   key: "metoclopramide",   generic: "metoclopramide" },
  { display: "Domperidone",      key: "domperidone",      generic: "domperidone" },
  { display: "Ondansetron",      key: "ondansetron",      generic: "ondansetron" },
  { display: "Gaviscon",         key: "gaviscon",         generic: "alginate + antacid" },

  // Cardiovascular / BP / Lipids / Anticoagulants / Anti-platelets
  { display: "Amlodipine",       key: "amlodipine",       generic: "amlodipine" },
  { display: "Felodipine",       key: "felodipine",       generic: "felodipine" },
  { display: "Metoprolol",       key: "metoprolol",       generic: "metoprolol" },
  { display: "Bisoprolol",       key: "bisoprolol",       generic: "bisoprolol" },
  { display: "Atenolol",         key: "atenolol",         generic: "atenolol" },
  { display: "Losartan",         key: "losartan",         generic: "losartan" },
  { display: "Candesartan",      key: "candesartan",      generic: "candesartan" },
  { display: "Enalapril",        key: "enalapril",        generic: "enalapril" },
  { display: "Lisinopril",       key: "lisinopril",       generic: "lisinopril" },
  { display: "Hydrochlorothiazide", key: "hydrochlorothiazide", generic: "hydrochlorothiazide" },
  { display: "Indapamide",       key: "indapamide",       generic: "indapamide" },
  { display: "Furosemide",       key: "furosemide",       generic: "furosemide" },
  { display: "Frusemide",        key: "frusemide",        generic: "furosemide" },
  { display: "Spironolactone",   key: "spironolactone",   generic: "spironolactone" },
  { display: "Isosorbide mononitrate", key: "isosorbidemononitrate", generic: "isosorbide mononitrate" },
  { display: "Glyceryl trinitrate", key: "glyceryltrinitrate", generic: "nitroglycerin" },
  { display: "Clopidogrel",      key: "clopidogrel",      generic: "clopidogrel" },
  { display: "Warfarin",         key: "warfarin",         generic: "warfarin" },
  { display: "Apixaban",         key: "apixaban",         generic: "apixaban" },
  { display: "Rivaroxaban",      key: "rivaroxaban",      generic: "rivaroxaban" },
  { display: "Dabigatran",       key: "dabigatran",       generic: "dabigatran" },
  { display: "Simvastatin",      key: "simvastatin",      generic: "simvastatin" },
  { display: "Atorvastatin",     key: "atorvastatin",     generic: "atorvastatin" },
  { display: "Rosuvastatin",     key: "rosuvastatin",     generic: "rosuvastatin" },

  // Diabetes & Endocrine
  { display: "Metformin",        key: "metformin",        generic: "metformin" },
  { display: "Gliclazide",       key: "gliclazide",       generic: "gliclazide" },
  { display: "Insulin",          key: "insulin",          generic: "insulin" },
  { display: "Sitagliptin",      key: "sitagliptin",      generic: "sitagliptin" },
  { display: "Empagliflozin",    key: "empagliflozin",    generic: "empagliflozin" },
  { display: "Dapagliflozin",    key: "dapagliflozin",    generic: "dapagliflozin" },
  { display: "Levothyroxine",    key: "levothyroxine",    generic: "levothyroxine" },
  { display: "Eltroxin",         key: "eltroxin",         generic: "levothyroxine" },
  { display: "Liothyronine",     key: "liothyronine",     generic: "liothyronine" },

  // Mental Health / Sleep
  { display: "Sertraline",       key: "sertraline",       generic: "sertraline" },
  { display: "Fluoxetine",       key: "fluoxetine",       generic: "fluoxetine" },
  { display: "Citalopram",       key: "citalopram",       generic: "citalopram" },
  { display: "Escitalopram",     key: "escitalopram",     generic: "escitalopram" },
  { display: "Venlafaxine",      key: "venlafaxine",      generic: "venlafaxine" },
  { display: "Mirtazapine",      key: "mirtazapine",      generic: "mirtazapine" },
  { display: "Amitriptyline",    key: "amitriptyline",    generic: "amitriptyline" },
  { display: "Nortriptyline",    key: "nortriptyline",    generic: "nortriptyline" },
  { display: "Quetiapine",       key: "quetiapine",       generic: "quetiapine" },
  { display: "Risperidone",      key: "risperidone",      generic: "risperidone" },
  { display: "Diazepam",         key: "diazepam",         generic: "diazepam" },
  { display: "Lorazepam",        key: "lorazepam",        generic: "lorazepam" },
  { display: "Zopiclone",        key: "zopiclone",        generic: "zopiclone" },

  // Neurology / Epilepsy / Nerve pain
  { display: "Sodium valproate", key: "sodiumvalproate",  generic: "valproate" },
  { display: "Lamotrigine",      key: "lamotrigine",      generic: "lamotrigine" },
  { display: "Levetiracetam",    key: "levetiracetam",    generic: "levetiracetam" },
  { display: "Topiramate",       key: "topiramate",       generic: "topiramate" },
  { display: "Carbamazepine",    key: "carbamazepine",    generic: "carbamazepine" },
  { display: "Gabapentin",       key: "gabapentin",       generic: "gabapentin" },
  { display: "Pregabalin",       key: "pregabalin",       generic: "pregabalin" },

  // Dermatology / Topicals
  { display: "Hydrocortisone",   key: "hydrocortisone",   generic: "hydrocortisone" },
  { display: "Betamethasone",    key: "betamethasone",    generic: "betamethasone" },
  { display: "Clotrimazole",     key: "clotrimazole",     generic: "clotrimazole" },
  { display: "Miconazole",       key: "miconazole",       generic: "miconazole" },
  { display: "Terbinafine",      key: "terbinafine",      generic: "terbinafine" },
  { display: "Ketoconazole",     key: "ketoconazole",     generic: "ketoconazole" },
  { display: "Aciclovir cream",  key: "aciclovircream",   generic: "aciclovir (topical)" },

  // Eye / Ear (very common)
  { display: "Chloramphenicol (eye)", key: "chloramphenicoleye", generic: "chloramphenicol (ophthalmic)" },
  { display: "Dexamethasone (eye/ear)", key: "dexamethasoneeye", generic: "dexamethasone (ophthalmic/otic)" },

  // Women’s health / Contraception (selected)
  { display: "Levonorgestrel (ECP)", key: "levonorgestrelecp", generic: "levonorgestrel (emergency contraception)" },
  { display: "Ethinylestradiol + levonorgestrel", key: "ethinylestradiollevonorgestrel", generic: "ethinylestradiol + levonorgestrel" },
  { display: "Medroxyprogesterone (Depo-Provera)", key: "medroxyprogesterone", generic: "medroxyprogesterone" },

  // Steroids & Immune
  { display: "Prednisone",       key: "prednisone",       generic: "prednisone" },
  { display: "Prednisolone",     key: "prednisolone",     generic: "prednisolone" },
  { display: "Dexamethasone",    key: "dexamethasone",    generic: "dexamethasone" },
  { display: "Methotrexate",     key: "methotrexate",     generic: "methotrexate" },

  // Supplements (common scripts/OTC)
  { display: "Ferrous fumarate", key: "ferrousfumarate",  generic: "iron (ferrous fumarate)" },
  { display: "Ferrous sulfate",  key: "ferroussulfate",   generic: "iron (ferrous sulfate)" },
  { display: "Folic acid",       key: "folicacid",        generic: "folic acid" },
  { display: "Cholecalciferol",  key: "cholecalciferol",  generic: "vitamin D3" },

  // Smoking cessation
  { display: "Nicotine patch",   key: "nicotinepatch",    generic: "nicotine (transdermal)" },
  { display: "Varenicline",      key: "varenicline",      generic: "varenicline" },

  // --- Additions: GI (PPIs) ---
{ display: "Esomeprazole", key: "esomeprazole", generic: "esomeprazole" },
{ display: "Nexium",       key: "nexium",       generic: "esomeprazole" },
{ display: "Pantoprazole", key: "pantoprazole", generic: "pantoprazole" },
{ display: "Somac",        key: "somac",        generic: "pantoprazole" },

// --- Additions: Antibiotics / Antivirals ---
{ display: "Clarithromycin", key: "clarithromycin", generic: "clarithromycin" },
{ display: "Klacid",         key: "klacid",         generic: "clarithromycin" },
{ display: "Aciclovir",      key: "aciclovir",      generic: "aciclovir" },
{ display: "Zovirax",        key: "zovirax",        generic: "aciclovir" },
{ display: "Valaciclovir",   key: "valaciclovir",   generic: "valaciclovir" },
{ display: "Valtrex",        key: "valtrex",        generic: "valaciclovir" },

// --- Additions: Cardio / Anticoagulants ---
{ display: "Apixaban",    key: "apixaban",    generic: "apixaban" },
{ display: "Eliquis",     key: "eliquis",     generic: "apixaban" },
{ display: "Rivaroxaban", key: "rivaroxaban", generic: "rivaroxaban" },
{ display: "Xarelto",     key: "xarelto",     generic: "rivaroxaban" },
{ display: "Dabigatran",  key: "dabigatran",  generic: "dabigatran" },
{ display: "Pradaxa",     key: "pradaxa",     generic: "dabigatran" },
{ display: "Clopidogrel", key: "clopidogrel", generic: "clopidogrel" },
{ display: "Plavix",      key: "plavix",      generic: "clopidogrel" },

// --- Additions: Lipids & Diabetes ---
{ display: "Rosuvastatin", key: "rosuvastatin", generic: "rosuvastatin" },
{ display: "Crestor",      key: "crestor",      generic: "rosuvastatin" },
{ display: "Sitagliptin",  key: "sitagliptin",  generic: "sitagliptin" },
{ display: "Januvia",      key: "januvia",      generic: "sitagliptin" },
{ display: "Glipizide",    key: "glipizide",    generic: "glipizide" }, // for gliclazide/glipizide look-alike

// --- Additions: Psych / Neuro ---
{ display: "Escitalopram", key: "escitalopram", generic: "escitalopram" },
{ display: "Lexapro",      key: "lexapro",      generic: "escitalopram" },
{ display: "Amitriptyline", key: "amitriptyline", generic: "amitriptyline" },
{ display: "Nortriptyline", key: "nortriptyline", generic: "nortriptyline" },
{ display: "Norpress",      key: "norpress",      generic: "nortriptyline" }, // common NZ brand
{ display: "Lorazepam",     key: "lorazepam",     generic: "lorazepam" },
{ display: "Ativan",        key: "ativan",        generic: "lorazepam" },

// --- Additions: Respiratory / Allergy ---
{ display: "Salmeterol", key: "salmeterol", generic: "salmeterol" },
{ display: "Serevent",   key: "serevent",   generic: "salmeterol" },

// --- Additions: Endocrine / Thyroid & Iron ---
{ display: "Levothyroxine",   key: "levothyroxine",   generic: "levothyroxine" },
{ display: "Eltroxin",        key: "eltroxin",        generic: "levothyroxine" },
{ display: "Liothyronine",    key: "liothyronine",    generic: "liothyronine" },
{ display: "Ferrous fumarate", key: "ferrousfumarate", generic: "ferrous fumarate" },
{ display: "Ferrous sulfate",  key: "ferroussulfate",  generic: "ferrous sulfate" },

// --- Additions: Derm / Topicals & ICS ---
{ display: "Beclomethasone", key: "beclomethasone", generic: "beclomethasone" },
{ display: "Beclazone",      key: "beclazone",      generic: "beclomethasone" }, // NZ inhaler brand
{ display: "Betamethasone",  key: "betamethasone",  generic: "betamethasone" },
{ display: "Betnovate",      key: "betnovate",      generic: "betamethasone" },
{ display: "Clotrimazole",   key: "clotrimazole",   generic: "clotrimazole" },
{ display: "Daktarin",       key: "daktarin",       generic: "miconazole" },   // brand → miconazole
{ display: "Miconazole",     key: "miconazole",     generic: "miconazole" },
{ display: "Ketoconazole",   key: "ketoconazole",   generic: "ketoconazole" },
{ display: "Nizoral",        key: "nizoral",        generic: "ketoconazole" },

// --- Additions: Steroids / Diuretics look-alike pair ---
{ display: "Hydrocortisone",      key: "hydrocortisone",      generic: "hydrocortisone" },
{ display: "Hydrochlorothiazide", key: "hydrochlorothiazide", generic: "hydrochlorothiazide" },

// --- Additions: Antiemetic ---
{ display: "Ondansetron", key: "ondansetron", generic: "ondansetron" },
{ display: "Zofran",      key: "zofran",      generic: "ondansetron" },
];

// Medicines that are commonly confused → force manual choice
const CONFUSABLE_PAIRS = [
  ["metoprolol", "metoclopramide"],
  ["hydralazine", "hydroxyzine"],
  ["amoxicillin", "ampicillin"],
  ["cefalexin", "ceftriaxone"],
  ["fluoxetine", "flucloxacillin"],
  ["clonazepam", "clonidine"],
  ["citalopram", "ciprofloxacin"],
  ["sertraline", "sotalol"],
  ["gabapentin", "pregabalin"],
  ["lamotrigine", "levetiracetam"],
  ["losartan", "loratadine"],
  ["omeprazole", "esomeprazole"],
  ["prednisone", "prednisolone"],
  ["rosuvastatin", "atorvastatin"],
  ["simvastatin", "sitagliptin"],
  ["salbutamol", "salmeterol"],

  // PPIs & GI
  ["omeprazole", "pantoprazole"],

  // ICS / Topicals
  ["beclomethasone", "betamethasone"],
  ["clotrimazole", "miconazole"],
  ["clotrimazole", "ketoconazole"],

  // Endocrine / Vitamins
  ["levothyroxine", "liothyronine"],
  ["ferrousfumarate", "ferroussulfate"],

  // Psych / Neuro
  ["amitriptyline", "amlodipine"],     // TCA vs CCB (very common mix-up)
  ["amitriptyline", "nortriptyline"],  // two TCAs
  ["escitalopram", "citalopram"],

  // Benzo vs Antihistamine
  ["lorazepam", "loratadine"],

  // Respiratory / Brand vs SSRI
  ["sertraline", "seretide"],

  // Anticoagulants (DOACs)
  ["apixaban", "rivaroxaban"],
  ["apixaban", "dabigatran"],
  ["rivaroxaban", "dabigatran"],

  // Antivirals
  ["aciclovir", "valaciclovir"],

  // Cardio / Diuretics vs Steroid
  ["hydrocortisone", "hydrochlorothiazide"],

  // Antiemetic vs ARB (look-alike)
  ["ondansetron", "candesartan"],

  // Macrolides (if you add Clarithromycin to MED_NAMES)
  ["clopidogrel", "clarithromycin"],   // ⚠️ add {display:"Clarithromycin", key:"clarithromycin", ...} to MED_NAMES for this to trigger

  // Optional: keep if GLIPIZIDE is in MED_NAMES
  ["gliclazide", "glipizide"],
];

export function norm(s) {
    return String(s).toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu, '').trim();
}

function levenshtein(a, b) {
    const A = a, B = b;
    const m = Array.from({ length: A.length + 1 }, () => new Array(B.length + 1).fill(0));
    for (let i = 0; i <= A.length; i++) m[i][0] = i;
    for (let j = 0; j <= B.length; j++) m[0][j] = j;
    for (let i = 1; i <= A.length; i++) {
        for (let j = 1; j <= B.length; j++) {
            const cost = A[i - 1] === B[j - 1] ? 0 : 1;
            m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + cost);
        }
    }
    return m[A.length][B.length];
}

function inConfusableSet(aKey, bKey) {
    const a = norm(aKey), b = norm(bKey);
    return CONFUSABLE_PAIRS.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
}

// Return first exact match if any
export function findExactName(token) {
    const k = norm(token);
    return MED_NAMES.find(n => n.key === k || norm(n.display) === k);
}

// Suggest close matches (very tight)
export function suggestNames(token) {
    const k = norm(token);
    if (!k) return [];
    const maxD = k.length <= 7 ? 1 : 2;
    return MED_NAMES
        .map(n => ({ n, d: levenshtein(k, n.key) }))
        .filter(x => x.d <= maxD)
        .sort((a, b) => a.d - b.d)
        .slice(0, 3)
        .map(x => x.n);
}

// Try to extract one medicine-like token from free text
export function extractPossibleNameFromQuestion(q) {
    // naive pass: look for any known name substring
    const low = q.toLowerCase();
    for (const n of MED_NAMES) {
        if (low.includes(n.display.toLowerCase()) || low.includes(n.key)) {
            return n;
        }
    }
    // fallback: pick a capitalised word (e.g., "Panadol")
    const m = q.match(/\b([A-Z][a-z]{2,}(?:\s[A-Z][a-z]{2,})?)\b/);
    return m ? { display: m[1], key: norm(m[1]) } : null;
}

// Main resolver used by the UI
// Returns one of:
//  - { status: 'exact', choice }
//  - { status: 'confirm', suggestion }   // single strong suggestion, not confusable
//  - { status: 'choose', options: [...] } // multiple suggestions or confusable pair
//  - { status: 'none' }
export function resolveNameOrSuggest(userQuestion) {
    const guess = extractPossibleNameFromQuestion(userQuestion || '');
    if (!guess) return { status: 'none' };

    // exact?
    const exact = findExactName(guess.display || guess.key);
    if (exact) return { status: 'exact', choice: exact };

    // close suggestions
    const hits = suggestNames(guess.display || guess.key);
    if (hits.length === 0) return { status: 'none' };
    if (hits.length === 1) {
        const s = hits[0];
        const confusableWith = MED_NAMES.find(n => inConfusableSet(n.key, s.key));
        if (confusableWith) return { status: 'choose', options: hits };
        return { status: 'confirm', suggestion: s };
    }
    return { status: 'choose', options: hits };
}

// Symptom-only guardrail: returns true if no medicine is mentioned
export function looksSymptomOnly(q) {
    // crude heuristic: if we didn’t find any name token at all
    const maybe = extractPossibleNameFromQuestion(q || '');
    return !maybe;
}

// (Optional) light-weight intent tags you may use later
xport function detectIntent(q) {
  const s = String(q).toLowerCase();

  // dose
  if (/\b(dose|dosage|how\s+much|how\s+many|how\s+often|mg\b)\b/.test(s)) {
    return 'dose';
  }

  // side effects
  if (/\b(side\s*effects?|adverse|risks?|warnings?)\b/.test(s)) {
    return 'side_effects';
  }

  // used for / indications
  if (
    /\b(used\s+for|what\s+is\s+.+\s+used\s+for|what\s+is\s+.+\s+for|indications?)\b/.test(s)
    || /^what\s+is\s+\w+(\s+\w+){0,2}\??$/.test(s)  // e.g. "what is metformin?"
  ) {
    return 'used_for';
  }

  return null;
}