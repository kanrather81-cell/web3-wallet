import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { AlertTriangle, Check, Zap, Clock, Gauge } from 'lucide-react';

export type TransactionSpeed = 'slow' | 'standard' | 'fast';

export interface TransactionDetails {
  to: string;
  amount: string;
  token: string;
  estimatedGas: string;
  gasPrice?: {
    slow: string;
    standard: string;
    fast: string;
  };
}

interface TransactionConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (password: string, speed: TransactionSpeed) => Promise<void>;
  details: TransactionDetails;
  requirePassword?: boolean;
}

export function TransactionConfirmDialog({
  open,
  onClose,
  onConfirm,
  details,
  requirePassword = true,
}: TransactionConfirmDialogProps) {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [speed, setSpeed] = useState<TransactionSpeed>('standard');
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (requirePassword && !password) {
      setError(t('security.passwordRequired'));
      return;
    }

    setError('');
    setIsConfirming(true);

    try {
      await onConfirm(password, speed);
      setPassword('');
      onClose();
    } catch (err: any) {
      setError(err.message || t('security.transactionFailed'));
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    setSpeed('standard');
    onClose();
  };

  const getGasPrice = () => {
    if (!details.gasPrice) return details.estimatedGas;
    return details.gasPrice[speed];
  };

  const getSpeedIcon = (speedType: TransactionSpeed) => {
    switch (speedType) {
      case 'slow':
        return <Clock className="w-4 h-4" />;
      case 'standard':
        return <Gauge className="w-4 h-4" />;
      case 'fast':
        return <Zap className="w-4 h-4" />;
    }
  };

  const getSpeedTime = (speedType: TransactionSpeed) => {
    switch (speedType) {
      case 'slow':
        return '~5 min';
      case 'standard':
        return '~2 min';
      case 'fast':
        return '~30 sec';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('security.confirmTransaction')}</DialogTitle>
          <DialogDescription>
            {t('security.reviewTransactionDetails')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Banner */}
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-400">
              {t('security.transactionWarning')}
            </p>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3 p-4 bg-gray-800 rounded-lg">
            <div>
              <p className="text-sm text-gray-400 mb-1">{t('transaction.to')}</p>
              <p className="text-white font-mono text-sm break-all">{details.to}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-400 mb-1">{t('transaction.amount')}</p>
                <p className="text-white font-semibold">
                  {details.amount} {details.token}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">{t('security.estimatedFee')}</p>
                <p className="text-white font-semibold">{getGasPrice()}</p>
              </div>
            </div>
          </div>

          {/* Transaction Speed Selection */}
          {details.gasPrice && (
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                {t('security.transactionSpeed')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['slow', 'standard', 'fast'] as TransactionSpeed[]).map((speedType) => (
                  <button
                    key={speedType}
                    onClick={() => setSpeed(speedType)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      speed === speedType
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={
                          speed === speedType ? 'text-indigo-400' : 'text-gray-400'
                        }
                      >
                        {getSpeedIcon(speedType)}
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          speed === speedType ? 'text-white' : 'text-gray-400'
                        }`}
                      >
                        {t(`security.speed.${speedType}`)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getSpeedTime(speedType)}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        {details.gasPrice?.[speedType]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Password Input */}
          {requirePassword && (
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                {t('security.enterPassword')}
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('security.passwordPlaceholder')}
                className="bg-gray-900 border-gray-700 text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleConfirm();
                  }
                }}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              disabled={isConfirming}
              className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isConfirming || (requirePassword && !password)}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isConfirming ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('security.confirming')}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {t('common.confirm')}
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
