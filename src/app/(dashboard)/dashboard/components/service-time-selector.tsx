// components/timeframe-selector.tsx
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

interface TimeframeSelectorProps {
  timeframe: string;
  setTimeframe: (value: string) => void;
}

const timeframes = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "threeMonths", label: "Last 3 Months" },
];

export const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  timeframe,
  setTimeframe,
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="mt-4">
      {isMobile ? (
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            {timeframes.map((tf) => (
              <SelectItem key={tf.value} value={tf.value}>
                {tf.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Tabs value={timeframe} onValueChange={setTimeframe} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {timeframes.map((tf) => (
              <TabsTrigger key={tf.value} value={tf.value}>
                {tf.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}
    </div>
  );
};
