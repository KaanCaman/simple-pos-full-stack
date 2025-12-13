import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "../../../../utils/format";
import type { Order } from "../../../../types/operation";

interface DailySalesChartProps {
  orders: Order[];
}

export const DailySalesChart = ({ orders }: DailySalesChartProps) => {
  // Process orders to group by hour
  const processData = () => {
    const hourlyData = new Array(24).fill(0).map((_, i) => ({
      hour: `${i.toString().padStart(2, "0")}:00`,
      amount: 0,
    }));

    orders.forEach((order) => {
      const date = new Date(order.created_at);
      const hour = date.getHours();
      // Ensure total_amount is treated as number and converted from cents
      hourlyData[hour].amount += (order.total_amount || 0) / 100;
    });

    // Filter out future hours or hours with no sales if preferred,
    // but keeping 24h view is often better for consistency.
    // For "trend" we might want to slice from first sale to last sale or current time.

    // For now, let's return the whole day but maybe trim empty start/end if needed later.
    return hourlyData;
  };

  const data = processData();

  return (
    <div className="bg-white dark:bg-[#1A1D1F] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm h-[300px]">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Saatlik Satış Grafiği
      </h3>
      <div className="h-[230px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
              opacity={0.5}
            />
            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              interval={2}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              tickFormatter={(value) => `₺${value}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white dark:bg-[#1A1D1F] p-3 border border-gray-100 dark:border-gray-800 rounded-lg shadow-lg">
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                        Saat: {label}
                      </p>
                      <p className="text-blue-500 font-bold text-lg">
                        {formatCurrency(payload[0].value as number)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#3B82F6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSales)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
