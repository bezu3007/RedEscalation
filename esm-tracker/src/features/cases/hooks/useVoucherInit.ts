// import { useQuery } from "@tanstack/react-query";
// import { casesApi } from "../api/casesApi";

// export function useVoucherInit() {
//   return useQuery({
//     queryKey: ["voucher-init"],

//     queryFn: async () => {
//       const response =
//         await casesApi.voucherInit();

//       const data = response.data;

//       const projects =
//         data.requiredConsignees[0]
//           ?.consignees ?? [];

//       const functionalConsultants =
//         data.requiredConsignees?.[1]
//           ?.consignees ?? [];

//       const developers =
//         data.requiredConsignees?.[2]
//           ?.consignees ?? [];

//       const modules = [
//         ...new Set<string>(
//           (
//             data.extensions?.[2]?.remark ?? ""
//           )
//             .split(",")
//             .map((m: string) => m.trim())
//             .filter(Boolean)
//         ),
//       ];

//       return {
//         raw: data,

//         voucherId: data.voucherId,

//         workflows: data.workflows,

//         currencies: data.currencies,

//         configs: data.configs,

//         projects,

//         functionalConsultants,

//         developers,

//         modules,
//       };
//     },

//     staleTime: Infinity,

//     gcTime: Infinity,

//     refetchOnWindowFocus: false,

//     refetchOnReconnect: false,

//     refetchOnMount: false,
//   });
// }

// useVoucherInit.ts

import { useQuery } from "@tanstack/react-query";
import { casesApi } from "../api/casesApi";
import {
  VoucherData,
  VoucherInitResult,
  Extension,
  Consignee,} from "../types"

export function useVoucherInit() {
  return useQuery<VoucherInitResult>({
    queryKey: ["voucher-init"],

    queryFn: async (): Promise<VoucherInitResult> => {
      const response = await casesApi.voucherInit();
      const data: VoucherData = response.data;

      // Extract consignees with safe access
      const projects: Consignee[] = data.requiredConsignees[0]?.consignees || [];
      const functionalConsultants: Consignee[] = data.requiredConsignees[1]?.consignees || [];
      const developers: Consignee[] = data.requiredConsignees[2]?.consignees || [];

      // Find modules extension (index 2)
      const modules: Extension | undefined = data.extensions.find(
        (ext: Extension) => ext.index === 2
      );

      return {
        raw: data,
        voucherId: data.voucherId,
        // workflows: data.workflows,
        // currencies: data.currencies,
        // configs: data.configs,
        projects,
        functionalConsultants,
        developers,
        modules,
      };
    },

    // Cache settings - data rarely changes
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}