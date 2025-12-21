"use client";

import { IconTrendingDown, IconTrendingUp, IconBriefcase, IconCash, IconGauge, IconMessageCircleDollar, IconArrowsHorizontal } from "@tabler/icons-react";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Portfolio } from "@/lib/types/portfolio";

interface FinancialDetailProps {
    label: string;
    value: number | string | undefined;
    valueClass?: string;
    showIcon?: boolean; // For trending icons
    iconComponent?: React.ElementType; // For specific label icons
    isPercentageValue?: boolean; // New prop to indicate if the value is a percentage
}

function FinancialDetail({ label, value, valueClass, showIcon = false, iconComponent: IconComponent, isPercentageValue }: FinancialDetailProps) {
    const isGain = typeof value === 'number' ? value >= 0 : undefined;
    const trendingIconClass = isGain === undefined ? "" : isGain ? "text-[color:var(--gain)]" : "text-[color:var(--loss)]";
    const TrendingIcon = isGain === undefined ? null : isGain ? IconTrendingUp : IconTrendingDown;

    const formattedValue = isPercentageValue && typeof value === 'number'
        ? value.toFixed(2) + '%'
        : typeof value === 'number' ? formatCurrency(value) : value;

    return (
        <div className="flex items-baseline justify-between">
            <span className="flex items-center gap-2 text-muted-foreground">
                {IconComponent && <IconComponent className="size-6 text-[color:var(--info)]" />}
                {label}
            </span>
            <span className={cn("font-medium flex items-center gap-1", valueClass)}>
                {showIcon && TrendingIcon && <TrendingIcon className="size-4" />}
                {formattedValue}
            </span>
        </div>
    );
}

interface PortfolioOverviewCardProps {
    portfolio: Portfolio;
    previousDayChange: number;
    previousDayChangePercentage: number;
}

export function PortfolioOverviewCard({
    portfolio,
    previousDayChange,
    previousDayChangePercentage,
}: PortfolioOverviewCardProps) {
    const isPreviousDayGain = previousDayChange >= 0;
    const previousDayValueClass = isPreviousDayGain ? "text-[color:var(--gain)]" : "text-[color:var(--loss)]";

    const isAbsoluteGain = portfolio.absoluteGainLoss >= 0;
    const absoluteValueClass = isAbsoluteGain ? "text-[color:var(--gain)]" : "text-[color:var(--loss)]";

    const isRealizedGain = portfolio.realizedGainLoss >= 0;
    const realizedValueClass = isRealizedGain ? "text-[color:var(--gain)]" : "text-[color:var(--loss)]";



    return (
        <Card className="@container/card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-md">Portfolio Overview</CardTitle>
                {portfolio.date && (
                    <CardDescription className="text-sm">
                        Latest NAV as of: {portfolio.date}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <FinancialDetail 
                        label="Market Value" 
                        value={portfolio.marketValue} 
                        iconComponent={IconBriefcase}
                    />
                    <FinancialDetail 
                        label="Invested Amount" 
                        value={portfolio.investedValue} 
                        iconComponent={IconCash}
                    />
                    {/* Previous Day Change Value */}
                    <FinancialDetail
                        label={isPreviousDayGain ? "Previous Day Gain" : "Previous Day Loss"}
                        value={previousDayChange}
                        iconComponent={IconArrowsHorizontal}
                        valueClass={previousDayValueClass}
                    />
                    {/* Previous Day Change Percentage */}
                    <FinancialDetail
                        label={isPreviousDayGain ? "Previous Day Gain %" : "Previous Day Loss %"}
                        value={Math.abs(previousDayChangePercentage)} // Display absolute value for percentage
                        isPercentageValue={true}
                        iconComponent={IconGauge}
                        showIcon={true}
                        valueClass={previousDayValueClass} // Color the percentage value
                    />
                </div>
                 <div className="flex flex-col gap-2 border-t border-dashed pt-2">
                        {/* Absolute Gain/Loss Value */}
                    <FinancialDetail
                        label={isAbsoluteGain ? "Absolute Gain" : "Absolute Loss"}
                        value={portfolio.absoluteGainLoss}
                        iconComponent={IconGauge}
                        valueClass={absoluteValueClass}
                    />
                    {/* Absolute Gain/Loss Percentage */}
                    <FinancialDetail
                        label={isAbsoluteGain ? "Absolute Gain %" : "Absolute Loss %"}
                        value={Math.abs(portfolio.absoluteGainLossPercentage)} // Display absolute value for percentage
                        isPercentageValue={true}
                        iconComponent={IconGauge}
                        showIcon={true}
                        valueClass={absoluteValueClass} // Color the percentage value
                    />
                           
                    <FinancialDetail
                        label={isPreviousDayGain ? "XIRR Gain" : "XIRR Loss"} // Fix this after XIRR implementation
                        value={previousDayChange}
                        iconComponent={IconArrowsHorizontal}
                        valueClass={previousDayValueClass}
                    />
                 </div>
                <div className="flex flex-col gap-2 pt-2 border-t border-dashed">
                    <FinancialDetail 
                        label={isRealizedGain ? "Realized Profit" : "Realized Loss"}
                        value={portfolio.realizedGainLoss} 
                        iconComponent={IconMessageCircleDollar}
                        valueClass={realizedValueClass}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
