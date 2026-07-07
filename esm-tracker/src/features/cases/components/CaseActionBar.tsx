// import React, { useMemo, useState } from "react";
// import { createPortal } from "react-dom";
// import { Button } from "@/shared/components/ui/button";
// import { getAllowedTransitions, useCaseTransition } from "../hooks/useCaseTransition";
// import type { CaseItem, CaseStatus } from "../types";
// import { 
//   Loader2, 
//   MoreVertical, 
//   X,
//   CheckCircle2,
//   Ban,
//   RotateCcw,
//   PlayCircle,
//   LoaderCircle,
//   CheckCheck,
//   Clock3,
//   FileCheck,
//   RefreshCw,
//   AlertCircle
// } from "lucide-react";

// interface Props {
//   caseItem: CaseItem;
//   trigger?: "button" | "icon"; // Allow different trigger styles
// }

// // Status transition labels
// const TRANSITION_LABELS: Record<CaseStatus, string> = {
//   Prepared: "Prepare",
//   Review: "Review",
//   Returned: "Return",
//   Rejected: "Reject",
//   Approved: "Approve",
//   OnProgress: "On Progress",
//   Solved: "Solved",
//   NotSolved: "Not Solved",
//   Accepted: "Accept",
//   Fixed: "Fix",
//   "Re Journal": "Re Journal",
//   Reviewed: "Review",
//   "On Progress": "Start Progress",
//   Closed: "Close",
//   Open: "Open",
//   InProgress: "In Progress",
//   PendingApproval: "Pending Approval",
//   Resolved: "Resolved",
//   DeadlineExtension: "Deadline Extension",
// };

// // Status icons
// const TRANSITION_ICONS: Record<CaseStatus, React.ReactNode> = {
//   Prepared: <FileCheck className="h-4 w-4 text-blue-500" />,
//   Review: <RefreshCw className="h-4 w-4 text-purple-500" />,
//   Returned: <RotateCcw className="h-4 w-4 text-orange-500" />,
//   Rejected: <Ban className="h-4 w-4 text-red-500" />,
//   Approved: <CheckCircle2 className="h-4 w-4 text-green-600" />,
//   OnProgress: <PlayCircle className="h-4 w-4 text-blue-500" />,
//   Solved: <CheckCheck className="h-4 w-4 text-green-600" />,
//   NotSolved: <AlertCircle className="h-4 w-4 text-red-500" />,
//   Accepted: <CheckCircle2 className="h-4 w-4 text-green-600" />,
//   Fixed: <CheckCircle2 className="h-4 w-4 text-blue-500" />,
//   "Re Journal": <RefreshCw className="h-4 w-4 text-orange-500" />,
//   Reviewed: <FileCheck className="h-4 w-4 text-purple-500" />,
//   "On Progress": <PlayCircle className="h-4 w-4 text-blue-500" />,
//   Closed: <X className="h-4 w-4 text-slate-600" />,
//   Open: <RotateCcw className="h-4 w-4 text-slate-500" />,
//   InProgress: <PlayCircle className="h-4 w-4 text-blue-500" />,
//   PendingApproval: <LoaderCircle className="h-4 w-4 text-amber-500" />,
//   Resolved: <CheckCheck className="h-4 w-4 text-green-600" />,
//   DeadlineExtension: <Clock3 className="h-4 w-4 text-violet-600" />,
// };

// // Status color variants for buttons
// const TRANSITION_VARIANTS: Record<
//   CaseStatus,
//   "primary" | "outline" | "danger" | "secondary" | "success" | "warning"
// > = {
//   Prepared: "secondary",
//   Review: "secondary",
//   Returned: "warning",
//   Rejected: "danger",
//   Approved: "success",
//   OnProgress: "primary",
//   Solved: "success",
//   NotSolved: "danger",
//   Accepted: "success",
//   Fixed: "primary",
//   "Re Journal": "warning",
//   Reviewed: "secondary",
//   "On Progress": "primary",
//   Closed: "secondary",
//   Open: "secondary",
//   InProgress: "primary",
//   PendingApproval: "warning",
//   Resolved: "success",
//   DeadlineExtension: "warning",
// };

