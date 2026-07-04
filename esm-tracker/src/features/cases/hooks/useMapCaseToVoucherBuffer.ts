import { CaseFormValues } from "../types";
import {  CaseItem } from "../types";
import { mapStatusToId } from "../utils/statusMapping";

export function mapCaseToVoucherBuffer(values: CaseFormValues, initialData?: CaseItem) {
  const now = new Date();
  const isEditing = !!initialData;
  const developerId = values.developer ? parseInt(values.developer) : 0;
  console.log('laststatus:', values.status);
  const lastStatusId = mapStatusToId(values.status || "Prepared");
  console.log('lastStatusId:', lastStatusId);

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
      lastState: lastStatusId,
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