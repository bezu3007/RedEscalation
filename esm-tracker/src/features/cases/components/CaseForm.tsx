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
import { VoucherBuffer } from "../types";


interface Props {
  mode: "create" | "edit";
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
  console.log("PERSONNNNNN: ", personId);

  const isCreator = useMemo(() => { 
    if (mode === "create") { return true; }
    if (!initialData || personId == null) 
      { return false; } 
    const creatorPersonId = Number( initialData.functionalConsultantId ); 
    return creatorPersonId === Number(personId); }, [mode, initialData, personId]); 
    const isReadOnly = mode === "edit" && !isCreator;

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

  // Memoize developer options
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

  useEffect(() => {
    console.log("CaseForm option counts:", {
      projects: projectOptions.length,
      modules: moduleList.length,
      developers: developerOptions.length,
    });
  }, [projectOptions, moduleList, developerOptions]);

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
      status: "Prepared", // Default status for new cases
    },
  });

  // FIXED: Removed 'form' from dependencies to prevent infinite loop
  useEffect(() => {
    if (!open) return;
    console.log('status:', initialData?.status);
    
    if (mode === "edit" && initialData) {
      form.reset({
      caseNumber: initialData.caseNumber || "",
      projectName: initialData.projectName || "",
      projectNameId: initialData.projectNameId ? String(initialData.projectNameId) : "",
      module: initialData.module || "",
      caseType: initialData.caseType || "Error",
      developer: initialData.developerId != null ? String(initialData.developerId) : null,
      paidorNot: initialData.paidorNot || "Free",
      department: initialData.department || "",
      issueDate: initialData.issueDate ? initialData.issueDate.split('T')[0] : "", 
      deadLine: initialData.deadLine ? initialData.deadLine.split('T')[0] : "",
      releaseNote: initialData.releaseNote || "",
      issues: initialData.issues || "",
      developmentStatus: initialData.developmentStatus || "",
      status: initialData.status || "Prepared", // Default status if not provided
      });
      if (initialData.releaseNote) {
        setDeploymentNotes(initialData.releaseNote);
      }
      
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
        status: "Prepared", // Default status for new cases
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

    const payload = mapCaseToVoucherBuffer(values, userId, personId, initialData);

    const normalizedPayload = {
      ...payload,
      voucher: {
        ...payload.voucher,
        consignee3: Number(payload.voucher.consignee3) || 0,
      },
    } as VoucherBuffer;

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
      console.log("Updating case with ID:", initialData.id);
      updateCase(
        {
          id: initialData.id!,
          body: normalizedPayload,
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
                            disabled={isReadOnly}
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
                                  disabled={isReadOnly}
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

                    <FormField
                      control={form.control}
                      name="module"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Module</FormLabel>
                          <Select
                            value={field.value ?? undefined}
                            onValueChange={field.onChange}
                            disabled={isReadOnly}
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
                          <Select value={field.value} onValueChange={field.onChange}
                            disabled={isReadOnly}>
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
                            disabled={isReadOnly}>
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
                            disabled={isReadOnly}
                          >
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

                  {/* ROW 4 - Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="issueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" className="h-10 bg-white" {...field} 
                            disabled={isReadOnly}/>
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
                            <Input type="date" className="h-10 bg-white" {...field} 
                            disabled={isReadOnly}/>
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
                            disabled={isReadOnly}
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
            <input type="hidden" {...form.register("status")} />
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
              
              {/* Show Close button for both modes */}
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