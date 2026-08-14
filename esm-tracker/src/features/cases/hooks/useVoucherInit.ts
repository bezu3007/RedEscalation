import { useQuery } from "@tanstack/react-query";
import { casesApi } from "../api/casesApi";
import {VoucherData, VoucherInitResult, Extension, Consignee,} from "../types"

export function useVoucherInit() {
  return useQuery<VoucherInitResult>({
    queryKey: ["voucher-init"],

    queryFn: async (): Promise<VoucherInitResult> => {
      const response = await casesApi.voucherInit();
      const data: VoucherData = response.data;

      const dev = await casesApi.getEmployee(true);

      const employees = await casesApi.getEmployee(false);

      // Extract consignees with safe access
      const projects: Consignee[] = data.requiredConsignees[0]?.consignees || [];
      const functionalConsultants: Consignee[] = employees || [];
      const developers: Consignee[] = dev || [];

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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });
}