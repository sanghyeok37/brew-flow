import React from "react";

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages - 1, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(0, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition-all ${
            page === i
              ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
              : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          }`}
        >
          {i + 1}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="flex h-9 px-3 items-center justify-center rounded-xl bg-zinc-900 text-sm font-medium text-zinc-400 transition-all hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Prev
      </button>
      <div className="flex items-center gap-1.5">{renderPageNumbers()}</div>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages - 1}
        className="flex h-9 px-3 items-center justify-center rounded-xl bg-zinc-900 text-sm font-medium text-zinc-400 transition-all hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}
