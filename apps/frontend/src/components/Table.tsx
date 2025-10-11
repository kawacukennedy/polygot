import React, { useState } from 'react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
}

interface TableProps {
  columns: Column[];
  data: any[];
  sortable?: boolean;
  paginated?: boolean;
}

const Table: React.FC<TableProps> = ({ columns, data, sortable = false, paginated = false }) => {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortedData = React.useMemo(() => {
    if (!sortKey || !sortable) return data;
    return [...data].sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return sortOrder === 'asc' ? -1 : 1;
      if (a[sortKey] > b[sortKey]) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortOrder, sortable]);

  const paginatedData = React.useMemo(() => {
    if (!paginated) return sortedData;
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, paginated]);

  const handleSort = (key: string) => {
    if (!sortable) return;
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`p-2 text-left border-b ${col.sortable ? 'cursor-pointer' : ''}`}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                {col.label} {sortKey === col.key && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, index) => (
            <tr key={index}>
              {columns.map((col) => (
                <td key={col.key} className="p-2 border-b">
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {paginated && (
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>Page {currentPage}</span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={paginatedData.length < itemsPerPage}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Table;