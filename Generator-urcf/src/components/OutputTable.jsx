import React from 'react'
import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table'
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ChevronDown as Expand, ChevronUp as Collapse,
  Search,
} from 'lucide-react'

function ExpandedRow({ row }) {
  return (
    <div className="grid grid-cols-3 gap-4 p-4 text-xs">
      <div>
        <p className="font-semibold text-violet-400 mb-1.5 uppercase tracking-wide text-[10px]">Control Requirements</p>
        <p className="dark:text-slate-300 text-slate-600 whitespace-pre-line leading-relaxed">{row.controlRequirements || '—'}</p>
      </div>
      <div>
        <p className="font-semibold text-cyan-400 mb-1.5 uppercase tracking-wide text-[10px]">Test Procedures</p>
        <p className="dark:text-slate-300 text-slate-600 whitespace-pre-line leading-relaxed">{row.testProcedures || '—'}</p>
      </div>
      <div>
        <p className="font-semibold text-amber-400 mb-1.5 uppercase tracking-wide text-[10px]">Risk Narratives</p>
        <p className="dark:text-slate-300 text-slate-600 whitespace-pre-line leading-relaxed">{row.riskNarratives || '—'}</p>
      </div>
    </div>
  )
}

function FilterSelect({ column, label }) {
  const uniqueValues = useMemo(() => {
    const vals = new Set()
    column.getFacetedRowModel?.()?.rows?.forEach(row => {
      vals.add(row.getValue(column.id))
    })
    return [...vals].filter(Boolean).sort()
  }, [column])

  return (
    <select
      value={column.getFilterValue() ?? ''}
      onChange={e => column.setFilterValue(e.target.value || undefined)}
      className="w-full mt-1 px-2 py-1 rounded-md text-[10px] dark:bg-[#07090f] bg-white dark:border-[#2a3347] border-slate-200 border dark:text-slate-300 text-slate-600 outline-none"
    >
      <option value="">All {label}</option>
      {uniqueValues.map(v => (
        <option key={v} value={v}>{v}</option>
      ))}
    </select>
  )
}

