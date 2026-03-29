'use client';

import React, { useEffect, useState } from 'react';

import {
  IconCalculator,
  IconInfoCircle,
  IconTrendingDown,
  IconTrendingUp,
} from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { getSchemeAction } from '@/features/schemes/action';
import type { Scheme } from '@/features/schemes/type';
import { simulateWithdrawal } from '@/features/tax-report/service';
import type { SimulationResult } from '@/features/tax-report/type';

import { cn } from '@/lib/utils';

interface WithdrawalCalculatorModalProps {
  schemeId: string;
}

export function WithdrawalCalculatorModal({ schemeId }: WithdrawalCalculatorModalProps) {
  const [open, setOpen] = useState(false);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(schemeId);
  const [units, setUnits] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [result, setResult] = useState<SimulationResult | null>(null);

  const loadSchemes = React.useCallback(async () => {
    if (schemes.length === 1 && schemes[0].id === schemeId) {
      return;
    }

    setLoading(true);
    try {
      const data = await getSchemeAction(schemeId);
      if (data) {
        setSchemes([data]);
        setSelectedSchemeId(data.id);
      }
    } finally {
      setLoading(false);
    }
  }, [schemeId, schemes.length]);

  const selectedScheme = schemes.find((s) => s.id === selectedSchemeId);

  // Synchronize result when units or selectedScheme changes
  useEffect(() => {
    const u = Number(units);
    // Ensure we have a valid selected scheme, units are a positive number, and we're not loading
    if (!selectedScheme || isNaN(u) || u <= 0 || loading) {
      setResult(null);
      return;
    }

    try {
      // Use a small epsilon to handle potential floating point precision issues in comparison
      const EPSILON = 0.0000001;
      const simulationUnits = u > selectedScheme.units + EPSILON ? selectedScheme.units : u;

      // Ensure NAV is valid
      const currentNav = selectedScheme.nav || 0;
      if (currentNav <= 0) {
        setResult(null);
        return;
      }

      const res = simulateWithdrawal(selectedScheme, simulationUnits, currentNav);

      // Basic validation of result to prevent NaN in UI
      if (isNaN(res.ltcg) || isNaN(res.stcg) || isNaN(res.totalGain)) {
        console.error('Calculator simulation produced NaN values');
        setResult(null);
        return;
      }

      setResult(res);
    } catch (err) {
      console.error('Calculator simulation failed:', err);
      setResult(null);
    }
  }, [units, selectedScheme, loading]);

  const handleUnitsChange = (val: string) => {
    setUnits(val);
    if (!selectedScheme || val === '' || isNaN(Number(val)) || selectedScheme.nav <= 0) {
      setAmount('');
      return;
    }
    const u = Number(val);
    const a = u * selectedScheme.nav;
    setAmount(a.toFixed(2));
  };

  const handleAmountChange = (val: string) => {
    setAmount(val);
    if (!selectedScheme || val === '' || isNaN(Number(val)) || selectedScheme.nav <= 0) {
      setUnits('');
      return;
    }
    const a = Number(val);
    const u = a / selectedScheme.nav;
    setUnits(u.toFixed(6));
  };

  const handleUseMax = () => {
    if (!selectedScheme) return;
    const u = selectedScheme.units;
    setUnits(u.toString());
    setAmount((u * selectedScheme.nav).toFixed(2));
  };

  const reset = () => {
    setUnits('');
    setAmount('');
    setResult(null);
  };

  useEffect(() => {
    if (open) {
      loadSchemes();
    } else {
      reset();
    }
  }, [open, loadSchemes]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                data-testid="withdrawal-calc-button"
                onClick={() => setOpen(true)}
              >
                <IconCalculator size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Simulate Withdrawal</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconCalculator size={18} />
            Withdrawal Calculator
          </DialogTitle>
          <DialogDescription>
            {selectedScheme
              ? `Simulate a withdrawal for ${selectedScheme.name}`
              : 'Simulate a withdrawal to estimate realized gains and tax impact.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {selectedScheme && (
            <div className="bg-muted/30 p-3 rounded-xl border flex items-center justify-between gap-y-2 text-sm animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mb-0.5">
                  Available Units
                </span>
                <span className="font-mono text-sm font-semibold">
                  {selectedScheme.units.toFixed(4)}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mb-0.5">
                  Current NAV
                </span>
                <span className="font-mono text-sm font-semibold">
                  ₹{selectedScheme.nav.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-card p-4 rounded-2xl border shadow-sm transition-all">
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="units" className="text-xs font-semibold text-muted-foreground">
                  Units to Withdraw
                </Label>
                {selectedScheme && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-5 px-2 text-[9px] font-bold bg-primary/10 text-primary hover:bg-primary/20 border-none rounded-full transition-colors"
                    onClick={handleUseMax}
                  >
                    All Units
                  </Button>
                )}
              </div>
              <Input
                id="units"
                type="number"
                placeholder="0.0000"
                value={units}
                onChange={(e) => handleUnitsChange(e.target.value)}
                disabled={!selectedSchemeId}
                className="font-mono h-10 text-base focus-visible:ring-primary/20"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="amount" className="text-xs font-semibold text-muted-foreground">
                Amount (Approx)
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                disabled={!selectedSchemeId}
                className="font-mono h-10 text-base focus-visible:ring-primary/20"
              />
            </div>
          </div>

          {selectedScheme &&
            !loading &&
            units &&
            !isNaN(Number(units)) &&
            Number(units) > selectedScheme.units + 0.0000001 && (
              <div className="bg-destructive/10 p-2 rounded-lg border border-destructive/20 flex items-center gap-2 animate-in slide-in-from-left-2 duration-300">
                <IconInfoCircle size={14} className="text-destructive shrink-0" />
                <p className="text-[10px] font-medium text-destructive">
                  Note: Entering more than available units. Capping simulation at{' '}
                  {selectedScheme.units.toFixed(4)} units.
                </p>
              </div>
            )}

          {result && (
            <div className="mt-2 space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
              <Separator />
              <div className="grid grid-cols-1 gap-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  Estimated Gains Breakdown
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <IconInfoCircle size={14} className="text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Calculated based on FIFO (First-In-First-Out) logic using your purchase
                        history.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SummaryItem
                    label="LTCG (Long-term)"
                    value={result.ltcg}
                    tooltip="Equity units held for > 365 days."
                  />
                  <SummaryItem
                    label="STCG (Short-term)"
                    value={result.stcg}
                    tooltip="Equity units held for <= 365 days."
                  />
                  <SummaryItem
                    label="Debt Gains"
                    value={result.debt}
                    tooltip="Gains from Debt/Other funds, taxed at your slab rate."
                  />
                  <SummaryItem
                    label="Total Gain/Loss"
                    value={result.totalGain}
                    isTotal
                    tooltip="Net realized profit or loss from this withdrawal."
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SummaryItem({
  label,
  value,
  isTotal,
  tooltip,
}: {
  label: string;
  value: number;
  isTotal?: boolean;
  tooltip?: string;
}) {
  const isPositive = value >= 0;
  return (
    <div className={cn('p-3 rounded-lg border bg-card', isTotal && 'bg-muted/50')}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <IconInfoCircle size={12} className="text-muted-foreground/50" />
              </TooltipTrigger>
              <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div
        className={cn(
          'text-sm font-bold flex items-center gap-1',
          isPositive ? 'text-green-600' : 'text-red-600'
        )}
      >
        {isPositive ? <IconTrendingUp size={14} /> : <IconTrendingDown size={14} />}
        {value.toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
        })}
      </div>
    </div>
  );
}
