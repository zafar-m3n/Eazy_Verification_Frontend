function Table({ columns = [], data = [], renderCell, emptyMessage = "No records found.", className = "" }) {
  return (
    <div className={`w-full ${className}`}>
      <div className="hidden overflow-x-auto rounded-2xl border border-border bg-card shadow-sm md:block">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-background">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text/70"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-text/60">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={row.id || rowIndex} className={rowIndex % 2 === 0 ? "bg-card" : "bg-background"}>
                  {columns.map((column) => (
                    <td key={column.key} className="whitespace-nowrap px-4 py-4 text-sm text-text">
                      {renderCell ? renderCell(row, column) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 md:hidden">
        {data.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-5 text-center text-sm text-text/60 shadow-sm">
            {emptyMessage}
          </div>
        ) : (
          data.map((row, rowIndex) => (
            <div
              key={row.id || rowIndex}
              className="divide-y divide-border rounded-2xl border border-border bg-card shadow-sm"
            >
              {columns.map((column) => (
                <div key={column.key} className="flex items-start justify-between gap-4 px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text/60">{column.label}</span>

                  <span className="max-w-[60%] truncate text-right text-sm text-text">
                    {renderCell ? renderCell(row, column) : row[column.key]}
                  </span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Table;
