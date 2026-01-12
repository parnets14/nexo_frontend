import React from 'react'
import { FiList } from 'react-icons/fi'

const PaginationControls = ({ 
  itemsPerPage, 
  onItemsPerPageChange, 
  totalItems,
  options = [10, 20, 50, 100],
  className = ""
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <FiList className="w-4 h-4" />
        <span>Show:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
          className="px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {options.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span>per page</span>
      </div>
      
      {totalItems > 0 && (
        <div className="text-sm text-slate-500">
          ({totalItems.toLocaleString()} total)
        </div>
      )}
    </div>
  )
}

export default PaginationControls