// export function CaseActionBar({ caseItem, trigger = "button" }: Props) {
//   const [open, setOpen] = useState(false);
//   const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
//   const btnRef = React.useRef<HTMLButtonElement>(null);
//   const { mutate, isPending } = useCaseTransition();

//   const allowed = useMemo(
//     () => getAllowedTransitions(caseItem.status),
//     [caseItem.status]
//   );

//   const handleTransition = (targetStatus: CaseStatus) => {
//     mutate({ 
//       caseId: String(caseItem.id), 
//       targetStatus 
//     });
//     setOpen(false);
//   };

//   const toggleMenu = () => {
//     const rect = btnRef.current?.getBoundingClientRect();
//     if (!rect) return;

//     setPos({
//       x: rect.left,
//       y: rect.bottom + 4,
//     });

//     setOpen((prev) => !prev);
//   };

//   // If no transitions allowed, show nothing
//   if (allowed.length === 0) return null;

//   // Determine what trigger to show
//   const renderTrigger = () => {
//     if (trigger === "icon") {
//       return (
//         <button
//           ref={btnRef}
//           onClick={toggleMenu}
//           className="h-8 w-8 rounded-md hover:bg-slate-100 flex items-center justify-center transition-colors"
//           disabled={isPending}
//         >
//           {isPending ? (
//             <Loader2 className="h-4 w-4 animate-spin" />
//           ) : (
//             <MoreVertical className="h-4 w-4" />
//           )}
//         </button>
//       );
//     }

//     // Default: button with dropdown indicator
//     return (
//       <Button
//         ref={btnRef as any}
//         variant="outline"
//         size="sm"
//         onClick={toggleMenu}
//         disabled={isPending}
//         className="gap-2"
//       >
//         {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
//         Actions
//         <MoreVertical className="h-3 w-3" />
//       </Button>
//     );
//   };

//   return (
//     <>
//       {renderTrigger()}

//       {/* Popup Menu */}
//       {open && pos && createPortal(
//         <>
//           {/* Backdrop */}
//           <div
//             className="fixed inset-0 z-[998]"
//             onClick={() => setOpen(false)}
//           />

//           {/* Menu Panel */}
//           <div
//             className="fixed z-[9999] min-w-[220px] max-w-[280px] rounded-2xl border bg-white shadow-2xl overflow-hidden"
//             style={{
//               top: pos.y,
//               left: Math.min(pos.x, window.innerWidth - 280),
//             }}
//           >
//             {/* Header */}
//             <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
//               <p className="font-medium text-sm truncate">
//                 {caseItem.caseNumber}
//               </p>
//               <button
//                 onClick={() => setOpen(false)}
//                 className="h-7 w-7 rounded-full hover:bg-slate-200 flex items-center justify-center transition-colors"
//               >
//                 <X className="h-4 w-4" />
//               </button>
//             </div>

//             {/* Actions */}
//             <div className="p-2 max-h-[400px] overflow-y-auto space-y-0.5">
//               {allowed.map((target) => (
//                 <button
//                   key={target}
//                   type="button"
//                   onClick={() => handleTransition(target)}
//                   className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-100 text-sm transition-colors"
//                   disabled={isPending}
//                 >
//                   {TRANSITION_ICONS[target] || (
//                     <RefreshCw className="h-4 w-4 text-slate-400" />
//                   )}
//                   <span className="flex-1 text-left font-medium">
//                     {TRANSITION_LABELS[target] || target}
//                   </span>
//                   {isPending && (
//                     <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
//                   )}
//                 </button>
//               ))}
//             </div>

//             {/* Footer with current status */}
//             <div className="px-4 py-2 border-t bg-slate-50/50">
//               <p className="text-xs text-muted-foreground">
//                 Current: <span className="font-medium">{caseItem.status}</span>
//               </p>
//             </div>
//           </div>
//         </>,
//         document.body
//       )}
//     </>
//   );
// }