import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { AutoLockSettings as Settings } from '../lib/hooks/useAutoLock';
import { toast } from 'sonner';
import { Lock, Clock } from 'lucide-react';

const TIMEOUT_OPTIONS = [
  { value: '60000', label: '1 分钟' },
  { value: '180000', label: '3 分钟' },
  { value: '300000', label: '5 分钟' },
  { value: '600000', label: '10 分钟' },
  { value: '900000', label: '15 分钟' },
  { value: '1800000', label: '30 分钟' },
  { value: '3600000', label: '1 小时' },
];

export function AutoLockSettings() {
  const [enabled, setEnabled] = useState(true);
  const [timeout, setTimeout] = useState('300000'); // 5 minutes default

  useEffect(() => {
    const settings = Settings.get();
    setEnabled(settings.enabled);
    setTimeout(settings.timeout.toString());
  }, []);

  const handleSave = () => {
    Settings.set({
      enabled,
      timeout: parseInt(timeout, 10),
    });
    toast.success('自动锁定设置已保存');
  };

  const handleReset = () => {
    const defaults = Settings.reset();
    setEnabled(defaults.enabled);
    setTimeout(defaults.timeout.toString());
    toast.success('已恢复默认设置');
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-400" />
          自动锁定设置
        </CardTitle>
        <CardDescription className="text-gray-400">
          配置钱包在不活动后自动锁定的时间
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex-1">
            <Label className="text-white font-medium">启用自动锁定</Label>
            <p className="text-sm text-gray-400 mt-1">
              在一段时间不活动后自动锁定钱包
            </p>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              enabled ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Timeout Selection */}
        {enabled && (
          <div className="space-y-2">
            <Label htmlFor="timeout" className="text-white flex items-center gap-2">
              <Clock className="w-4 h-4" />
              自动锁定时间
            </Label>
            <Select value={timeout} onValueChange={setTimeout}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {TIMEOUT_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-white hover:bg-gray-700"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-400">
              钱包将在 {TIMEOUT_OPTIONS.find((o) => o.value === timeout)?.label}{' '}
              不活动后自动锁定
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-gray-700">
          <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
            保存设置
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            恢复默认
          </Button>
        </div>

        {/* Info Box */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/50 rounded-lg">
          <p className="text-sm text-blue-400">
            💡 提示：自动锁定功能可以保护您的钱包在您离开时不被未授权访问。
            任何鼠标、键盘或触摸活动都会重置计时器。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
