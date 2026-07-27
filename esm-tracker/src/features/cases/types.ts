export const Case_Status =[
   "Accepted",
   "Solved",
   "Fixed",
   "Prepared",
   "Re Journal",
   "Rejected",
   "Returned",
   "Reviewed",
   "Not Solved",
   "On Progress",
   "Closed"
]
export type CaseStatus =
  (typeof Case_Status)[number];

export const CASE_TYPES = [
  "Performance",
  "Error",
  "Report",
  "Intermitant Case",
  "New Functionality",
  "Customization",
  "Not Implemented",
] as const;

export type CaseType =
  (typeof CASE_TYPES)[number];

  export const PAID_OR_NOT = [
  "Paid",
  "Free",
  "To Be Determined",
] as const;

export type PaidorNot =
  (typeof PAID_OR_NOT)[number];

export interface CaseFilters {
  code: string,
  search: string;
  status: CaseStatus | "";
  caseType: CaseType | "";
  module: string;
  projectName: string;
  paidorNot: string;
  developer: string;
  fromIssueDate: string;
  toIssueDate: string;
}

export interface VoucherDTO {
    id: number; // Make sure this is required number, not nullable
    code: string;
    lastDevice: string;
    consignee1: number;
    subTotal: number;
    discount: number;
    addCharge: number;
    grandTotal: number;
    consignee2: Number | null;
    consignee3: number | null;
    consignee4: number | null;
    issuedDate: string;
    note: string;
    originConsigneeUnit: number;
    consigneeUnit1: number;
    lastModified: string;
    createdOn: string;
    extension1: string;
    extension2: string;
    extension3: string;
    extension4: string;
    lastState: number;
    startDate: string;
    endDate: string;
    remark: string;
    type: number;
    lastUser: number | null;
    definition: number;
}

export interface ActivityDTO {
  id: number;
  reference: number;
  device: string | null;
  timeStamp: string;
  user: number | null;
  day: number;
  month: number;
  year: number;
  platform: string;
  consigneeUnit: number;
  activityDefinition: number;
  remark: string;
}

export interface TransactionReferenceDTO {
  id: number;
  referring: number | null;
  referencingVoucherDefn: number | null;
  referenced: number | null;
  referencedVoucherDefn: number | null;
  value: number | null;
  relationType: number | null;
  remark: string | null;
}

export interface ClosedRelationDTO {
  id: number;
  voucher: number;
  timeStamp: string;
  referredVouherDefn: number;
  referringVoucherDefn: number;
  remark: string | null;
}

export interface TransactionReferenceBuffer {
  transactionReference: TransactionReferenceDTO;
  referencedActivity: ActivityDTO | null;
  referencedVoucherLastState: number | null;
  referencedVoucherVoid: boolean;
  closedRelation: ClosedRelationDTO | null;
}

export interface VoucherBuffer {
  voucher: VoucherDTO;
  activity: ActivityDTO;
  IdGenerationParams: {
    isWeb: boolean;
    consigneeUnitId: number;
  };
  transactionReferencesBuffer: TransactionReferenceBuffer[];
}

export interface CreateCaseRequest {
  id: number | null;
  caseNumber: string | "";
  issueDate: string;
  projectName: string;
  projectNameId: string | undefined;
  issues: string;
  paidorNot: string;
  caseType: CaseType;
  module: string;
  functionalConsultant: string;
  functionalConsultantId: string;
  reviewedBy: string | null;
  developer: string | null;
  developerId: string | null;
  department: string | null;
  departmentId: string | null;
  developmentStatus: string;
  UATStatus: string | null;
  status: CaseStatus;
  releaseNote: string;
  startDate: string;
  deadLine: string;
  referencedId: string;
  attachmentUrl: string;
//aiSuggestedDeveloper?: string | null;
}

export interface UpdateCaseRequest extends Partial<CreateCaseRequest> {
  developerId?: string;
  status?: CaseStatus;
}

export interface CaseTransitionRequest {
  caseId: number;
  targetStatus: CaseStatus;
  comment?: string;
}

