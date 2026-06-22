import { LoginForm } from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <div className="bg-background rounded-2xl shadow-lg p-8 w-full max-w-sm space-y-6 border">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">EMS Portal</h1>
          <p className="text-sm text-muted-foreground">
            Escalation Management System
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}