
import React from 'react';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';

const ResumeSectionSkeleton: React.FC<{ titleWidth: string; lineCount: number }> = ({ titleWidth, lineCount }) => (
  <div>
    <Skeleton className={`h-5 ${titleWidth} mb-4`} />
    <div className="space-y-2">
      {Array.from({ length: lineCount }).map((_, i) => (
        <Skeleton key={i} className="h-4" style={{ width: `${80 + (i % 3) * 10}%` }} />
      ))}
    </div>
  </div>
);

export const ResumePreviewSkeleton: React.FC = () => {
  return (
    <Card>
      <div className="text-center mb-6">
        <Skeleton className="h-8 w-48 mx-auto mb-3" />
        <Skeleton className="h-4 w-full max-w-lg mx-auto" />
        <Skeleton className="h-4 w-full max-w-md mx-auto mt-2" />
      </div>

      <div className="space-y-6">
        <ResumeSectionSkeleton titleWidth="w-24" lineCount={4} />

        <div>
          <Skeleton className="h-5 w-20 mb-4" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>

        <div>
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="space-y-4">
            <div>
              <Skeleton className="h-5 w-3/4 mb-1" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full mt-1" />
              <Skeleton className="h-4 w-5/6 mt-1" />
            </div>
            <div>
              <Skeleton className="h-5 w-3/4 mb-1" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6 mt-1" />
            </div>
          </div>
        </div>

        <ResumeSectionSkeleton titleWidth="w-28" lineCount={2} />
      </div>
    </Card>
  );
};