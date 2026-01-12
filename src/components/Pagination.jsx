import React from 'react'
import { FiChevronLeft, FiChevronRight, FiMoreHorizontal } from 'react-icons/fi'

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage,
  onPageChange,
  showInfo = true,
  showJumpToPage = false,
  maxVisiblePages = 5,
  className = ""
}) => {
  // Don't render if there's only one page or no items
  if (totalPages <= 1) return null

  // Generate page numbers to display
  const generatePageNumbers = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const half = Math.floor(maxVisiblePages / 2)
    let start = Math.max(1, currentPage - half)
    let end = Math.min(totalPages, start + maxVisiblePages - 1)

    // Adjust start if we're near the end
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1)
    }

    const pages = []
    
    // Add first page and ellipsis if needed
    if (start > 1) {
      pages.push(1)
      if (start > 2) {
        pages.push('...')
      }
    }

    // Add visible pages
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // Add ellipsis and last page if needed
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('...')
      }
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = generatePageNumbers()
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page)
    }
  }

  const handleJumpToPage = (e) => {
    e.preventDefault()
    const page = parseInt(e.target.jumpPage.value)
    if (page >= 1 && page <= totalPages) {
      handlePageChange(page)
      e.target.reset()
    }
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Info Section */}
      {showInfo && (
        <div className="text-sm text-slate-600 order-2 sm:order-1">
          Showing {startItem} to {endItem} of {totalItems.toLocaleString()} results
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center gap-2 order-1 sm:order-2">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Previous page"
        >
          <FiChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="flex items-center justify-center w-10 h-10 text-slate-400">
                  <FiMoreHorizontal className="w-4 h-4" />
                </span>
              ) : (
                <button
                  onClick={() => handlePageChange(page)}
                  className={`flex items-center justify-center w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                    page === currentPage
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50'
                  }`}
                  title={`Go to page ${page}`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <FiChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Jump to Page */}
      {showJumpToPage && totalPages > 10 && (
        <form onSubmit={handleJumpToPage} className="flex items-center gap-2 order-3">
          <span className="text-sm text-slate-600">Go to:</span>
          <input
            type="number"
            name="jumpPage"
            min="1"
            max={totalPages}
            placeholder="Page"
            className="w-16 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            type="submit"
            className="px-3 py-1 text-sm font-medium text-white bg-primary rounded hover:bg-primary-dark transition-colors"
          >
            Go
          </button>
        </form>
      )}
    </div>
  )
}

// Compact version for smaller spaces
export const CompactPagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = ""
}) => {
  if (totalPages <= 1) return null

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Previous page"
      >
        <FiChevronLeft className="w-4 h-4" />
      </button>
      
      <span className="px-3 py-2 text-sm text-slate-600 bg-slate-50 rounded-lg">
        {currentPage} of {totalPages}
      </span>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Next page"
      >
        <FiChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

// Simple pagination with just prev/next
export const SimplePagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  showPageInfo = true,
  className = ""
}) => {
  if (totalPages <= 1) return null

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <FiChevronLeft className="w-4 h-4" />
        Previous
      </button>
      
      {showPageInfo && (
        <span className="text-sm text-slate-600">
          Page {currentPage} of {totalPages}
        </span>
      )}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
        <FiChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

export default Pagination