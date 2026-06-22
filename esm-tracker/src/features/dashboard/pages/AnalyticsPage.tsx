import { AnalyticsDashboard } from "../components/AnalyticsDashboard";

export default function AnalyticsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          System-wide escalation metrics and performance overview
        </p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}