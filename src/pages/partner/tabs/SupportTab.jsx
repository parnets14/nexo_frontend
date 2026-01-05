import { useState, useEffect } from 'react';
import { 
  FiMail, FiPhone, FiMessageCircle, FiSend, FiCheckCircle, 
  FiClock, FiHeadphones, FiHelpCircle, FiChevronDown,
  FiEye, FiCornerUpLeft, FiThumbsUp, FiThumbsDown
} from 'react-icons/fi';
import { supportApi } from '../../../services/supportApi';
import { usePartnerAuth } from '../../../context/PartnerAuthContext';

const SupportTab = () => {
  const { partner, token } = usePartnerAuth();
  const [activeTab, setActiveTab] = useState('contact');
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium'
  });
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [supportSettings, setSupportSettings] = useState(null);

  useEffect(() => {
    fetchFAQs();
    fetchSupportSettings();
    
    if (partner && token) {
      fetchPartnerTickets();
    }
  }, [partner, token]);

  const fetchSupportSettings = async () => {
    try {
      const response = await supportApi.getSupportSettings();
      setSupportSettings(response.data);
    } catch (error) {
      console.error('Error fetching support settings:', error);
      // Set default values if fetch fails
      setSupportSettings({
        supportPhone: '+91 1800-XXX-XXXX',
        supportEmail: 'support@nexo.works',
        workingHours: 'Mon-Sat, 9AM-6PM',
        liveChatEnabled: true
      });
    }
  };

  const fetchFAQs = async () => {
    try {
      const response = await supportApi.getFAQs({ limit: 20 });
      setFaqs(response.data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  };

  const fetchPartnerTickets = async () => {
    try {
      if (!token) {
        console.log('No auth token available for fetching tickets');
        return;
      }
      const response = await supportApi.getPartnerTickets(token);
      setTickets(response.data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!partner || !token) {
      alert('Please login to submit a support ticket');
      return;
    }

    setSending(true);
    try {
      await supportApi.createPartnerTicket(token, formData);
      setShowSuccess(true);
      setFormData({ subject: '', message: '', category: 'general', priority: 'medium' });
      setTimeout(() => setShowSuccess(false), 5000);
      fetchPartnerTickets(); // Refresh tickets
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleTicketReply = async (ticketId) => {
    if (!replyMessage.trim()) return;

    try {
      if (!token) {
        alert('Authentication required to send reply');
        return;
      }
      await supportApi.addPartnerTicketReply(token, ticketId, { message: replyMessage });
      setReplyMessage('');
      // Refresh ticket details
      const response = await supportApi.getPartnerTicketDetails(token, ticketId);
      setSelectedTicket(response.data);
      fetchPartnerTickets(); // Refresh tickets list
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply');
    }
  };

  const handleFAQRating = async (faqId, helpful) => {
    try {
      await supportApi.rateFAQ(faqId, helpful);
      // Optionally show feedback
    } catch (error) {
      console.error('Error rating FAQ:', error);
    }
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
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

  return (
    <div className="space-y-8">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 bg-green-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in max-w-sm sm:max-w-none mx-auto sm:mx-0">
          <FiCheckCircle size={20} className="sm:w-6 sm:h-6 flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-sm sm:text-base">Ticket Created Successfully!</p>
            <p className="text-xs sm:text-sm text-green-100">We'll get back to you soon.</p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-primary via-primary-dark to-[#152d47] rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-white overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-white/10 rounded-full -mr-16 sm:-mr-32 -mt-16 sm:-mt-32"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-48 sm:h-48 bg-white/5 rounded-full -ml-12 sm:-ml-24 -mb-12 sm:-mb-24"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <FiHeadphones size={20} className="sm:w-6 sm:h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">Partner Support Center</h1>
          </div>
          <p className="text-blue-100 text-base sm:text-lg max-w-2xl leading-relaxed">
            Get help with your partner account, job management, payments, and more. Our support team is here to assist you.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
          {[
            { id: 'contact', label: 'Contact Support', icon: FiMessageCircle, shortLabel: 'Contact' },
            { id: 'tickets', label: 'My Tickets', icon: FiSend, shortLabel: 'Tickets' },
            { id: 'faqs', label: 'FAQs', icon: FiHelpCircle, shortLabel: 'FAQs' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-semibold transition whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-gray-600 hover:text-primary hover:bg-gray-50'
              }`}
            >
              <tab.icon size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">
          {/* Contact Support Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6 sm:space-y-8">
              {/* Contact Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="group bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-4 sm:p-6 text-center border border-gray-100 hover:border-primary/30 hover:-translate-y-1">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-primary-dark rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <FiPhone className="text-white" size={20} />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2 text-base sm:text-lg">Call Us</h3>
                  <p className="text-primary font-semibold text-base sm:text-lg mb-2 break-all">
                    {supportSettings?.supportPhone || '+91 1800-XXX-XXXX'}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500">
                    <FiClock size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                    <span className="text-center">
                      {supportSettings?.workingHours || 'Mon-Sat, 9AM-6PM'}
                    </span>
                  </div>
                </div>

                <div className="group bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-4 sm:p-6 text-center border border-gray-100 hover:border-green-200 hover:-translate-y-1">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <FiMail className="text-white" size={20} />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2 text-base sm:text-lg">Email Us</h3>
                  <p className="text-green-600 font-semibold mb-2 text-sm sm:text-base break-all">
                    {supportSettings?.supportEmail || 'support@nexo.works'}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500">
                    <FiCheckCircle size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                    <span>24/7 Support</span>
                  </div>
                </div>

                <div className="group bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-4 sm:p-6 text-center border border-gray-100 hover:border-primary-light/30 hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-light to-primary rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <FiMessageCircle className="text-white" size={20} />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2 text-base sm:text-lg">Live Chat</h3>
                  <p className="text-primary-light font-semibold mb-2 text-sm sm:text-base">Chat with us</p>
                  <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${supportSettings?.liveChatEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span>{supportSettings?.liveChatEnabled ? 'Available 24/7' : 'Currently Offline'}</span>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 to-primary-light/10 p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <FiSend className="text-white" size={16} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-800">Create Support Ticket</h2>
                      <p className="text-gray-600 text-xs sm:text-sm mt-0.5">We typically respond within 24 hours</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm sm:text-base"
                        required
                      >
                        <option value="general">General Inquiry</option>
                        <option value="job_management">Job Management</option>
                        <option value="payment">Payment Issue</option>
                        <option value="technical">Technical Issue</option>
                        <option value="account">Account Problem</option>
                        <option value="wallet">Wallet Issue</option>
                        <option value="subscription">Subscription/Plan</option>
                        <option value="complaint">Complaint</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Priority *
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm sm:text-base"
                        required
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm sm:text-base"
                      placeholder="What is this about?"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none text-sm sm:text-base"
                      rows="5"
                      placeholder="Describe your issue or question in detail..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending || !partner || !token}
                    className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-primary to-primary-light text-white rounded-lg sm:rounded-xl hover:from-primary-dark hover:to-primary disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] text-sm sm:text-base"
                  >
                    {sending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                        <span className="hidden sm:inline">Creating Ticket...</span>
                        <span className="sm:hidden">Creating...</span>
                      </>
                    ) : !partner || !token ? (
                      <>
                        <span className="hidden sm:inline">Please Login to Create Ticket</span>
                        <span className="sm:hidden">Please Login</span>
                      </>
                    ) : (
                      <>
                        <FiSend size={16} className="sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Create Support Ticket</span>
                        <span className="sm:hidden">Create Ticket</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* My Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="space-y-4 sm:space-y-6">
              {!partner || !token ? (
                <div className="text-center py-8">
                  <FiMessageCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 text-sm sm:text-base">Please login to view your support tickets</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">My Support Tickets</h2>
                    <button
                      onClick={fetchPartnerTickets}
                      className="px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm sm:text-base self-start sm:self-auto"
                    >
                      <span className="hidden sm:inline">Refresh</span>
                      <span className="sm:hidden">↻</span>
                    </button>
                  </div>

                  {tickets.length === 0 ? (
                    <div className="text-center py-8">
                      <FiMessageCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 text-sm sm:text-base mb-4">No support tickets found</p>
                      <button
                        onClick={() => setActiveTab('contact')}
                        className="px-4 sm:px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm sm:text-base"
                      >
                        Create Your First Ticket
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {tickets.map(ticket => (
                        <div
                          key={ticket._id}
                          className="bg-gray-50 rounded-lg p-3 sm:p-4 hover:bg-gray-100 transition cursor-pointer"
                          onClick={async () => {
                            try {
                              if (!token) {
                                alert('Authentication required to view ticket details');
                                return;
                              }
                              const response = await supportApi.getPartnerTicketDetails(token, ticket._id);
                              setSelectedTicket(response.data);
                              setShowTicketModal(true);
                            } catch (error) {
                              console.error('Error fetching ticket details:', error);
                            }
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">#{ticket.ticketId}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                  {ticket.status}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                                  {ticket.priority}
                                </span>
                              </div>
                              <p className="font-medium text-gray-800 mb-1 text-sm sm:text-base truncate">{ticket.subject}</p>
                              <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2">{ticket.message}</p>
                              <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-500 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <FiClock size={12} />
                                  <span className="hidden sm:inline">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                  <span className="sm:hidden">{new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                </span>
                                {ticket.replies && ticket.replies.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <FiCornerUpLeft size={12} />
                                    {ticket.replies.length} replies
                                  </span>
                                )}
                              </div>
                            </div>
                            <FiEye className="text-gray-400 flex-shrink-0 ml-2" size={16} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* FAQs Tab */}
          {activeTab === 'faqs' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <FiHelpCircle className="text-white" size={16} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Frequently Asked Questions</h2>
                  <p className="text-gray-600 text-xs sm:text-sm mt-0.5">Quick answers to common partner questions</p>
                </div>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                {faqs.map((faq, index) => (
                  <div 
                    key={faq._id}
                    className="border-2 border-gray-100 rounded-lg sm:rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between p-3 sm:p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-semibold text-gray-800 pr-3 sm:pr-4 text-sm sm:text-base leading-tight">{faq.question}</h3>
                      <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-md sm:rounded-lg flex items-center justify-center transition-transform duration-300 ${expandedFaq === index ? 'rotate-180' : ''}`}>
                        <FiChevronDown className="text-primary" size={16} />
                      </div>
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-300 ${expandedFaq === index ? 'max-h-96' : 'max-h-0'}`}>
                      <div className="p-3 sm:p-4 pt-0 text-gray-600 bg-gray-50">
                        <p className="leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">{faq.answer}</p>
                        <div className="flex items-center gap-2 text-xs sm:text-sm flex-wrap">
                          <span className="text-gray-500">Was this helpful?</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFAQRating(faq._id, true);
                            }}
                            className="flex items-center gap-1 px-2 py-1 text-green-600 hover:bg-green-100 rounded transition"
                          >
                            <FiThumbsUp size={12} />
                            Yes
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFAQRating(faq._id, false);
                            }}
                            className="flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-100 rounded transition"
                          >
                            <FiThumbsDown size={12} />
                            No
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Details Modal */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Ticket #{selectedTicket.ticketId}</h2>
                  <p className="text-gray-600 text-sm sm:text-base truncate">{selectedTicket.subject}</p>
                </div>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
                >
                  <span className="text-xl sm:text-2xl">×</span>
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                  {selectedTicket.status}
                </span>
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                  {selectedTicket.priority}
                </span>
                <span className="text-xs text-gray-500">
                  <span className="hidden sm:inline">Created: {new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                  <span className="sm:hidden">{new Date(selectedTicket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </span>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Original Message</h4>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed break-words">{selectedTicket.message}</p>
              </div>
              
              {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Conversation</h4>
                  <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
                    {selectedTicket.replies.map((reply, index) => (
                      <div key={index} className={`p-2.5 sm:p-3 rounded-lg text-sm sm:text-base ${
                        reply.isAdmin ? 'bg-primary/10 ml-4 sm:ml-8' : 'bg-gray-100 mr-4 sm:mr-8'
                      }`}>
                        <div className="flex items-center justify-between mb-1.5 sm:mb-2 gap-2">
                          <span className="font-medium text-xs sm:text-sm flex-shrink-0">
                            {reply.isAdmin ? 'Support Team' : 'You'}
                          </span>
                          <span className="text-xs text-gray-500 text-right">
                            <span className="hidden sm:inline">{new Date(reply.createdAt).toLocaleString()}</span>
                            <span className="sm:hidden">{new Date(reply.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm leading-relaxed break-words">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedTicket.status !== 'closed' && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Add Reply</h4>
                  <div className="space-y-3 sm:space-y-4">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply..."
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm sm:text-base resize-none"
                      rows="4"
                    />
                    
                    <button
                      onClick={() => handleTicketReply(selectedTicket._id)}
                      disabled={!replyMessage.trim()}
                      className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-white rounded-lg sm:rounded-xl hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm sm:text-base"
                    >
                      <FiCornerUpLeft size={16} className="sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">Send Reply</span>
                      <span className="sm:hidden">Reply</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Need Immediate Help Section */}
      <div className="bg-gradient-to-br from-primary via-primary-dark to-[#152d47] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
            <FiCheckCircle size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base sm:text-lg mb-2">Need Immediate Help?</h3>
            <p className="text-blue-100 mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">
              For urgent partner issues, please call our support hotline. We're available 24/7 to assist you with job management, payments, and technical problems.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <a
                href={`tel:${supportSettings?.supportPhone?.replace(/\s+/g, '') || '+911800XXXXXX'}`}
                className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-white text-primary rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm sm:text-base"
              >
                <FiPhone size={16} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Call Support</span>
                <span className="sm:hidden">Call Now</span>
              </a>
              <button
                onClick={() => setActiveTab('faqs')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors font-medium text-sm sm:text-base"
              >
                <FiHelpCircle size={16} className="sm:w-4 sm:h-4" />
                View FAQs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportTab;