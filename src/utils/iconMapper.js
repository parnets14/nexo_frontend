import {
  FaSnowflake,
  FaBolt,
  FaWrench,
  FaCog,
  FaHammer,
  FaPaintBrush,
  FaBroom,
  FaBug,
  FaTools,
  FaHome,
  FaCar,
  FaLaptop,
  FaTv,
  FaWifi,
  FaPlug,
  FaLightbulb,
  FaFan,
  FaThermometerHalf,
  FaShower,
  FaToilet,
  FaSink,
  FaCouch,
  FaBed,
  FaChair,
  FaDoorOpen,
  FaWindowMaximize,
  FaSprayCan,
  FaLeaf,
  FaShieldAlt,
  FaFire,
  FaWater,
  FaGasPump,
  FaTint,
  FaPaintRoller,
  FaFilter
} from 'react-icons/fa';

// Icon mapping object
const iconMap = {
  // AC & Cooling
  'FaSnowflake': FaSnowflake,
  'FaThermometerHalf': FaThermometerHalf,
  'FaFan': FaFan,
  
  // Electrical
  'FaBolt': FaBolt,
  'FaPlug': FaPlug,
  'FaLightbulb': FaLightbulb,
  'FaWifi': FaWifi,
  
  // Plumbing
  'FaWrench': FaWrench,
  'FaShower': FaShower,
  'FaToilet': FaToilet,
  'FaSink': FaSink,
  'FaWater': FaWater,
  'FaTint': FaTint,
  
  // Appliances
  'FaCog': FaCog,
  'FaLaptop': FaLaptop,
  'FaTv': FaTv,
  'FaGasPump': FaGasPump,
  
  // Carpentry & Furniture
  'FaHammer': FaHammer,
  'FaCouch': FaCouch,
  'FaBed': FaBed,
  'FaChair': FaChair,
  'FaDoorOpen': FaDoorOpen,
  'FaWindowMaximize': FaWindowMaximize,
  
  // Painting & Cleaning
  'FaPaintBrush': FaPaintBrush,
  'FaPaintRoller': FaPaintRoller,
  'FaBroom': FaBroom,
  'FaSprayCan': FaSprayCan,
  
  // Pest Control & Safety
  'FaBug': FaBug,
  'FaShieldAlt': FaShieldAlt,
  'FaLeaf': FaLeaf,
  'FaFire': FaFire,
  
  // Water & Filters
  'FaFilter': FaFilter,
  
  // General
  'FaTools': FaTools,
  'FaHome': FaHome,
  'FaCar': FaCar
};

// Function to get icon component by name
export const getIconComponent = (iconName) => {
  // If iconName is already a component, return it
  if (typeof iconName === 'function') {
    return iconName;
  }
  
  // If it's a string, look it up in the map
  if (typeof iconName === 'string') {
    return iconMap[iconName] || FaTools; // Default to FaTools if icon not found
  }
  
  // Default fallback
  return FaTools;
};

// Function to get all available icons (for admin use)
export const getAllIcons = () => {
  return Object.keys(iconMap);
};

export default iconMap;