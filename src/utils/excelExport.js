import * as XLSX from 'xlsx'

/**
 * Export data to Excel file
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of column definitions with {header, accessor} or {header, key}
 * @param {String} filename - Name of the Excel file (without extension)
 * @param {String} sheetName - Name of the worksheet (default: 'Sheet1')
 * @param {Object} options - Additional options like column widths, date formatting, etc.
 */
export const exportToExcel = (data, columns, filename, sheetName = 'Sheet1', options = {}) => {
  if (!data || data.length === 0) {
    alert('No data to export')
    return
  }

  try {
    // Prepare data for Excel
    const excelData = data.map((row) => {
      const rowData = {}
      columns.forEach((column) => {
        const accessor = column.accessor || column.key
        let value = row[accessor]

        // Handle different value types
        if (value === null || value === undefined) {
          value = 'N/A'
        } else if (typeof value === 'object' && value !== null) {
          // Handle objects (like dates, nested objects)
          if (value instanceof Date) {
            value = value.toLocaleString('en-IN')
          } else {
            value = JSON.stringify(value)
          }
        } else if (typeof value === 'string' && value.includes('₹')) {
          // Extract numeric value from currency strings
          value = value.replace(/[₹,]/g, '')
        }

        // Use custom formatter if provided
        if (column.excelFormatter && typeof column.excelFormatter === 'function') {
          value = column.excelFormatter(value, row)
        }

        rowData[column.header] = value
      })
      return rowData
    })

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, sheetName)

    // Set column widths if provided
    if (options.columnWidths && Array.isArray(options.columnWidths)) {
      ws['!cols'] = options.columnWidths.map((width) => ({ wch: width }))
    } else {
      // Auto-size columns
      const maxWidth = 50
      ws['!cols'] = columns.map(() => ({ wch: maxWidth }))
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '_')
    const finalFilename = `${filename}_${timestamp}.xlsx`

    // Write file
    XLSX.writeFile(wb, finalFilename)
  } catch (error) {
    console.error('Excel export error:', error)
    alert('Failed to export data. Please try again.')
  }
}

/**
 * Export multiple sheets to Excel
 * @param {Array} sheets - Array of {name, data, columns} objects
 * @param {String} filename - Name of the Excel file
 */
export const exportMultipleSheets = (sheets, filename) => {
  if (!sheets || sheets.length === 0) {
    alert('No data to export')
    return
  }

  try {
    const wb = XLSX.utils.book_new()

    sheets.forEach((sheet) => {
      const { name, data, columns, columnWidths } = sheet

      if (!data || data.length === 0) {
        return
      }

      // Prepare data
      const excelData = data.map((row) => {
        const rowData = {}
        columns.forEach((column) => {
          const accessor = column.accessor || column.key
          let value = row[accessor]

          if (value === null || value === undefined) {
            value = 'N/A'
          } else if (typeof value === 'object' && value !== null) {
            if (value instanceof Date) {
              value = value.toLocaleString('en-IN')
            } else {
              value = JSON.stringify(value)
            }
          } else if (typeof value === 'string' && value.includes('₹')) {
            value = value.replace(/[₹,]/g, '')
          }

          if (column.excelFormatter && typeof column.excelFormatter === 'function') {
            value = column.excelFormatter(value, row)
          }

          rowData[column.header] = value
        })
        return rowData
      })

      const ws = XLSX.utils.json_to_sheet(excelData)

      // Set column widths
      if (columnWidths && Array.isArray(columnWidths)) {
        ws['!cols'] = columnWidths.map((width) => ({ wch: width }))
      }

      XLSX.utils.book_append_sheet(wb, ws, name)
    })

    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '_')
    const finalFilename = `${filename}_${timestamp}.xlsx`

    XLSX.writeFile(wb, finalFilename)
  } catch (error) {
    console.error('Excel export error:', error)
    alert('Failed to export data. Please try again.')
  }
}

