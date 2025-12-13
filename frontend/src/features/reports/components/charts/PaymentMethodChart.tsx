import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { formatCurrency } from "../../../../utils/format";

interface PaymentMethodChartProps {
  cashSales: number;
  creditSales: number;
}

export const PaymentMethodChart = ({
  cashSales,
  creditSales,
}: PaymentMethodChartProps) => {
  const data = [
    { name: "Nakit", value: cashSales / 100 },
    { name: "Kredi Kartı", value: creditSales / 100 },
  ];

  const COLORS = ["#10B981", "#3B82F6"]; // Green for Cash, Blue for Credit

  return (
    <div className="bg-white dark:bg-[#1A1D1F] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm h-[300px]">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Ödeme Yöntemleri
      </h3>
      <div className="h-[230px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white dark:bg-[#1A1D1F] p-3 border border-gray-100 dark:border-gray-800 rounded-lg shadow-lg">
                      <p className="text-gray-900 dark:text-white font-medium">
                        {payload[0].name}
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(payload[0].value as number)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
