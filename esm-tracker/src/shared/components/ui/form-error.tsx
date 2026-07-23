import { Alert, AlertDescription } from "./alert";
import { cn } from "@/shared/lib/utils";

interface FormErrorProps {
  message?: string;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <p className={cn("text-sm text-red-500 mt-1.5", className)}>
      {message}
    </p>
  );
}

interface FormErrorSummaryProps {
  errors: Record<string, any>;
  className?: string;
}

export function FormErrorSummary({ errors, className }: FormErrorSummaryProps) {
  const errorMessages = Object.values(errors)
    .filter((error) => error?.message)
    .map((error) => error.message);

  if (errorMessages.length === 0) return null;

  return (
    <Alert variant="destructive" className={cn("mb-4", className)}>
      <AlertDescription>
        <div className="flex items-start gap-2">
          <span className="font-medium">⚠️ Please fix the following errors:</span>
        </div>
        {/* <ul className="mt-1.5 list-disc list-inside space-y-0.5">
          {errorMessages.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul> */}
      </AlertDescription>
    </Alert>
  );
}