import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export interface EntityOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface Props {
  options: EntityOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyLabel?: string;
  disabled?: boolean;
  className?: string;
}

export function EntitySelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  emptyLabel = "All",
  disabled,
  className,
}: Props) {
  return (
    <Select value={value || "__all__"} onValueChange={(v) => onChange(v === "__all__" ? "" : v)} disabled={disabled}>
      <SelectTrigger className={className} disabled={disabled}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">{emptyLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            <span>{o.label}</span>
            {o.sublabel && (
              <span className="ml-2 text-xs text-muted-foreground">
                {o.sublabel}
              </span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}