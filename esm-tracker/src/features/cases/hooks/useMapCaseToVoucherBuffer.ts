import { CaseFormValues } from "../types";
import {  CaseItem } from "../types";
import { mapStatusToId } from "../utils/statusMapping";
export function mapCaseToVoucherBuffer(values: CaseFormValues, userId : number | null, personId: number | null, initialData?: CaseItem) {
  const now = new Date();
  const isEditing = !!initialData;

  let finalStatus = values.status || "Prepared";
  
  if(finalStatus == "Returned"){
    finalStatus="Prepared";
  }
  const lastStatusId = mapStatusToId(finalStatus);
  // console.log('lastStatusId:', lastStatusId);
  // console.log("Dev: ", initialData?.developerId);
  // console.log(initialData?.functionalConsultantId);
  // console.log(personId);
  console.log(values.issueDate);

  return {
    voucher: {
      id: isEditing ? initialData.id! : 0,
      code: initialData?.caseNumber || "",
      lastDevice: "",
      consignee1: Number(values.projectNameId),
      subTotal: 0,
      discount: 0,
      addCharge: 0,
      grandTotal: 0,
      consignee2: isEditing ? initialData?.functionalConsultantId : personId,
      consignee3: initialData?.developerId || values.developer || null,
      consignee4: null,
      issuedDate: values.issueDate,
      note: values.issues,
      originConsigneeUnit: 3,
      consigneeUnit1: 3,
      lastModified: now.toISOString(),
      createdOn: values.issueDate,
      extension1: values.paidorNot,
      extension2: values.caseType,
      extension3: values.module,
      extension4: finalStatus,
      lastState: lastStatusId,
      startDate: values.issueDate,
      endDate: values.deadLine,
      remark: values.releaseNote,
      type: 1917,
      lastUser: userId,
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