import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { AppShell } from "@/shared/components/AppShell";
import { Skeleton } from "@/shared/components/ui/skeleton";

const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const CaseListPage = lazy(() => import("@/features/cases/pages/CaseListPage"));
const CaseDetailPage = lazy(
  () => import("@/features/cases/pages/CaseDetailPage")
);
const AnalyticsPage = lazy(
  () => import("@/features/dashboard/pages/AnalyticsPage")
);

function PageLoader() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/cases" replace /> },
      {
        path: "cases",
        element: (
          <Suspense fallback={<PageLoader />}>
            <CaseListPage />
          </Suspense>
        ),
      },
      {
        path: "cases/:id",
        element: (
          <Suspense fallback={<PageLoader />}>
            <CaseDetailPage />
          </Suspense>
        ),
      },
      {
        path: "analytics",
        element: (
          <Suspense fallback={<PageLoader />}>
            <AnalyticsPage />
          </Suspense>
        ),
      },
    ],
  },
  { path: "*", element: <Navigate to="/cases" replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}