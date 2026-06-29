import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateCase, useUpdateCase } from "../hooks/useCases";
import type { CaseItem, CreateCaseRequest } from "../types";
import { CASE_TYPES, PAID_OR_NOT, Case_Status } from "../types";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/shared/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAttachment } from "../hooks/useAttachment";
import { AttachmentUploader } from "./AttachmentUploader";
import { cn } from "@/shared/lib/utils";
import { useVoucherInit } from "../hooks/useVoucherInit";
import type { Consignee, Extension } from "../types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger} from "@/shared/components/ui/popover"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";

import { Check, ChevronsUpDown } from "lucide-react";


interface CaseFormValues extends CreateCaseRequest {
  projectNameID: string;
}

interface Props {
  mode: "create" | "edit";
  initialData?: CaseItem;
  open: boolean;
  onClose: () => void;
}

function mapCaseToVoucherBuffer(
  values: CaseFormValues,
  initialData?: CaseItem
) {
  const now = new Date();
  const isEditing = !!initialData;

  return {
    voucher: {
      id: isEditing ? initialData.id! : 0,
      code: "",
      lastDevice: "",
      consignee1: Number(values.projectNameID),
      subTotal: 0,
      discount: 0,
      addCharge: 0,
      grandTotal: 0,
      consignee2: 37453,
      consignee3: 183,
      consignee4: null,
      issuedDate: now.toISOString(),
      note: values.issues,
      originConsigneeUnit: 3,
      consigneeUnit1: 3,
      lastModified: now.toISOString(),
      createdOn: now.toISOString(),
      extension1: values.paidorNot,
      extension2: values.caseType,
      extension3: values.module,
      extension4: values.developmentStatus,
      lastState: 1305,
      startDate: values.issueDate,
      endDate: values.deadLine,
      remark: values.releaseNote,
      type: 1917,
      lastUser: 409,
      definition: 400,
    },
    activity: {
      id: 0,
      reference: 0,
      device: null,
      timeStamp: now.toISOString(),
      user: 409,
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      platform: "WEB",
      consigneeUnit: 3,
      activityDefinition: isEditing ? 1001 : 1001,
      remark: "",
    },
    IdGenerationParams: { isWeb: true, consigneeUnitId: 3 },
    transactionReferencesBuffer: [],
  };
}

export function CaseForm({ mode, initialData, open, onClose }: Props) {
  const [projectOpen, setProjectOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "attachments" | "notes">("general");
  const [deploymentNotes, setDeploymentNotes] = useState("");

  const { data: initData, isLoading: isLoadingInit } = useVoucherInit();
  const { mutate: createCase, isPending: creating } = useCreateCase();
  const { mutate: updateCase, isPending: updating } = useUpdateCase();
  const { files, addFiles, removeFile, reset: resetAttachments } = useAttachment();

  const isPending = creating || updating;

  const form = useForm<CaseFormValues>({
    defaultValues: {
      projectName: "",
      projectNameID: "",
      module: "",
      caseType: "Error",
      developer: "",
      paidorNot: "Free",
      department: "",
      issueDate: "",
      deadLine: "",
      releaseNote: "",
      issues: "",
      developmentStatus: "",
    },
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      form.reset({
        caseNumber: initialData.caseNumber,
        projectName: initialData.projectName,
        projectNameID: initialData.projectNameID,
        module: initialData.module,
        caseType: initialData.caseType,
        developer: initialData.developer ?? "",
        paidorNot: initialData.paidorNot,
        department: initialData.department ?? "",
        issueDate: initialData.issueDate ?? "",
        deadLine: initialData.deadLine ?? "",
        releaseNote: initialData.releaseNote ?? "",
        issues: initialData.issues ?? "",
        developmentStatus: initialData.developmentStatus ?? "",
      });
    } else {
      form.reset({
        projectName: "",
        projectNameID: "",
        module: "",
        caseType: "Error",
        developer: "",
        paidorNot: "Free",
        department: "",
        issueDate: "",
        deadLine: "",
        releaseNote: "",
        issues: "",
        developmentStatus: "",
      });
    }
  }, [mode, initialData, form]);

  const handleClose = () => {
    form.reset();
    resetAttachments();
    setDeploymentNotes("");
    setActiveTab("general");
    onClose();
  };

  const onSubmit = (values: CaseFormValues) => {
    console.log("FORM VALUES", values);

    const payload = mapCaseToVoucherBuffer(values, initialData);

    console.log("PAYLOAD", payload);

    if (mode === "create") {
      createCase(payload, {
        onSuccess: (data) => {
          console.log("CREATE SUCCESS", data);
          handleClose();
        },
        onError: (err: any) => {
          console.error("CREATE ERROR", err);
          console.log("STATUS", err?.response?.status);
          console.log("RESPONSE DATA", err?.response?.data);
        },
      });
    } else if (initialData) {
      updateCase(
        {
          id: initialData.id!,
          body: payload,
        },
        {
          onSuccess: () => {
            handleClose();
          },
          onError: (err) => {
            console.error("UPDATE ERROR", err);
          },
        }
      );
    }
  };

  // Helper to parse modules from extension remark
  const getModuleList = (modules: Extension | undefined): string[] => {
    if (!modules?.remark) return [];
    return modules.remark.split(",").map((m) => m.trim());
  };

  // Get the selected project's name for display
  const selectedProject = initData?.projects?.find(
    (p: Consignee) => String(p.id) === form.watch("projectNameID")
  );

  if (isLoadingInit) {
    return (
      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden border-0 rounded-3xl bg-white">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
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
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={cn(
                "py-3",
                activeTab === "general"
                  ? "border-b-2 border-violet-600 font-medium text-violet-700"
                  : "text-slate-500"
              )}
            >
              General Definition
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("attachments")}
              className={cn(
                "py-3",
                activeTab === "attachments"
                  ? "border-b-2 border-violet-600 font-medium text-violet-700"
                  : "text-slate-500"
              )}
            >
              Related Attachments ({files.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("notes")}
              className={cn(
                "py-3",
                activeTab === "notes"
                  ? "border-b-2 border-violet-600 font-medium text-violet-700"
                  : "text-slate-500"
              )}
            >
              Release Deployment Notes
            </button>
          </div>
        </div>

        {/* FORM */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
            {activeTab === "general" && (
              <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 p-6 min-h-[500px]">
                {/* LEFT CARD */}
                <div className="rounded-2xl border bg-slate-50 p-5 space-y-5 shadow-sm">
                  {/* ROW 1 - Project & Module */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
  control={form.control}
  name="projectNameID"
  render={({ field }) => (
    <FormItem className="flex flex-col">
      <FormLabel>Projects</FormLabel>

      <Popover
        open={projectOpen}
        onOpenChange={setProjectOpen}
      >
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              className="justify-between h-10 bg-white"
            >
              {field.value
                ? initData?.projects?.find(
                    (p) =>
                      String(p.id) === field.value
                  )?.fullName
                : "Select project"}

              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>

        <PopoverContent className="w-[350px] p-0 bg-white">
          <Command>
            <CommandInput placeholder="Search project..." />

            <CommandList>
              <CommandEmpty>
                No project found.
              </CommandEmpty>

              <CommandGroup>
                {initData?.projects?.map(
                  (project: Consignee) => (
                    <CommandItem
                      key={project.id}
                      value={project.fullName}
                      onSelect={() => {
                        field.onChange(
                          String(project.id)
                        );

                        setProjectOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          String(project.id) ===
                            field.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />

                      {project.fullName}
                    </CommandItem>
                  )
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </FormItem>
  )}
/>

                    <FormField
                      control={form.control}
                      name="module"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Module</FormLabel>
                          <Select
                            value={field.value ?? undefined}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10 bg-white">
                                <SelectValue placeholder="Select module" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white">
                              {getModuleList(initData?.modules).map((module: string) => (
                                <SelectItem key={module} value={module}>
                                  {module}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* ROW 2 - Case Type & Payment Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="caseType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Case Type</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="h-10 bg-white">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white">
                              {CASE_TYPES.map((t) => (
                                <SelectItem key={t} value={t}>
                                  {t}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paidorNot"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Status</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="h-10 bg-white">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white">
                              {PAID_OR_NOT.map((t) => (
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

                  {/* ROW 3 - Developer & Department */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="developer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Developer</FormLabel>
                          <Select
                            value={field.value ?? undefined}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10 bg-white">
                                <SelectValue placeholder="Select developer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white">
                              {initData?.developers?.map((dev: Consignee) => (
                                <SelectItem key={dev.id} value={String(dev.id)}>
                                  {dev.fullName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* ROW 4 - Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="issueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" className="h-10 bg-white" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deadLine"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deadline</FormLabel>
                          <FormControl>
                            <Input type="date" className="h-10 bg-white" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Development Status */}
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="developmentStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Development Status</FormLabel>
                          <Select value={field.value ?? ""} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="h-10 bg-white">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white">
                              {Case_Status.map((t) => (
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
                </div>

                {/* RIGHT SIDE - Issues */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="issues"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issue Details Log</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={14}
                            className="resize-none rounded-2xl border bg-slate-50 p-4"
                            placeholder="Enter issue descriptions here..."
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* ATTACHMENTS TAB */}
            {activeTab === "attachments" && (
              <div className="p-6 min-h-[500px]">
                <AttachmentUploader
                  files={files}
                  addFiles={addFiles}
                  removeFile={removeFile}
                />
              </div>
            )}

            {/* NOTES TAB */}
            {activeTab === "notes" && (
              <div className="p-6 min-h-[500px]">
                <Textarea
                  rows={18}
                  value={deploymentNotes}
                  onChange={(e) => setDeploymentNotes(e.target.value)}
                  placeholder="Write deployment notes..."
                  className="resize-none rounded-2xl border bg-slate-50 p-4"
                />
              </div>
            )}

            {/* FOOTER */}
            <div className="flex items-center gap-3 border-t bg-slate-50 px-6 py-4">
              <Button
                type="submit"
                disabled={isPending || isLoadingInit}
                className="rounded-xl bg-slate-900 px-6 hover:bg-slate-800"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
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