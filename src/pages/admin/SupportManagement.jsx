import React, { useState, useEffect } from 'react';
import { 
  FiMessageSquare, FiUser, FiClock, FiCheck, FiX, FiEye, FiCornerUpLeft,
  FiFilter, FiSearch, FiSettings, FiPlus, FiEdit3,
  FiTrash2, FiSave, FiRefreshCw
} from 'react-icons/fi';
import { adminApi } from '../../services/adminApi';
import { useAdminAuth } from '../../context/AdminAuthContext';

const SupportManagement = () => {
  const { token } = useAdminAuth();
  const [tickets, setTickets] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tickets');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: ''
  });
  
  // FAQ form state
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: 'general',
    isActive: true
  });
  
  // Reply form state
  const [replyForm, setReplyForm] = useState({
    message: '',
    status: 'open'
  });
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [supportSettings, setSupportSettings] = useState({
    autoReplyEnabled: true,
    autoReplyMessage: 'Thank you for contacting us. We have received your message and will respond within 24 hours.',
    supportEmail: 'support@nexo.works',
    supportPhone: '+91 1800-XXX-XXXX',
    workingHours: 'Mon-Sat, 9AM-6PM',
    emergencyContact: '+91 9999-XXX-XXX'
  });

  useEffect(() => {
    fetchSupportData();
  }, [token]);

  const fetchSupportData = async () => {
    setLoading(true);
    try {
      const [ticketsRes, faqsRes, settingsRes] = await Promise.all([
        adminApi.getSupportTickets(token),
        adminApi.getFAQs(token),
        adminApi.getSupportSettings(token)
      ]);
      
      setTickets(ticketsRes.data || []);
      setFaqs(faqsRes.data || []);
      if (settingsRes.data) {
        setSupportSettings(settingsRes.data);
      }
    } catch (error) {
      console.error('Error fetching support data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketReply = async (ticketId) => {
    try {
      await adminApi.replyToTicket(token, ticketId, replyForm);
      setReplyForm({ message: '', status: 'open' });
      setShowTicketModal(false);
      fetchSupportData();
      alert('Reply sent successfully!');
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply');
    }
  };

  const handleTicketStatusUpdate = async (ticketId, status) => {
    setUpdatingStatus(true);
    try {
      const response = await adminApi.updateTicketStatus(token, ticketId, status);
      
      // Update the selected ticket if it's the one being updated
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket(response.data);
      }
      
      // If current filter would hide the updated ticket, reset to show all
      if (filters.status !== 'all' && filters.status !== status) {
        setFilters({ ...filters, status: 'all' });
        alert(`Ticket status updated to ${status} successfully! Filter reset to show all tickets.`);
      } else {
        alert(`Ticket status updated to ${status} successfully!`);
      }
      
      fetchSupportData();
    } catch (error) {
      console.error('Error updating ticket status:', error);
      alert(`Failed to update ticket status: ${error.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleFaqSave = async () => {
    try {
      if (faqForm.id) {
        await adminApi.updateFAQ(token, faqForm.id, faqForm);
      } else {
        await adminApi.createFAQ(token, faqForm);
      }
      setFaqForm({ question: '', answer: '', category: 'general', isActive: true });
      setShowFaqModal(false);
      fetchSupportData();
      alert('FAQ saved successfully!');
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert('Failed to save FAQ');
    }
  };

  const handleFaqDelete = async (faqId) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await adminApi.deleteFAQ(token, faqId);
        fetchSupportData();
      } catch (error) {
        console.error('Error deleting FAQ:', error);
      }
    }
  };

  const handleSettingsSave = async () => {
    try {
      await adminApi.updateSupportSettings(token, supportSettings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filters.status === 'all' || ticket.status === filters.status;
    const matchesPriority = filters.priority === 'all' || ticket.priority === filters.priority;
    const matchesSearch = !filters.search || 
      ticket.subject?.toLowerCase().includes(filters.search.toLowerCase()) ||
      ticket.user?.name?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Support Management</h1>
          <p className="text-slate-600">Manage customer support tickets, FAQs, and settings</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchSupportData}
            className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition border border-slate-200"
          >
            <FiRefreshCw className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200">
        <div className="flex border-b border-slate-200">
          {[
            { id: 'tickets', label: 'Support Tickets', icon: FiMessageSquare },
            { id: 'faqs', label: 'FAQs Management', icon: FiEdit3 },
            { id: 'settings', label: 'Support Settings', icon: FiSettings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-slate-600 hover:text-primary hover:bg-slate-50'
              }`}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Support Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search tickets..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Filter Indicator */}
              {(filters.status !== 'all' || filters.priority !== 'all' || filters.search) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-700">
                      <FiFilter size={16} />
                      <span className="text-sm font-medium">
                        Filters applied: 
                        {filters.status !== 'all' && ` Status: ${filters.status}`}
                        {filters.priority !== 'all' && ` Priority: ${filters.priority}`}
                        {filters.search && ` Search: "${filters.search}"`}
                        {` (${filteredTickets.length} of ${tickets.length} tickets shown)`}
                      </span>
                    </div>
                    <button
                      onClick={() => setFilters({ status: 'all', priority: 'all', search: '' })}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              )}

              {/* Tickets List */}
              <div className="space-y-4">
                {filteredTickets.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <FiMessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No support tickets found</p>
                  </div>
                ) : (
                  filteredTickets.map(ticket => (
                    <div
                      key={ticket._id}
                      className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition cursor-pointer"
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setShowTicketModal(true);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-800">{ticket.subject}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                              {ticket.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                          </div>
                          <p className="text-slate-600 text-sm mb-2 line-clamp-2">{ticket.message}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <FiUser />
                              {ticket.user?.name || 'Unknown User'}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiClock />
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTicketStatusUpdate(ticket._id, 'resolved');
                            }}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                            title="Mark as Resolved"
                          >
                            <FiCheck />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTicket(ticket);
                              setShowTicketModal(true);
                            }}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                            title="View Details"
                          >
                            <FiEye />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* FAQs Management Tab */}
          {activeTab === 'faqs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Manage FAQs</h2>
                <button
                  onClick={() => {
                    setFaqForm({ question: '', answer: '', category: 'general', isActive: true });
                    setShowFaqModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                >
                  <FiPlus />
                  Add FAQ
                </button>
              </div>

              <div className="space-y-4">
                {faqs.map(faq => (
                  <div key={faq._id} className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 mb-2">{faq.question}</h3>
                        <p className="text-slate-600 text-sm mb-2">{faq.answer}</p>
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                            {faq.category}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            faq.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {faq.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setFaqForm(faq);
                            setShowFaqModal(true);
                          }}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                        >
                          <FiEdit3 />
                        </button>
                        <button
                          onClick={() => handleFaqDelete(faq._id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Support Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800">Support Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={supportSettings.supportEmail}
                      onChange={(e) => setSupportSettings({ ...supportSettings, supportEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Support Phone
                    </label>
                    <input
                      type="text"
                      value={supportSettings.supportPhone}
                      onChange={(e) => setSupportSettings({ ...supportSettings, supportPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Working Hours
                    </label>
                    <input
                      type="text"
                      value={supportSettings.workingHours}
                      onChange={(e) => setSupportSettings({ ...supportSettings, workingHours: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
                      <span className="text-red-600 mr-2">🚨</span>
                      Emergency Contact Number
                    </label>
                    <input
                      type="text"
                      value={supportSettings.emergencyContact}
                      onChange={(e) => setSupportSettings({ ...supportSettings, emergencyContact: e.target.value })}
                      className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50"
                      placeholder="+91 9999-XXX-XXX"
                    />
                    <p className="text-xs text-red-600 mt-1">
                      This number will be displayed on the emergency services page for 24/7 urgent assistance
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={supportSettings.autoReplyEnabled}
                        onChange={(e) => setSupportSettings({ ...supportSettings, autoReplyEnabled: e.target.checked })}
                        className="rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-semibold text-slate-700">Enable Auto Reply</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Auto Reply Message
                    </label>
                    <textarea
                      value={supportSettings.autoReplyMessage}
                      onChange={(e) => setSupportSettings({ ...supportSettings, autoReplyMessage: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      rows="4"
                    />
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleSettingsSave}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
              >
                <FiSave />
                Save Settings
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Details Modal */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Ticket Details</h2>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <FiX />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">{selectedTicket.subject}</h3>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <p className="text-slate-600">{selectedTicket.message}</p>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-800 mb-2">Customer Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Name:</span> {selectedTicket.user?.name || 'N/A'}</p>
                  <p><span className="font-medium">Email:</span> {selectedTicket.user?.email || 'N/A'}</p>
                  <p><span className="font-medium">Phone:</span> {selectedTicket.user?.phone || 'N/A'}</p>
                  <p><span className="font-medium">Created:</span> {new Date(selectedTicket.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">Conversation</h4>
                  <div className="space-y-3">
                    {selectedTicket.replies.map((reply, index) => (
                      <div key={index} className={`p-3 rounded-lg ${
                        reply.isAdmin ? 'bg-primary/10 ml-8' : 'bg-slate-100 mr-8'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">
                            {reply.isAdmin ? 'Admin' : selectedTicket.user?.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(reply.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Status Update Section */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-800 mb-3">Update Ticket Status</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Current Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                          {selectedTicket.status}
                        </span>
                      </label>
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => {
                          if (e.target.value !== selectedTicket.status) {
                            handleTicketStatusUpdate(selectedTicket._id, e.target.value);
                          }
                        }}
                        disabled={updatingStatus}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                      {updatingStatus && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-primary">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          Updating status...
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-slate-600">
                      {selectedTicket.assignedTo && (
                        <p><span className="font-medium">Assigned to:</span> {selectedTicket.assignedTo.name}</p>
                      )}
                      {selectedTicket.resolvedAt && (
                        <p><span className="font-medium">Resolved:</span> {new Date(selectedTicket.resolvedAt).toLocaleString()}</p>
                      )}
                      {selectedTicket.closedAt && (
                        <p><span className="font-medium">Closed:</span> {new Date(selectedTicket.closedAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Quick Action Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {selectedTicket.status === 'open' && (
                      <button
                        onClick={() => handleTicketStatusUpdate(selectedTicket._id, 'in_progress')}
                        disabled={updatingStatus}
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium hover:bg-yellow-200 disabled:opacity-50 transition"
                      >
                        Start Working
                      </button>
                    )}
                    {(selectedTicket.status === 'open' || selectedTicket.status === 'in_progress') && (
                      <button
                        onClick={() => handleTicketStatusUpdate(selectedTicket._id, 'resolved')}
                        disabled={updatingStatus}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium hover:bg-green-200 disabled:opacity-50 transition"
                      >
                        Mark Resolved
                      </button>
                    )}
                    {selectedTicket.status === 'resolved' && (
                      <button
                        onClick={() => handleTicketStatusUpdate(selectedTicket._id, 'closed')}
                        disabled={updatingStatus}
                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium hover:bg-gray-200 disabled:opacity-50 transition"
                      >
                        Close Ticket
                      </button>
                    )}
                    {selectedTicket.status !== 'open' && (
                      <button
                        onClick={() => handleTicketStatusUpdate(selectedTicket._id, 'open')}
                        disabled={updatingStatus}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium hover:bg-blue-200 disabled:opacity-50 transition"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Send Reply</h4>
                <div className="space-y-4">
                  <textarea
                    value={replyForm.message}
                    onChange={(e) => setReplyForm({ ...replyForm, message: e.target.value })}
                    placeholder="Type your reply..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    rows="4"
                  />
                  
                  <div className="flex items-center justify-between">
                    <select
                      value={replyForm.status}
                      onChange={(e) => setReplyForm({ ...replyForm, status: e.target.value })}
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="open">Keep Open</option>
                      <option value="in_progress">Mark In Progress</option>
                      <option value="resolved">Mark Resolved</option>
                      <option value="closed">Close Ticket</option>
                    </select>
                    
                    <button
                      onClick={() => handleTicketReply(selectedTicket._id)}
                      disabled={!replyForm.message.trim()}
                      className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <FiCornerUpLeft />
                      Send Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {showFaqModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">
                  {faqForm.id ? 'Edit FAQ' : 'Add New FAQ'}
                </h2>
                <button
                  onClick={() => setShowFaqModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <FiX />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Question
                </label>
                <input
                  type="text"
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter the question..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Answer
                </label>
                <textarea
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  rows="4"
                  placeholder="Enter the answer..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Category
                </label>
                <select
                  value={faqForm.category}
                  onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="general">General</option>
                  <option value="booking">Booking</option>
                  <option value="payment">Payment</option>
                  <option value="account">Account</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={faqForm.isActive}
                    onChange={(e) => setFaqForm({ ...faqForm, isActive: e.target.checked })}
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-semibold text-slate-700">Active</span>
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowFaqModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFaqSave}
                  disabled={!faqForm.question.trim() || !faqForm.answer.trim()}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Save FAQ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportManagement;