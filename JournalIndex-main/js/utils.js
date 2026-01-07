// Conversion Helpers
const convert = (val, type, toUnit) => {
    if (val === null || val === undefined || isNaN(val)) return 0;
    const num = parseFloat(val);
    if (type === 'percent' || type === 'index' || type === 'cal') return num;
    
    // Convert KG -> LBS if imperial
    if (type === 'mass') {
        if (toUnit === 'imperial') return num * 2.20462; 
        return num; 
    }
    return num;
};

// Input Helpers (Convert Display Unit -> Storage Unit)
const fromInput = (val, type, currentUnit) => {
    if (!val) return null;
    const num = parseFloat(val);
    // Convert LBS -> KG for storage if imperial
    if (type === 'mass' && currentUnit === 'imperial') return num / 2.20462;
    return num;
};

const formatVal = (val, type, unit) => {
    if (!val && val !== 0) return '-';
    const converted = convert(val, type, unit);
    if (type === 'cal') return Math.round(converted);
    return converted.toFixed(1);
};

const getUnitLabel = (type, unit) => {
    if (type === 'percent') return '%';
    if (type === 'index') return '';
    if (type === 'cal') return 'kcal';
    return unit === 'imperial' ? 'lbs' : 'kg';
};

window.convert = convert;
window.fromInput = fromInput;
window.formatVal = formatVal;
window.getUnitLabel = getUnitLabel;