export default function OutputTable({ rows, frameworks, allFrameworks }) {
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [pageSize, setPageSize] = useState(20)

  const toggleExpand = (rowId) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      next.has(rowId) ? next.delete(rowId) : next.add(rowId)
      return next
    })
  }

  const columns = useMemo(() => [
    {
      id: 'rowNum',
      header: '#',
      size: 48,
      minSize: 48,
      maxSize: 48,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-xs dark:text-slate-500 text-slate-400 font-mono">
          {row.index + 1}
        </span>
      ),
    },
    {
      accessorKey: 'mainCategory',
      header: 'Main Category',
      size: 160,
      minSize: 120,
      enableColumnFilter: true,
      cell: ({ getValue }) => (
        <span className="text-xs font-medium dark:text-slate-200 text-slate-700 leading-snug">
          {getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'subCategory',
      header: 'Sub-category',
      size: 180,
      minSize: 140,
      enableColumnFilter: true,
      cell: ({ getValue }) => (
        <span className="text-xs dark:text-slate-300 text-slate-600 leading-snug">
          {getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'theme',
      header: 'Theme',
      size: 200,
      minSize: 160,
      enableColumnFilter: false,
      cell: ({ getValue }) => (
        <span className="text-xs font-medium dark:text-violet-300 text-violet-700 leading-snug">
          {getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'controlRequirements',
      header: 'Control Requirements',
      size: 280,
      minSize: 200,
      enableSorting: false,
      cell: ({ getValue }) => (
        <p className="text-xs dark:text-slate-300 text-slate-600 leading-relaxed cell-clamp whitespace-pre-line">
          {getValue() || <span className="dark:text-slate-600 text-slate-400 italic">Pending…</span>}
        </p>
      ),
    },
    {
      accessorKey: 'testProcedures',
      header: 'Test Procedures',
      size: 250,
      minSize: 180,
      enableSorting: false,
      cell: ({ getValue }) => (
        <p className="text-xs dark:text-slate-300 text-slate-600 leading-relaxed cell-clamp whitespace-pre-line">
          {getValue() || <span className="dark:text-slate-600 text-slate-400 italic">Pending…</span>}
        </p>
      ),
    },
    {
      accessorKey: 'riskNarratives',
      header: 'Risk Narratives',
      size: 220,
      minSize: 160,
      enableSorting: false,
      cell: ({ getValue }) => (
        <p className="text-xs dark:text-slate-300 text-slate-600 leading-relaxed cell-clamp whitespace-pre-line">
          {getValue() || <span className="dark:text-slate-600 text-slate-400 italic">Pending…</span>}
        </p>
      ),
    },
    ...frameworks.map(fw => ({
      id: fw,
      accessorFn: row => row.frameworkSections?.[fw] || '',
      header: fw,
      size: 140,
      minSize: 100,
      enableSorting: false,
      cell: ({ getValue }) => {
        const val = getValue()
        if (!val) return <span className="text-xs dark:text-slate-600 text-slate-300">—</span>
        return (
          <div className="flex flex-col gap-0.5">
            {val.split('\n').map((v, i) => (
              <span key={i} className="text-[11px] font-mono dark:text-cyan-300 text-cyan-700 bg-cyan-500/10 px-1.5 py-0.5 rounded border dark:border-cyan-800/30 border-cyan-200 leading-snug">
                {v}
              </span>
            ))}
          </div>
        )
      },
    })),
    {
      id: 'expand',
      header: '',
      size: 36,
      minSize: 36,
      maxSize: 36,
      enableSorting: false,
      cell: ({ row }) => {
        const isExp = expandedRows.has(row.id)
        return (
          <button
            onClick={() => toggleExpand(row.id)}
            className="w-6 h-6 rounded flex items-center justify-center dark:hover:bg-[#1f2535] hover:bg-slate-100 dark:text-slate-500 text-slate-400 dark:hover:text-violet-400 hover:text-violet-500 transition-colors"
          >
            {isExp ? <Collapse size={14} /> : <Expand size={14} />}
          </button>
        )
      },
    },
  ], [frameworks, expandedRows])

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, columnFilters, globalFilter, pagination: { pageIndex: 0, pageSize } },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    columnResizeMode: 'onChange',
    manualPagination: false,
  })

  const { pageIndex } = table.getState().pagination

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-slate-500 text-slate-400" />
          <input
            type="text"
            placeholder="Search all columns…"
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-lg dark:bg-[#141820] bg-white dark:border-[#2a3347] border-slate-200 border dark:text-slate-300 text-slate-700 dark:placeholder-slate-600 placeholder-slate-400 outline-none dark:focus:border-violet-500 focus:border-violet-400 transition-colors"
          />
        </div>

        {/* Category filter */}
        {table.getColumn('mainCategory') && (
          <div className="min-w-[160px]">
            <FilterSelect
              column={table.getColumn('mainCategory')}
              label="Category"
            />
          </div>
        )}
        {table.getColumn('subCategory') && (
          <div className="min-w-[180px]">
            <FilterSelect
              column={table.getColumn('subCategory')}
              label="Sub-category"
            />
          </div>
        )}

        <span className="text-xs dark:text-slate-500 text-slate-400 ml-auto whitespace-nowrap">
          {table.getFilteredRowModel().rows.length} rows
        </span>
      </div>

      {/* Table container */}
      <div className="flex-1 overflow-auto rounded-xl border dark:border-[#1f2535] border-slate-200 min-h-0">
        <table className="w-full border-collapse" style={{ tableLayout: 'fixed', minWidth: `${columns.reduce((s, c) => s + (c.size || 150), 0)}px` }}>
          <thead className="sticky top-0 z-20">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, colIdx) => {
                  const isSticky = colIdx < 4
                  const stickyLeft = isSticky
                    ? headerGroup.headers.slice(0, colIdx).reduce((s, h) => s + h.getSize(), 0)
                    : undefined

                  const isFramework = colIdx >= 7 && colIdx < columns.length - 1
                  const bgClass = isFramework
                    ? 'dark:bg-[#0f1729] bg-slate-700'
                    : colIdx >= 4 && colIdx < 7
                      ? 'dark:bg-[#0d1a30] bg-slate-800'
                      : 'dark:bg-[#0e1520] bg-slate-900'

                  return (
                    <th
                      key={header.id}
                      className={`
                        relative px-3 py-2.5 text-left border-b dark:border-[#1f2535] border-slate-700
                        ${bgClass}
                        ${isSticky ? 'sticky z-30' : ''}
                        ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                      `}
                      style={{
                        width: header.getSize(),
                        minWidth: header.column.columnDef.minSize,
                        ...(isSticky ? { left: stickyLeft } : {}),
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-white uppercase tracking-wide truncate">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {header.column.getCanSort() && (
                          <span className="text-slate-500 shrink-0">
                            {header.column.getIsSorted() === 'asc' ? <ChevronUp size={12} /> :
                             header.column.getIsSorted() === 'desc' ? <ChevronDown size={12} /> :
                             <ChevronsUpDown size={12} />}
                          </span>
                        )}
                      </div>
                      {/* Column filter for main/sub category */}
                      {header.column.getCanFilter() && (
                        <select
                          value={header.column.getFilterValue() ?? ''}
                          onChange={e => header.column.setFilterValue(e.target.value || undefined)}
                          onClick={e => e.stopPropagation()}
                          className="w-full mt-1 px-1.5 py-0.5 rounded text-[10px] bg-black/30 border border-white/10 text-slate-300 outline-none"
                        >
                          <option value="">All</option>
                          {[...new Set(rows.map(r => r[header.column.id]))].filter(Boolean).sort().map(v => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      )}
                      {/* Resize handle */}
                      <div
                        className={`resizer ${header.column.getIsResizing() ? 'isResizing' : 'dark:hover:bg-violet-600 hover:bg-violet-400'}`}
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        onClick={e => e.stopPropagation()}
                      />
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, rowIdx) => {
              const isExpanded = expandedRows.has(row.id)
              const isEven = rowIdx % 2 === 0
              const rowBg = isEven
                ? 'dark:bg-[#0e1119] bg-white'
                : 'dark:bg-[#111620] bg-slate-50/70'

              return (
                <React.Fragment key={row.id}>
                  <tr
                    className={`${rowBg} dark:hover:bg-[#141c2d] hover:bg-slate-100/80 transition-colors`}
                  >
                    {row.getVisibleCells().map((cell, colIdx) => {
                      const isSticky = colIdx < 4
                      const stickyLeft = isSticky
                        ? row.getVisibleCells().slice(0, colIdx).reduce((s, c) => s + c.column.getSize(), 0)
                        : undefined
                      return (
                        <td
                          key={cell.id}
                          className={`
                            px-3 py-2.5 border-b dark:border-[#1a2030] border-slate-100 align-top
                            ${rowBg}
                            ${isSticky ? 'sticky z-10' : ''}
                          `}
                          style={{
                            width: cell.column.getSize(),
                            ...(isSticky ? { left: stickyLeft } : {}),
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      )
                    })}
                  </tr>
                  {isExpanded && (
                    <tr className={`${rowBg} row-expand`}>
                      <td
                        colSpan={columns.length}
                        className="border-b dark:border-[#1a2030] border-slate-100 dark:bg-[#0a1020] bg-violet-50/50"
                      >
                        <ExpandedRow row={row.original} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center text-sm dark:text-slate-500 text-slate-400">
                  No data to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs dark:text-slate-500 text-slate-400">Rows per page:</span>
          <select
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); table.setPageSize(Number(e.target.value)) }}
            className="px-2 py-1 text-xs rounded dark:bg-[#141820] bg-white dark:border-[#2a3347] border-slate-200 border dark:text-slate-300 text-slate-600 outline-none"
          >
            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} className="p-1.5 rounded dark:hover:bg-[#1f2535] hover:bg-slate-100 dark:text-slate-400 text-slate-500 disabled:opacity-30 transition-colors"><ChevronsLeft size={14} /></button>
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="p-1.5 rounded dark:hover:bg-[#1f2535] hover:bg-slate-100 dark:text-slate-400 text-slate-500 disabled:opacity-30 transition-colors"><ChevronLeft size={14} /></button>
          <span className="text-xs dark:text-slate-400 text-slate-500 px-2">
            Page {pageIndex + 1} of {table.getPageCount() || 1}
          </span>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="p-1.5 rounded dark:hover:bg-[#1f2535] hover:bg-slate-100 dark:text-slate-400 text-slate-500 disabled:opacity-30 transition-colors"><ChevronRight size={14} /></button>
          <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} className="p-1.5 rounded dark:hover:bg-[#1f2535] hover:bg-slate-100 dark:text-slate-400 text-slate-500 disabled:opacity-30 transition-colors"><ChevronsRight size={14} /></button>
        </div>
      </div>
    </div>
  )
}
