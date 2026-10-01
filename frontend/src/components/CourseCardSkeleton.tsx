import React from 'react';

/**
 * Placeholder card shown while course data loads. Mirrors the CourseCard
 * layout so the grid doesn't jump when real content arrives.
 */
export const CourseCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      <div className="aspect-video skeleton" />
      <div className="p-4 sm:p-5 flex-1 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 rounded-md skeleton" />
          <div className="h-4 w-12 rounded-md skeleton" />
        </div>
        <div className="h-5 w-full rounded-md skeleton" />
        <div className="h-5 w-2/3 rounded-md skeleton" />
        <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="h-6 w-24 rounded-md skeleton" />
          <div className="h-8 w-20 rounded-lg skeleton" />
        </div>
      </div>
    </div>
  );
};

export const CourseGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <CourseCardSkeleton key={i} />
    ))}
  </div>
);
