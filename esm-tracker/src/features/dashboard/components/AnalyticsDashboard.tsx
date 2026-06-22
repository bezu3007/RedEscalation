import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "../api/reportsApi";
import { ProjectDistributionChart } from "./charts/ProjectDistributionChart";
import { PaymentStatusChart } from "./charts/PaymentStatusChart";
import { ModuleDistributionChart } from "./charts/ModuleDistributionChart";
import { DeveloperResolutionChart } from "./charts/DeveloperResolutionChart";
import { DepartmentStatsChart } from "./charts/DepartmentStatsChart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";

function StatCard({
  title,
  value,
  icon: Icon,
  className,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  className?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${className}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => reportsApi.getAnalytics(),
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Cases"
          value={data.totalCases}
          icon={TrendingUp}
          className="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Open Cases"
          value={data.openCases}
          icon={AlertCircle}
          className="bg-orange-100 text-orange-600"
        />
        <StatCard
          title="Resolved"
          value={data.resolvedCases}
          icon={CheckCircle2}
          className="bg-green-100 text-green-600"
        />
        <StatCard
          title="Avg Resolution"
          value={`${data.avgResolutionDays.toFixed(1)}d`}
          icon={Clock}
          className="bg-purple-100 text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Project Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectDistributionChart data={data.projectDistribution} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentStatusChart data={data.paymentStatus} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Top Modules by Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ModuleDistributionChart data={data.moduleDistribution} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Developer Resolution Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DeveloperResolutionChart data={data.developerResolution} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Department Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <DepartmentStatsChart data={data.departmentStats} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}