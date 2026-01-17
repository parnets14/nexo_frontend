import React, { useState, useEffect } from 'react';
import { FiX, FiSearch, FiPercent, FiDollarSign, FiUser, FiPhone, FiMail, FiCalendar, FiTag } from 'react-icons/fi';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

const SpecialDiscountModal = ({ onClose, onSuccess }) => {
  const { token } = useAdminAuth();
  const [step, setStep] = useState(1); // 1: Select Customer, 2: Select Booking, 3: Apply Discount
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerBookings, setCustomerBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [discountType, setDiscountType] = useState('amount'); // 'amount' or 'percentage'
  const [discountValue, setDiscountValue] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  // Fetch customers
  useEffect(() => {
    if (step === 1) {
      fetchCustomers();
    }
  }, [step, searchQuery]);

  // Fetch customer bookings when customer is selected
  useEffect(() => {
    if (step === 2 && selectedCustomer) {
      fetchCustomerBookings();
    }
  }, [step, selectedCustomer]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllCustomers(token, {
        search: searchQuery,
        limit: 50
      });
      setCustomers(response.data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerBookings = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getCustomerBookings(token, selectedCustomer._id, {
        status: 'all',
        limit: 50
      });
      setCustomerBookings(response.data || []);
    } catch (err) {
      console.error('Error fetching customer bookings:', err);
      setError('Failed to load customer bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setStep(2);
  };

  const handleBookingSelect = (booking) => {
    setSelectedBooking(booking);
    setStep(3);
  };

  const handleApplyDiscount = async () => {
    try {
      setError('');
      
      if (!discountValue || parseFloat(discountValue) <= 0) {
        setError('Please enter a valid discount value');
        return;
      }

      if (discountType === 'percentage' && parseFloat(discountValue) > 100) {
        setError('Percentage cannot exceed 100%');
        return;
      }

      setLoading(true);

      const discountData = {
        [discountType]: parseFloat(discountValue),
        reason: reason || 'Special discount applied by admin'
      };

      await adminApi.applySpecialDiscount(token, selectedBooking._id, discountData);
      
      if (onSuccess) {
        onSuccess();
      }
      
      alert('Special discount applied successfully!');
      onClose();
    } catch (err) {
      console.error('Error applying discount:', err);
      setError(err.message || 'Failed to apply discount');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setSelectedCustomer(null);
      setCustomerBookings([]);
      setStep(1);
    } else if (step === 3) {
      setSelectedBooking(null);
      setDiscountValue('');
      setReason('');
      setError('');
      setStep(2);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Apply Special Discount</h3>
            <p className="text-sm text-gray-500 mt-1">
              {step === 1 && 'Step 1: Select Customer'}
              {step === 2 && 'Step 2: Select Booking'}
              {step === 3 && 'Step 3: Apply Discount'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Select Customer */}
          {step === 1 && (
            <div>
              <div className="mb-4">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search customers by name, phone, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading customers...</p>
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-8">
                  <FiUser className="mx-auto text-4xl text-gray-400 mb-2" />
                  <p className="text-gray-500">No customers found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {customers.map((customer) => (
                    <div
                      key={customer._id}
                      onClick={() => handleCustomerSelect(customer)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary-50 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 h-12 w-12">
                          {customer.profilePicture ? (
                            <img
                              src={customer.profilePicture}
                              alt={customer.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                              {customer.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{customer.name || 'Unknown'}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <FiPhone className="text-xs" />
                              {customer.phone}
                            </span>
                            {customer.email && (
                              <span className="flex items-center gap-1">
                                <FiMail className="text-xs" />
                                {customer.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Booking */}
          {step === 2 && (
            <div>
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Selected Customer</h4>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 h-10 w-10">
                    {selectedCustomer.profilePicture ? (
                      <img
                        src={selectedCustomer.profilePicture}
                        alt={selectedCustomer.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {selectedCustomer.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
                    <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading bookings...</p>
                </div>
              ) : customerBookings.length === 0 ? (
                <div className="text-center py-8">
                  <FiCalendar className="mx-auto text-4xl text-gray-400 mb-2" />
                  <p className="text-gray-500">No bookings found for this customer</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {customerBookings.map((booking) => (
                    <div
                      key={booking._id}
                      onClick={() => handleBookingSelect(booking)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary-50 cursor-pointer transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">
                              {booking.serviceName || booking.subService?.name || booking.service?.name || booking.popularService?.name || 'Service'}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                              booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <FiCalendar className="text-xs" />
                              {new Date(booking.scheduledDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiDollarSign className="text-xs" />
                              ₹{booking.totalAmount || booking.amount}
                            </span>
                          </div>
                          {booking.specialDiscount && booking.specialDiscount.amount > 0 && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                              <FiTag className="text-xs" />
                              Special discount already applied: ₹{booking.specialDiscount.amount}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Back to Customers
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Apply Discount */}
          {step === 3 && (
            <div>
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Selected Booking</h4>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-gray-600">Service:</span>{' '}
                    <span className="font-medium">{selectedBooking.serviceName || selectedBooking.subService?.name || 'Service'}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-600">Amount:</span>{' '}
                    <span className="font-medium">₹{selectedBooking.totalAmount || selectedBooking.amount}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-600">Date:</span>{' '}
                    <span className="font-medium">{new Date(selectedBooking.scheduledDate).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setDiscountType('amount')}
                      className={`p-3 border-2 rounded-lg flex items-center justify-center gap-2 transition ${
                        discountType === 'amount'
                          ? 'border-primary bg-primary-50 text-primary'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FiDollarSign />
                      <span className="font-medium">Fixed Amount</span>
                    </button>
                    <button
                      onClick={() => setDiscountType('percentage')}
                      className={`p-3 border-2 rounded-lg flex items-center justify-center gap-2 transition ${
                        discountType === 'percentage'
                          ? 'border-primary bg-primary-50 text-primary'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FiPercent />
                      <span className="font-medium">Percentage</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Value {discountType === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={discountType === 'percentage' ? '100' : undefined}
                    step={discountType === 'percentage' ? '1' : '0.01'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'percentage' ? 'Enter percentage (0-100)' : 'Enter amount'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter reason for special discount..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {discountValue && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">Discount Preview</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Original Amount:</span>
                        <span className="font-medium">₹{selectedBooking.totalAmount || selectedBooking.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Discount:</span>
                        <span className="font-medium text-red-600">
                          -₹{discountType === 'amount' 
                            ? parseFloat(discountValue).toFixed(2)
                            : ((selectedBooking.totalAmount || selectedBooking.amount) * parseFloat(discountValue) / 100).toFixed(2)
                          }
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-blue-300">
                        <span className="text-blue-900 font-medium">Final Amount:</span>
                        <span className="font-bold text-green-600">
                          ₹{(
                            (selectedBooking.totalAmount || selectedBooking.amount) - 
                            (discountType === 'amount' 
                              ? parseFloat(discountValue)
                              : (selectedBooking.totalAmount || selectedBooking.amount) * parseFloat(discountValue) / 100
                            )
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleApplyDiscount}
                  disabled={loading || !discountValue}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? 'Applying...' : 'Apply Special Discount'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpecialDiscountModal;
