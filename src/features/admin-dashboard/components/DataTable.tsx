import React from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export default function DataTable<T>({ 
  columns, 
  data, 
  isLoading, 
  onRowClick,
  emptyMessage = "Không có dữ liệu hiển thị." 
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-tiktok-surface/50 rounded-2xl border border-tiktok-border border-dashed">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-tiktok-cyan/20 border-t-tiktok-cyan rounded-full animate-spin" />
          <span className="text-gray-500 text-sm">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-tiktok-border bg-tiktok-surface shadow-xl shadow-black/20">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-tiktok-border">
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-tiktok-border">
            {data.length > 0 ? (
              data.map((item, rowIdx) => (
                <tr 
                  key={rowIdx}
                  onClick={() => onRowClick?.(item)}
                  className={`
                    transition-colors group
                    ${onRowClick ? 'cursor-pointer hover:bg-white/[0.03]' : ''}
                  `}
                >
                  {columns.map((col, colIdx) => (
                    <td 
                      key={colIdx} 
                      className={`px-6 py-4 text-sm text-gray-300 ${col.className || ''}`}
                    >
                      {typeof col.accessor === 'function' 
                        ? col.accessor(item) 
                        : (item[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500 italic">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Table Footer / Pagination Placeholder */}
      <div className="px-6 py-4 bg-white/[0.02] border-t border-tiktok-border flex items-center justify-between">
        <p className="text-xs text-gray-500">Hiển thị {data.length} hàng dữ liệu</p>
        <div className="flex items-center gap-2">
          {/* Pagination buttons could go here */}
        </div>
      </div>
    </div>
  );
}
