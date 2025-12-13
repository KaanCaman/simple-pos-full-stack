import { observer } from "mobx-react-lite";
import { Coffee, Sandwich, IceCream, Utensils } from "lucide-react";

// Mock Data
export const MOCK_CATEGORIES = [
  { id: 1, name: "Tostlar", icon: Sandwich, color: "bg-orange-500" },
  { id: 2, name: "İçecekler", icon: Coffee, color: "bg-blue-500" },
  { id: 3, name: "Tatlılar", icon: IceCream, color: "bg-pink-500" },
  { id: 4, name: "Extralar", icon: Utensils, color: "bg-green-500" },
];

interface CategoryTabsProps {
  activeCategory: number;
  onSelect: (id: number) => void;
}

export const CategoryTabs = observer(
  ({ activeCategory, onSelect }: CategoryTabsProps) => {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {MOCK_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          const Icon = cat.icon;

          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`flex flex-col items-center justify-center min-w-[100px] h-24 rounded-2xl transition-all duration-200 border transform active:scale-95 ${
                isActive
                  ? "bg-gray-900 text-white border-gray-900 shadow-lg scale-105 dark:bg-primary-500 dark:border-primary-500"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:bg-[#1A1D1F] dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              <div
                className={`p-2 rounded-full mb-2 ${
                  isActive ? "bg-white/10" : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                <Icon
                  className={`h-6 w-6 ${
                    isActive ? "text-white" : "text-gray-500 dark:text-gray-400"
                  }`}
                />
              </div>
              <span className="text-sm font-bold">{cat.name}</span>
            </button>
          );
        })}
      </div>
    );
  }
);
