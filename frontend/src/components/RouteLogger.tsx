import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logger } from "../utils/logger";

// Component to log route changes.
// Rota değişikliklerini kaydetmek için bileşen.
export const RouteLogger = () => {
  const location = useLocation();

  useEffect(() => {
    logger.info(
      `Navigation: ${location.pathname}`,
      {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
      },
      "Router"
    );
  }, [location]);

  return null;
};
