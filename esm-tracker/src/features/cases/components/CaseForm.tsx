import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useCreateCase, useUpdateCase } from "../hooks/useCases";
import type { CaseItem, CaseStatus } from "../types";
import { CASE_TYPES, PAID_OR_NOT } from "../types";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/shared/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAttachment } from "../hooks/useAttachment";
import { AttachmentUploader } from "./AttachmentUploader";
import { cn } from "@/shared/lib/utils";
import type { Consignee, Extension, CaseFormValues } from "../types";
import { mapCaseToVoucherBuffer } from "../hooks/useMapCaseToVoucherBuffer";
import { useAuthStore } from "@/features/auth/store/authStore";
import { UserRole } from "@/features/auth/types";
import { VoucherBuffer } from "../types";
import { useCaseStore } from "../store/caseStore";
import { FormError } from "@/shared/components/ui/form-error";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getPlainTextFromHtml } from '../utils/htmlUtils';

interface Props {
  mode: "create" | "edit" | "view";
  initialTab?: "general" | "attachments" | "notes";
  initialData?: CaseItem;
  open: boolean;
  onClose: () => void;
  onSuccess?: (title: string, message: string) => void;
  initData?: {
    projects?: Consignee[];
    developers?: Consignee[];
    modules?: Extension;
  };
}


