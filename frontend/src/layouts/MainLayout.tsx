import { useState } from "react";
import { Outlet } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { ExpenseModal } from "../features/expenses/components/ExpenseModal";

export const MainLayout = observer(() => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-[#111315] overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Wrapper */}
      <div className="flex flex-1 flex-col h-full overflow-hidden w-full">
        {/* Header */}
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onAddExpense={() => setExpenseModalOpen(true)}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 transition-all duration-200">
          <Outlet />
        </main>
      </div>

      {/* Global Modals */}
      <ExpenseModal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
      />
    </div>
  );
});
