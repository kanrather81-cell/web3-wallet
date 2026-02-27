import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NetworkManager, type NetworkConfig } from '../services/networkManager';
import { BiometricAuthService } from '../services/biometricAuth';
import { AutoLockSettings } from '../components/AutoLockSettings';
import { Input } from '../components/ui/input';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  ArrowLeft,
  Settings,
  Network,
  Plus,
  Trash2,
  Check,
  ExternalLink,
  Edit,
  Fingerprint,
  Wallet,
} from 'lucide-react';

export function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [networks, setNetworks] = useState<NetworkConfig[]>([]);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingNetwork, setEditingNetwork] = useState<NetworkConfig | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    chainId: '',
    symbol: '',
    rpcUrl: '',
    explorerUrl: '',
  });
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    loadNetworks();
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = () => {
    setBiometricAvailable(BiometricAuthService.isAvailable());
    setBiometricEnabled(BiometricAuthService.isEnabled());
  };

  const handleToggleBiometric = async () => {
    try {
      if (biometricEnabled) {
        BiometricAuthService.disable();
        setBiometricEnabled(false);
        alert(t('security.biometric.disable'));
      } else {
        // In a real app, you'd get the user ID from the wallet
        const userId = 'user_' + Date.now();
        await BiometricAuthService.register(userId);
        setBiometricEnabled(true);
        alert(t('security.biometric.registerSuccess'));
      }
    } catch (error) {
      alert(t('security.biometric.registerFailed'));
    }
  };

  const loadNetworks = () => {
    setNetworks(NetworkManager.getAllNetworks());
  };

  const handleSetDefault = (networkId: string) => {
    try {
      NetworkManager.setDefaultNetwork(networkId);
      loadNetworks();
    } catch (error) {
      alert(t('settings.setDefaultFailed'));
    }
  };

  const handleDelete = (networkId: string) => {
    if (window.confirm(t('settings.confirmDelete'))) {
      try {
        NetworkManager.deleteCustomNetwork(networkId);
        loadNetworks();
      } catch (error) {
        alert(t('settings.deleteNetworkFailed'));
      }
    }
  };

  const handleEdit = (network: NetworkConfig) => {
    setEditingNetwork(network);
    setFormData({
      name: network.name,
      chainId: network.chainId.toString(),
      symbol: network.symbol,
      rpcUrl: network.rpcUrl,
      explorerUrl: network.explorerUrl,
    });
    setIsEditDialogOpen(true);
  };

  const handleAddNetwork = async () => {
    setValidationError('');

    // Validate form
    if (!formData.name || !formData.chainId || !formData.symbol || !formData.rpcUrl) {
      setValidationError(t('settings.fillAllFields'));
      return;
    }

    const chainId = parseInt(formData.chainId);
    if (isNaN(chainId) || chainId <= 0) {
      setValidationError(t('settings.chainIdMustBePositive'));
      return;
    }

    // Validate RPC URL
    setIsValidating(true);
    const isValid = await NetworkManager.validateRpcUrl(formData.rpcUrl, chainId);
    setIsValidating(false);

    if (!isValid) {
      setValidationError(t('settings.rpcValidationFailed'));
      return;
    }

    try {
      NetworkManager.addCustomNetwork({
        name: formData.name,
        chainId,
        symbol: formData.symbol,
        rpcUrl: formData.rpcUrl,
        explorerUrl: formData.explorerUrl,
      });

      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        chainId: '',
        symbol: '',
        rpcUrl: '',
        explorerUrl: '',
      });
      loadNetworks();
    } catch (error: any) {
      setValidationError(error.message || t('settings.addNetworkFailed'));
    }
  };

  const handleUpdateNetwork = async () => {
    if (!editingNetwork) return;

    setValidationError('');

    // Validate form
    if (!formData.name || !formData.symbol || !formData.rpcUrl) {
      setValidationError(t('settings.fillAllFields'));
      return;
    }

    try {
      NetworkManager.updateCustomNetwork(editingNetwork.id, {
        name: formData.name,
        symbol: formData.symbol,
        rpcUrl: formData.rpcUrl,
        explorerUrl: formData.explorerUrl,
      });

      setIsEditDialogOpen(false);
      setEditingNetwork(null);
      setFormData({
        name: '',
        chainId: '',
        symbol: '',
        rpcUrl: '',
        explorerUrl: '',
      });
      loadNetworks();
    } catch (error: any) {
      setValidationError(error.message || t('settings.updateNetworkFailed'));
    }
  };

  const getChainColor = (chainId: number) => {
    const colors: Record<number, string> = {
      1: 'bg-blue-500',
      137: 'bg-purple-500',
      10: 'bg-red-500',
      42161: 'bg-cyan-500',
      8453: 'bg-indigo-500',
    };
    return colors[chainId] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header - TP Style */}
      <div className="bg-gradient-tp text-white px-6 pt-12 pb-6 rounded-b-[32px] shadow-lg">
        <div className="flex items-center gap-3">
          <Settings className="w-7 h-7" />
          <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-4">
        {/* Language Settings Section */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">{t('settings.language')}</h2>
          <p className="text-sm text-gray-600 mb-4">{t('settings.selectLanguage')}</p>
          <LanguageSwitcher />
        </div>

        {/* Wallet Management Section */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">钱包管理</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">管理您的多个钱包</p>
          <button
            onClick={() => navigate('/wallets')}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-primary-600" />
              <div className="text-left">
                <p className="text-gray-900 font-medium">查看所有钱包</p>
                <p className="text-sm text-gray-600">创建、导入、切换和管理钱包</p>
              </div>
            </div>
            <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
          </button>
        </div>

        {/* Biometric Authentication Section */}
        {biometricAvailable && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Fingerprint className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">{t('security.biometric.title')}</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">{t('security.biometric.description')}</p>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-gray-900 font-medium mb-1">
                  {biometricEnabled
                    ? t('security.biometric.disable')
                    : t('security.biometric.enable')}
                </p>
                <p className="text-sm text-gray-600">
                  {t('security.biometric.type')}: {BiometricAuthService.getBiometricType()}
                </p>
              </div>
              <button
                onClick={handleToggleBiometric}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  biometricEnabled ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    biometricEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Auto Lock Settings Section */}
        <AutoLockSettings />

        {/* Network Management Section */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Network className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">{t('settings.networkManagement')}</h2>
              </div>
              <p className="text-sm text-gray-600">{t('settings.networkManagementDesc')}</p>
            </div>
            <button
              onClick={() => setIsAddDialogOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('settings.addNetwork')}</span>
            </button>
          </div>
          
          <div className="space-y-3">
            {networks.map((network) => (
              <div
                key={network.id}
                className={`bg-gray-50 rounded-xl p-4 border ${
                  network.isDefault ? 'border-primary-300 bg-primary-50' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Network Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="text-2xl mt-0.5">{network.icon || '🌐'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-gray-900 font-semibold">{network.name}</h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getChainColor(
                            network.chainId
                          )} text-white font-medium`}
                        >
                          {network.symbol}
                        </span>
                        {network.isDefault && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-600 text-white font-medium flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            {t('settings.default')}
                          </span>
                        )}
                        {network.isCustom && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                            {t('settings.custom')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                        <span>Chain ID: {network.chainId}</span>
                        <span>•</span>
                        <span className="truncate">{network.rpcUrl}</span>
                      </div>
                      
                      {/* Actions Row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {!network.isDefault && (
                          <button
                            onClick={() => handleSetDefault(network.id)}
                            className="px-3 py-1.5 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
                          >
                            {t('settings.setAsDefault')}
                          </button>
                        )}
                        {network.isCustom && (
                          <>
                            <button
                              onClick={() => handleEdit(network)}
                              className="p-1.5 hover:bg-primary-100 rounded-lg transition-colors"
                              title={t('common.edit')}
                            >
                              <Edit className="w-4 h-4 text-primary-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(network.id)}
                              className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                              title={t('common.delete')}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </>
                        )}
                        <a
                          href={network.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                          title={t('settings.browser')}
                        >
                          <ExternalLink className="w-4 h-4 text-gray-600" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <p className="text-blue-800 text-sm">
            {t('settings.networkInfo')}
          </p>
        </div>
      </div>

      {/* Add Network Dialog - TP Style */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">{t('settings.addNetworkTitle')}</DialogTitle>
            <DialogDescription className="text-gray-600">{t('settings.addNetworkDesc')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-700 mb-1 block font-medium">{t('settings.networkName')} *</label>
              <Input
                type="text"
                placeholder={t('settings.networkNamePlaceholder')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-gray-50 border-gray-200 text-gray-900"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700 mb-1 block font-medium">{t('settings.chainId')} *</label>
              <Input
                type="number"
                placeholder={t('settings.chainIdPlaceholder')}
                value={formData.chainId}
                onChange={(e) => setFormData({ ...formData, chainId: e.target.value })}
                className="bg-gray-50 border-gray-200 text-gray-900"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700 mb-1 block font-medium">{t('settings.symbol')} *</label>
              <Input
                type="text"
                placeholder={t('settings.symbolPlaceholder')}
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                className="bg-gray-50 border-gray-200 text-gray-900"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700 mb-1 block font-medium">{t('settings.rpcUrl')} *</label>
              <Input
                type="url"
                placeholder={t('settings.rpcUrlPlaceholder')}
                value={formData.rpcUrl}
                onChange={(e) => setFormData({ ...formData, rpcUrl: e.target.value })}
                className="bg-gray-50 border-gray-200 text-gray-900"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700 mb-1 block font-medium">{t('settings.explorer')}</label>
              <Input
                type="url"
                placeholder={t('settings.explorerPlaceholder')}
                value={formData.explorerUrl}
                onChange={(e) => setFormData({ ...formData, explorerUrl: e.target.value })}
                className="bg-gray-50 border-gray-200 text-gray-900"
              />
            </div>

            {validationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {validationError}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setIsAddDialogOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleAddNetwork}
                disabled={isValidating}
                className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
              >
                {isValidating ? t('settings.validating') : t('common.add')}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Network Dialog - TP Style */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">{t('settings.editNetworkTitle')}</DialogTitle>
            <DialogDescription className="text-gray-600">{t('settings.editNetworkDesc')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-700 mb-1 block font-medium">{t('settings.networkName')} *</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-gray-50 border-gray-200 text-gray-900"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700 mb-1 block font-medium">{t('settings.chainId')}</label>
              <Input
                type="number"
                value={formData.chainId}
                disabled
                className="bg-gray-100 border-gray-200 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">{t('settings.chainIdNotEditable')}</p>
            </div>

            <div>
              <label className="text-sm text-gray-700 mb-1 block font-medium">{t('settings.symbol')} *</label>
              <Input
                type="text"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                className="bg-gray-50 border-gray-200 text-gray-900"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700 mb-1 block font-medium">{t('settings.rpcUrl')} *</label>
              <Input
                type="url"
                value={formData.rpcUrl}
                onChange={(e) => setFormData({ ...formData, rpcUrl: e.target.value })}
                className="bg-gray-50 border-gray-200 text-gray-900"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700 mb-1 block font-medium">{t('settings.explorer')}</label>
              <Input
                type="url"
                value={formData.explorerUrl}
                onChange={(e) => setFormData({ ...formData, explorerUrl: e.target.value })}
                className="bg-gray-50 border-gray-200 text-gray-900"
              />
            </div>

            {validationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {validationError}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleUpdateNetwork}
                className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors font-medium shadow-md"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
