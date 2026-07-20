import { CaseFormValues } from "../types";
import {  CaseItem } from "../types";
import { mapStatusToId } from "../utils/statusMapping";
export function mapCaseToVoucherBuffer(values: CaseFormValues, userId : number | null, personId: number | null, initialData?: CaseItem) {
  console.log("reacheddddddddddddddddd...", values, userId, personId, initialData);
  const now = new Date();
  const isEditing = !!initialData;

  const issueDateValue = values.issueDate?.trim()
    ? values.issueDate
    : (isEditing
        ? initialData?.issueDate?.split("T")[0] || ""
        : now.toISOString().split("T")[0]);

  let finalStatus = values.status || "Prepared";
  
  if(finalStatus == "Returned"){
    finalStatus="Prepared";
  }
  console.log("Functional Consultant ID:", initialData?.functionalConsultantId);
  const lastStatusId = mapStatusToId(finalStatus);
  const normalizedProjectId = Number(values.projectNameId) || 0;
  const normalizedConsignee2 = Number(isEditing ? initialData?.functionalConsultantId : personId ?? userId ?? 0) || null;
  const normalizedConsignee3 = Number(values.developer ?? initialData?.developerId ?? null);

  console.log("Mapping case to voucher buffer with values:", {
    values,
    userId,
    personId,
    initialData
  });

  return {
    voucher: {
      id: isEditing ? initialData.id! : 0,
      code: initialData?.caseNumber || "",
      lastDevice: "",
      consignee1: normalizedProjectId,
      subTotal: 0,
      discount: 0,
      addCharge: 0,
      grandTotal: 0,
      consignee2: normalizedConsignee2,
      consignee3: normalizedConsignee3,
      consignee4: null,
      issuedDate: issueDateValue,
      note: values.issues,
      originConsigneeUnit: 3,
      consigneeUnit1: 3,
      lastModified: now.toISOString(),
      createdOn: issueDateValue,
      extension1: values.paidorNot,
      extension2: values.caseType,
      extension3: values.module,
      extension4: finalStatus,
      lastState: lastStatusId,
      startDate: issueDateValue,
      endDate: values.deadLine || null,
      remark: values.releaseNote,
      type: 1917,
      lastUser: userId ?? 0,
      definition: 400,
    },
    activity: {
      id: 0,
      reference: 0,
      device: null,
      timeStamp: now.toISOString(),
      user: userId,
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