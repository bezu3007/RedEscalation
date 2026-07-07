// AppRouter.tsx
import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { AppShell } from "@/shared/components/AppShell";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { Providers } from "@/app/providers";

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

// Create the router without Providers wrapper
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
    element: <AuthGuard />, // This will check authentication and redirect if needed
    children: [
      {
        element: (
          <Suspense fallback={<PageLoader />}>
            <AppShell />
          </Suspense>
        ),
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
    ],
  },
  { path: "*", element: <Navigate to="/cases" replace /> },
]);

export function AppRouter() {
  // Wrap the entire app with Providers
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}