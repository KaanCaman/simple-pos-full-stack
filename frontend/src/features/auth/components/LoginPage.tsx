import { useState } from "react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import {
  UtensilsCrossed,
  ArrowRight,
  User as UserIcon,
  Lock,
  Moon,
  Sun,
} from "lucide-react";
import { useRootStore } from "../../../stores/rootStore";
import { AppConstants } from "../../../constants/app";
import { logger } from "../../../utils/logger";
import { useTheme } from "../../../providers/ThemeProvider";

// Zod schema for login validation.
// Giriş doğrulama için Zod şeması.
const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(4).regex(/^\d+$/, "Password must be numeric"),
});

// Login Page Component.
// Giriş Sayfası Bileşeni.
export const LoginPage = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { authStore } = useRootStore();
  const { theme, setTheme } = useTheme();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  const [isFocused, setIsFocused] = useState<"username" | "password" | null>(
    null
  );

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numeric input
    if (/^\d*$/.test(value)) {
      setPassword(value);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate input using Zod.
    const result = loginSchema.safeParse({ username, password });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        username: fieldErrors.username?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    try {
      await authStore.login(username, password);
      logger.info(
        "Login successful, navigating to dashboard",
        undefined,
        "LoginPage"
      );
      navigate("/"); // Redirect to dashboard
    } catch (err) {
      // Error handled in store, shown via authStore.error
      logger.error("Login submission failed", { err }, "LoginPage");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-[#1A1D1F] text-gray-900 dark:text-white p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      ></div>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label={t("auth.theme.toggle")}
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>

      <div className="z-10 w-full max-w-sm flex flex-col items-center space-y-8 animate-fade-in-up">
        {/* Logo Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/20 ring-4 ring-primary-500/10">
            <UtensilsCrossed className="w-10 h-10 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight mb-1">
              {AppConstants.APP_NAME}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {t("auth.login_subtitle")}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {authStore.error && (
          <div className="w-full bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center space-x-2 animate-shake">
            <div className="w-1 h-8 bg-red-500 rounded-full"></div>
            <p className="text-red-600 dark:text-red-400 text-sm font-medium">
              {authStore.error}
            </p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-4">
            {/* Username Input */}
            <div className="group relative">
              <div
                className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                  isFocused === "username"
                    ? "text-primary-500"
                    : "text-gray-400"
                }`}
              >
                <UserIcon className="h-5 w-5" />
              </div>
              <input
                id="username"
                type="text"
                placeholder={t("auth.username_placeholder")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setIsFocused("username")}
                onBlur={() => setIsFocused(null)}
                className={`block w-full pl-10 pr-3 py-4 bg-white dark:bg-[#272B2E] border-2 rounded-xl placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-all duration-200 ${
                  errors.username
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200 dark:border-transparent focus:border-primary-500 focus:shadow-lg focus:shadow-primary-500/10"
                }`}
              />
            </div>
            {errors.username && (
              <p className="text-red-500 text-xs pl-1">{errors.username}</p>
            )}

            {/* Password Input */}
            <div className="group relative">
              <div
                className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                  isFocused === "password"
                    ? "text-primary-500"
                    : "text-gray-400"
                }`}
              >
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="password"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={t("auth.password_placeholder")}
                value={password}
                onChange={handlePasswordChange}
                onFocus={() => setIsFocused("password")}
                onBlur={() => setIsFocused(null)}
                className={`block w-full pl-10 pr-3 py-4 bg-white dark:bg-[#272B2E] border-2 rounded-xl placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-all duration-200 ${
                  errors.password
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200 dark:border-transparent focus:border-primary-500 focus:shadow-lg focus:shadow-primary-500/10"
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs pl-1">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={authStore.isLoading}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-bold rounded-xl text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] shadow-lg shadow-primary-500/25"
          >
            <span className="absolute right-4 inset-y-0 flex items-center pl-3">
              <ArrowRight className="h-5 w-5 text-white/80 group-hover:text-white transition-colors" />
            </span>
            {authStore.isLoading ? t("common.loading") : t("auth.login")}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 dark:text-[#6B7280] text-xs">
            &copy; {new Date().getFullYear()} {AppConstants.APP_NAME} v
            {AppConstants.APP_VERSION}
          </p>
        </div>
      </div>
    </div>
  );
});
