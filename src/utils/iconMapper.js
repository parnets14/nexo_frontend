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
  FaGasPump
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
  'FaBroom': FaBroom,
  'FaSprayCan': FaSprayCan,
  
  // Pest Control & Safety
  'FaBug': FaBug,
  'FaShieldAlt': FaShieldAlt,
  'FaLeaf': FaLeaf,
  'FaFire': FaFire,
  
  // General
  'FaTools': FaTools,
  'FaHome': FaHome,
  'FaCar': FaCar
};

// Function to get icon component by name
export const getIconComponent = (iconName) => {
  return iconMap[iconName] || FaTools; // Default to FaTools if icon not found
};

// Function to get all available icons (for admin use)
export const getAllIcons = () => {
  return Object.keys(iconMap);
};

export default iconMap;