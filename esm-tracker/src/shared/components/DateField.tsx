import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  min?: string;
  max?: string;
}

export function DateField({
  value,
  onChange,
  placeholder,
  className,
  min,
  max,
}: Props) {
  return (
    <Input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      max={max}
      className={cn("text-sm", className)}
    />
  );
}