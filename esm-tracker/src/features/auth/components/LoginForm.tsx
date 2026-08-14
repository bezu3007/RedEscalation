// features/auth/components/LoginForm.tsx
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useAuthStore } from "../store/authStore";
import type { LoginRequest } from "../types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";

export function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/cases";
  const { signIn } = useAuthStore();
  const [fieldError, setFieldError] = useState<{ field: 'username' | 'password' | 'general'; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    watch,
  } = useForm<LoginRequest>({
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
      branch: "3",
    },
  });

  const username = watch("username");
  const password = watch("password");
  const [showPassword, setShowPassword] = useState(false);
  const rememberMe = watch("rememberMe");

  const { mutate, isPending, error } = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      console.log("Login successful:", data);
      if (data.success && data.user) {
        await signIn(data.user, rememberMe);
        navigate(returnUrl);
      } else {
        setFieldError({
          field: 'general',
          message: data.message || "Login failed. Please try again."
        });
      }
    },
    onError: (err: Error) => {
      
      const errorMessage = err.message.toLowerCase();
      
      if (errorMessage.includes("username is incorrect") || 
          errorMessage.includes("user not found") ||
          errorMessage.includes("username is required")) {
        setFieldError({
          field: 'username',
          message: "Username is incorrect."
        });
        setError("username", { 
          type: "manual", 
          message: "Username is incorrect." 
        });
        clearErrors("password");
      } else if (errorMessage.includes("password is incorrect") || 
                 errorMessage.includes("invalid password") ||
                 errorMessage.includes("password is required")) {
        setFieldError({
          field: 'password',
          message: "Password is incorrect."
        });
        setError("password", { 
          type: "manual", 
          message: "Password is incorrect." 
        });
        clearErrors("username");
      } else if (errorMessage.includes("empty") || errorMessage.includes("required")) {
        setFieldError({
          field: 'general',
          message: "Password or username is empty."
        });
      } else {
        setFieldError({
          field: 'general',
          message: err.message || "Login failed. Please try again."
        });
      }
    },
  });

  useEffect(() => {
    if (fieldError) {
      setFieldError(null);
      clearErrors();
    }
  }, [username, password, clearErrors, fieldError]);

  const onSubmit = (data: LoginRequest) => {
    setFieldError(null);
    clearErrors();
    mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 w-full max-w-sm"
    >
      <div className="space-y-1">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          autoComplete="username"
          className={errors.username ? "border-destructive" : ""}
          {...register("username", { 
            required: "Username is required",
            onChange: () => {
              clearErrors("username");
              setFieldError(null);
            }
          })}
        />
        {errors.username && (
          <p className="text-sm text-destructive">{errors.username.message}</p>
        )}
      </div>

      <div className="space-y-1">
      <Label htmlFor="password">Password</Label>

      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          className={`pr-10 ${
            errors.password ? "border-destructive" : ""
          }`}
          {...register("password", {
            required: "Password is required",
            onChange: () => {
              clearErrors("password");
              setFieldError(null);
            },
          })}
        />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
              showPassword
                ? "text-black hover:text-gray-700"
                : "text-blue-600 hover:text-blue-700"
            }`}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {errors.password && (
          <p className="text-sm text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="rememberMe"
          {...register("rememberMe")}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
          Remember me
        </Label>
      </div>

      {fieldError?.field === 'general' && (
        <Alert variant="destructive">
          <AlertDescription>{fieldError.message}</AlertDescription>
        </Alert>
      )}

      {error && !fieldError && (
        <Alert variant="destructive">
          <AlertDescription>{(error as Error).message}</AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        className="w-full bg-[#E31B23] hover:bg-[#C4151C] transition-colors" 
        disabled={isPending || isSubmitting}
      >
        {(isPending || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Login
      </Button>

      {returnUrl && returnUrl !== "/cases" && (
        <input type="hidden" name="returnUrl" value={returnUrl} />
      )}
    </form>
  );
}