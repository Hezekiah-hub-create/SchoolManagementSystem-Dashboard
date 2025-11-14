"use client";

import { useState } from "react";
import Image from "next/image";

type SortOptions = {
  key: string;
  order: "asc" | "desc";
};

const FilterSort = ({
  onFilter,
  onSort,
  filterPlaceholder = "Filter...",
  sortKeys = [],
}: {
  onFilter: (query: string) => void;
  onSort: (opts: SortOptions) => void;
  filterPlaceholder?: string;
  sortKeys?: string[];
}) => {
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState(sortKeys[0] || "");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const applyFilter = () => {
    onFilter(query.trim());
    setShowFilter(false);
  };

  const resetFilter = () => {
    setQuery("");
    onFilter("");
    setShowFilter(false);
  };

  const applySort = () => {
    if (sortKey) onSort({ key: sortKey, order });
    setShowSort(false);
  };

  return (
    <div className="relative flex items-center">
      <div className="relative">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full bg-ZekPurple"
          onClick={() => {
            setShowFilter((s) => !s);
            setShowSort(false);
          }}
        >
          <Image src="/filter.png" alt="filter" width={14} height={14} />
        </button>
        {showFilter && (
          <div className="absolute right-0 mt-2 w-64 bg-white shadow-md rounded-md p-3 z-50">
            <input
              className="w-full p-2 ring-1 ring-gray-200 rounded-md text-sm"
              placeholder={filterPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                className="px-3 py-1 rounded-md bg-slate-100 text-sm"
                onClick={resetFilter}
                type="button"
              >
                Reset
              </button>
              <button
                className="px-3 py-1 rounded-md bg-ZekPurple text-white text-sm"
                onClick={applyFilter}
                type="button"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="relative ml-2">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full bg-ZekPurple"
          onClick={() => {
            setShowSort((s) => !s);
            setShowFilter(false);
          }}
        >
          <Image src="/sort.png" alt="sort" width={14} height={14} />
        </button>
        {showSort && (
          <div className="absolute right-0 mt-2 w-64 bg-white shadow-md rounded-md p-3 z-50">
            <label className="text-xs text-gray-500">Sort by</label>
            <select
              className="w-full p-2 ring-1 ring-gray-200 rounded-md text-sm mt-1"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
            >
              <option value="">Select</option>
              {sortKeys.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-xs">Order</label>
                <button
                  className={`px-2 py-1 rounded-md text-sm ${order === "asc" ? "bg-ZekPurple text-white" : "bg-slate-100"}`}
                  onClick={() => setOrder("asc")}
                  type="button"
                >
                  Asc
                </button>
                <button
                  className={`px-2 py-1 rounded-md text-sm ${order === "desc" ? "bg-ZekPurple text-white" : "bg-slate-100"}`}
                  onClick={() => setOrder("desc")}
                  type="button"
                >
                  Desc
                </button>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded-md bg-slate-100 text-sm" onClick={() => setShowSort(false)} type="button">
                  Cancel
                </button>
                <button className="px-3 py-1 rounded-md bg-ZekPurple text-white text-sm" onClick={applySort} type="button">
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSort;
