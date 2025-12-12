import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { ArrowLeft } from "lucide-react";
import { CategoryTabs } from "./CategoryTabs";
import { ProductGrid } from "./ProductGrid";
import { OrderSummary } from "./OrderSummary";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export const OrderPage = observer(() => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(1);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { id: 1, name: "Kaşarlı Tost", price: 120.0, quantity: 2 },
    { id: 4, name: "Ayran", price: 20.0, quantity: 1 },
    { id: 8, name: "Türk Kahvesi", price: 40.0, quantity: 2 },
  ]);

  const handleProductClick = (product: any) => {
    setOrderItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  };

  const handleUpdateQuantity = (id: number, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleCloseOrder = (method: "cash" | "pos") => {
    // Mock logic for now
    console.log(`Order closed with ${method}`);
    navigate("/");
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.20))] -m-4 md:-m-6 overflow-hidden">
      {/* Left Side: Product Selection */}
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
        {/* Back Button & Title - Mobile Only mostly */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Masa {id}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Sipariş eklemek için ürün seçin
            </p>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <CategoryTabs
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>

        {/* Product Grid */}
        <ProductGrid
          activeCategory={activeCategory}
          onProductClick={handleProductClick}
        />
      </div>

      {/* Right Side: Order Summary */}
      <div className="w-[400px] hidden lg:block h-full shadow-xl z-10">
        <OrderSummary
          items={orderItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={(id) => handleUpdateQuantity(id, -1000)}
          onCloseOrder={handleCloseOrder}
        />
      </div>

      {/* Mobile Cart Trigger - could be added here for mobile view */}
    </div>
  );
});
