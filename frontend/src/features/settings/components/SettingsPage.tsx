import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { User, Shield, CreditCard, Bell, Key } from "lucide-react";

export const SettingsPage = observer(() => {
  const { t } = useTranslation();

  const sections = [
    {
      title: "Hesap",
      items: [
        {
          icon: User,
          label: "Profil Bilgileri",
          desc: "Ad, soyad ve iletişim bilgileri",
        },
        { icon: Key, label: "PIN Kodu", desc: "Giriş şifrenizi değiştirin" },
      ],
    },
    {
      title: "İşletme",
      items: [
        {
          icon: Shield,
          label: "Personel Yönetimi",
          desc: "Garson hesapları ve yetkiler",
        },
        {
          icon: CreditCard,
          label: "Ödeme Yöntemleri",
          desc: "Nakit, POS ve diğerleri",
        },
      ],
    },
    {
      title: "Uygulama",
      items: [
        { icon: Bell, label: "Bildirimler", desc: "Ses ve uyarı ayarları" },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("dashboard.menu.settings")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Sistem ve hesap ayarlarınızı yönetin
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
                    key={item.label}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors text-left group"
                  >
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {item.label}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.desc}
                      </p>
                    </div>
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
