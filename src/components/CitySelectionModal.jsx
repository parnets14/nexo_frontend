import { useState, useEffect } from 'react';
import { X, MapPin, Check } from 'lucide-react';
import cityService from '../services/cityService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? 'http://localhost:5173' : window.location.origin);

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  if (imagePath.startsWith('/uploads')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  return `${API_BASE_URL}/uploads/${imagePath}`;
};

const CitySelectionModal = ({ isOpen, onClose, onCitySelect }) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchCities();
      const savedCity = localStorage.getItem('selectedCity');
      if (savedCity) {
        try {
          setSelectedCity(JSON.parse(savedCity));
        } catch (e) {
          console.error('Error parsing saved city:', e);
        }
      }
    }
  }, [isOpen]);

  const fetchCities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const cities = await cityService.getEnabledCities();
      setCities(cities);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setError(error.message || 'Failed to load cities');
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (city) => {
    if (!city.isEnabled) {
      alert('Service will be available soon in ' + city.name + '!');
      return;
    }
    
    setSelectedCity(city);
    localStorage.setItem('selectedCity', JSON.stringify(city));
    if (onCitySelect) {
      onCitySelect(city);
    }
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative w-full" style={{ maxWidth: '30%', minWidth: '320px' }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 w-10 h-10 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center transition-all shadow-lg z-20"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        <div
          className="bg-white rounded-2xl shadow-2xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-1xl md:text-1xl  text-gray-900">Select City</h2>
            </div>

            {/* Cities Grid */}
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="h-32 md:h-40 bg-gray-200 rounded-2xl animate-pulse"></div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <MapPin className="w-12 h-12 text-red-300 mx-auto mb-3" />
                  <p className="text-red-500 font-medium mb-2">Error loading cities</p>
                  <p className="text-gray-500 text-sm">{error}</p>
                  <button
                    onClick={fetchCities}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : cities.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No cities available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  {cities.map((city) => {
                    const isSelected = selectedCity?._id === city._id;
                    const isDisabled = !city.isEnabled;
                    const hasImage = city.image && city.image.trim() !== '';
                    const imageUrl = hasImage ? getImageUrl(city.image) : null;

                    return (
                      <button
                        key={city._id}
                        onClick={() => handleCitySelect(city)}
                        disabled={isDisabled}
                        className={`group relative rounded-2xl overflow-hidden transition-all h-32 md:h-40 ${
                          isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-xl'
                        } ${isSelected ? 'ring-4 ring-purple-600 shadow-2xl' : 'shadow-lg'}`}
                        style={{ backgroundColor: hasImage ? 'transparent' : '#667eea' }}
                      >
                        {/* Background */}
                        {hasImage ? (
                          <img
                            src={imageUrl}
                            alt={city.name}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700" />
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                        {/* Selected Badge */}
                        {isSelected && !isDisabled && (
                          <div className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-xl z-30">
                            <Check className="w-5 h-5 text-purple-600 stroke-[3]" />
                          </div>
                        )}

                        {/* Coming Soon Badge */}
                        {isDisabled && (
                          <div className="absolute top-2 right-2 bg-white/90 text-orange-600 text-xs font-semibold px-2 py-1 rounded-full shadow-md">
                            Soon
                          </div>
                        )}

                        {/* City Name */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                          <h3 className="text-white font-bold text-lg md:text-xl drop-shadow-lg truncate">
                            {city.name}
                          </h3>
                        </div>

                        {/* Hover Effect */}
                        {!isDisabled && (
                          <div className="absolute inset-0 bg-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitySelectionModal;