import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
];

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-gray-400">
        <Globe className="w-5 h-5" />
        <h3 className="text-lg font-semibold">{t('settings.language')}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`p-4 rounded-lg border-2 transition-all ${
              i18n.language === lang.code
                ? 'border-indigo-500 bg-indigo-500/10 text-white'
                : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
            }`}
          >
            <div className="text-left">
              <div className="font-semibold">{lang.nativeName}</div>
              <div className="text-sm text-gray-400">{lang.name}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
