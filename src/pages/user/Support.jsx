import React, { useState } from 'react';
import { 
  FiMail, FiPhone, FiMessageCircle, FiSend, FiCheckCircle, 
  FiClock, FiHeadphones, FiHelpCircle, FiChevronDown, FiChevronUp 
} from 'react-icons/fi';
import axios from 'axios';

const Support = () => {
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      const token = localStorage.getItem('userToken');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/contactus`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setShowSuccess(true);
      setFormData({ subject: '', message: '' });
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqs = [
    {
      question: 'How do I book a service?',
      answer: 'Browse our services, select the one you need, choose a date and time, and confirm your booking. You can pay using your wallet or other payment methods.'
    },
    {
      question: 'Can I cancel my booking?',
      answer: 'Yes, you can cancel your booking from the My Bookings section. Cancellation charges may apply based on the timing. Free cancellation is available up to 2 hours before the scheduled time.'
    },
    {
      question: 'How do I add money to my wallet?',
      answer: 'Go to the Wallet section and click on "Add Money". Choose your payment method (UPI, Card, Net Banking) and complete the transaction securely through PayU gateway.'
    },
    {
      question: 'How can I track my service provider?',
      answer: 'Once your booking is confirmed, you can track your service provider in real-time from the booking details page. You\'ll receive notifications when they\'re on the way.'
    },
    {
      question: 'What if I\'m not satisfied with the service?',
      answer: 'We have a 100% satisfaction guarantee. If you\'re not happy with the service, contact our support team within 24 hours and we\'ll make it right or provide a full refund.'
    },
    {
      question: 'How do I update my profile information?',
      answer: 'Go to the Profile section from the sidebar menu. You can update your name, email, phone number, and profile picture. Changes are saved automatically.'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in">
          <FiCheckCircle size={24} />
          <div>
            <p className="font-semibold">Message Sent Successfully!</p>
            <p className="text-sm text-green-100">We'll get back to you soon.</p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-primary via-primary-dark to-[#152d47] rounded-3xl p-8 md:p-12 text-white overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <FiHeadphones size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Support & Help Center</h1>
          </div>
          <p className="text-blue-100 text-lg max-w-2xl">
            We're here to help! Get in touch with our support team or find answers to common questions.
          </p>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 text-center border border-gray-100 hover:border-primary/30 hover:-translate-y-1">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <FiPhone className="text-white" size={28} />
          </div>
          <h3 className="font-bold text-gray-800 mb-2 text-lg">Call Us</h3>
          <p className="text-primary font-semibold text-lg mb-2">+91 1800-XXX-XXXX</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <FiClock size={14} />
            <span>Mon-Sat, 9AM-6PM</span>
          </div>
          <button className="mt-4 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium">
            Call Now
          </button>
        </div>

        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 text-center border border-gray-100 hover:border-green-200 hover:-translate-y-1">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <FiMail className="text-white" size={28} />
          </div>
          <h3 className="font-bold text-gray-800 mb-2 text-lg">Email Us</h3>
          <p className="text-green-600 font-semibold mb-2">support@nexo.works</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <FiCheckCircle size={14} />
            <span>24/7 Support</span>
          </div>
          <button className="mt-4 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
            Send Email
          </button>
        </div>

        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 text-center border border-gray-100 hover:border-primary-light/30 hover:-translate-y-1">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-light to-primary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <FiMessageCircle className="text-white" size={28} />
          </div>
          <h3 className="font-bold text-gray-800 mb-2 text-lg">Live Chat</h3>
          <p className="text-primary-light font-semibold mb-2">Chat with us</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Available 24/7</span>
          </div>
          <button className="mt-4 px-4 py-2 bg-primary/10 text-primary-light rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium">
            Start Chat
          </button>
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-primary-light/10 p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <FiSend className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Send us a Message</h2>
              <p className="text-gray-600 text-sm mt-0.5">We typically respond within 24 hours</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
              rows="6"
              placeholder="Describe your issue or question in detail..."
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              Please provide as much detail as possible to help us assist you better.
            </p>
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl hover:from-primary-dark hover:to-primary disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Sending...
              </>
            ) : (
              <>
                <FiSend size={20} />
                Send Message
              </>
            )}
          </button>
        </form>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-primary-light/10 p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <FiHelpCircle className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Frequently Asked Questions</h2>
              <p className="text-gray-600 text-sm mt-0.5">Quick answers to common questions</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-3">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="border-2 border-gray-100 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-800 pr-4">{faq.question}</h3>
                <div className={`flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center transition-transform duration-300 ${expandedFaq === index ? 'rotate-180' : ''}`}>
                  <FiChevronDown className="text-primary" size={20} />
                </div>
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${expandedFaq === index ? 'max-h-96' : 'max-h-0'}`}>
                <div className="p-4 pt-0 text-gray-600 bg-gray-50">
                  <p className="leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-br from-primary via-primary-dark to-[#152d47] rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
            <FiCheckCircle size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Need Immediate Help?</h3>
            <p className="text-blue-100 mb-4">
              For urgent issues, please call our support hotline. We're available 24/7 to assist you with any emergency service needs.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-white text-primary rounded-lg hover:bg-blue-50 transition-colors font-medium">
                Call Support
              </button>
              <button className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors font-medium">
                View Help Center
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
