import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, AlertTriangle } from 'lucide-react';
import { Input } from './ui/input';

interface SlippageSettingsProps {
  slippage: number;
  onSlippageChange: (slippage: number) => void;
}

const PRESET_SLIPPAGES = [0.1, 0.5, 1.0];

export function SlippageSettings({ slippage, onSlippageChange }: SlippageSettingsProps) {
  const { t } = useTranslation();
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState(slippage.toString());

  const handlePresetClick = (value: number) => {
    setIsCustom(false);
    onSlippageChange(value);
  };

  const handleCustomChange = (value: string) => {
    setCustomValue(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 50) {
      onSlippageChange(numValue);
    }
  };

  const getSlippageWarning = () => {
    if (slippage < 0.1) {
      return {
        type: 'error',
        message: t('security.slippage.tooLow'),
      };
    }
    if (slippage > 5) {
      return {
        type: 'warning',
        message: t('security.slippage.tooHigh'),
      };
    }
    return null;
  };

  const warning = getSlippageWarning();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-gray-400">
        <Settings className="w-4 h-4" />
        <span className="text-sm font-medium">{t('security.slippage.title')}</span>
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {PRESET_SLIPPAGES.map((preset) => (
          <button
            key={preset}
            onClick={() => handlePresetClick(preset)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              !isCustom && slippage === preset
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {preset}%
          </button>
        ))}
        <button
          onClick={() => setIsCustom(true)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            isCustom
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          {t('security.slippage.custom')}
        </button>
      </div>

      {/* Custom Input */}
      {isCustom && (
        <div className="relative">
          <Input
            type="number"
            step="0.1"
            min="0"
            max="50"
            value={customValue}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="0.5"
            className="bg-gray-900 border-gray-700 text-white pr-8"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            %
          </span>
        </div>
      )}

      {/* Warning Message */}
      {warning && (
        <div
          className={`p-3 rounded-lg flex items-start gap-2 ${
            warning.type === 'error'
              ? 'bg-red-500/10 border border-red-500/30'
              : 'bg-yellow-500/10 border border-yellow-500/30'
          }`}
        >
          <AlertTriangle
            className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
              warning.type === 'error' ? 'text-red-400' : 'text-yellow-400'
            }`}
          />
          <p
            className={`text-sm ${
              warning.type === 'error' ? 'text-red-400' : 'text-yellow-400'
            }`}
          >
            {warning.message}
          </p>
        </div>
      )}

      {/* Info */}
      <p className="text-xs text-gray-500">
        {t('security.slippage.description')}
      </p>
    </div>
  );
}