export function CaseForm({ mode, initialData, open, onClose, initData, initialTab, onSuccess }: Props) {
  const [activeTab, setActiveTab] = useState<"general" | "attachments" | "notes">(initialTab ?? "general");
  const [projectQuery, setProjectQuery] = useState("");
  const [developerQuery, setDeveloperQuery] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [activeCaseId, setActiveCaseId] = useState<number | null>(initialData?.id ?? null);
  const MAX_CHAR_LIMIT = 300;

  const deploymentModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
    ],
  };

  const userId = useAuthStore((s) => s.userId);
  const personId = useAuthStore((s) => s.personId);
  const userRole = useAuthStore((s) => s.userRole);
  const transitionTargetStatus = useCaseStore((s) => s.transitionTargetStatus);
  const selectedParentCase = useCaseStore((s) => s.selectedParentCase);

  const isCreator = useMemo(() => { 
    if (mode === "create") { return true; }
    if (!initialData || personId == null) 
      { return false; } 
    const creatorPersonId = Number( initialData.functionalConsultantId ); 
    return creatorPersonId === Number(personId); 
  }, [mode, initialData, personId]);

    
  const isAdminAcceptanceReview = mode === "edit" && transitionTargetStatus === "Accepted";
  const isAdminAcceptedCaseEdit =
    mode === "edit" &&
    (isAdminAcceptanceReview ||
      (userRole === UserRole.ADMIN && initialData?.status === "Accepted"));
  const isTransitioningToWork =
    transitionTargetStatus === "On Progress" ||
    transitionTargetStatus === "Fixed";
  const canEditDeadline = isAdminAcceptedCaseEdit && !isTransitioningToWork;
  // const canEditDeveloper = isAdminAcceptedCaseEdit && !isTransitioningToWork;
  const canEditDeveloper =
    mode === "create" ||
    (
      mode === "edit" &&
      userRole === UserRole.ADMIN &&
      ["Prepared", "Accepted"].includes(
        transitionTargetStatus ?? initialData?.status ?? ""
      )
    );

  const isLimitedReviewEdit = mode === "edit" && isAdminAcceptedCaseEdit;

  const PRE_FIXED_STATUSES: CaseStatus[] = ["Prepared", "Returned", "Rejected", "Reviewed", "Accepted", "On Progress"];
  const POST_FIXED_STATUSES: CaseStatus[] = ["Solved", "Not Solved"];

  const isReleaseNoteEditable = useMemo(() => {
    if (mode === "view" || mode === "create") return false;

    const requestedStatus = transitionTargetStatus ?? initialData?.status;

    if (requestedStatus === "Fixed") {
      return userRole === UserRole.ADMIN || userRole === UserRole.DEVELOPER;
    }
    if (requestedStatus && POST_FIXED_STATUSES.includes(requestedStatus as CaseStatus)) {
      return userRole === UserRole.ADMIN || userRole === UserRole.DEVELOPER;
    }
    if (requestedStatus && PRE_FIXED_STATUSES.includes(requestedStatus as CaseStatus)) {
      return false;
    }

    return false;
  }, [mode, transitionTargetStatus, initialData?.status, userRole]);

  const isReleaseNoteRequired = useMemo(() => {
    if (mode === "view" || mode === "create") return false;
    return transitionTargetStatus === "Fixed";
  }, [mode, transitionTargetStatus]);

  const shouldOpenNotesTab = useMemo(() => {
    if (mode !== "edit") return false;
    if (transitionTargetStatus === "Fixed") return true;
    return Boolean(
      transitionTargetStatus &&
      POST_FIXED_STATUSES.includes(transitionTargetStatus as CaseStatus) &&
      (userRole === UserRole.ADMIN || userRole === UserRole.DEVELOPER)
    );
  }, [mode, transitionTargetStatus, userRole]);

  const isSubCaseCreateMode = mode === "create" && Boolean(selectedParentCase?.id);
  const isSubCaseBlocked = isSubCaseCreateMode && ["Solved", "Rejected"].includes(selectedParentCase?.status ?? "");
  const isParentValueLocked = isSubCaseCreateMode && Boolean(selectedParentCase);
  const isReadOnly = mode === "view" || (mode === "edit" && !isCreator && !isAdminAcceptedCaseEdit);
  const isReleaseNoteReadOnly = mode === "view" || mode === "create" || !isReleaseNoteEditable;
  const canSubmitChanges = mode === "create" || isCreator || isAdminAcceptedCaseEdit || isReleaseNoteEditable;

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
  const { files, addFiles, removeFile, uploadSingleFile, uploadAllFiles, downloadFile, reset: resetAttachments, persistAttachments, updateAttachments, loadAttachments, previewAttachment } = useAttachment();

  useEffect(() => {
    if (
      open && initialData?.id && (mode === "edit" || mode === "view")
    ) {
      loadAttachments(initialData.id);
    }
  }, [open, initialData?.id, mode]);

  const isPending = creating || updating;

  const form = useForm<CaseFormValues>({
    defaultValues: {
      projectName: "",
      projectNameId: "",
      module: "",
      isSubcase: "false",
      isUrgent: false,
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
    mode: "onChange",
  });

  const watchedDeveloper = form.watch("developer");
  // const watchedDeadline = form.watch("deadLine");
  const { errors } = form.formState;

  useEffect(() => {
    if (!open) return;

    setActiveCaseId(initialData?.id ?? null);
    const parentContext = selectedParentCase ?? (mode === "create" ? initialData : undefined);
    const parentProjectId = parentContext?.projectNameId ? String(parentContext.projectNameId) : "";
    const parentProjectName = parentContext?.projectName || "";
    const parentModule = parentContext?.module || "";

    if (shouldOpenNotesTab && mode === "edit") {
      setActiveTab("notes");
    }
    
    if ((mode === "view" || mode === "edit") && initialData) {
    const resetValues = {
      caseNumber: initialData.caseNumber || "",
      issueDate: initialData.issueDate ? initialData.issueDate.split('T')[0] : "", 
      projectName: initialData.projectName || "",
      projectNameId: initialData.projectNameId ? String(initialData.projectNameId) : "",
      issues: initialData.issues || "",
      paidorNot: initialData.paidorNot || "Free",
      caseType: initialData.caseType || "",
      module: initialData.module || "",
      developmentStatus: initialData.developmentStatus || "",
      isSubcase: typeof initialData.isSubcase === "boolean" ? (initialData.isSubcase ? "true" : "false") : (initialData.isSubcase === "true" ? "true" : "false"),
      isUrgent: initialData.isUrgent ? true : false,
      developer: initialData.developerId != null ? String(initialData.developerId) : null,
      department: initialData.department || "",
      deadLine: initialData.deadLine ? initialData.deadLine.split('T')[0] : "",
      releaseNote: initialData.releaseNote || "",
      status: initialData.status || "",
    };
    form.reset(resetValues);
      
    } else if (mode === "create") {
      form.reset({
        projectName: parentProjectName,
        projectNameId: parentProjectId,
        module: parentModule,
        isSubcase: "false",
        isUrgent: false,
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
    setSubmitAttempted(false);
  }, [mode, initialData, open, form, shouldOpenNotesTab, selectedParentCase]);

  const handleClose = useCallback(() => {
    form.reset();
    resetAttachments();
    setActiveTab("general");
    setSubmitAttempted(false);
    useCaseStore.getState().clearTransitionTargetStatus();
    onClose();
  }, [form, resetAttachments, onClose]);
  

  // const onSubmit = useCallback((values: CaseFormValues) => {
   const onSubmit = useCallback(async (values: CaseFormValues) => {

    if (isSubCaseBlocked) {
      console.warn("Sub-case creation is blocked for the selected parent case status.");
      return;
    }

    if(values.isUrgent){
      values.status = "Urgent";
    }

    values.isSubcase = isSubCaseCreateMode
      ? "true"
      : values.isSubcase === "true"
        ? "true"
        : "false";

    const currentStatus = form.getValues("status");
    const targetStatus = transitionTargetStatus ?? currentStatus ?? values.status;

    const submitValues: CaseFormValues = {
      ...values,
      status:
        mode === "edit" && targetStatus
          ? targetStatus
          : currentStatus || values.status,
    };

    const payload = mapCaseToVoucherBuffer(
      submitValues,
      userId,
      personId,
      initialData,
      isSubCaseCreateMode ? Number(selectedParentCase?.id ?? 0) : undefined,
    );

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

    if (mode === "create") {
      createCase(normalizedPayload, {
        onSuccess: async (data) => {
          const caseId = Number(data?.id ?? 0);

          setActiveCaseId(caseId || null);

          if (files.length > 0 && caseId) {
            try {
              await persistAttachments(caseId);
            } catch (err) {
              console.error("Attachment persistence failed after case creation", err);
            }
          }

          onSuccess?.(
            "Case Created",
            "Case created successfully."
          );

          handleClose();
        },
        onError: (err: any) => {
          console.error("CREATE ERROR", err);
        },
      });
    } else if (initialData) {
      updateCase(normalizedPayload, {
        onSuccess: async (data) => {

          const caseId = Number(data?.id ?? 0);

          setActiveCaseId(caseId || null);

          const hasAttachmentChanges =files.some(f => !f.isExisting) || files.some(f => f.isDeleted);

          if (caseId && hasAttachmentChanges) {
            await updateAttachments(caseId);
          }
          
         onSuccess?.(
          "Case Updated",
          "Case updated successfully."
        );
          handleClose();
        },
        onError: (err) => {
          console.error("UPDATE ERROR", err);
        },
      });
    }
  }, [mode, initialData, createCase, updateCase, handleClose, userId, personId, form, transitionTargetStatus, files, uploadAllFiles, persistAttachments, updateAttachments, isSubCaseBlocked, isSubCaseCreateMode, selectedParentCase]);

  const handleSubmitAttempt = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const isValid = await form.trigger();

    if (!isValid) {
      console.log("❌ Form validation failed");

      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (element as HTMLElement).focus();
        }
      }
      return;
    }

    await form.handleSubmit(onSubmit)();
  }, [form, onSubmit, errors]);

  const getFieldErrorClass = (fieldState: any) => {
    if (submitAttempted && fieldState.error) {
      return 'border-red-500 focus:ring-red-500';
    }
    return '';
  };

  const isUrgent = initialData?.isUrgent; 

  // const URGENT_EDITABLE_STATUSES: CaseStatus[] = [
  //   "Prepared",
  //   "Returned",
  //   "Urgent",
  // ];

  // const currentStatus = (transitionTargetStatus ??
  //   initialData?.status ??
  //   "") as CaseStatus;

  // let canEditUrgentChecklist = false;
  
  // if(mode== "create"){
  //   canEditUrgentChecklist = true;
  // } else{
  //   canEditUrgentChecklist = URGENT_EDITABLE_STATUSES.includes(currentStatus);
  // }


  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent 
        className={cn(
          "max-w-5xl p-0 overflow-hidden rounded-3xl bg-white border-2",
          isUrgent
            ? "border-red-500 shadow-red-200 shadow-lg"
            : "border-transparent"
        )}
      >
          {/* HEADER */}
          <div className="bg-gradient-to-r from-slate-950 to-slate-900 px-6 py-4 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {mode === "view"
                    ? "View Issue Voucher" 
                    :mode === "create"
                      ? (isSubCaseCreateMode
                          ? `Issue ${selectedParentCase?.caseNumber || selectedParentCase?.id || "New"}`
                          : "Add Issue Voucher Proposal")
                      : "Edit Issue Voucher"}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  {isSubCaseCreateMode
                    ? `Creating a sub-case for ${selectedParentCase?.caseNumber || "the selected parent case"}`
                    : "Creating new root level project issue track"}
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
                {submitAttempted && Object.keys(errors).length > 0 && (
                  <span className="ml-2 text-xs text-red-500">⚠️</span>
                )}
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
              onSubmit={handleSubmitAttempt}
              className="flex flex-col"
            >
              {activeTab === "general" && (
                <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 p-6 min-h-[500px]">
                  {/* LEFT CARD */}
                  <div className="rounded-2xl border bg-slate-50 p-5 space-y-5 shadow-sm">
                    
                    {/* ROW 1 - Project */}
                    {mode === "view" ? (
                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 min-h-10">
                        <p
                          className="text-sm text-slate-700 break-words whitespace-normal"
                          title={initialData?.projectName || ""}
                        >
                          {initialData?.projectName || "Not Assigned"}
                        </p>
                      </div>
                    ) : (
                      <div className=" gap-4">
                        <FormField
                          control={form.control}
                          name="projectNameId"
                          rules={{ required: "Project is required" }}
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel>Projects <span className="text-red-500">*</span></FormLabel>
                              <Select
                                value={field.value ?? undefined}
                                onValueChange={field.onChange}
                                disabled={isReadOnly || isLimitedReviewEdit || isParentValueLocked}
                              >
                                <FormControl>
                                  <SelectTrigger 
                                    className={cn(
                                      "h-10 bg-white",
                                      getFieldErrorClass(fieldState)
                                    )}
                                  >
                                    <SelectValue placeholder="Select project" />
                                  </SelectTrigger>
                                </FormControl>

                                <SelectContent 
                                  className="bg-white z-[100] max-h-[320px] overflow-hidden"
                                  position="popper"
                                  sideOffset={4}
                                >
                                  <div className="sticky top-0 z-10 bg-white px-2 pb-2 pt-2">
                                    <Input
                                      value={projectQuery}
                                      onChange={(e) => setProjectQuery(e.target.value)}
                                      onKeyDown={(e) => e.stopPropagation()}
                                      onMouseDown={(e) => e.stopPropagation()}
                                      placeholder="Search project"
                                      className="h-8"
                                      disabled={isReadOnly || isLimitedReviewEdit || isParentValueLocked}
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
                              <FormError message={fieldState.error?.message} />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                      
                    {/* ROW 2 - Module */}
                    <div className="gap-4">
                      <FormField
                        control={form.control}
                        name="module"
                        rules={{ required: "Module is required" }}
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>Module <span className="text-red-500">*</span></FormLabel>
                            <Select
                              value={field.value ?? undefined}
                              onValueChange={field.onChange}
                              disabled={isReadOnly || isLimitedReviewEdit || isParentValueLocked}
                            >
                              <FormControl>
                                <SelectTrigger 
                                  className={cn(
                                    "h-10 bg-white",
                                    getFieldErrorClass(fieldState)
                                  )}
                                >
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
                            {isParentValueLocked && (
                              <p className="mt-2 text-xs text-slate-500">
                                Project and module are locked to the parent case values.
                              </p>
                            )}
                            <FormError message={fieldState.error?.message} />
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
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>Case Type <span className="text-red-500">*</span></FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}
                              disabled={isReadOnly || isLimitedReviewEdit}>
                              <FormControl>
                                <SelectTrigger className={cn(
                                  "h-10 bg-white",
                                  getFieldErrorClass(fieldState)
                                )}>
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
                            <FormError message={fieldState.error?.message} />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="paidorNot"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>Payment Status</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}
                              disabled={isReadOnly || isLimitedReviewEdit}>
                              <FormControl>
                                <SelectTrigger className={cn(
                                  "h-10 bg-white",
                                  getFieldErrorClass(fieldState)
                                )}>
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
                            <FormError message={fieldState.error?.message} />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* {canEditUrgentChecklist &&(
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="isUrgent"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 rounded-md border p-3 bg-white">
                              <FormControl>
                                <Checkbox
                                  checked={field.value === true}
                                  onCheckedChange={(checked) =>
                                    field.onChange(checked ? true : false)
                                  }
                                  disabled={isReadOnly || isLimitedReviewEdit}
                                />
                              </FormControl>

                              <label className="!mt-0 cursor-pointer text-sm font-medium">
                                Urgent Issue
                              </label>
                            </FormItem>
                          )}
                        />
                      </div>
                    )} */}

                    {mode === "view" && (
                      <div className="grid gap-4">
                        
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
                          rules={isAdminAcceptanceReview ? { required: "Assigning developer is required before accepting" } : {}}
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel>Deadline <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input type="date" className="h-10 bg-white" {...field} disabled={!canEditDeadline} />
                              </FormControl>
                              <FormError message={fieldState.error?.message} />
                            </FormItem>
                          )}
                        />
                      </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-3">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Developer</p>
                          <p className="mt-1 text-sm text-slate-700">{watchedDeveloper ? (initData?.developers?.find((developer) => String(developer.id) === String(watchedDeveloper))?.fullName || initialData?.developer || "Not Assigned") : (initialData?.developer || "Not Assigned")}</p>
                        </div>
                        {/* <div className="rounded-xl border border-slate-200 bg-white p-3">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Deadline</p>
                          <p className="mt-1 text-sm text-slate-700">{watchedDeadline ? watchedDeadline : (initialData?.deadLine ? initialData.deadLine.split("T")[0] : "Not Assigned")}</p>
                        </div> */}
                      </div>
                    )}

                    {canEditDeveloper && (
                      <div className="gap-4">
                        <FormField
                          control={form.control}
                          name="developer"
                          rules={{ 
                            required: isAdminAcceptanceReview
                              ? "Developer is required before accepting"
                              : undefined,
                          }}
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel>
                                Developer 
                                {isAdminAcceptanceReview && (
                                  <span className="text-red-500">*</span>
                                )}
                              </FormLabel>
                              <Select value={field.value ?? undefined} onValueChange={field.onChange} disabled={!canEditDeveloper}>
                                <FormControl>
                                  <SelectTrigger 
                                    className={cn(
                                      "h-10 bg-white",
                                      getFieldErrorClass(fieldState)
                                    )}
                                  >
                                    <SelectValue placeholder="Select developer" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent 
                                  className="bg-white z-[100] overflow-hidden"
                                  position="popper"
                                  sideOffset={4}
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
                                        {developer.firstName} {developer.secondName}
                                      </SelectItem>
                                    ))}
                                  </div>
                                </SelectContent>
                              </Select>
                              <FormError message={fieldState.error?.message} />
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
                          // rules={isAdminAcceptanceReview ? { required: "Deadline is required before accepting" } : {}}
                          rules={{
                            required: isAdminAcceptanceReview ? "Deadline is required before accepting" : undefined,
                            validate: (value) => {
                              if (!value) return true;
                          
                              const issueDate = form.getValues("issueDate");
                              
                              if (issueDate && value < issueDate) {
                                return "Deadline cannot be before the Issue Date";
                              }
                              
                              return true;
                            }
                          }}
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel>Deadline <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  className={cn(
                                    "h-10 bg-white",
                                    getFieldErrorClass(fieldState)
                                  )} 
                                  {...field} 
                                  disabled={!canEditDeadline} 
                                />
                              </FormControl>
                              <FormError message={fieldState.error?.message} />
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
                      rules={{ 
                        required: "Issue details are required",
                        validate: (value) => {
                          const plainText = getPlainTextFromHtml(value);
                          if (plainText.length > MAX_CHAR_LIMIT) {
                            return `Maximum ${MAX_CHAR_LIMIT} characters allowed`;
                          }
                          return true;
                        }
                      }}
                      render={({ field, fieldState }) => {
                        const currentLength = getPlainTextFromHtml(field.value || "").length;

                        return (
                          <FormItem>
                            <div className="flex justify-between items-center mb-2">
                              <FormLabel>
                                Issue Details Log <span className="text-red-500">*</span>
                              </FormLabel>
                              <span className={`text-sm font-medium ${currentLength > MAX_CHAR_LIMIT ? 'text-red-500' : 'text-slate-500'}`}>
                                {currentLength} / {MAX_CHAR_LIMIT}
                              </span>
                            </div>
                            
                            <FormControl>
                              <ReactQuill
                                theme="snow"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                className="rounded-2xl border shadow-sm bg-slate-50 overflow-hidden [&_.ql-editor]:min-h-[400px]"
                                modules={{
                                  toolbar: [
                                    [{ header: [1, 2, false] }],
                                    ['bold', 'italic', 'underline', 'strike'],
                                    [{ list: 'ordered' }, { list: 'bullet' }],
                                    ['link'],
                                    ['clean'] // Removes formatting
                                  ],
                                }}
                                placeholder="Enter issue descriptions here..."
                                readOnly={isReadOnly || isLimitedReviewEdit}
                              />
                            </FormControl>
                            <FormError message={fieldState.error?.message} />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                </div>
              )}
              
              {activeTab === "attachments" && (
                <div className="p-6 min-h-[500px]">
                  <AttachmentUploader
                    open={activeTab === "attachments"}
                    files={files}
                    addFiles={addFiles}
                    removeFile={removeFile}
                    uploadSingleFile={uploadSingleFile}
                    uploadAllFiles={uploadAllFiles}
                    downloadFile={downloadFile}
                    previewFile={previewAttachment}
                    caseId={activeCaseId ?? initialData?.id ?? null}
                    disabled={isReadOnly}
                    maxFileSize={5}
                    subDirectory="0076217301/Transaction/ESMTracker"
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
                
              // {activeTab === "notes" && canAddReleaseNote && (
                <div className="p-6 min-h-[500px] flex flex-col">
                  <FormField
                    control={form.control}
                    name="releaseNote"
                    rules={{
                      validate: (value) => {
                        const plainText = getPlainTextFromHtml(value || "");
                        if (isReleaseNoteRequired && plainText.trim().length === 0) {
                          return "Release deployment notes are required before proceeding";
                        }
                        if (plainText.length > MAX_CHAR_LIMIT) {
                          return `Maximum ${MAX_CHAR_LIMIT} characters allowed`;
                        }
                        return true;
                      }
                    }}
                    render={({ field, fieldState }) => {
                      const currentLength = getPlainTextFromHtml(field.value || "").length;
                      
                      return (
                        <>
                          <div className="flex justify-end mb-2">
                            <span className={`text-sm font-medium ${currentLength > MAX_CHAR_LIMIT ? 'text-red-500' : 'text-slate-500'}`}>
                              {currentLength} / {MAX_CHAR_LIMIT}
                            </span>
                          </div>
                          
                          <ReactQuill
                            theme="snow"
                            value={field.value || ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            className="rounded-2xl border bg-slate-50 overflow-hidden flex-1 [&_.ql-editor]:min-h-[400px]"
                            modules={deploymentModules}
                            placeholder="Write deployment notes..."
                            readOnly={isReleaseNoteReadOnly}
                          />
                          
                          {currentLength > MAX_CHAR_LIMIT && (
                            <p className="mt-2 text-sm text-red-500">
                              Deployment notes exceed the maximum {MAX_CHAR_LIMIT} characters.
                            </p>
                          )}
                          
                          <FormError message={fieldState.error?.message} />
                        </>
                      );
                    }}
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
                {isSubCaseBlocked && (
                  <p className="text-sm text-red-600">
                    Sub-case creation is not allowed for Solved or Rejected parent cases.
                  </p>
                )}
                {canSubmitChanges && (
                  <Button
                    type="submit"
                    disabled={isPending || isSubCaseBlocked}
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