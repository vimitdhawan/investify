'use client';

/**
 * PortfolioOverlapCard Component
 * Displays portfolio overlap matrix with heatmap
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import type { OverlapMatrix } from '../type';
import { HeatmapMatrix } from './HeatmapMatrix';
import { OverlapLegend } from './OverlapLegend';

interface PortfolioOverlapCardProps {
  overlapMatrix: OverlapMatrix | null;
}

export function PortfolioOverlapCard({ overlapMatrix }: PortfolioOverlapCardProps) {
  if (!overlapMatrix || overlapMatrix.schemes.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Overlap Analysis</CardTitle>
          <CardDescription>
            {!overlapMatrix
              ? 'No overlap data available'
              : 'Need at least 2 schemes with holdings to analyze overlap'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { schemes, matrix, statistics } = overlapMatrix;

  // Calculate dynamic size based on number of schemes
  const cellSize = Math.max(60, Math.min(100, 800 / schemes.length));
  const matrixSize = schemes.length * cellSize + 220; // 220 for margins

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Overlap Analysis</CardTitle>
        <CardDescription>
          Comparing holdings across {schemes.length} schemes to identify overlaps
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics Legend */}
        <OverlapLegend
          minOverlap={statistics.minOverlap}
          maxOverlap={statistics.maxOverlap}
          avgOverlap={statistics.avgOverlap}
          totalComparisons={statistics.totalComparisons}
        />

        {/* Heatmap Matrix */}
        <div className="overflow-x-auto">
          <HeatmapMatrix schemes={schemes} matrix={matrix} width={matrixSize} height={matrixSize} />
        </div>
      </CardContent>
    </Card>
  );
}
