"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";

type Props = {
  date?: DateRange;
  onDateChange: (date: DateRange | undefined) => void;
  onApply?: () => void;
  onClear?: () => void;
};

export function DateRangePicker({
  date,
  onDateChange,
  onApply,
  onClear,
}: Props) {
  const [open, setOpen] = React.useState(false);

  const handleRangeSelect = (
    _range: DateRange | undefined,
    selectedDay: Date
  ) => {
    const selectedTime = new Date(
      selectedDay.getFullYear(),
      selectedDay.getMonth(),
      selectedDay.getDate()
    ).getTime();

    if (date?.from && date?.to) {
      onDateChange({ from: selectedDay, to: undefined });
      return;
    }

    if (date?.from && !date.to) {
      const startTime = new Date(
        date.from.getFullYear(),
        date.from.getMonth(),
        date.from.getDate()
      ).getTime();

      if (selectedTime < startTime) {
        onDateChange({ from: selectedDay, to: undefined });
        return;
      }

      onDateChange({ from: date.from, to: selectedDay });
      return;
    }

    onDateChange({ from: selectedDay, to: undefined });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          style={{ backgroundColor: "#f9fafb" }}
          className={cn(
            "h-10 w-[220px] justify-start gap-1.5 whitespace-nowrap px-2 text-left font-normal bg-gray-50",
            date?.from ? "text-[10px] leading-none" : "text-sm",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon
            className={cn(
              "shrink-0",
              date?.from ? "h-3.5 w-3.5" : "mr-1 h-4 w-4"
            )}
          />

          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "MMM dd, yyyy")} -{" "}
                {format(date.to, "MMM dd, yyyy")}
              </>
            ) : (
              format(date.from, "MMM dd, yyyy")
            )
          ) : (
            <span>Select date range</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto bg-white p-0 text-slate-950" align="start">
        <Calendar
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={handleRangeSelect}
          numberOfMonths={2}
          className="p-2"
        />
        <div className="flex items-center justify-end gap-2 border-t px-2 py-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 px-3"
            onClick={() => {
              onClear?.();
              onDateChange(undefined);
            }}
          >
            Clear
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-7 px-3"
            onClick={() => {
              onApply?.();
              setOpen(false);
            }}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}