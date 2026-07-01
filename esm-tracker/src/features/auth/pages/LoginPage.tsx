import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LoginForm } from "../components/LoginForm";
import { useAuthStore } from "../store/authStore";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading } = useAuthStore();
  const returnUrl = searchParams.get("returnUrl") || "/cases";

  useEffect(() => {
    // If already authenticated, redirect to returnUrl
    if (isAuthenticated && !isLoading) {
      navigate(returnUrl);
    }
  }, [isAuthenticated, isLoading, navigate, returnUrl]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <div className="bg-background rounded-2xl shadow-lg p-8 w-full max-w-sm space-y-6 border">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">EMS Portal</h1>
          <p className="text-sm text-muted-foreground">
            Escalation Management System
          </p>
          {returnUrl && returnUrl !== "/cases" && (
            <p className="text-xs text-muted-foreground mt-2">
              Redirecting to: {returnUrl}
            </p>
          )}
        </div>
        <LoginForm />
      </div>
    </div>
  );
}