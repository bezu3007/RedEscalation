import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "../api/reportsApi";
import { MetricCard } from "@/shared/components/charts/MetricCard";
import { Case_Status } from "@/features/cases/types";
import { DashboardChartCard } from "@/shared/components/charts/DashboardChartCard";
import { DashboardTable } from "@/shared/components/charts/DashboardTable";
import Loader from "@/shared/components/ui/loader";
import {
  BadgeAlert,
  CheckCircle2,
  CircleDollarSign,
  TrendingUp,
  Users,
} from "lucide-react";
import type { EChartsOption } from "echarts";
import { useAutoScroll } from "@/shared/hooks/useAutoScroll";

function buildPieOption(title: string, labels: string[], values: number[]) {
  return {
    tooltip: { trigger: "item" },
    legend: {
      top: "bottom",
      type: "scroll",
    },
    series: [
      {
        name: title,
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: "{b}: {d}%",
        },
        data: labels.map((label, index) => ({
          name: label,
          value: values[index] ?? 0,
        })),
      },
    ],
  } satisfies EChartsOption;
}

function buildBarOption(
  _title: string,
  categories: string[],
  totals: number[],
  solved: number[],
  fixed: number[],
  overdue: number[],
) {
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: {
      top: 0,
      data: ["Total Cases", "Solved", "Fixed", "Overdue"],
    },
    xAxis: {
      type: "category",
      data: categories,
      axisLabel: {
        interval: 0,
        rotate: 20,
      },
    },
    yAxis: {
      type: "value",
      minInterval: 1,
    },
    series: [
      {
        name: "Total Cases",
        type: "bar",
        data: totals,
        itemStyle: { color: "#3b82f6" },
      },
      {
        name: "Solved",
        type: "bar",
        data: solved,
        itemStyle: { color: "#22c55e" },
      },
      {
        name: "Fixed",
        type: "bar",
        data: fixed,
        itemStyle: { color: "#f59e0b" },
      },
      {
        name: "Overdue",
        type: "bar",
        data: overdue,
        itemStyle: { color: "#ef4444" },
      },
    ],
  } satisfies EChartsOption;
}

