// import { Button } from "@/shared/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/shared/components/ui/select";

// import { DateField } from "@/shared/components/DateField";
// import { useCaseStore } from "../store/caseStore";
// import type {
//   CasePriority,
//   CaseStatus,
//   CaseType,
// } from "../types";

// const STATUSES: CaseStatus[] = [
//   "Open",
//   "InProgress",
//   "PendingApproval",
//   "Resolved",
//   "Closed",
//   "Rejected",
// ];

// const TYPES: CaseType[] = [
//   "Bug",
//   "FeatureRequest",
//   "Support",
//   "Payment",
//   "Infrastructure",
//   "Other",
// ];

// const PRIORITIES: CasePriority[] = [
//   "Low",
//   "Medium",
//   "High",
//   "Critical",
// ];

// export function FilterPanel() {
//   const { filters, setFilters, resetFilters } = useCaseStore();

//   return (
//     <div className="rounded-2xl border bg-card p-5 shadow-sm">
//       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
//         {/* Project */}
//         <div className="space-y-2">
//           <label className="text-xs font-medium uppercase text-muted-foreground">
//             Project
//           </label>

//           <Select
//             value={filters.projectName || "all"}
//             onValueChange={(v) =>
//               setFilters({
//                 projectName: v === "all" ? "" : v,
//               })
//             }
//           >
//             <SelectTrigger className="h-11 rounded-xl">
//               <SelectValue placeholder="All Projects" />
//             </SelectTrigger>

//             <SelectContent>
//               <SelectItem value="all">
//                 All Projects
//               </SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Module */}
//         <div className="space-y-2">
//           <label className="text-xs font-medium uppercase text-muted-foreground">
//             Module
//           </label>

//           <Select
//             value={filters.department || "all"}
//             onValueChange={(v) =>
//               setFilters({
//                 department: v === "all" ? "" : v,
//               })
//             }
//           >
//             <SelectTrigger className="h-11 rounded-xl">
//               <SelectValue placeholder="All Modules" />
//             </SelectTrigger>

//             <SelectContent>
//               <SelectItem value="all">
//                 All Modules
//               </SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Type */}
//         <div className="space-y-2">
//           <label className="text-xs font-medium uppercase text-muted-foreground">
//             Case Type
//           </label>

//           <Select
//             value={filters.caseType || "all"}
//             onValueChange={(v) =>
//               setFilters({
//                 caseType:
//                   v === "all"
//                     ? ""
//                     : (v as CaseType),
//               })
//             }
//           >
//             <SelectTrigger className="h-11 rounded-xl">
//               <SelectValue placeholder="All Types" />
//             </SelectTrigger>

//             <SelectContent>
//               <SelectItem value="all">
//                 All Types
//               </SelectItem>

//               {TYPES.map((t) => (
//                 <SelectItem key={t} value={t}>
//                   {t}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Status */}
//         <div className="space-y-2">
//           <label className="text-xs font-medium uppercase text-muted-foreground">
//             UAT Status
//           </label>

//           <Select
//             value={filters.status || "all"}
//             onValueChange={(v) =>
//               setFilters({
//                 status:
//                   v === "all"
//                     ? ""
//                     : (v as CaseStatus),
//               })
//             }
//           >
//             <SelectTrigger className="h-11 rounded-xl">
//               <SelectValue placeholder="All Statuses" />
//             </SelectTrigger>

//             <SelectContent>
//               <SelectItem value="all">
//                 All Statuses
//               </SelectItem>

//               {STATUSES.map((s) => (
//                 <SelectItem key={s} value={s}>
//                   {s}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Date */}
//         <div className="space-y-2">
//           <label className="text-xs font-medium uppercase text-muted-foreground">
//             Reported After
//           </label>

//           <DateField
//             value={filters.dateFrom}
//             onChange={(v) =>
//               setFilters({ dateFrom: v })
//             }
//             className="h-11 rounded-xl"
//           />
//         </div>
//       </div>

//       <div className="flex justify-end mt-4">
//         <Button
//           variant="ghost"
//           size="sm"
//           onClick={resetFilters}
//         >
//           Reset All Filters
//         </Button>
//       </div>
//     </div>
//   );
// }