import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaClock, FaTimes, FaCalendar, FaRupeeSign } from 'react-icons/fa';
import axios from 'axios';
import { useUserAuth } from '../../context/UserAuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CustomAlert from '../../components/CustomAlert';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173';

const MySubscriptions = () => {
  const { user } = useUserAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [subscriptions, setSubscriptions] = useState([]);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    // Check for payment status in URL
    const paymentStatus = searchParams.get('payment');
    const reason = searchParams.get('reason');
    
    if (paymentStatus === 'success') {
      setAlert({
        type: 'success',
        message: 'Subscription activated successfully!'
      });
      // Clean URL
      window.history.replaceState({}, '', '/user/subscriptions');
    } else if (paymentStatus === 'failed') {
      setAlert({
        type: 'error',
        message: `Payment failed: ${reason || 'Unknown error'}`
      });
      // Clean URL
      window.history.replaceState({}, '', '/user/subscriptions');
    }

    fetchSubscriptions();
  }, [searchParams]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('userToken');
      
      // Fetch AMC subscriptions
      const response = await axios.get(`${API_BASE_URL}/api/user/amc-subscriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSubscriptions(response.data.data.subscriptions || []);
        setActiveSubscription(response.data.data.activeSubscription || null);
      }
    } catch (error) {
      console.error('Error fetching AMC subscriptions:', error);
      setAlert({
        type: 'error',
        message: 'Failed to load AMC subscriptions'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to cancel this AMC subscription?')) {
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.put(
        `${API_BASE_URL}/api/user/amc-subscriptions/${subscriptionId}/cancel`,
        { reason: 'User requested cancellation' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setAlert({
          type: 'success',
          message: 'AMC subscription cancelled successfully'
        });
        fetchSubscriptions();
      }
    } catch (error) {
      console.error('Error cancelling AMC subscription:', error);
      setAlert({
        type: 'error',
        message: 'Failed to cancel AMC subscription'
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FaCheckCircle className="text-green-500" />;
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'expired':
      case 'cancelled':
        return <FaTimes className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 365) {
      const years = Math.floor(diffDays / 365);
      return `${years} ${years > 1 ? 'years' : 'year'}`;
    } else if (diffDays >= 30) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months > 1 ? 'months' : 'month'}`;
    } else {
      return `${diffDays} ${diffDays > 1 ? 'days' : 'day'}`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {alert && (
        <CustomAlert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My AMC Subscriptions</h1>
        <p className="text-gray-600">Manage your Annual Maintenance Contract subscriptions</p>
      </div>

      {/* Active Subscription Card */}
      {activeSubscription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 mb-8 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{activeSubscription.planName}</h2>
              <p className="text-white/80">Active AMC Plan</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">₹{activeSubscription.planPrice}</div>
              <div className="text-white/80">
                for {calculateDuration(activeSubscription.startDate, activeSubscription.endDate)}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
            <div className="flex items-center gap-2">
              <FaCalendar />
              <span>Started: {formatDate(activeSubscription.startDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCalendar />
              <span>Expires: {formatDate(activeSubscription.endDate)}</span>
            </div>
          </div>

          {/* Service Address for Active Subscription */}
          {activeSubscription.serviceAddress && activeSubscription.serviceAddress.address && (
            <div className="mb-4 p-3 bg-white/10 rounded-lg">
              <h4 className="text-sm font-semibold mb-1">Service Address:</h4>
              <p className="text-sm text-white/90">
                {activeSubscription.serviceAddress.address}
                {activeSubscription.serviceAddress.landmark && `, ${activeSubscription.serviceAddress.landmark}`}
                {activeSubscription.serviceAddress.pincode && ` - ${activeSubscription.serviceAddress.pincode}`}
              </p>
            </div>
          )}

          {/* Features for Active Subscription */}
          {activeSubscription.features && activeSubscription.features.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">Plan Benefits:</h4>
              <div className="flex flex-wrap gap-2">
                {activeSubscription.features.slice(0, 4).map((feature, idx) => (
                  <span key={idx} className="px-2 py-1 bg-white/20 text-white text-xs rounded-full">
                    {feature}
                  </span>
                ))}
                {activeSubscription.features.length > 4 && (
                  <span className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded-full">
                    +{activeSubscription.features.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          <button
            onClick={() => handleCancelSubscription(activeSubscription._id)}
            className="mt-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Cancel AMC Subscription
          </button>
        </motion.div>
      )}

      {/* Browse Plans Button */}
      {!activeSubscription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-2xl p-8 mb-8 text-center"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Active AMC Subscription</h3>
          <p className="text-gray-600 mb-4">Subscribe to an AMC plan to enjoy annual maintenance benefits and priority support</p>
          <button
            onClick={() => navigate('/amc')}
            className="bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-dark transition-colors"
          >
            Browse AMC Plans
          </button>
        </motion.div>
      )}

      {/* Subscription History */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">AMC Subscription History</h2>

        {subscriptions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No AMC subscription history found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <motion.div
                key={subscription._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{subscription.planName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(subscription.status)}`}>
                        {getStatusIcon(subscription.status)}
                        {subscription.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <FaRupeeSign className="text-primary" />
                        <span>₹{subscription.planPrice}/year</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCalendar className="text-primary" />
                        <span>{formatDate(subscription.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCalendar className="text-primary" />
                        <span>to {formatDate(subscription.endDate)}</span>
                      </div>
                    </div>

                    {/* Service Address */}
                    {subscription.serviceAddress && subscription.serviceAddress.address && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Service Address:</h4>
                        <p className="text-sm text-gray-600">
                          {subscription.serviceAddress.address}
                          {subscription.serviceAddress.landmark && `, ${subscription.serviceAddress.landmark}`}
                          {subscription.serviceAddress.pincode && ` - ${subscription.serviceAddress.pincode}`}
                        </p>
                      </div>
                    )}

                    {/* Features */}
                    {subscription.features && subscription.features.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Plan Features:</h4>
                        <div className="flex flex-wrap gap-2">
                          {subscription.features.slice(0, 3).map((feature, idx) => (
                            <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                              {feature}
                            </span>
                          ))}
                          {subscription.features.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{subscription.features.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Payment Details */}
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                      {subscription.txnid && (
                        <span>Transaction ID: {subscription.txnid}</span>
                      )}
                      {subscription.mihpayid && (
                        <span>Payment ID: {subscription.mihpayid}</span>
                      )}
                    </div>
                  </div>

                  {subscription.status === 'active' && (
                    <button
                      onClick={() => handleCancelSubscription(subscription._id)}
                      className="ml-4 text-red-600 hover:text-red-700 font-semibold text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySubscriptions;
