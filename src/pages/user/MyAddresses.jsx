import React, { useEffect, useState } from 'react';
import { FiMapPin, FiPlus, FiEdit2, FiTrash2, FiHome, FiBriefcase, FiCheckCircle, FiX, FiNavigation, FiMoreHorizontal } from 'react-icons/fi';
import axios from 'axios';

const MyAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    lat: '',
    lng: '',
    landmark: '',
    addressType: 'home'
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/user/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddresses(response.data.user.addresses || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem('userToken');
      
      if (editingAddress) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/user/address/${editingAddress._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/user/address`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setShowModal(false);
      setEditingAddress(null);
      setFormData({ address: '', lat: '', lng: '', landmark: '', addressType: 'home' });
      fetchAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const token = localStorage.getItem('userToken');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/user/address/${addressId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Address deleted successfully');
      fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address');
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      address: address.address,
      lat: address.lat || '',
      lng: address.lng || '',
      landmark: address.landmark || '',
      addressType: address.addressType || 'home'
    });
    setShowModal(true);
  };

  const getAddressIcon = (type) => {
    return type === 'work' ? <FiBriefcase size={20} /> : <FiHome size={20} />;
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocode using OpenStreetMap Nominatim API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          if (data && data.display_name) {
            setFormData({
              ...formData,
              address: data.display_name,
              lat: latitude.toString(),
              lng: longitude.toString()
            });
          } else {
            // Fallback if reverse geocoding fails
            setFormData({
              ...formData,
              address: `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              lat: latitude.toString(),
              lng: longitude.toString()
            });
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          // Still save coordinates even if reverse geocoding fails
          setFormData({
            ...formData,
            address: `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            lat: latitude.toString(),
            lng: longitude.toString()
          });
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Unable to get your location. ';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
        }
        
        alert(errorMessage);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in">
          <FiCheckCircle size={24} />
          <div>
            <p className="font-semibold">Success!</p>
            <p className="text-sm text-green-100">Address saved successfully.</p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-primary via-primary-dark to-[#152d47] rounded-3xl p-8 md:p-12 text-white overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <FiMapPin size={24} />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">My Addresses</h1>
              </div>
              <p className="text-blue-100 text-lg">
                Manage your saved addresses for faster bookings
              </p>
            </div>
            <button
              onClick={() => {
                setEditingAddress(null);
                setFormData({ address: '', lat: '', lng: '', landmark: '', addressType: 'home' });
                setShowModal(true);
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              <FiPlus size={20} />
              Add New Address
            </button>
          </div>
        </div>
      </div>

      {/* Addresses Grid */}
      {addresses.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary-light/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiMapPin className="text-primary" size={48} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">No Addresses Yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Add your first address to make booking services faster and easier. You can save multiple addresses for home, work, and more.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl hover:from-primary-dark hover:to-primary font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <FiPlus size={20} />
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map((address, index) => (
            <div 
              key={address._id} 
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-primary/30 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${
                    address.addressType === 'home' ? 'bg-blue-100 text-blue-600' :
                    address.addressType === 'work' ? 'bg-purple-100 text-purple-600' :
                    'bg-green-100 text-green-600'
                  } group-hover:scale-110 transition-transform`}>
                    {getAddressIcon(address.addressType)}
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 capitalize block">
                      {address.addressType}
                    </span>
                    <span className="text-xs text-gray-500">Address #{index + 1}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(address)}
                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Edit address"
                  >
                    <FiEdit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(address._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete address"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <FiMapPin className="text-gray-400 mt-1 flex-shrink-0" size={16} />
                  <p className="text-gray-700 text-sm leading-relaxed">{address.address}</p>
                </div>
                
                {address.landmark && (
                  <div className="flex items-start gap-2">
                    <FiNavigation className="text-gray-400 mt-1 flex-shrink-0" size={16} />
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Landmark:</span> {address.landmark}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(address)}
                  className="w-full py-2 text-primary hover:bg-primary/5 rounded-lg transition-colors text-sm font-medium"
                >
                  Edit Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-slide-up">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary/10 to-primary-light/10 p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <FiMapPin className="text-white" size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingAddress(null);
                  }}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <FiX size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Address Type *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <label className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.addressType === 'home' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-primary/30'
                  }`}>
                    <input
                      type="radio"
                      name="addressType"
                      value="home"
                      checked={formData.addressType === 'home'}
                      onChange={(e) => setFormData({ ...formData, addressType: e.target.value })}
                      className="sr-only"
                    />
                    <FiHome size={24} className={formData.addressType === 'home' ? 'text-primary' : 'text-gray-400'} />
                    <span className={`mt-2 text-sm font-medium ${formData.addressType === 'home' ? 'text-primary' : 'text-gray-600'}`}>
                      Home
                    </span>
                  </label>

                  <label className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.addressType === 'work' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-primary/30'
                  }`}>
                    <input
                      type="radio"
                      name="addressType"
                      value="work"
                      checked={formData.addressType === 'work'}
                      onChange={(e) => setFormData({ ...formData, addressType: e.target.value })}
                      className="sr-only"
                    />
                    <FiBriefcase size={24} className={formData.addressType === 'work' ? 'text-primary' : 'text-gray-400'} />
                    <span className={`mt-2 text-sm font-medium ${formData.addressType === 'work' ? 'text-primary' : 'text-gray-600'}`}>
                      Work
                    </span>
                  </label>

                  <label className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.addressType === 'other' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-primary/30'
                  }`}>
                    <input
                      type="radio"
                      name="addressType"
                      value="other"
                      checked={formData.addressType === 'other'}
                      onChange={(e) => setFormData({ ...formData, addressType: e.target.value })}
                      className="sr-only"
                    />
                    <FiMoreHorizontal size={24} className={formData.addressType === 'other' ? 'text-primary' : 'text-gray-400'} />
                    <span className={`mt-2 text-sm font-medium ${formData.addressType === 'other' ? 'text-primary' : 'text-gray-600'}`}>
                      Other
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Complete Address *
                  </label>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {gettingLocation ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        Getting...
                      </>
                    ) : (
                      <>
                        <FiNavigation size={16} />
                        Use Current Location
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <FiMapPin className="absolute left-4 top-4 text-gray-400" size={18} />
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
                    rows="3"
                    placeholder="House/Flat No., Building Name, Street, Area"
                    required
                  />
                </div>
                {formData.lat && formData.lng && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <FiCheckCircle size={12} />
                    Location coordinates saved: {parseFloat(formData.lat).toFixed(4)}, {parseFloat(formData.lng).toFixed(4)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Landmark (Optional)
                </label>
                <div className="relative">
                  <FiNavigation className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="Nearby landmark for easy location"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingAddress(null);
                  }}
                  disabled={saving}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl hover:from-primary-dark hover:to-primary disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle size={20} />
                      Save Address
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAddresses;
