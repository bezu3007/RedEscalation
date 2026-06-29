import { cn } from "@/shared/lib/utils";
import * as React from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

const Form = FormProvider;

const FormField = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>(
  props: ControllerProps<TFieldValues, TName>
) => {
  return <Controller {...props} />;
};

const FormItem = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("space-y-2", className)}
    {...props}
  />
);

const FormLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-sm font-medium">{children}</label>
);

const FormControl = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

const FormMessage = () => {
  const {
    formState: { errors },
  } = useFormContext();

  const message = Object.values(errors)[0]?.message;

  if (!message) return null;

  return (
    <p className="text-sm text-red-500">
      {String(message)}
    </p>
  );
};

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
};