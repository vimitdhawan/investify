"use client";

import React, { useState, useMemo } from "react";
import { SchemeSummary } from "@/lib/types/summary";
import { SchemeCard } from "./scheme-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function SchemeList({ summaries }: { summaries: SchemeSummary[] }) {
  const [selectedFolio, setSelectedFolio] = useState("All");
  const [balanceFilter, setBalanceFilter] = useState("All");

  const folios = useMemo(() => {
    const folioMap = new Map<string, string>();
    summaries.forEach(s => {
      if (!folioMap.has(s.folio_number)) {
        folioMap.set(s.folio_number, s.amc);
      }
    });
    return Array.from(folioMap.entries()).map(([folio, amc]) => ({ folio, amc })).sort((a, b) => a.amc.localeCompare(b.amc));
  }, [summaries]);

  const filteredSummaries = useMemo(() => {
    return summaries.filter(summary => {
      const folioMatch = selectedFolio === "All" || summary.folio_number === selectedFolio;
      const balanceMatch = balanceFilter === "All" ||
        (balanceFilter === "Active" && summary.marketValue > 0) ||
        (balanceFilter === "Closed" && summary.marketValue === 0);
      return folioMatch && balanceMatch;
    });
  }, [summaries, selectedFolio, balanceFilter]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Folio</label>
          <Select value={selectedFolio} onValueChange={setSelectedFolio}>
            <SelectTrigger className="w-[350px]">
              <SelectValue placeholder="Select a folio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Folios</SelectItem>
              {folios.map(({ folio, amc }) => (
                <SelectItem key={folio} value={folio}>{`${amc} - ${folio}`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Status</label>
          <ToggleGroup type="single" value={balanceFilter} onValueChange={(value) => { if(value) setBalanceFilter(value)}}>
            <ToggleGroupItem value="All">All</ToggleGroupItem>
            <ToggleGroupItem value="Active">Active</ToggleGroupItem>
            <ToggleGroupItem value="Closed">Closed</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSummaries.map((summary) => (
          <SchemeCard key={`${summary.isin}-${summary.folio_number}`} summary={summary} />
        ))}
      </div>
    </div>
  );
}
