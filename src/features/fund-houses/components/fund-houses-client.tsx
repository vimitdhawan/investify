'use client';

import React, { useState, useMemo } from 'react';
import { MutualFundView } from '@/features/fund-houses/type';
import { FundHouseCard } from './fund-house-card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface FundHousesClientProps {
  mutualFunds: MutualFundView[];
}

export function FundHousesClient({ mutualFunds }: FundHousesClientProps) {
  const [showClosedFunds, setShowClosedFunds] = useState(false);

  const filteredMutualFunds = useMemo(() => {
    return mutualFunds.filter((fund) => {
      const isFundClosed = (fund.marketValue ?? 0) === 0;
      return showClosedFunds ? isFundClosed : !isFundClosed;
    });
  }, [mutualFunds, showClosedFunds]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-end items-center space-x-2 mb-4">
        <Label htmlFor="show-closed-funds" className="text-sm font-medium">
          Show Closed Funds
        </Label>
        <Switch
          id="show-closed-funds"
          checked={showClosedFunds}
          onCheckedChange={setShowClosedFunds}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMutualFunds.map((mutualFund) => (
          <FundHouseCard key={mutualFund.name} mutualFund={mutualFund} />
        ))}
      </div>
    </div>
  );
}
