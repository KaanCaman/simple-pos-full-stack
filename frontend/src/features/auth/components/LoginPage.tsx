import { useState } from "react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useRootStore } from "../../../stores/rootStore";
import { AppConstants } from "../../../constants/app";
import { logger } from "../../../utils/logger";

// Zod schema for login validation.
// Giriş doğrulama için Zod şeması.
const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(4),
});

// Login Page Component.
// Giriş Sayfası Bileşeni.
export const LoginPage = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { authStore } = useRootStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          {AppConstants.APP_NAME}
        </h1>
        <h2 className="text-xl mb-4 text-center text-gray-600 dark:text-gray-300">
          {t("auth.login")}
        </h2>

        {authStore.error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
            role="alert"
          >
            <span className="block sm:inline">{authStore.error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.username ? "border-red-500" : ""
              }`}
            />
            {errors.username && (
              <p className="text-red-500 text-xs italic">{errors.username}</p>
            )}
          </div>

          <div>
            <label
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
              htmlFor="password"
            >
              {t("auth.password")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.password ? "border-red-500" : ""
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs italic">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={authStore.isLoading}
              className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50"
            >
              {authStore.isLoading ? t("common.loading") : t("auth.login")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});
