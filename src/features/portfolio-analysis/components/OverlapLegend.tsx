'use client';

/**
 * OverlapLegend Component
 * Displays statistics and legend for the overlap matrix
 */
import { Card } from '@/components/ui/card';

interface OverlapLegendProps {
  minOverlap: number;
  maxOverlap: number;
  avgOverlap: number;
  totalComparisons: number;
}

export function OverlapLegend({
  minOverlap,
  maxOverlap,
  avgOverlap,
  totalComparisons,
}: OverlapLegendProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2">Overlap Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-3">
            <div className="text-xs text-muted-foreground">Min Overlap</div>
            <div className="text-2xl font-bold">{minOverlap}</div>
            <div className="text-xs text-muted-foreground">stocks</div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground">Max Overlap</div>
            <div className="text-2xl font-bold">{maxOverlap}</div>
            <div className="text-xs text-muted-foreground">stocks</div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground">Avg Overlap</div>
            <div className="text-2xl font-bold">{avgOverlap.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">stocks</div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground">Comparisons</div>
            <div className="text-2xl font-bold">{totalComparisons}</div>
            <div className="text-xs text-muted-foreground">pairs</div>
          </Card>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">How to Read</h4>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• Hover over cells to see overlap details between two schemes</p>
          <p>• Darker colors indicate higher overlap (more common stocks)</p>
          <p>• Diagonal cells show each scheme&apos;s total holdings count</p>
        </div>
      </div>
    </div>
  );
}
