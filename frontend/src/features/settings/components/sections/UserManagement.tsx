import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useStore } from "../../../../stores/rootStore";
import { userService } from "../../services/userService";
import type { UserResponse } from "../../services/userService";
import {
  User,
  Plus,
  Trash2,
  Shield,
  ShieldAlert,
  X,
  Loader2,
  Key,
} from "lucide-react";
import toast from "react-hot-toast";

export const UserManagement = observer(() => {
  const { t } = useTranslation();
  const { authStore, uiStore } = useStore();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    pin: "",
    role: "waiter" as "admin" | "waiter",
  });

  // PIN Change State
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newPin, setNewPin] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers();
      if (res.data.success && res.data.data) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error(t("settings.users.messages.load_error"));
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const cleanVal = val.replace(/[^a-zA-Z0-9]/g, "");
    setFormData({ ...formData, name: cleanVal });
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
    setFormData({ ...formData, pin: val });
  };

  const handleNewPinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
    setNewPin(val);
  };

  const openPinModal = (userId: number) => {
    setSelectedUserId(userId);
    setNewPin("");
    setPinModalOpen(true);
  };

  const handlePinUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4)
      return toast.error(t("settings.users.validation.pin_length"));
    if (!selectedUserId) return;

    setSubmitting(true);
    try {
      await userService.changePin(selectedUserId, newPin);
      toast.success(t("settings.users.messages.pin_updated"));
      setPinModalOpen(false);
      setNewPin("");
      setSelectedUserId(null);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          t("settings.users.messages.pin_update_error")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.length < 3)
      return toast.error(t("settings.users.validation.username_min"));
    if (formData.pin.length !== 4)
      return toast.error(t("settings.users.validation.pin_length"));

    setSubmitting(true);
    try {
      await userService.createUser({
        name: formData.name,
        pin: formData.pin,
        role: "waiter",
      });
      toast.success(t("settings.users.messages.created"));
      setIsModalOpen(false);
      setFormData({ name: "", pin: "", role: "waiter" });
      loadUsers();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || t("errors.generic"));
    } finally {
      setSubmitting(false);
    }
  };

  const handeDelete = (id: number) => {
    uiStore.showConfirmation({
      title: t("settings.users.messages.delete_confirm_title"),
      message: t("settings.users.messages.delete_confirm_message"),
      type: "danger",
      confirmText: t("common.delete"),
      cancelText: t("common.cancel"),
      onConfirm: async () => {
        try {
          await userService.deleteUser(id);
          toast.success(t("settings.users.messages.deleted"));
          loadUsers();
        } catch (error) {
          toast.error(t("settings.users.messages.delete_error"));
        }
      },
    });
  };

  if (loading)
    return <div className="p-8 text-center">{t("common.loading")}</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {t("settings.users.title")}
          </h2>
          <p className="text-sm text-gray-500">
            {t("settings.users.subtitle")}
          </p>
        </div>
        {authStore.user?.role === "admin" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{t("settings.users.add_user")}</span>
          </button>
        )}
      </div>

      <div className="bg-background-card dark:bg-background-dark-primary rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3 font-medium">
                {t("settings.users.user")}
              </th>
              <th className="px-6 py-3 font-medium">
                {t("settings.users.role")}
              </th>
              <th className="px-6 py-3 font-medium text-right">
                {t("settings.users.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {users.map((user) => (
              <tr
                key={user.id}
                className="group hover:bg-gray-50 dark:hover:bg-gray-800/30"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}
                  >
                    {user.role === "admin" ? (
                      <ShieldAlert className="h-3 w-3" />
                    ) : (
                      <Shield className="h-3 w-3" />
                    )}
                    {user.role === "admin"
                      ? t("settings.users.admin")
                      : t("settings.users.waiter")}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {user.role !== "admin" && (
                    <div className="flex items-center justify-end gap-2">
                      {/* Only Admin can change PINs */}
                      {authStore.user?.role === "admin" && (
                        <button
                          onClick={() => openPinModal(user.id)}
                          className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                          title={t("settings.users.change_pin_title")}
                        >
                          <Key className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handeDelete(user.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-background-card dark:bg-background-dark-primary rounded-2xl shadow-xl border border-border-light dark:border-border-dark">
            <div className="p-6 border-b border-border-light dark:border-border-dark flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary dark:text-text-dark-primary">
                {t("settings.users.add_user_title")}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("settings.users.username")}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder={t("settings.users.placeholders.username")}
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border rounded-xl focus:ring-2 outline-none transition-all ${
                    formData.name.length > 0 && formData.name.length < 3
                      ? "border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 dark:border-gray-700 focus:ring-primary-500"
                  }`}
                  autoFocus
                />
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    • {t("settings.users.validation.username_min")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    • {t("settings.users.validation.username_alphanum")}
                  </p>
                  {formData.name.length > 0 && formData.name.length < 3 && (
                    <p className="text-xs text-red-500 font-medium animate-pulse">
                      {t("settings.users.validation.username_short")}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("settings.users.pin")}
                </label>
                <input
                  type="text"
                  value={formData.pin}
                  onChange={handlePinChange}
                  placeholder={t("settings.users.placeholders.pin")}
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border rounded-xl focus:ring-2 outline-none transition-all font-mono tracking-[0.5em] text-center text-xl ${
                    formData.pin.length > 0 && formData.pin.length !== 4
                      ? "border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 dark:border-gray-700 focus:ring-primary-500"
                  }`}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    • {t("settings.users.validation.pin_numeric")}
                  </p>
                  {formData.pin.length > 0 && formData.pin.length !== 4 && (
                    <p className="text-xs text-red-500 font-medium">
                      {t("settings.users.validation.pin_length")}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !formData.name ||
                    formData.name.length < 3 ||
                    formData.pin.length !== 4
                  }
                  className="flex-1 px-4 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("settings.users.create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change PIN Modal */}
      {pinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-background-card dark:bg-background-dark-primary rounded-2xl shadow-xl border border-border-light dark:border-border-dark">
            <div className="p-6 border-b border-border-light dark:border-border-dark flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary dark:text-text-dark-primary">
                {t("settings.users.change_pin_title")}
              </h3>
              <button
                onClick={() => setPinModalOpen(false)}
                className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePinUpdate} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                  {t("settings.users.new_pin")}
                </label>
                <input
                  type="text"
                  value={newPin}
                  onChange={handleNewPinChange}
                  placeholder={t("settings.users.placeholders.pin")}
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border rounded-xl focus:ring-2 outline-none transition-all font-mono tracking-[0.5em] text-center text-xl ${
                    newPin.length > 0 && newPin.length !== 4
                      ? "border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 dark:border-gray-700 focus:ring-primary-500"
                  }`}
                  autoFocus
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    • {t("settings.users.validation.pin_desc")}
                  </p>
                  {newPin.length > 0 && newPin.length !== 4 && (
                    <p className="text-xs text-red-500 font-medium">
                      {t("settings.users.validation.pin_length")}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setPinModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={submitting || newPin.length !== 4}
                  className="flex-1 px-4 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("settings.users.update")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});
