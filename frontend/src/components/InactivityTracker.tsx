import { useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../stores/rootStore";
import { AppConstants } from "../constants/app";
import { logger } from "../utils/logger";

export const InactivityTracker = observer(() => {
  const { authStore } = useRootStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logoutUser = () => {
    if (authStore.isAuthenticated) {
      logger.info(
        "User inactive for 15 minutes, logging out.",
        undefined,
        "InactivityTracker"
      );
      authStore.logout();
    }
  };

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (authStore.isAuthenticated) {
      timerRef.current = setTimeout(logoutUser, AppConstants.IDLE_TIMEOUT);
    }
  };

  useEffect(() => {
    // Events to detect user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleActivity = () => {
      resetTimer();
    };

    // Initialize timer
    resetTimer();

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      // Cleanup
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [authStore.isAuthenticated]); // Re-run when auth state changes

  return null; // This component doesn't render anything
});
