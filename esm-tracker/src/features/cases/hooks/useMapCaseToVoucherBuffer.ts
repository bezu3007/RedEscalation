import { CaseFormValues, CaseItem, TransactionReferenceBuffer } from "../types";
import { mapStatusToId } from "../utils/statusMapping";

export function mapCaseToVoucherBuffer(
  values: CaseFormValues,
  userId: number | null,
  personId: number | null,
  initialData?: CaseItem,
  referencedId?: number,
) {
  const now = new Date();
  const isEditing = !!initialData;
  console.log("Referenced ID:", referencedId);

  const issueDateValue = values.issueDate?.trim()
    ? values.issueDate
    : (isEditing
        ? initialData?.issueDate?.split("T")[0] || ""
        : now.toISOString().split("T")[0]);

  let finalStatus = values.status || "Prepared";
  
  if(finalStatus == "Returned"){
    finalStatus="Prepared";
  }

  // if(finalStatus == "Rejected"){
  //   finalStatus="Closed";
  // }
console.log("Final Status isUrgentttttttttttttttttt:", finalStatus, values.isUrgent);

  if(finalStatus === "Prepared" && values.isUrgent){
        finalStatus = "Urgent";
  }
  if(finalStatus === "Urgent" && !values.isUrgent){
        finalStatus = "Prepared";
  }

  const lastStatusId = mapStatusToId(finalStatus);
  const normalizedProjectId = Number(values.projectNameId) || 0;
  const normalizedConsignee2 = Number(isEditing ? initialData?.functionalConsultantId : personId ?? userId ?? 0) || null;
  const normalizedConsignee3 = Number(values.developer ?? initialData?.developerId ?? null);
  const transactionReferencesBuffer: TransactionReferenceBuffer[] =
    referencedId && referencedId > 0
      ? [
          {
            transactionReference: {
              id: 0,
              referring: 0,
              referencingVoucherDefn: 400,
              referenced: referencedId,
              referencedVoucherDefn: 400,
              value: null,
              relationType: null,
              remark: "sub issue",
            },
            referencedActivity: null,
            referencedVoucherLastState: null,
            referencedVoucherVoid: false,
            closedRelation: null,
          },
        ]
      : [];

  if(referencedId && referencedId === 0){
    values.isSubcase = "false";
  }


  console.log("Transaction References Buffer:", transactionReferencesBuffer);
  console.log(referencedId && referencedId > 0 ? "Referenced ID is valid" : "Referenced ID is not valid or not provided");
  
  
  // const urgentValue =
  // isEditing && initialData?.isUrgent
  //   ? "1364"
  //   : values.isUrgent
  //     ? "1364"
  //     : "0";

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
      consignee4: finalStatus === "Reviewed" ? personId ?? null : null,
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
      extension5: values.isUrgent ? "1364" : "0",
      extension6: values.isSubcase === "true" ? "true" : "false",
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
      activityDefinition: isEditing ? 1290 : 1305,
      remark: "",
    },
    IdGenerationParams: { isWeb: true, consigneeUnitId: 3 },
    transactionReferencesBuffer,
  };
}