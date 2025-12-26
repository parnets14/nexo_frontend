import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiHome, FiCalendar, FiUser, FiMapPin, FiCreditCard, 
  FiStar, FiBell, FiHelpCircle, FiMenu, FiX, FiLogOut 
} from 'react-icons/fi';
import { useUserAuth } from '../../context/UserAuthContext';

const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout: authLogout } = useUserAuth();

  const menuItems = [
    { path: '/user/dashboard', icon: FiHome, label: 'Dashboard', color: 'blue' },
    { path: '/user/dashboard/bookings', icon: FiCalendar, label: 'My Bookings', color: 'purple' },
    { path: '/user/dashboard/subscriptions', icon: FiCreditCard, label: 'Subscriptions', color: 'teal' },
    { path: '/user/dashboard/profile', icon: FiUser, label: 'Profile', color: 'green' },
    { path: '/user/dashboard/addresses', icon: FiMapPin, label: 'Addresses', color: 'orange' },
    { path: '/user/dashboard/wallet', icon: FiCreditCard, label: 'Wallet', color: 'pink' },
    { path: '/user/dashboard/reviews', icon: FiStar, label: 'My Reviews', color: 'yellow' },
    { path: '/user/dashboard/notifications', icon: FiBell, label: 'Notifications', color: 'red' },
    { path: '/user/dashboard/support', icon: FiHelpCircle, label: 'Support', color: 'indigo' },
  ];

  const handleLogout = () => {
    authLogout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center">
                <FiUser className="text-white" size={20} />
              </div>
              <h1 className="text-2xl font-bold text-white">Nexo</h1>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3.5 rounded-xl
                    transition-all duration-200 group relative overflow-hidden
                    ${isActive 
                      ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/50' 
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent animate-pulse" />
                  )}
                  <Icon size={20} className="relative z-10" />
                  <span className="font-medium relative z-10">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full relative z-10" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Info Card */}
          <div className="p-4 border-t border-white/10">
            <div className="bg-white/5 rounded-xl p-4 mb-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white/20 shadow-lg">
                  {user?.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt={user.name || 'User'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiUser className="text-white" size={20} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm truncate">{user?.name || 'Welcome!'}</p>
                  <p className="text-slate-400 text-xs truncate">{user?.email || user?.phone || 'User Dashboard'}</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300
                transition-all duration-200 font-medium"
            >
              <FiLogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-xl shadow-sm z-10 border-b border-slate-200">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <FiMenu size={24} />
            </button>
            
            <div className="flex-1 lg:ml-0 ml-4">
              <h2 className="text-2xl font-bold text-slate-800">
                {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/user/dashboard/notifications')}
                className="relative p-3 text-slate-600 hover:text-primary rounded-xl hover:bg-primary/10 transition-all duration-200"
              >
                <FiBell size={22} />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              </button>
              
              <button
                onClick={() => navigate('/user/dashboard/profile')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-200"
              >
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt={user.name || 'User'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiUser size={14} />
                  )}
                </div>
                <span className="hidden sm:inline font-medium">{user?.name?.split(' ')[0] || 'Profile'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
