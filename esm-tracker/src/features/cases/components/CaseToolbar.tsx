// import { Search, Plus, SlidersHorizontal, Columns3 } from "lucide-react";
// import { Button } from "@/shared/components/ui/button";
// import { Input } from "@/shared/components/ui/input";
// import { useCaseStore } from "../store/caseStore";

// interface Props {
//   onCreate: () => void;
// }

// export function CaseToolbar({ onCreate }: Props) {
//   const { filters, setFilters } = useCaseStore();

//   return (
//     <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
//       <div className="relative flex-1 max-w-xl">
//         <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

//         <Input
//           value={filters.search}
//           onChange={(e) =>
//             setFilters({ search: e.target.value })
//           }
//           placeholder="Search by code, project, module, description..."
//           className="pl-9 h-11 rounded-xl bg-background"
//         />
//       </div>

//       <div className="flex items-center gap-2">
//         <Button variant="outline" className="gap-2 rounded-xl">
//           <SlidersHorizontal className="h-4 w-4" />
//           Filters
//         </Button>

//         <Button variant="outline" className="gap-2 rounded-xl">
//           <Columns3 className="h-4 w-4" />
//           Columns
//         </Button>

//         <Button
//           onClick={onCreate}
//           className="rounded-xl px-5"
//         >
//           <Plus className="h-4 w-4 mr-2" />
//           Create Issue Voucher
//         </Button>
//       </div>
//     </div>
//   );
// }