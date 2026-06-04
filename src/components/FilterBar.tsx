"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface FilterOption {
  label: string;
  value: number | string;
}

interface FilterBarProps {
  filterTime: number[];
  filterPrice: number[];
  filterParty: number[];
  filterEnv: string[];
  onFilterChange: (filters: {
    filter_time?: number[];
    filter_price?: number[];
    filter_party?: number[];
    filter_env?: string[];
  }) => void;
}

const TIME_OPTIONS: FilterOption[] = [
  { label: "Under 1 hour", value: 1 },
  { label: "1-3 hours", value: 3 },
  { label: "3+ hours", value: 99 },
];

const PRICE_OPTIONS: FilterOption[] = [
  { label: "Free", value: 0 },
  { label: "Under $20", value: 20 },
  { label: "$20+", value: 99 },
];

const PARTY_OPTIONS: FilterOption[] = [
  { label: "Solo", value: 1 },
  { label: "2 people", value: 2 },
  { label: "3+", value: 3 },
];

const ENV_OPTIONS: FilterOption[] = [
  { label: "Indoor", value: "indoor" },
  { label: "Outdoor", value: "outdoor" },
];

function FilterDropdown({
  options,
  selected,
  onToggle,
  anchorRect,
  onClose,
}: {
  options: FilterOption[];
  selected: (number | string)[];
  onToggle: (value: number | string) => void;
  anchorRect: DOMRect;
  onClose: () => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    // Use setTimeout so the opening click doesn't immediately close it
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClick);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        top: anchorRect.bottom + 8,
        left: anchorRect.left,
        backgroundColor: "#FFFFFF",
        borderRadius: "0.5rem",
        boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
        border: "1px solid #E8E4DE",
        padding: "0.375rem",
        zIndex: 99999,
        minWidth: "170px",
      }}
    >
      {options.map((opt) => {
        const isSelected = selected.some(
          (s) => String(s) === String(opt.value)
        );
        return (
          <button
            key={String(opt.value)}
            onClick={() => onToggle(opt.value)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "0.625rem 0.75rem",
              fontSize: "0.875rem",
              borderRadius: "0.375rem",
              border: "none",
              cursor: "pointer",
              backgroundColor: isSelected
                ? "rgba(196,151,59,0.12)"
                : "transparent",
              color: isSelected ? "#C4973B" : "#2A2A2A",
              fontWeight: isSelected ? 600 : 400,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>,
    document.body
  );
}

export default function FilterBar({
  filterTime,
  filterPrice,
  filterParty,
  filterEnv,
  onFilterChange,
}: FilterBarProps) {
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const toggleFilter = useCallback(
    (
      key: "filter_time" | "filter_price" | "filter_party" | "filter_env",
      value: number | string,
      current: (number | string)[]
    ) => {
      const exists = current.some((v) => String(v) === String(value));
      const next = exists
        ? current.filter((v) => String(v) !== String(value))
        : [...current, value];
      onFilterChange({ [key]: next });
    },
    [onFilterChange]
  );

  const handleChipClick = (key: string) => {
    if (openFilter === key) {
      setOpenFilter(null);
      setAnchorRect(null);
    } else {
      const el = chipRefs.current[key];
      if (el) {
        setAnchorRect(el.getBoundingClientRect());
      }
      setOpenFilter(key);
    }
  };

  const filters = [
    { key: "time", label: "TIME", options: TIME_OPTIONS, selected: filterTime, filterKey: "filter_time" as const },
    { key: "price", label: "PRICE", options: PRICE_OPTIONS, selected: filterPrice, filterKey: "filter_price" as const },
    { key: "party", label: "PARTYSIZE", options: PARTY_OPTIONS, selected: filterParty, filterKey: "filter_party" as const },
    { key: "env", label: "ENVIRONMENT", options: ENV_OPTIONS, selected: filterEnv, filterKey: "filter_env" as const },
  ];

  const activeFilter = filters.find((f) => f.key === openFilter);

  return (
    <>
      <div
        style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.5rem" }}
        className="no-scrollbar"
      >
        {filters.map((filter) => {
          const hasActive = filter.selected.length > 0;
          return (
            <button
              key={filter.key}
              ref={(el) => { chipRefs.current[filter.key] = el; }}
              onClick={() => handleChipClick(filter.key)}
              className="filter-chip"
              style={hasActive ? { borderColor: "#C4973B", color: "#C4973B" } : undefined}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {openFilter && activeFilter && anchorRect && (
        <FilterDropdown
          options={activeFilter.options}
          selected={activeFilter.selected}
          onToggle={(value) =>
            toggleFilter(activeFilter.filterKey, value, activeFilter.selected)
          }
          anchorRect={anchorRect}
          onClose={() => { setOpenFilter(null); setAnchorRect(null); }}
        />
      )}
    </>
  );
}
