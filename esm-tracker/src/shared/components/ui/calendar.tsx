"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/shared/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      className={cn("bg-white p-3 text-slate-950", className)}
      classNames={{
        root: "relative",
        months: "flex flex-col gap-2 sm:flex-row",
        month: "space-y-2",
        month_caption: "flex h-9 items-center justify-center",
        caption_label: "text-xs font-medium",
        nav: "absolute inset-x-3 top-3 flex h-7 items-center justify-between",
        button_previous: "inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-background p-0 text-muted-foreground [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:mx-auto [&>svg]:block hover:bg-accent hover:text-accent-foreground",
        button_next: "inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-background p-0 text-muted-foreground [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:mx-auto [&>svg]:block hover:bg-accent hover:text-accent-foreground",
        month_grid: "w-full border-collapse",
        weekdays: "",
        weekday: "h-7 w-7 text-center text-[11px] font-normal text-muted-foreground",
        week: "",
        day: "relative h-7 w-7 p-0 text-center text-xs",
        day_button: "h-7 w-7 rounded-md p-0 text-xs font-normal hover:bg-blue-100 hover:text-blue-700",
        range_start: "rounded-l-md bg-blue-600 font-bold text-white",
        range_middle: "bg-sky-200 text-sky-800",
        range_end: "rounded-r-md bg-blue-600 font-bold text-white",
        selected: "bg-blue-600 font-bold text-white",
        today: "rounded-md border border-primary",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      {...props}
      showOutsideDays={showOutsideDays}
    />
  );
}

Calendar.displayName = "Calendar";