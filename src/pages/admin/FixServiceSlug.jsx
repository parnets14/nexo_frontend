import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FixServiceSlug = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const fixSlug = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/migration/fix-preventive-maintenance-slug`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.message || 'Failed to fix slug');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Fix Service Slug
          </h1>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Preventive Maintenance Service - Slug Issue
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p className="mb-2">Current situation:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Frontend expects: <code className="bg-yellow-100 px-1 rounded">preventive-maintenance-services-ac</code></li>
                    <li>Database has: <code className="bg-yellow-100 px-1 rounded">preventive-maintenance-services</code></li>
                    <li>Result: 404 Not Found</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              What this will do:
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Find the "Preventive Maintenance Services" in the database</li>
              <li>Update its slug from <code className="bg-gray-100 px-1 rounded">preventive-maintenance-services</code> to <code className="bg-gray-100 px-1 rounded">preventive-maintenance-services-ac</code></li>
              <li>Make the service accessible at the correct URL</li>
            </ul>
          </div>

          <button
            onClick={fixSlug}
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Fixing...
              </span>
            ) : (
              'Fix Slug Now'
            )}
          </button>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-green-50 border-l-4 border-green-400 p-4"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Success! Slug Fixed
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p className="mb-2">Service: {result.data?.serviceName}</p>
                    <p className="mb-2">Old slug: <code className="bg-green-100 px-1 rounded">{result.data?.oldSlug}</code></p>
                    <p className="mb-2">New slug: <code className="bg-green-100 px-1 rounded">{result.data?.newSlug}</code></p>
                    <p className="mt-4 font-semibold">The service is now accessible at:</p>
                    <a 
                      href={`/service/${result.data?.newSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      /service/{result.data?.newSlug}
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-red-50 border-l-4 border-red-400 p-4"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default FixServiceSlug;
