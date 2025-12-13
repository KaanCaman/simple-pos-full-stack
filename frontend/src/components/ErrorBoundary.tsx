import { Component, type ErrorInfo, type ReactNode } from "react";
import { type WithTranslation, withTranslation } from "react-i18next";
import { logger } from "../utils/logger";

interface Props extends WithTranslation {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// Global Error Boundary to catch and log unhandled errors in the component tree.
// Bileşen ağacındaki işlenmemiş hataları yakalamak ve kaydetmek için Küresel Hata Sınırı.
class ErrorBoundaryBase extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error(
      "Unhandled UI Error",
      {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      },
      "ErrorBoundary"
    );
  }

  public render() {
    if (this.state.hasError) {
      const { t } = this.props;
      return (
        <div className="p-4 bg-red-50 text-red-900 border border-red-200 rounded">
          <h2 className="text-lg font-bold">{t("errors.title")}</h2>
          <p>{t("errors.contactSupport")}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryBase);