export function AnalyticsDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => reportsApi.getAnalytics(),
    staleTime: 2 * 60 * 1000,
  });

  const scrollRef = useAutoScroll();
  const summary = useMemo(() => {
    const projectDistribution = Array.isArray(data?.projectDistribution)
      ? data.projectDistribution
      : [];
    const paymentStatus = Array.isArray(data?.paymentStatus)
      ? data.paymentStatus
      : [];
    const moduleDistribution = Array.isArray(data?.moduleDistribution)
      ? data.moduleDistribution
      : [];
    const developerResolution = Array.isArray(data?.developerResolution)
      ? data.developerResolution
      : [];

    const totalCases = Number(data?.totalCases ?? data?.totalIssues ?? 0);
    const resolvedCases = Number(
      data?.resolvedCases ??
        data?.resolvedIssues ??
        data?.statusCounts?.SOLVED ??
        0,
    );
    const overdueIssues = Number(
      data?.overdueIssues ??
        data?.overdueCases ??
        data?.issuesWithDeadLinePassed ??
        0,
    );

    const openCases = projectDistribution.reduce(
      (sum, item) => sum + Number(item.openCases ?? 0),
      0,
    );
    const resolvedProjectCases = projectDistribution.reduce(
      (sum, item) => sum + Number(item.resolvedCases ?? 0),
      0,
    );
    const pendingProjectCases = Math.max(
      totalCases - openCases - resolvedProjectCases,
      0,
    );
    const statusCounts = data?.statusCounts ?? {};
    const statusLabels = Case_Status;
    const statusValues = Case_Status.map((status) => Number(statusCounts[status] ?? 0));

    const developerRows = developerResolution
      .map((item) => ({
        developerName: item.developerName || "Unassigned",
        totalCases: Number(item.totalAssigned ?? 0),
        solvedCases: Number(item.resolved ?? 0),
        fixedCases: Number(item.fixedCases ?? 0),
        overdueCases: Number(item.overdueCases ?? 0),
      }))
      .sort((a, b) => a.developerName.localeCompare(b.developerName, undefined, { sensitivity: "base" }));

    const unassignedRows = developerRows.filter((row) => row.developerName.toLowerCase() === "unassigned");
    const unassignedCaseCount = unassignedRows.reduce((sum, row) => sum + row.totalCases, 0);

    return {
      totalCases,
      resolvedCases,
      overdueIssues,
      projectStatusLabels: ["Open", "Resolved", "Pending"],
      projectStatusValues: [openCases, resolvedProjectCases, pendingProjectCases],
      paymentLabels: paymentStatus.map((item) => item.status),
      paymentValues: paymentStatus.map((item) => item.count),
      moduleLabels: moduleDistribution.map((item) => item.moduleName),
      moduleValues: moduleDistribution.map((item) => item.caseCount),
      statusLabels,
      statusValues,
      developerRows,
      unassignedCaseCount,
      developerNames: developerRows.map((row) => row.developerName),
      developerTotals: developerRows.map((row) => row.totalCases),
      developerSolved: developerRows.map((row) => row.solvedCases),
      developerFixed: developerRows.map((row) => row.fixedCases),
      developerOverdue: developerRows.map((row) => row.overdueCases),
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex min-h-[560px] items-center justify-center p-6 mt-20">
        <Loader />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div ref={scrollRef} className="h-full w-full overflow-y-auto px-4 py-4">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .dashboard-scroll-track {
            animation: none !important;
          }
        }
      `}</style>

      <div className="flex w-full flex-col gap-6 pb-10">
        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Total Issues"
            value={summary.totalCases}
            subtitle="All tracked cases"
            icon={<TrendingUp className="h-5 w-5" />}
            accentClassName="bg-blue-50"
          />
          <MetricCard
            title="Resolved Issues"
            value={summary.resolvedCases}
            subtitle="Successfully closed"
            icon={<CheckCircle2 className="h-5 w-5" />}
            accentClassName="bg-emerald-50"
          />
          <MetricCard
            title="Overdue Issues"
            value={summary.overdueIssues}
            subtitle="Past deadline"
            icon={<BadgeAlert className="h-5 w-5" />}
            accentClassName="bg-rose-50"
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
          <div className="space-y-6">
            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
              <DashboardChartCard
                title="Project Distribution by Status"
                description="Open, resolved, and pending case mix"
                option={buildPieOption(
                  "Project Distribution by Status",
                  summary.projectStatusLabels,
                  summary.projectStatusValues,
                )}
                height={600}
              />
              <DashboardChartCard
                title="Payment Status"
                description="Case payment breakdown"
                option={buildPieOption(
                  "Payment Status",
                  summary.paymentLabels,
                  summary.paymentValues,
                )}
                height={600}
              />
              <DashboardChartCard
                title="Module Distribution"
                description="Issues assigned by module"
                option={buildPieOption(
                  "Module Distribution",
                  summary.moduleLabels,
                  summary.moduleValues,
                )}
                height={600}
              />
              <DashboardChartCard
                title="Case Status Distribution"
                description="Coverage across all workflow statuses"
                option={buildPieOption(
                  "Case Status Distribution",
                  summary.statusLabels,
                  summary.statusValues,
                )}
                height={600}
              />
            </div>

            {/* Bar Charts */}
            <DashboardChartCard
              title="Cases Resolved by Developer"
              description="Performance across assigned, solved, fixed, and overdue cases"
              option={buildBarOption(
                "Cases Resolved by Developer",
                summary.developerNames,
                summary.developerTotals,
                summary.developerSolved,
                summary.developerFixed,
                summary.developerOverdue,
              )}
              height={660}
            />

            {/* Table */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-slate-600" />
                <h3 className="text-base font-semibold text-slate-900">Developer Overview</h3>
              </div>
              {summary.unassignedCaseCount > 0 ? (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Unassigned bucket: {summary.unassignedCaseCount} cases
                </div>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {summary.developerRows
                  .filter((row) => row.developerName.toLowerCase() !== "unassigned")
                  .map((row) => (
                    <div key={row.developerName} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">{row.developerName}</p>
                      <div className="mt-3 ml-5 mr-5 space-y-2 text-sm text-slate-600">
                        <div className="flex items-center justify-between">
                          <span>Total</span>
                          <span className="font-semibold text-slate-900">{row.totalCases}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Fixed</span>
                          <span className="font-semibold text-amber-600">{row.fixedCases}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Overdue</span>
                          <span className="font-semibold text-rose-600">{row.overdueCases}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Solved</span>
                          <span className="font-semibold text-emerald-600">{row.solvedCases}</span>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <CircleDollarSign className="h-5 w-5 text-slate-600" />
                <h3 className="text-base font-semibold text-slate-900">Developer Case Breakdown</h3>
              </div>
              <DashboardTable rows={summary.developerRows} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}