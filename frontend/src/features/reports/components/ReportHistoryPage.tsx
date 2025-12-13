import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  reportService,
  type WorkPeriodHistory,
} from "../services/reportService";
import { formatCurrency } from "../../../utils/format";
import { useNavigate } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";

export const ReportHistoryPage = observer(() => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<WorkPeriodHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await reportService.getReportHistory();
      if (res.data.success && res.data.data) {
        setReports(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Calendar className="h-8 w-8 text-blue-500" />
          Geçmiş Çalışma Dönemleri
        </h1>
      </div>

      <div className="bg-white dark:bg-[#1A1D1F] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {reports.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Henüz kaydedilmiş rapor bulunmuyor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Dönem / Tarih
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                    Toplam Satış
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                    Giderler
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                    Net Kar
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {/* Action */}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    onClick={() => {
                      // Navigate to detail view using unique period ID
                      navigate(`/reports/period_${report.id}`);
                    }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">
                          {new Date(report.start_time).toLocaleDateString(
                            "tr-TR",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(report.start_time).toLocaleTimeString(
                            "tr-TR",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                          {" - "}
                          {report.end_time
                            ? new Date(report.end_time).toLocaleTimeString(
                                "tr-TR",
                                { hour: "2-digit", minute: "2-digit" }
                              )
                            : "Aktif"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-green-600">
                      {formatCurrency((report.total_sales || 0) / 100)}
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-red-500">
                      {formatCurrency((report.total_expenses || 0) / 100)}
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-blue-600">
                      {formatCurrency((report.net_profit || 0) / 100)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors inline-block" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
});
