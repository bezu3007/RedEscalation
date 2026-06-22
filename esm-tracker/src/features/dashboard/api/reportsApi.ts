import { apiClient } from "@/shared/lib/apiClient";
import type { AnalyticsData } from "../types";

export interface AnalyticsParams {
  from?: string;
  to?: string;
  department?: string;
  projectName?: string;
}

export const reportsApi = {
  getAnalytics: (params?: AnalyticsParams): Promise<AnalyticsData> =>
    apiClient.get("/reports/analytics", { params }).then((r) => r.data),
};