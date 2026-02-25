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
import { AlertTriangle, ShieldAlert, Check } from 'lucide-react';

export type SensitiveActionType = 'exportPrivateKey' | 'exportMnemonic' | 'clearData' | 'deleteAccount';

interface SensitiveActionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  actionType: SensitiveActionType;
  title?: string;
  description?: string;
  warningMessage?: string;
}

export function SensitiveActionDialog({
  open,
  onClose,
  onConfirm,
  actionType,
  title,
  description,
  warningMessage,
}: SensitiveActionDialogProps) {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState('');

  const requiresTextConfirmation = actionType === 'clearData' || actionType === 'deleteAccount';
  const confirmationText = 'DELETE';

  const getDefaultTitle = () => {
    switch (actionType) {
      case 'exportPrivateKey':
        return t('security.exportPrivateKey');
      case 'exportMnemonic':
        return t('security.exportMnemonic');
      case 'clearData':
        return t('security.clearData');
      case 'deleteAccount':
        return t('security.deleteAccount');
    }
  };

  const getDefaultDescription = () => {
    switch (actionType) {
      case 'exportPrivateKey':
        return t('security.exportPrivateKeyDesc');
      case 'exportMnemonic':
        return t('security.exportMnemonicDesc');
      case 'clearData':
        return t('security.clearDataDesc');
      case 'deleteAccount':
        return t('security.deleteAccountDesc');
    }
  };

  const getDefaultWarning = () => {
    switch (actionType) {
      case 'exportPrivateKey':
      case 'exportMnemonic':
        return t('security.exportWarning');
      case 'clearData':
        return t('security.clearDataWarning');
      case 'deleteAccount':
        return t('security.deleteAccountWarning');
    }
  };

  const handleConfirm = async () => {
    if (!password) {
      setError(t('security.passwordRequired'));
      return;
    }

    if (requiresTextConfirmation && confirmText !== confirmationText) {
      setError(t('security.confirmationTextMismatch', { text: confirmationText }));
      return;
    }

    setError('');
    setIsConfirming(true);

    try {
      await onConfirm(password);
      setPassword('');
      setConfirmText('');
      onClose();
    } catch (err: any) {
      setError(err.message || t('security.actionFailed'));
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setConfirmText('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-400" />
            <DialogTitle className="text-red-400">
              {title || getDefaultTitle()}
            </DialogTitle>
          </div>
          <DialogDescription>
            {description || getDefaultDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Banner */}
          <div className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-red-400">
                {t('security.dangerZone')}
              </p>
            </div>
            <p className="text-sm text-red-300 ml-7">
              {warningMessage || getDefaultWarning()}
            </p>
          </div>

          {/* Security Checklist */}
          <div className="space-y-2 p-3 bg-gray-800 rounded-lg">
            <p className="text-sm font-medium text-gray-300 mb-2">
              {t('security.beforeProceeding')}
            </p>
            <ul className="space-y-1 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">•</span>
                <span>{t('security.checklist.secure')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">•</span>
                <span>{t('security.checklist.noShare')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">•</span>
                <span>{t('security.checklist.understand')}</span>
              </li>
            </ul>
          </div>

          {/* Text Confirmation for Destructive Actions */}
          {requiresTextConfirmation && (
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                {t('security.typeToConfirm', { text: confirmationText })}
              </label>
              <Input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={confirmationText}
                className="bg-gray-900 border-gray-700 text-white font-mono"
              />
            </div>
          )}

          {/* Password Input */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              {t('security.enterPasswordToConfirm')}
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
              disabled={
                isConfirming ||
                !password ||
                (requiresTextConfirmation && confirmText !== confirmationText)
              }
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isConfirming ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('security.processing')}
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
