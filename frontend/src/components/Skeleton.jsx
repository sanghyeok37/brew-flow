import React from "react";

export default function Skeleton({ className }) {
  return (
    <div className={`animate-pulse rounded-md bg-zinc-800/50 ${className}`} />
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="w-full space-y-4">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 backdrop-blur-sm space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-2 w-32" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  );
}
