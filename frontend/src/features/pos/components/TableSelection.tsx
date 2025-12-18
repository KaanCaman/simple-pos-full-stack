import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores/rootStore";
import { Users } from "lucide-react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export const TableSelection = observer(() => {
  const { tableStore, orderStore, authStore } = useStore();
  const { t } = useTranslation();

  const [activeSection, setActiveSection] = useState<string>("all");

  const filteredTables = tableStore.tables.filter((table) => {
    if (activeSection === "all") return true;
    // Default to 'salon' if section is missing/undefined
    const section = table.section || "salon";
    return section === activeSection;
  });

  const sections = [
    {
      id: "all",
      label: t("pos.section_all", "Hepsi"),
      icon: <span className="text-xl">🏢</span>,
    },
    {
      id: "salon",
      label: t("pos.section_salon", "Salon"),
      icon: <span className="text-xl">🪑</span>,
    },
    {
      id: "garden",
      label: t("pos.section_garden", "Bahçe"),
      icon: <span className="text-xl">🌳</span>,
    },
    {
      id: "shops",
      label: t("pos.section_shops", "Dükkanlar"),
      icon: <span className="text-xl">🏪</span>,
    },
  ];

  const getSectionLabel = (sectionId?: string) => {
    const section = sections.find((s) => s.id === (sectionId || "salon"));
    return section?.label || sectionId;
  };

  const handleTableClick = async (table: any) => {
    if (table.status === "occupied") {
      // Fetch orders for this table
      const orders = await orderStore.fetchTableOrders(table.id);

      if (orders.length > 0) {
        // Load the first order
        await orderStore.loadOrder(orders[0].id);
      } else {
        if (authStore.user) {
          await orderStore.createOrder(table.id, authStore.user.id);
        }
      }
    } else if (table.status === "available") {
      if (!authStore.user) {
        toast.error(t("pos.user_not_found"));
        return;
      }
      // Create new order
      await orderStore.createOrder(table.id, authStore.user.id);
    }
  };

  return (
    <div className="h-full p-4 sm:p-6 overflow-y-auto flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("pos.table_selection")}
        </h1>

        {/* Section Tabs - Scrollable on mobile */}
        <div className="w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl min-w-max">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap
                  ${
                    activeSection === section.id
                      ? "bg-white dark:bg-[#1A1D1F] text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }
                `}
              >
                {section.icon}
                <span>{section.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20">
        {filteredTables.map((table) => (
          <button
            key={table.id}
            onClick={() => handleTableClick(table)}
            disabled={orderStore.isLoading}
            className={`
              relative group p-4 rounded-xl border-2 transition-all duration-200
              flex flex-col items-center justify-between min-h-[140px]
              ${
                table.status === "occupied"
                  ? "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30 hover:shadow-lg hover:shadow-red-500/10"
                  : "bg-white border-gray-200 dark:bg-[#1A1D1F] dark:border-gray-800 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-lg hover:shadow-primary-500/10"
              }
            `}
          >
            <div className="flex w-full justify-between items-start">
              <span
                className={`text-lg font-bold ${
                  table.status === "occupied"
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {table.name}
              </span>
              {table.status === "occupied" && (
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </div>

            <div
              className={`
              h-12 w-12 rounded-full flex items-center justify-center mb-2
              ${
                table.status === "occupied"
                  ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600 dark:group-hover:bg-primary-900/20 dark:group-hover:text-primary-400"
              }
            `}
            >
              {/* Show different icon based on section maybe? For now standard Users icon */}
              <Users className="h-6 w-6" />
            </div>

            <div className="w-full text-center flex flex-col gap-1">
              <span
                className={`text-sm font-medium ${
                  table.status === "occupied"
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {table.status === "occupied"
                  ? `${t("pos.occupied")} (${table.order_count || 1})`
                  : t("pos.empty")}
              </span>
              {/* Display Section Name */}
              <span className="text-xs text-gray-400 font-medium bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full inline-block mx-auto">
                {getSectionLabel(table.section)}
              </span>
            </div>

            {orderStore.isLoading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-black/50 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Badge for Order Count */}
            {table.status === "occupied" && (table.order_count || 0) > 1 && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md animate-bounce">
                {table.order_count}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
});
