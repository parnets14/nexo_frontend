import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiDollarSign, FiStar, FiTrendingUp, FiArrowRight, FiCheckCircle, FiZap, FiUsers, FiAward, FiTool, FiSettings, FiUser } from 'react-icons/fi';
import { FaBuilding } from 'react-icons/fa';
import axios from 'axios';
import { useUserAuth } from '../../context/UserAuthContext';
import AMCPlanSelector from '../../components/AMCPlanSelector';

// Helper function to safely get booking data
const getBookingData = (booking) => {
  if (!booking) return null;
  
  return {
    id: booking._id || booking.id || 'N/A',
    serviceName: booking.serviceName || 
                 booking.service?.name || 
                 booking.subService?.name || 
                 booking.subService?.service?.name ||
                 booking.product?.name ||
                 'Service Booking',
    
    status: booking.status || 'pending',
    
    date: booking.scheduledDate || 
          booking.bookingDate || 
          booking.serviceDate ||
          booking.createdAt || 
          booking.date ||
          new Date(),
          
    amount: booking.totalAmount || 
            booking.amount || 
            booking.price ||
            booking.cost ||
            0
  };
};

const UserOverview = () => {
  const navigate = useNavigate();
  const { user } = useUserAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    walletBalance: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAMCSelector, setShowAMCSelector] = useState(false);

  useEffect(() => {
    if (user?._id) {
      fetchDashboardData();
    }
  }, [user?._id]);

  // Show AMC selector for company users who haven't selected a plan yet
  useEffect(() => {
    if (user?.userType === 'company' && !user?.amcSubscription?.isActive) {
      // Show AMC selector after a short delay to let the user see their dashboard first
      const timer = setTimeout(() => {
        setShowAMCSelector(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const userId = user?._id || localStorage.getItem('userId');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // console.log('🔍 Dashboard: Fetching booking data...');
      // console.log('   User ID:', userId);
      // console.log('   Token exists:', !!token);

      // Try multiple booking endpoints
      let bookings = [];
      
      try {
        // Try the main endpoint first (getAllUserBookings)
        console.log('📋 Trying main bookings endpoint...');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/user/bookings`,
          config
        );
        
        console.log('📋 Bookings API Response:', response.data);
        
        if (response.data.success && response.data.data) {
          bookings = response.data.data.bookings || response.data.data || [];
        } else if (response.data.bookings) {
          bookings = response.data.bookings;
        } else if (Array.isArray(response.data.data)) {
          bookings = response.data.data;
        } else if (Array.isArray(response.data)) {
          bookings = response.data;
        }
        
        console.log('📋 Processed bookings from main endpoint:', bookings.length);
        
      } catch (mainError) {
        console.warn('⚠️ Main endpoint failed, trying alternative...');
        console.warn('   Main error:', mainError.message);
        
        try {
          // Try alternative endpoint (getUserBookings)
          const altResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/user/bookings/all`,
            config
          );
          
          console.log('📋 Alternative API Response:', altResponse.data);
          
          if (altResponse.data.success && altResponse.data.data) {
            if (altResponse.data.data.bookings) {
              bookings = altResponse.data.data.bookings;
            } else if (Array.isArray(altResponse.data.data)) {
              bookings = altResponse.data.data;
            }
          }
          
          console.log('📋 Processed bookings from alternative endpoint:', bookings.length);
          
        } catch (altError) {
          console.error('❌ Both booking endpoints failed');
          console.error('   Alt error:', altError.message);
          bookings = [];
        }
      }

      // Ensure bookings is always an array
      bookings = Array.isArray(bookings) ? bookings : [];
      console.log('📋 Final bookings array:', bookings.length);
      
      // Fetch wallet balance
      let walletBalance = 0;
      if (userId) {
        try {
          const walletRes = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/user/wallet/${userId}`,
            config
          );
          if (walletRes.data.success && walletRes.data.data) {
            walletBalance = walletRes.data.data.balance || 0;
          }
        } catch (err) {
          console.error('Error fetching wallet balance:', err);
        }
      }
      
      setStats({
        totalBookings: bookings.length,
        activeBookings: bookings.filter(b => ['pending', 'confirmed', 'in-progress'].includes(b.status)).length,
        completedBookings: bookings.filter(b => b.status === 'completed').length,
        walletBalance: walletBalance
      });

      setRecentBookings(bookings.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values on error
      setStats({
        totalBookings: 0,
        activeBookings: 0,
        completedBookings: 0,
        walletBalance: 0
      });
      setRecentBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { icon: FiCalendar, label: 'Total Bookings', value: stats.totalBookings, color: 'blue' },
    { icon: FiClock, label: 'Active Bookings', value: stats.activeBookings, color: 'orange' },
    { icon: FiStar, label: 'Completed', value: stats.completedBookings, color: 'green' },
    { icon: FiDollarSign, label: 'Wallet Balance', value: `₹${stats.walletBalance}`, color: 'purple' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Company AMC Banner - Show for company users */}
      {user?.userType === 'company' && (
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-6 text-white overflow-hidden shadow-xl animate-fade-in">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                <FaBuilding className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">
                  Welcome {user?.companyDetails?.companyName || 'Corporate User'}!
                </h3>
                <p className="text-blue-100">
                  {user?.amcSubscription?.isActive 
                    ? `Your ${user.amcSubscription.planName} AMC plan is active`
                    : 'Get comprehensive AMC plans for your business needs'
                  }
                </p>
              </div>
            </div>
            {!user?.amcSubscription?.isActive && (
              <button
                onClick={() => setShowAMCSelector(true)}
                className="px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold whitespace-nowrap"
              >
                View AMC Plans
              </button>
            )}
          </div>
        </div>
      )}

   

      {/* Promotional Banner - Fast Service (Compact) */}
      <div className="relative bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl p-4 md:p-6 text-white overflow-hidden shadow-xl animate-fade-in" style={{ animationDelay: '200ms' }}>
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2LTRoLTJ2NGgtNHYyaDR2NGgydi00aDR2LTJoLTR6bTAtMzBWMGgtMnY0aC00djJoNHY0aDJWNmg0VjRoLTR6TTYgMzR2LTRINHY0SDB2Mmg0djRoMnYtNGg0di0ySDZ6TTYgNFYwSDR2NEgwdjJoNHY0aDJWNmg0VjRINnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Icon + Message */}
            <div className="flex items-center gap-3 md:gap-4">
              <div className="relative flex-shrink-0">
                {/* Main animated icon with mechanics theme */}
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center animate-bounce-slow">
                  <div className="relative">
                    <FiTool className="text-yellow-300 animate-pulse" size={28} />
                    <FiZap className="absolute -top-1 -right-1 text-white animate-ping" size={12} />
                  </div>
                </div>
                {/* Orbiting mechanics icons */}
                <div className="absolute top-0 left-0 w-full h-full animate-spin" style={{ animationDuration: '4s' }}>
                  <FiSettings className="absolute -top-1 left-1/2 -ml-2 text-yellow-300" size={12} />
                </div>
                <div className="absolute top-0 left-0 w-full h-full animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}>
                  <FiTool className="absolute -bottom-1 left-1/2 -ml-2 text-white" size={10} />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-300 rounded-full animate-ping"></div>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                    <FiZap size={10} />
                    LIVE NOW
                  </span>
                  <span className="text-xs md:text-sm font-semibold text-yellow-300 flex items-center gap-1">
                    <FiSettings className="animate-spin" size={14} style={{ animationDuration: '3s' }} />
                    Fast Home Service
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-bold leading-tight flex items-center gap-2">
                  <FiTool className="text-yellow-300 animate-pulse" size={18} />
                  Service in <span className="text-yellow-300 animate-pulse">Quick Time!</span>
                  <FiCheckCircle className="text-green-300 animate-bounce" size={20} />
                </h3>
                <div className="flex items-center gap-3 mt-1.5 text-xs md:text-sm text-white/90">
                  <span className="flex items-center gap-1">
                    <FiUsers className="animate-pulse" size={14} />
                    Expert Technicians
                  </span>
                  <span className="flex items-center gap-1">
                    <FiAward className="animate-pulse" size={14} style={{ animationDelay: '0.5s' }} />
                    Certified
                  </span>
                  <span className="flex items-center gap-1">
                    <FiStar className="animate-pulse" size={14} style={{ animationDelay: '1s' }} />
                    4.9★
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Stats + CTA */}
            <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
              {/* Quick Stats with Icons */}
              <div className="hidden lg:flex items-center gap-3">
                <div className="text-center px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all group">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <FiTool className="text-yellow-300 group-hover:animate-spin" size={16} />
                    <div className="text-lg font-bold">1000+</div>
                  </div>
                  <div className="text-xs text-white/80">Services Done</div>
                </div>
                <div className="text-center px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all group">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <FiZap className="text-yellow-300 animate-pulse group-hover:animate-bounce" size={16} />
                    <div className="text-lg font-bold">Fast</div>
                  </div>
                  <div className="text-xs text-white/80">Response</div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => navigate('/')}
                className="group relative px-5 md:px-6 py-2.5 md:py-3 bg-white text-orange-600 rounded-xl font-bold shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-110 whitespace-nowrap overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <FiTool className="group-hover:rotate-12 transition-transform" size={18} />
                  <span className="text-sm md:text-base">Book Service</span>
                  <FiArrowRight className="group-hover:translate-x-2 transition-transform" size={16} />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colors = {
            blue: 'from-primary to-primary-light',
            orange: 'from-orange-500 to-orange-600',
            green: 'from-green-500 to-green-600',
            purple: 'from-purple-500 to-purple-600'
          };
          return (
            <div 
              key={index} 
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 overflow-hidden border border-gray-100 hover:border-primary/30 transform hover:-translate-y-2 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${colors[stat.color]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[stat.color]} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiArrowRight className="text-gray-600" size={16} />
                  </div>
                </div>
                <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-800 group-hover:text-primary transition-colors">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 animate-fade-in" style={{ animationDelay: '400ms' }}>
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-primary/5 to-primary-light/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center transform hover:scale-110 hover:rotate-6 transition-all duration-300">
                <FiCalendar className="text-white" size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Recent Bookings</h2>
            </div>
            <button
              onClick={() => navigate('/user/dashboard/bookings')}
              className="group flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl font-medium transition-all duration-200"
            >
              View All
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {recentBookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCalendar className="text-slate-400" size={32} />
              </div>
              <p className="text-slate-600 font-medium mb-2">No bookings yet</p>
              <p className="text-slate-500 text-sm mb-6">Start booking services to see them here</p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 font-medium"
              >
                Book a Service
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking, index) => {
                const bookingData = getBookingData(booking);
                if (!bookingData) return null;
                
                return (
                  <div
                    key={bookingData.id}
                    onClick={() => navigate(`/user/dashboard/bookings/${bookingData.id}`)}
                    className="group flex items-center justify-between p-4 border-2 border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 cursor-pointer transition-all duration-200 transform hover:scale-[1.02] animate-slide-in-left"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary-light/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FiCalendar className="text-primary" size={20} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 group-hover:text-primary transition-colors">{bookingData.serviceName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <FiClock className="text-slate-400" size={14} />
                          <p className="text-sm text-slate-600">
                            {new Date(bookingData.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                          {bookingData.amount > 0 && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-sm font-medium text-slate-700">₹{bookingData.amount}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 capitalize
                        ${bookingData.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                          bookingData.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'}`}
                      >
                        {bookingData.status}
                      </span>
                      <FiArrowRight className="text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" size={20} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Standard Plan CTA - Test PayU Integration */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white mb-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold mb-2">🚀 Get Standard Plan</h3>
            <p className="text-green-100">Unlock premium features with our Standard subscription plan</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1">
                <FiCheckCircle />
                Priority Support
              </span>
              <span className="flex items-center gap-1">
                <FiStar />
                Premium Features
              </span>
              <span className="flex items-center gap-1">
                <FiZap />
                Fast Service
              </span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">₹299</div>
            <div className="text-green-100 text-sm mb-3">per month</div>
            <button
              onClick={() => navigate('/#subscription-plans')}
              className="bg-white text-green-600 px-6 py-3 rounded-xl font-bold hover:bg-green-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get Standard Plan
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate('/')}
          className="group relative bg-gradient-to-br from-primary to-primary-light rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-left overflow-hidden transform hover:scale-105 animate-fade-in"
          style={{ animationDelay: '500ms' }}
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <FiCalendar className="text-white" size={28} />
            </div>
            <h3 className="font-bold text-white text-lg mb-2">Book a Service</h3>
            <p className="text-blue-100 text-sm">Browse and book services instantly</p>
            <div className="mt-4 flex items-center text-white text-sm font-medium">
              <span>Explore Services</span>
              <FiArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/user/dashboard/wallet')}
          className="group relative bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-left overflow-hidden transform hover:scale-105 animate-fade-in"
          style={{ animationDelay: '600ms' }}
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <FiDollarSign className="text-white" size={28} />
            </div>
            <h3 className="font-bold text-white text-lg mb-2">Add Money</h3>
            <p className="text-green-100 text-sm">Top up your wallet balance</p>
            <div className="mt-4 flex items-center text-white text-sm font-medium">
              <span>Manage Wallet</span>
              <FiArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/user/dashboard/support')}
          className="group relative bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-left overflow-hidden transform hover:scale-105 animate-fade-in"
          style={{ animationDelay: '700ms' }}
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <FiTrendingUp className="text-white" size={28} />
            </div>
            <h3 className="font-bold text-white text-lg mb-2">Get Help</h3>
            <p className="text-purple-100 text-sm">Contact our support team</p>
            <div className="mt-4 flex items-center text-white text-sm font-medium">
              <span>Contact Support</span>
              <FiArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </button>
      </div>

      {/* AMC Plan Selector Modal */}
      {showAMCSelector && (
        <AMCPlanSelector
          user={user}
          onClose={() => setShowAMCSelector(false)}
          onPlanSelect={(plan) => {
            console.log('Selected AMC plan:', plan);
            setShowAMCSelector(false);
          }}
        />
      )}
    </div>
  );
};

export default UserOverview;
