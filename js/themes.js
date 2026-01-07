// --- THEME CONFIGURATION ---
const THEMES = {
    monochrome: { id: 'monochrome', label: 'Noir', bg: 'bg-gray-800', text: 'text-gray-800', accent: 'bg-gray-900 text-white', icon: 'text-gray-800', lightBg: 'bg-gray-200', darkShade: 'bg-gray-800' },
    ocean: { id: 'ocean', label: 'Ocean', bg: 'bg-blue-600', text: 'text-blue-600', accent: 'bg-blue-500 text-white', icon: 'text-blue-500', lightBg: 'bg-blue-100', darkShade: 'bg-blue-700' },
    forest: { id: 'forest', label: 'Forest', bg: 'bg-emerald-600', text: 'text-emerald-600', accent: 'bg-emerald-600 text-white', icon: 'text-emerald-600', lightBg: 'bg-emerald-100', darkShade: 'bg-emerald-700' },
    mint: { id: 'mint', label: 'Mint', bg: 'bg-teal-400', text: 'text-teal-500', accent: 'bg-teal-400 text-white', icon: 'text-teal-400', lightBg: 'bg-teal-100', darkShade: 'bg-teal-500' },
    bubblegum: { id: 'bubblegum', label: 'Bubblegum', bg: 'bg-pink-500', text: 'text-pink-500', accent: 'bg-pink-500 text-white', icon: 'text-pink-500', lightBg: 'bg-pink-100', darkShade: 'bg-pink-600' },
    rose: { id: 'rose', label: 'Rose', bg: 'bg-rose-300', text: 'text-rose-400', accent: 'bg-rose-300 text-white', icon: 'text-rose-400', lightBg: 'bg-rose-100', darkShade: 'bg-rose-400' },
};

// --- METRICS CONFIGURATION ---
const METRICS = {
    weight: { label: 'Weight', unitType: 'mass', input: true },
    bmi: { label: 'BMI', unitType: 'index', input: false }, // Calculated
    bodyFat: { label: 'Body Fat', unitType: 'percent', input: true },
    fatMass: { label: 'Fat Mass', unitType: 'mass', input: false }, // Calculated
    leanMass: { label: 'Fat Free Mass', unitType: 'mass', input: false }, // Calculated
    visceralFat: { label: 'Visceral Fat', unitType: 'index', input: true },
    bodyWater: { label: 'Body Water', unitType: 'percent', input: true },
    skeletalMuscle: { label: 'Skeletal Muscle', unitType: 'percent', input: true },
    muscleMass: { label: 'Muscle Mass', unitType: 'mass', input: false }, // Calculated
    boneMass: { label: 'Bone Mass', unitType: 'mass', input: true },
    bmr: { label: 'BMR', unitType: 'cal', input: true },
};

window.THEMES = THEMES;
window.METRICS = METRICS;