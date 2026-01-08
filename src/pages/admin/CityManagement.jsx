import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaMapMarkerAlt, FaCity, FaBuilding, FaMapPin } from 'react-icons/fa';
import axios from 'axios';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';
import cityService from '../../services/cityService';

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_BASE_URL || 'https://nexo-backend-testing.onrender.com';

const iconOptions = [
  { name: 'FaMapMarkerAlt', icon: FaMapMarkerAlt, label: 'Map Marker' },
  { name: 'FaCity', icon: FaCity, label: 'City' },
  { name: 'FaBuilding', icon: FaBuilding, label: 'Building' },
  { name: 'FaMapPin', icon: FaMapPin, label: 'Map Pin' }
];

const CityManagement = () => {
  const { token } = useAdminAuth();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: 'FaMapMarkerAlt',
    description: '',
    state: '',
    displayOrder: 0,
    isEnabled: true,
    image: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchCities();
    }
  }, [token]);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/cities/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setCities(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      alert('Failed to fetch cities');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      setUploading(true);
      const response = await axios.post(`${API_BASE_URL}/api/cities/upload-image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = formData.image;

      // Upload image if a new one was selected
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const payload = {
        ...formData,
        image: imageUrl
      };

      if (editingCity) {
        await axios.put(`${API_BASE_URL}/api/cities/${editingCity._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('City updated successfully');
      } else {
        await axios.post(`${API_BASE_URL}/api/cities`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('City created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchCities();
      
      // Clear city cache since cities were updated
      cityService.clearCache();
    } catch (error) {
      console.error('Error saving city:', error);
      alert(error.response?.data?.message || 'Failed to save city');
    }
  };

  const handleEdit = (city) => {
    setEditingCity(city);
    setFormData({
      name: city.name,
      icon: city.icon,
      description: city.description || '',
      state: city.state || '',
      displayOrder: city.displayOrder || 0,
      isEnabled: city.isEnabled,
      image: city.image || ''
    });
    setImagePreview(city.image || null);
    setImageFile(null);
    setShowModal(true);
  };

  const handleToggle = async (cityId) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/cities/${cityId}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCities();
      
      // Clear city cache since city status was toggled
      cityService.clearCache();
    } catch (error) {
      console.error('Error toggling city:', error);
      alert('Failed to toggle city status');
    }
  };

  const handleDelete = async (cityId) => {
    if (!window.confirm('Are you sure you want to delete this city?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/cities/${cityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('City deleted successfully');
      fetchCities();
      
      // Clear city cache since city was deleted
      cityService.clearCache();
    } catch (error) {
      console.error('Error deleting city:', error);
      alert('Failed to delete city');
    }
  };

  const resetForm = () => {
    setEditingCity(null);
    setFormData({
      name: '',
      icon: 'FaMapMarkerAlt',
      description: '',
      state: '',
      displayOrder: 0,
      isEnabled: true,
      image: ''
    });
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">City Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-primary text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-primary-dark transition-colors"
        >
          <FaPlus /> Add City
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cities.map((city) => {
                const IconComponent = iconOptions.find(opt => opt.name === city.icon)?.icon || FaMapMarkerAlt;
                return (
                  <tr key={city._id}>
                    <td className="px-6 py-4">
                      {city.image ? (
                        <img 
                          src={city.image.startsWith('http') ? city.image : `${API_BASE_URL}${city.image.startsWith('/') ? city.image : '/uploads/' + city.image}`} 
                          alt={city.name} 
                          className="w-12 h-12 object-cover rounded-lg shadow-sm" 
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center"><span class="text-gray-400 text-xs">Error</span></div>';
                          }}
                        />
                      ) : (
                        <IconComponent className="w-6 h-6 text-primary" />
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium">{city.name}</td>
                    <td className="px-6 py-4">{city.state || '-'}</td>
                    <td className="px-6 py-4">{city.displayOrder}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        city.isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {city.isEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggle(city._id)}
                          className="p-2 hover:bg-gray-100 rounded"
                        >
                          {city.isEnabled ? <FaToggleOn className="text-green-600" /> : <FaToggleOff className="text-gray-400" />}
                        </button>
                        <button
                          onClick={() => handleEdit(city)}
                          className="p-2 hover:bg-gray-100 rounded"
                        >
                          <FaEdit className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(city._id)}
                          className="p-2 hover:bg-gray-100 rounded"
                        >
                          <FaTrash className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-4">{editingCity ? 'Edit City' : 'Add City'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">City Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Icon</label>
                <div className="grid grid-cols-4 gap-2">
                  {iconOptions.map((opt) => (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: opt.name })}
                      className={`p-4 border rounded-lg flex flex-col items-center gap-2 ${
                        formData.icon === opt.name ? 'border-primary bg-primary/10' : 'border-gray-300'
                      }`}
                    >
                      <opt.icon className="w-6 h-6" />
                      <span className="text-xs">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">City Image</label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                  {imagePreview && (
                    <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                          setFormData({ ...formData, image: '' });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Display Order</label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isEnabled}
                  onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">Enabled</label>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : editingCity ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CityManagement;
