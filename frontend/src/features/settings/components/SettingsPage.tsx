import { useState } from "react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import {
  User,
  Shield,
  LayoutGrid,
  UtensilsCrossed,
  Tags,
  ChevronRight,
  ChevronLeft,
  Receipt,
} from "lucide-react";
import { TableManagement } from "./sections/TableManagement";
import { CategoryManagement } from "./sections/CategoryManagement";
import { ProductManagement } from "./sections/ProductManagement";
import { ExpenseManagement } from "./sections/ExpenseManagement";
import { UserManagement } from "./sections/UserManagement";

type SectionId =
  | "profile"
  | "pin"
  | "staff"
  | "payments"
  | "notifications"
  | "tables"
  | "categories"
  | "products"
  | "expenses" // Added
  | null;

export const SettingsPage = observer(() => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<SectionId>(null);

  const sections = [
    {
      title: t("settings.business_management", "İşletme Yönetimi"),
      items: [
        {
          id: "tables",
          icon: LayoutGrid,
          label: t("settings.sections.table_management", "Masa Düzeni"),
          desc: t(
            "settings.sections.table_management_desc",
            "Kat planı ve masa yerleşimi"
          ),
          component: <TableManagement />,
        },
        {
          id: "categories",
          icon: Tags,
          label: t("settings.sections.category_management", "Kategoriler"),
          desc: t(
            "settings.sections.category_management_desc",
            "Menü kategorileri ve renkleri"
          ),
          component: <CategoryManagement />,
        },
        {
          id: "products",
          icon: UtensilsCrossed,
          label: t("settings.sections.product_management", "Ürünler"),
          desc: t(
            "settings.sections.product_management_desc",
            "Menü kalemleri ve fiyatlar"
          ),
          component: <ProductManagement />,
        },
        {
          id: "expenses",
          icon: Receipt,
          label: t("settings.sections.expense_management", "Gider Yönetimi"),
          desc: t(
            "settings.sections.expense_management_desc",
            "Harcamalar ve gider takibi"
          ),
          component: <ExpenseManagement />,
        },
      ],
    },
    {
      title: t("settings.account_system", "Hesap & Sistem"),
      items: [
        {
          id: "profile",
          icon: User,
          label: t("settings.sections.profile", "Profil Bilgileri"),
          desc: t(
            "settings.sections.profile_desc",
            "Ad, soyad ve iletişim bilgileri"
          ),
          component: (
            <div className="p-4">{t("common.coming_soon", "Yakında")}</div>
          ),
        },
        {
          id: "staff",
          icon: Shield,
          label: t("settings.sections.user_management", "Personel Yönetimi"),
          desc: t(
            "settings.sections.user_management_desc",
            "Garson hesapları ve yetkiler"
          ),
          component: <UserManagement />,
        },
      ],
    },
  ];

  const activeItem = sections
    .flatMap((s) => s.items)
    .find((i) => i.id === activeSection);

  if (activeSection && activeItem) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSection(null)}
            className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-gray-900 dark:text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {activeItem.label}
            </h1>
            <p className="text-sm text-gray-500">{activeItem.desc}</p>
          </div>
        </div>

        {/* Render Content */}
        <div className="animate-in slide-in-from-right duration-300">
          {activeItem.component}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-left duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("dashboard.menu.settings")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {t("settings.subtitle", "Sistem ve hesap ayarlarınızı yönetin")}
        </p>
      </div>

      <div className="grid gap-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className="bg-white dark:bg-[#1A1D1F] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {section.title}
              </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as SectionId)}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors text-left group"
                  >
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {item.label}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.desc}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
