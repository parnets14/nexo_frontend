import React from 'react'

const DataTable = ({ columns, data, emptyLabel = 'No records found', renderActions }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key ?? column.accessor}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  {column.header}
                </th>
              ))}
              {renderActions && (
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (renderActions ? 1 : 0)}
                  className="px-4 py-6 text-center text-sm text-slate-400"
                >
                  {emptyLabel}
                </td>
              </tr>
            )}
            {data.map((row, index) => (
              <tr key={row.id ?? row._id ?? `row-${index}`}>
                {columns.map((column) => (
                  <td key={column.key ?? column.accessor} className="px-4 py-4 text-sm text-slate-700">
                    {typeof column.render === 'function'
                      ? column.render(row[column.accessor], row)
                      : row[column.accessor]}
                  </td>
                ))}
                {renderActions && (
                  <td className="px-4 py-4 text-sm text-slate-500">{renderActions(row)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable


