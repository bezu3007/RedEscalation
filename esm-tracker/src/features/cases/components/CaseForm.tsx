import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useCreateCase, useUpdateCase } from "../hooks/useCases";
import type { CaseItem, CreateCaseRequest } from "../types";
import { CASE_TYPES, PAID_OR_NOT } from "../types";
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
import type { Consignee, Extension } from "../types";

interface CaseFormValues extends CreateCaseRequest {
  projectNameId: string;
  developer: string;
}

interface Props {
  mode: "create" | "edit";
  initialData?: CaseItem;
  open: boolean;
  onClose: () => void;
  initData?: {
    projects?: any[];
    developers?: Consignee[];
    modules?: Extension;
  };
}

function mapCaseToVoucherBuffer(values: CaseFormValues, initialData?: CaseItem) {
  const now = new Date();
  const isEditing = !!initialData;
  const developerId = values.developer ? parseInt(values.developer) : 0;

  return {
    voucher: {
      id: isEditing ? initialData.id! : 0,
      code: "",
      lastDevice: "",
      consignee1: Number(values.projectNameId),
      subTotal: 0,
      discount: 0,
      addCharge: 0,
      grandTotal: 0,
      consignee2: 37453,
      consignee3: developerId || 183,
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
      extension4: values.developmentStatus || "Prepared",
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

export function CaseForm({ mode, initialData, open, onClose, initData }: Props) {
  const [activeTab, setActiveTab] = useState<"general" | "attachments" | "notes">("general");
  const [deploymentNotes, setDeploymentNotes] = useState("");
  
  const projectOptions = useMemo(
    () => initData?.projects ?? [],
    [initData?.projects]
  );
  // Memoize module list with duplicate removal
  const moduleList = useMemo(() => {
    if (!initData?.modules?.remark) return [];
    const modules = initData.modules.remark
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m.length > 0);
    return [...new Set(modules)];
  }, [initData?.modules]);

  // Memoize developer options
  const developerOptions = useMemo(
    () => initData?.developers ?? [],
    [initData?.developers]
  );

  const { mutate: createCase, isPending: creating } = useCreateCase();
  const { mutate: updateCase, isPending: updating } = useUpdateCase();
  const { files, addFiles, removeFile, reset: resetAttachments } = useAttachment();

  const isPending = creating || updating;

  const form = useForm<CaseFormValues>({
    defaultValues: {
      projectName: "",
      projectNameId: "",
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

  // FIXED: Removed 'form' from dependencies to prevent infinite loop
  useEffect(() => {
    if (!open) return;
    
    if (mode === "edit" && initialData) {
      form.reset({
        caseNumber: initialData.caseNumber,
        projectName: initialData.projectName,
        projectNameId: initialData.projectNameId,
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
    } else if (mode === "create") {
      form.reset({
        projectName: "",
        projectNameId: "",
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
  }, [mode, initialData, open]); // REMOVED 'form' from dependencies

  const handleClose = useCallback(() => {
    form.reset();
    resetAttachments();
    setDeploymentNotes("");
    setActiveTab("general");
    onClose();
  }, [form, resetAttachments, onClose]);

  const onSubmit = useCallback((values: CaseFormValues) => {
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
  }, [mode, initialData, createCase, updateCase, handleClose]);

  if (!initData) {
    return null;
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
                      name="projectNameId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Projects</FormLabel>
                          <Select
                            value={field.value ?? undefined}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10 bg-white">
                                <SelectValue placeholder="Select project" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white z-[100]">
                              {projectOptions.map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                            <SelectContent className="bg-white z-[100]">
                              {moduleList.map((module: string) => (
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
                            <SelectContent className="bg-white z-[100]">
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
                            <SelectContent className="bg-white z-[100]">
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

                  {/* ROW 3 - Developer */}
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
                            <SelectContent className="bg-white z-[100]">
                              {developerOptions.map((developer: Consignee) => (
                                <SelectItem key={developer.id} value={String(developer.id)}>
                                  {developer.fullName}
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
                disabled={isPending}
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