export interface CasesResponse {
  items: CaseItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface Developer {
  id: string;
  name: string;
  department: string;
  activeCaseCount: number;
}

export interface AiSuggestDevelopersResponse {
  suggestions: Array<{
    developer: Developer;
    score: number;
    reason: string;
  }>;
}

export interface CaseItem {
  id: number | null;
  caseNumber: string | "";
  issueDate: string;
  projectNameId: string;
  projectName: string;
  issues: string;
  paidorNot: string;
  caseType: CaseType;
  module: string;
  status: CaseStatus;
  isUrgent: string | null;//extension5 is used for urgency indicator
  isSubcase: string | null;//extension6 is used for subcase indicator
  functionalConsultantId: Number | null;
  functionalConsultant: string;
  developerId: string | null;
  developer: string | null;
  reviewerId: string | null;//consignee4Id
  reviewer: string | null;//consignee4FullName
  department: string | null;
  departmentId: Number | null;
  developmentStatus: string;
  // UATStatus: string | null;
  releaseNote: string;
  startDate: string;
  deadLine: string;
  // referencedId: string;
  // attachmentUrl: string;
//aiSuggestedDeveloper?: string | null;
}

export interface CaseFormValues {
  projectName: string;
  projectNameId: string;
  functionalConsultantId: Number | null;
  module: string;
  caseType: CaseType | "";
  developer: string | null;
  paidorNot: string;
  department: string;
  issueDate: string;
  deadLine: string;
  releaseNote: string;
  issues: string;
  developmentStatus: string;
  status?: string;
  caseNumber?: string;
}

// Main interface matching the API response structure
export interface VoucherInit {
    voucherId: string;
    // workflows: WorkFlow[];
    extensions: Extension[];
    requiredConsignees: RequiredConsignee[];
    // Additional fields you might want to include
    // currencies?: Currency[];
    // configs?: Config[];
    // references?: Reference[];
}

// export interface WorkFlow {
//     id: number;
//     reference: number;
//     consigneeUnit: number | null;
//     description: number;
//     state: number;
//     index: number;
//     needsPassCode: boolean;
//     issuingEffect: boolean;
//     isManual: boolean;
//     requiredTime: number;
//     maxRepeat: number;
//     sequence: boolean;
//     isPrint: boolean;
//     remark: string | null;
// }

// ============ Main Response Types ============

export interface VoucherInitResponse {
  data: VoucherData;
}

export interface VoucherData {
  voucherId: string;
  // workflows: WorkFlow[];
  // currencies: Currency[];
  // configs: Config[];
  extensions: Extension[];
  requiredConsignees: RequiredConsignee[];
  // references?: Reference[];
  sourceStoreMappings?: any[];
  destinationStoreMappings?: any[];
}

export interface Extension {
    id: number;
    voucherDefinition: number;
    descritpion: string;  // Note: typo in JSON "descritpion"
    index: number;
    isMandatory: boolean;
    type: number;
    exDataType: null;
    remark: string | null;
}

export interface RequiredConsignee {
    rqGSLObject: RqGSLObject;
    consignees: Consignee[];
}

export interface RqGSLObject {
    id: number;
    voucherDefn: number;
    type: number;
    consigneeUnit: null;
    index: number;
    description: string;
    isMandatory: boolean;
    needConsigneeUnit: boolean;
    remark: string | null;
}

export interface Consignee {
    id: number;
    code: string;  // Note: JSON has code as string, e.g., "0910990961"
    gslType: number;
    isPerson: boolean;
    firstName: string;
    secondName: string | null;
    thirdName: string | null;
    fullName: string;
    tin: string | null;
    categoryId: number;
    categoryDescription: string;
    phoneNo: string | null;
    mainConsigneeUnit: number | null;
    mainConsigneeUnitName: string | null;
    email: string | null;
}

// Optional: Additional interfaces for completeness
// export interface Currency {
//     id: number;
//     country: number;
//     description: string;
//     sign: string;
//     abbrivation: string;
//     isDefault: boolean;
//     remark: string | null;
// }

// export interface Config {
//     id: number;
//     pointer: number;
//     reference: string;
//     consigneeUnit: null;
//     attribute: string;
//     currentValue: string;
//     previousValue: string | null;
//     remark: string | null;
// }

// export interface Reference {
//     id: number;
//     relationType: number;
//     consigneeUnit: null;
//     referringPointer: number;
//     referringObject: number;
//     referencedPointer: number;
//     referencedObject: number;
//     relationLevel: null;
//     remark: string | null;
// }

export interface VoucherInitResult {
  raw: VoucherData;
  voucherId: string;
  // workflows: WorkFlow[];
  // currencies: Currency[];
  // configs: Config[];
  projects: Consignee[];
  functionalConsultants: Consignee[];
  developers: Consignee[];
  modules: Extension | undefined;
}

export interface AttachmentDTO {
  id: number;
  reference: number;
  category: number;
  description: string;
  url: string;
  type: number;
  index: number;
  pointer: number;
  isActive: boolean;
  remark: string | null;
}