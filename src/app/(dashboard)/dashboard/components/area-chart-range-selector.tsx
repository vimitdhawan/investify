import * as React from "react";
import { CardAction } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Time Range Selector Component
interface TimeRangeSelectorProps {
  timeRange: string;
  setTimeRange: (value: "7d" | "30d" | "90d") => void;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  timeRange,
  setTimeRange,
}) => {
  return (
    <CardAction>
      <ToggleGroup
        type="single"
        value={timeRange}
        onValueChange={setTimeRange}
        variant="outline"
        className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
      >
        <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
        <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
        <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
      </ToggleGroup>
      <Select value={timeRange} onValueChange={setTimeRange}>
        <SelectTrigger
          className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
          size="sm"
          aria-label="Select a value"
        >
          <SelectValue placeholder="Last 3 months" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="90d" className="rounded-lg">
            Last 3 months
          </SelectItem>
          <SelectItem value="30d" className="rounded-lg">
            Last 30 days
          </SelectItem>
          <SelectItem value="7d" className="rounded-lg">
            Last 7 days
          </SelectItem>
        </SelectContent>
      </Select>
    </CardAction>
  );
};
