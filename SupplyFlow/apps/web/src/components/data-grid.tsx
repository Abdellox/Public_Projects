"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
  type SortingState
} from "@tanstack/react-table";
import { ArrowUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/client/cn";
import { StatusBadge, RiskDot, EmptyState, Spinner } from "@/components/ui";

export type GridType = "text" | "number" | "money" | "date" | "datetime" | "status" | "risk" | "select";

export interface GridColumn<T> {
  key: keyof T & string;
  label: string;
  type?: GridType;
  width?: number;
  editable?: boolean;
  options?: string[];
  pinned?: boolean;
  format?: (row: T) => React.ReactNode;
  getValue?: (row: T) => unknown;
}

interface DataGridProps<T extends { id: string }> {
  columns: GridColumn<T>[];
  data: T[];
  loading?: boolean;
  searchPlaceholder?: string;
  onUpdateCell?: (row: T, column: GridColumn<T>, value: string) => Promise<void>;
  onDeleteRow?: (row: T) => Promise<void>;
  onRowClick?: (row: T) => void;
  toolbar?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataGrid<T extends { id: string }>({
  columns,
  data,
  loading,
  searchPlaceholder = "Search…",
  onUpdateCell,
  onDeleteRow,
  onRowClick,
  toolbar,
  emptyTitle = "No records yet",
  emptyDescription
}: DataGridProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [editing, setEditing] = useState<{ rowId: string; colKey: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingCell, setSavingCell] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const columnHelper = createColumnHelper<T>();

  const tableColumns = useMemo<ColumnDef<T>[]>(
    () =>
      columns.map((col) =>
        columnHelper.accessor(col.getValue ?? ((row: T) => row[col.key as keyof T]), {
          id: col.key,
          header: col.label,
          size: col.width ?? 160,
          enableSorting: true,
          cell: (info) => {
            const row = info.row.original;
            if (col.format) return <>{col.format(row)}</>;
            return renderCellContent(row, col);
          }
        })
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columns]
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString"
  });

  const startEdit = useCallback(
    (row: T, col: GridColumn<T>) => {
      if (!col.editable || !onUpdateCell) return;
      const current = (row[col.key as keyof T] as unknown) ?? "";
      setEditValue(String(current));
      setEditing({ rowId: row.id, colKey: col.key });
    },
    [onUpdateCell]
  );

  const commitEdit = useCallback(
    async (row: T, col: GridColumn<T>) => {
      if (!editing || !onUpdateCell) return;
      setEditing(null);
      const original = String((row[col.key as keyof T] as unknown) ?? "");
      if (editValue === original) return;
      setSavingCell(`${editing.rowId}:${editing.colKey}`);
      try {
        await onUpdateCell(row, col, editValue);
      } finally {
        setSavingCell(null);
      }
    },
    [editing, editValue, onUpdateCell]
  );

  function handleCellKeyDown(e: React.KeyboardEvent, row: T, col: GridColumn<T>) {
    const cell = (e.currentTarget as HTMLElement).closest("[data-cell]") as HTMLElement;
    if (e.key === "Enter") {
      e.preventDefault();
      if (editing?.rowId === row.id && editing.colKey === col.key) {
        void commitEdit(row, col);
      } else {
        startEdit(row, col);
      }
    } else if (e.key === "Escape" && editing?.rowId === row.id && editing.colKey === col.key) {
      setEditing(null);
    } else if (e.key === "Tab" || ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      if (editing) return;
      e.preventDefault();
      moveFocus(cell, e.key);
    }
  }

  function moveFocus(current: HTMLElement | null, key: string) {
    if (!current) return;
    const cells = Array.from(gridRef.current?.querySelectorAll<HTMLElement>("[data-cell]") ?? []);
    const idx = cells.indexOf(current);
    const colsCount = table.getVisibleFlatColumns().length;
    let next = idx;
    if (key === "ArrowRight" || key === "Tab") next = idx + 1;
    else if (key === "ArrowLeft") next = idx - 1;
    else if (key === "ArrowDown") next = idx + colsCount;
    else if (key === "ArrowUp") next = idx - colsCount;
    cells[next]?.focus();
  }

  const rows = table.getRowModel().rows;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="h-6 w-6 text-brand-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-ink-100 bg-white">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-400" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-8 w-full rounded-md border border-ink-200 bg-white pl-8 pr-7 text-[13px] sf-focus-ring"
          />
          {globalFilter ? (
            <button onClick={() => setGlobalFilter("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600">
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
        <span className="text-[12px] text-ink-400">
          {rows.length} row{rows.length === 1 ? "" : "s"}
        </span>
        <div className="ml-auto flex items-center gap-2">{toolbar}</div>
      </div>

      {rows.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div ref={gridRef} className="flex-1 overflow-auto bg-white">
          <table className="w-full border-separate border-spacing-0 text-[13px]" style={{ minWidth: columns.reduce((a, c) => a + (c.width ?? 160), 60) }}>
            <thead className="sticky top-0 z-10">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => {
                    const col = columns.find((c) => c.key === header.column.id)!;
                    return (
                      <th
                        key={header.id}
                        style={{ width: header.getSize(), minWidth: header.getSize() }}
                        className={cn(
                          "border-b border-ink-200 bg-ink-50 px-3 py-2 text-left font-medium text-[11px] uppercase tracking-wide text-ink-500 select-none",
                          col.pinned && "sticky left-0 z-20"
                        )}
                      >
                        <button
                          className="inline-flex items-center gap-1 hover:text-ink-800 sf-focus-ring rounded"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <ArrowUpDown className={cn("h-3 w-3 transition-opacity", header.column.getIsSorted() ? "opacity-70" : "opacity-25")} />
                          {{ asc: "↑", desc: "↓" }[header.column.getIsSorted() as string] ?? ""}
                        </button>
                      </th>
                    );
                  })}
                  {onDeleteRow ? (
                    <th style={{ width: 44 }} className="border-b border-ink-200 bg-ink-50" aria-label="actions" />
                  ) : null}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="group hover:bg-brand-50/40">
                  {row.getVisibleCells().map((cell) => {
                    const col = columns.find((c) => c.key === cell.column.id)!;
                    const isEditing = editing?.rowId === row.original.id && editing.colKey === col.key;
                    const isSaving = savingCell === `${row.original.id}:${col.key}`;
                    return (
                      <td
                        key={cell.id}
                        data-cell
                        tabIndex={0}
                        onDoubleClick={() => startEdit(row.original, col)}
                        onKeyDown={(e) => handleCellKeyDown(e, row.original, col)}
                        onClick={() => col.editable ? undefined : onRowClick?.(row.original)}
                        className={cn(
                          "relative border-b border-ink-100 px-3 py-1.5 h-[34px] max-w-[320px] truncate outline-none",
                          "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500",
                          col.pinned && "sticky left-0 bg-white group-hover:bg-brand-50/80 z-[5]",
                          col.editable && "cursor-cell",
                          !col.editable && onRowClick && "cursor-pointer"
                        )}
                      >
                        {isEditing ? (
                          col.type === "select" && col.options ? (
                            <select
                              autoFocus
                              defaultValue={String((row.original[col.key as keyof T] as unknown) ?? "")}
                              onChange={(e) => {
                                setEditValue(e.target.value);
                                void (async () => {
                                  setEditing(null);
                                  setSavingCell(cell.id);
                                  try { await onUpdateCell!(row.original, col, e.target.value); } finally { setSavingCell(null); }
                                })();
                              }}
                              onBlur={() => setEditing(null)}
                              className="sf-cell-input"
                            >
                              {col.options.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
                            </select>
                          ) : (
                            <input
                              autoFocus
                              type={col.type === "date" ? "date" : col.type === "number" || col.type === "money" ? "number" : "text"}
                              value={editValue}
                              step="any"
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => void commitEdit(row.original, col)}
                              className="sf-cell-input"
                            />
                          )
                        ) : (
                          <>
                            {isSaving ? <Spinner className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3" /> : null}
                            {col.format ? col.format(row.original) : renderCellContent(row.original, col)}
                          </>
                        )}
                      </td>
                    );
                  })}
                  {onDeleteRow ? (
                    <td className="border-b border-ink-100 px-2 text-center">
                      <button
                        onClick={() => onDeleteRow(row.original)}
                        title="Delete"
                        className="opacity-0 group-hover:opacity-100 text-ink-300 hover:text-red-600 transition-opacity sf-focus-ring rounded"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function renderCellContent<T extends { id: string }>(row: T, col: GridColumn<T>): React.ReactNode {
  const raw = row[col.key as keyof T];
  switch (col.type) {
    case "status":
      return raw ? <StatusBadge value={String(raw)} /> : null;
    case "risk":
      return raw ? (
        <span className="capitalize inline-flex items-center whitespace-nowrap">
          <RiskDot risk={String(raw)} /> {String(raw).replace(/_/g, " ")}
        </span>
      ) : null;
    case "money": {
      const n = typeof raw === "string" ? parseFloat(raw) : raw as number | null;
      if (n === null || n === undefined || Number.isNaN(n)) return <span className="text-ink-300">—</span>;
      return <span className="tabular-nums">${n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}</span>;
    }
    case "number":
      if (raw === null || raw === undefined || raw === "") return <span className="text-ink-300">—</span>;
      return <span className="tabular-nums">{Number(raw).toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>;
    case "date":
      if (!raw) return <span className="text-ink-300">—</span>;
      return new Date(String(raw)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    case "datetime":
      if (!raw) return <span className="text-ink-300">—</span>;
      return new Date(String(raw)).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    default:
      if (raw === null || raw === undefined || raw === "") return <span className="text-ink-300">—</span>;
      return <span className="truncate block">{String(raw)}</span>;
  }
}
