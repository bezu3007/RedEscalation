import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useCreateCase, useUpdateCase } from "../hooks/useCases";
import type { CaseItem } from "../types";
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
import type { Consignee, Extension, CaseFormValues } from "../types";
import { mapCaseToVoucherBuffer } from "../hooks/useMapCaseToVoucherBuffer";
import { useAuthStore } from "@/features/auth/store/authStore";
// import { UserRole } from "@/features/auth/types";
import { VoucherBuffer } from "../types";
import { useCaseStore } from "../store/caseStore";


interface Props {
  mode: "create" | "edit" | "view";
  initialData?: CaseItem;
  open: boolean;
  onClose: () => void;
  initData?: {
    projects?: Consignee[];
    developers?: Consignee[];
    modules?: Extension;
  };
}


export function CaseForm({ mode, initialData, open, onClose, initData }: Props) {
  const [activeTab, setActiveTab] = useState<"general" | "attachments" | "notes">("general");
  const [deploymentNotes, setDeploymentNotes] = useState("");
  const [projectQuery, setProjectQuery] = useState("");
  const [developerQuery, setDeveloperQuery] = useState("");

  const userId = useAuthStore((s) => s.userId);
  const personId = useAuthStore((s) => s.personId);
  // const userRole = useAuthStore((s) => s.userRole);
  const transitionTargetStatus = useCaseStore((s) => s.transitionTargetStatus);
  console.log("PERSONNNNNN: ", personId);
  console.log(mode, "MODDDDDDDDDDDEEEEEEEEEEEEEE");
  console.log("Intial Data: ", initialData);

  const isCreator = useMemo(() => { 
    if (mode === "create") { return true; }
    if (!initialData || personId == null) 
      { return false; } 
    const creatorPersonId = Number( initialData.functionalConsultantId ); 
    return creatorPersonId === Number(personId); 
  }, [mode, initialData, personId]);

  console.log("isCreator:", isCreator);
    
  const isAdminAcceptanceReview = mode === "edit" && transitionTargetStatus === "Accepted";
  // const isAdminAcceptanceReview = mode === "edit";
  // const isReadOnly = mode == "view" || (mode === "edit" && !isCreator && !isAdminAcceptanceReview);
  const isLimitedReviewEdit = mode === "edit" && isAdminAcceptanceReview;
  const canEditDeadline = mode === "edit" && isAdminAcceptanceReview;
  const canEditDeveloper = mode === "edit" && isAdminAcceptanceReview;

  const isReadOnly = mode == "view" || (mode === "edit" && !isCreator && !isAdminAcceptanceReview);

  console.log("🔍 isReadOnly:", isReadOnly);

  const projectOptions = useMemo(() => {
  const projects = initData?.projects ?? [];
  const query = projectQuery.trim().toLowerCase();

    if (!query) {
      return projects.slice(0, 250);
    }

    return projects
      .filter((project) => {
        const haystack = [
          project.fullName,
          project.firstName,
          project.secondName,
          project.thirdName,
          project.code,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(query);
      })
      .slice(0, 250);
  }, [initData?.projects, projectQuery]);

  // Memoize module list with duplicate removal
  const moduleList = useMemo(() => {
    if (!initData?.modules?.remark) return [];
    const modules = initData.modules.remark
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m.length > 0);
    return [...new Set(modules)];
  }, [initData?.modules]);

  const developerOptions = useMemo(() => {
    const developers = initData?.developers ?? [];
    const query = developerQuery.trim().toLowerCase();

    if (!query) {
      return developers.slice(0, 250);
    }

    return developers
      .filter((developer) => {
        const haystack = [
          developer.fullName,
          developer.firstName,
          developer.secondName,
          developer.thirdName,
          developer.code,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(query);
      })
      .slice(0, 250);
  }, [initData?.developers, developerQuery]);

  const { mutate: createCase, isPending: creating } = useCreateCase();
  const { mutate: updateCase, isPending: updating } = useUpdateCase();
  const { files, addFiles, removeFile, reset: resetAttachments } = useAttachment();

  const isPending = creating || updating;

  const form = useForm<CaseFormValues>({
    defaultValues: {
      projectName: "",
      projectNameId: "",
      module: "",
      caseType: "",
      developer: "",
      paidorNot: "Free",
      department: "",
      issueDate: "",
      deadLine: "",
      releaseNote: "",
      issues: "",
      developmentStatus: "",
      status: "",
    },
  });

  const watchedDeveloper = form.watch("developer");
  const watchedDeadline = form.watch("deadLine");

  useEffect(() => {
    if (!open) return;
    console.log('status:', initialData?.status);
    
    if ((mode === "view" || mode === "edit") && initialData) {
    console.log("🔄 Resetting form with initialData:", initialData);
    const resetValues = {
      caseNumber: initialData.caseNumber || "",
      projectName: initialData.projectName || "",
      projectNameId: initialData.projectNameId ? String(initialData.projectNameId) : "",
      module: initialData.module || "",
      caseType: initialData.caseType || "",
      developer: initialData.developerId != null ? String(initialData.developerId) : null,
      paidorNot: initialData.paidorNot || "Free",
      department: initialData.department || "",
      issueDate: initialData.issueDate ? initialData.issueDate.split('T')[0] : "", 
      deadLine: initialData.deadLine ? initialData.deadLine.split('T')[0] : "",
      releaseNote: initialData.releaseNote || "",
      issues: initialData.issues || "",
      developmentStatus: initialData.developmentStatus || "",
      status: initialData.status || "",
    };
    console.log("📋 Reset values:", resetValues);
    form.reset(resetValues);

      if (initialData.releaseNote) {
        setDeploymentNotes(initialData.releaseNote);
      }
      
    } else if (mode === "create") {
      form.reset({
        projectName: "",
        projectNameId: "",
        module: "",
        caseType: "",
        developer: "",
        paidorNot: "Free",
        department: "",
        issueDate: "",
        deadLine: "",
        releaseNote: "",
        issues: "",
        developmentStatus: "",
        status: "",
      });
    }
  }, [mode, initialData, open]);
  console.log("Form state after reset:", form.getValues());
const { errors } = form.formState;
useEffect(() => {
  if (Object.keys(errors).length > 0) {
    console.log("❌ Form Validation Failed! Current errors:", errors);
  }
}, [errors]);

  const handleClose = useCallback(() => {
    form.reset();
    resetAttachments();
    setDeploymentNotes("");
    setActiveTab("general");
    useCaseStore.getState().clearTransitionTargetStatus();
    onClose();
  }, [form, resetAttachments, onClose]);
  
console.log("Button state - isPending:", isPending);
console.log("Button state - isReadOnly:", isReadOnly);

  const onSubmit = useCallback((values: CaseFormValues) => {
    console.log("🚀 Form submitted with values:", values);
console.log("INITIAL DATA:", initialData);
// console.log("FINAL PAYLOAD:", mappedData);
    console.log("📝 Current form state:", form.getValues());
    console.log("🎯 Mode:", mode);
    console.log("🔍 isAdminAcceptanceReview:", isAdminAcceptanceReview);

    console.log("Validation check:", {
      projectNameId: values.projectNameId,
      module: values.module,
      caseType: values.caseType,
      issues: values.issues,
    });


    const currentStatus = form.getValues("status");

    const submitValues: CaseFormValues = {
      ...values,
      status:
        mode === "edit" && isAdminAcceptanceReview
          ? "Accepted"
          : currentStatus || values.status,
    };

    console.log("Preparing to map case to voucher buffer with submitValues:", submitValues);
    const payload = mapCaseToVoucherBuffer(submitValues, userId, personId, initialData);
    console.log("Mapped payload for submission:", payload);

    const normalizedPayload = {
      ...payload,
      voucher: {
        ...payload.voucher,
        consignee1: Number(payload.voucher.consignee1) || null,
        consignee2: Number(payload.voucher.consignee2) || null,
        consignee3: Number(payload.voucher.consignee3) || null,
        lastUser: Number(payload.voucher.lastUser) || null,
      },
    } as VoucherBuffer;

    console.log("PAYLOAD", normalizedPayload);

    if (mode === "create") {
      createCase(normalizedPayload, {
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
      console.log("Updating case with ID:", initialData.id);
      updateCase(normalizedPayload, {
        onSuccess: (data) => {
          console.log("UPDATE SUCCESS", data);
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
                {mode === "view"
                  ? "View Issue Voucher" 
                  :mode === "create"
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
          <form
            onSubmit={form.handleSubmit(
              onSubmit,
              (errors) => console.log("❌ Form Validation Failed on Submit!", errors) // <-- ADD THIS
            )}
            className="flex flex-col"
          >
            {activeTab === "general" && (
              <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 p-6 min-h-[500px]">
                {/* LEFT CARD */}
                <div className="rounded-2xl border bg-slate-50 p-5 space-y-5 shadow-sm">
                  {/* ROW 1 - Project */}
                  <div className=" gap-4">
                    <FormField
                      control={form.control}
                      name="projectNameId"
                      rules={{ required: "Project is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Projects <span className="text-red-500">*</span></FormLabel>
                          <Select
                            value={field.value ?? undefined}
                            onValueChange={field.onChange}
                            disabled={isReadOnly || isLimitedReviewEdit}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10 bg-white">
                                <SelectValue placeholder="Select project" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent 
                              className="bg-white z-[100] max-h-[320px] overflow-hidden"
                              position="popper" // Add this
                              sideOffset={4}    // Add this
                            >
                              <div className="sticky top-0 z-10 bg-white px-2 pb-2 pt-2">
                                <Input
                                  value={projectQuery}
                                  onChange={(e) => setProjectQuery(e.target.value)}
                                  onKeyDown={(e) => e.stopPropagation()}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  placeholder="Search project"
                                  className="h-8"
                                  disabled={isReadOnly || isLimitedReviewEdit}
                                />
                              </div>
                              <div className="px-2 pb-1 text-xs text-slate-500">
                                Showing first 250 matches. Type to narrow the list.
                              </div>
                              <div className="h-[220px] overflow-y-auto">
                                {projectOptions.map((project: Consignee) => (
                                  <SelectItem key={project.id} value={String(project.id)}>
                                    {project.fullName}
                                  </SelectItem>
                                ))}
                              </div>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                    
                  {/* ROW 2 - Module */}
                  <div className="gap-4">
                    <FormField
                      control={form.control}
                      name="module"
                      rules={{ required: "Module is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Module <span className="text-red-500">*</span></FormLabel>
                          <Select
                            value={field.value ?? undefined}
                            onValueChange={field.onChange}
                            disabled={isReadOnly || isLimitedReviewEdit}
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

                  {/* ROW 3 - Case Type & Payment Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="caseType"
                      rules={{ required: "Case Type is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Case Type <span className="text-red-500">*</span></FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}
                            disabled={isReadOnly || isLimitedReviewEdit}>
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
                          <Select value={field.value} onValueChange={field.onChange}
                            disabled={isReadOnly || isLimitedReviewEdit}>
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

                  {mode === "view" && (
                    <div className="grid gap-4">
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Issue Date</p>
                        <p className="mt-1 text-sm text-slate-700">{initialData?.issueDate ? initialData.issueDate.split("T")[0] : "Not Assigned"}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Developer</p>
                        <p className="mt-1 text-sm text-slate-700">{watchedDeveloper ? (initData?.developers?.find((developer) => String(developer.id) === String(watchedDeveloper))?.fullName || initialData?.developer || "Not Assigned") : (initialData?.developer || "Not Assigned")}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Deadline</p>
                        <p className="mt-1 text-sm text-slate-700">{watchedDeadline ? watchedDeadline : (initialData?.deadLine ? initialData.deadLine.split("T")[0] : "Not Assigned")}</p>
                      </div>
                    </div>
                  )}

                  {isAdminAcceptanceReview && (
                    <div className="gap-4">
                      <FormField
                        control={form.control}
                        name="developer"
                        rules={{ required: "Developer is required before accepting" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Developer <span className="text-red-500">*</span></FormLabel>
                            <Select value={field.value ?? undefined} onValueChange={field.onChange} disabled={!canEditDeveloper}>
                              <FormControl>
                                <SelectTrigger className="h-10 bg-white">
                                  <SelectValue placeholder="Select developer" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent 
                                className="bg-white z-[100] overflow-hidden"
                                position="popper" // Add this
                                sideOffset={4}    // Add this
                              >
                                <div className="sticky top-0 z-10 bg-white px-2 pb-2 pt-2">
                                  <Input
                                    value={developerQuery}
                                    onChange={(e) => setDeveloperQuery(e.target.value)}
                                    onKeyDown={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    placeholder="Search developer"
                                    className="h-8"
                                  />
                                </div>
                                <div className="px-2 pb-1 text-xs text-slate-500">
                                  Showing first 250 matches. Type to narrow the list.
                                </div>
                                <div className="h-[220px] overflow-y-auto">
                                  {developerOptions.map((developer: Consignee) => (
                                    <SelectItem key={developer.id} value={String(developer.id)}>
                                      {developer.fullName}
                                    </SelectItem>
                                  ))}
                                </div>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {mode === "edit" && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="issueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Issue Date</FormLabel>
                            <FormControl>
                              <Input type="date" className="h-10 bg-white" {...field} readOnly disabled />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="deadLine"
                        rules={isAdminAcceptanceReview ? { required: "Deadline is required before accepting" } : {}}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deadline <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input type="date" className="h-10 bg-white" {...field} disabled={!canEditDeadline} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* RIGHT SIDE - Issues */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="issues"
                    rules={{ required: "Issue details are required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issue Details Log <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Textarea
                            rows={20}
                            className="resize-none rounded-2xl border bg-slate-50 p-4"
                            placeholder="Enter issue descriptions here..."
                            {...field}
                            disabled={isReadOnly || isLimitedReviewEdit}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
            
            {activeTab === "attachments" && (
              <div className="p-6 min-h-[500px]">
                <AttachmentUploader
                  files={files}
                  addFiles={addFiles}
                  removeFile={removeFile}
                  disabled={isReadOnly}
                  maxFileSize={20} // 20MB limit
                  acceptedTypes={[
                    "image/*", 
                    "application/pdf", 
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  ]}
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
                  disabled={isReadOnly}
                />
              </div>
            )}

            {/* FOOTER */}
            <div className="flex items-center gap-3 border-t bg-slate-50 px-6 py-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <input type="hidden" {...field} />
                )}
              />
              {!isReadOnly && (
                <Button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-slate-900 px-6 hover:bg-slate-800"
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === "create" ? "Create Case" : "Save Changes"}
                </Button>
              )}
              
              {/* Show Close button for all modes */}
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="rounded-xl"
              >
                {isReadOnly ? "Close" : "Cancel"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}