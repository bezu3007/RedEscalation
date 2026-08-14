import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";

const IDLE_TIMEOUT = 30* 60 * 1000;
const LAST_ACTIVITY_KEY = "lastActivity";

export function IdleTimeout() {
  const timerRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const logout = useAuthStore((state) => state.signOut);

  useEffect(() => {
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (lastActivity) {
      const inactiveTime = Date.now() - Number(lastActivity);

      // User has been inactive for more than 1 minute
      if (inactiveTime >= IDLE_TIMEOUT) {
        logout();
        localStorage.removeItem(LAST_ACTIVITY_KEY);
        navigate("/login", { replace: true });
        return;
      }
    }

    const resetTimer = () => {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }

      timerRef.current = window.setTimeout(() => {
        logout();
        localStorage.removeItem(LAST_ACTIVITY_KEY);

        navigate("/login", { replace: true });
      }, IDLE_TIMEOUT);
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [logout, navigate]);

  return null;
}