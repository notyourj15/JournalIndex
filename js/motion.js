// Framer Motion safety fallback (in case CDN lags or fails)
const MotionLib = window.Motion || { 
    motion: { div: 'div', button: 'button' }, 
    AnimatePresence: ({children}) => children 
};
const { motion, AnimatePresence } = MotionLib;

window.motion = motion;
window.AnimatePresence = AnimatePresence;
window.MotionLib = MotionLib; // Export for other files