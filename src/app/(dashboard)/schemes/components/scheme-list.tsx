"use client";

import React, { useState, useMemo } from "react";
import { Scheme } from "@/lib/types/scheme";
import { SchemeCard } from "./scheme-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function SchemeList({ schemes, dayChanges }: { schemes: Scheme[], dayChanges: Map<string, number> }) {
  const [selectedFolio, setSelectedFolio] = useState("All");
  const [showClosedSchemes, setShowClosedSchemes] = useState(false);

  const folios = useMemo(() => {
    const folioMap = new Map<string, string>();
    schemes.forEach(s => {
      if (!folioMap.has(s.folioNumber)) {
        folioMap.set(s.folioNumber, s.amc);
      }
    });
    return Array.from(folioMap.entries()).map(([folio, amc]) => ({ folio, amc })).sort((a, b) => a.amc.localeCompare(b.amc));
  }, [schemes]);

  const filteredSchemes = useMemo(() => {
    return schemes.filter(scheme => {
      const folioMatch = selectedFolio === "All" || scheme.folioNumber === selectedFolio;
      const statusMatch = showClosedSchemes
        ? (scheme.marketValue ?? 0) === 0 // Show only closed schemes
        : (scheme.marketValue ?? 0) > 0; // Show only active schemes
      return folioMatch && statusMatch;
    });
  }, [schemes, selectedFolio, showClosedSchemes]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap gap-4 justify-between items-end">
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
        {/* New Switch for Closed Schemes */}
        <div className="flex items-center space-x-2">
            <Switch
                id="show-closed-schemes"
                checked={showClosedSchemes}
                onCheckedChange={setShowClosedSchemes}
            />
            <Label htmlFor="show-closed-schemes" className="text-sm font-medium">Show Closed Schemes</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSchemes.map((scheme) => (
          <SchemeCard key={`${scheme.id}`} scheme={scheme} previousDayChangePercentage={dayChanges.get(scheme.id) ?? 0} />
        ))}
      </div>
    </div>
  );
}
