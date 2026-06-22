import { useEffect } from "react";

import { useForm } from "react-hook-form";

import { useCaseStore } from "../store/caseStore";

import { useCreateCase, useUpdateCase } from "../hooks/useCases";

import type { CaseItem, CaseType, CasePriority, CreateCaseRequest } from "../types";

import {

  Dialog,

  DialogContent,

  DialogHeader,

  DialogTitle,

  DialogFooter,

} from "@/shared/components/ui/dialog";

import {

  Form,

  FormField,

  FormItem,

  FormLabel,

  FormControl,

  FormMessage,

} from "@/shared/components/ui/form";

import {

  Select,

  SelectContent,

  SelectItem,

  SelectTrigger,

  SelectValue,

} from "@/shared/components/ui/select";

import { Input } from "@/shared/components/ui/input";

import { Textarea } from "@/shared/components/ui/textarea";

import { Button } from "@/shared/components/ui/button";

import { Loader2 } from "lucide-react";



const TYPES: CaseType[] = [

  "Bug", "FeatureRequest", "Support", "Payment", "Infrastructure", "Other",

];

const PRIORITIES: CasePriority[] = ["Low", "Medium", "High", "Critical"];



interface CaseFormValues extends CreateCaseRequest {}



interface Props {

  mode: "create" | "edit";

  initialData?: CaseItem;

  open: boolean;

  onClose: () => void;

}



export function CaseForm({ mode, initialData, open, onClose }: Props) {

  const { mutate: createCase, isPending: creating } = useCreateCase();

  const { mutate: updateCase, isPending: updating } = useUpdateCase();

  const isPending = creating || updating;



  const form = useForm<CaseFormValues>({

    defaultValues: {

      title: "",

      description: "",

      caseType: "Bug",

      priority: "Medium",

      projectName: "",

      moduleName: "",

      department: "",

      voucherNumber: "",

    },

  });



  useEffect(() => {

    if (mode === "edit" && initialData) {

      form.reset({

        title: initialData.title,

        description: initialData.description,

        caseType: initialData.caseType,

        priority: initialData.priority,

        projectName: initialData.projectName,

        moduleName: initialData.moduleName,

        department: initialData.department,

        voucherNumber: initialData.voucherNumber ?? "",

        paymentAmount: initialData.paymentAmount ?? undefined,

      });

    } else {

      form.reset();

    }

  }, [mode, initialData, form]);



  const onSubmit = (values: CaseFormValues) => {

    if (mode === "create") {

      createCase(values, { onSuccess: onClose });

    } else if (initialData) {

      updateCase(

        { id: initialData.id, body: values },

        { onSuccess: onClose }

      );

    }

  };



  return (

    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>

      <DialogContent className="max-w-5xl p-0 overflow-hidden border-0 rounded-3xl bg-white">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-slate-950 to-slate-900 px-6 py-4 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {mode === "create"
                  ? "Add Issue Voucher Proposal"
                  : "Edit Issue Voucher"}
              </h2>

              <p className="text-xs text-slate-300 mt-1">
                Creating new root level project issue track
              </p>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="border-b px-6">
          <div className="flex gap-6 text-sm">
            <button className="border-b-2 border-violet-600 py-3 font-medium text-violet-700">
              General Definition
            </button>

            <button className="py-3 text-slate-500">
              Related Attachments (0)
            </button>

            <button className="py-3 text-slate-500">
              Release Deployment Notes
            </button>
          </div>
        </div>

        {/* FORM */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 p-6 min-h-[500px]">

              {/* LEFT CARD */}
              <div className="rounded-2xl border bg-slate-50 p-5 space-y-5 shadow-sm">

                {/* ROW 1 */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="voucherNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] uppercase text-slate-500">
                          Voucher Code
                        </FormLabel>

                        <FormControl>
                          <Input
                            className="h-10 bg-white"
                            placeholder="EM-2026-005"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="projectName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] uppercase text-slate-500">
                          Project Match
                        </FormLabel>

                        <FormControl>
                          <Input
                            className="h-10 bg-white"
                            placeholder="E-Commerce Integration"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* ROW 2 */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="moduleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] uppercase text-slate-500">
                          Module Component
                        </FormLabel>

                        <FormControl>
                          <Input
                            className="h-10 bg-white"
                            placeholder="Billing & Checkout"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="caseType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] uppercase text-slate-500">
                          Case Type
                        </FormLabel>

                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 bg-white">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent className="bg-white">
                            {TYPES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                {/* ROW 3 */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] uppercase text-slate-500">
                          Assigned Soldier
                        </FormLabel>

                        <FormControl>
                          <Input
                            className="h-10 bg-white"
                            placeholder="Alex Chen"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] uppercase text-slate-500">
                          Payment Status
                        </FormLabel>

                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 bg-white">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent className="bg-white">
                            {PRIORITIES.map((p) => (
                              <SelectItem key={p} value={p}>
                                {p}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                {/* ROW 4 */}
                <div className="grid grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel className="text-[11px] uppercase text-slate-500">
                      Workflow Launch Date
                    </FormLabel>

                    <Input type="date" className="h-10 bg-white" />
                  </FormItem>

                  <FormItem>
                    <FormLabel className="text-[11px] uppercase text-slate-500">
                      Committed Milestone Deadline
                    </FormLabel>

                    <Input type="date" className="h-10 bg-white" />
                  </FormItem>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] uppercase text-slate-500">
                        Issue Details Log (HTML/Formatting)
                      </FormLabel>

                      <FormControl>
                        <Textarea
                          rows={14}
                          className="resize-none rounded-2xl border bg-slate-50 p-4"
                          placeholder="<p>Enter issue descriptions here...</p>"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex items-center gap-3 border-t bg-slate-50 px-6 py-4">
              <Button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-slate-900 px-6 hover:bg-slate-800"
              >
                {isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}

                Save Changes
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>

    </Dialog>

  );

}