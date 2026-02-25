import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NetworkManager, type NetworkConfig } from '../services/networkManager';
import { BiometricAuthService } from '../services/biometricAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto pt-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-indigo-400" />
              <h1 className="text-3xl font-bold text-white">{t('settings.title')}</h1>
            </div>
          </div>
        </div>

        {/* Language Settings Section */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">{t('settings.language')}</CardTitle>
            <CardDescription>{t('settings.selectLanguage')}</CardDescription>
          </CardHeader>
          <CardContent>
            <LanguageSwitcher />
          </CardContent>
        </Card>

        {/* Biometric Authentication Section */}
        {biometricAvailable && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-indigo-400" />
                <CardTitle className="text-white">{t('security.biometric.title')}</CardTitle>
              </div>
              <CardDescription>{t('security.biometric.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                <div>
                  <p className="text-white font-medium mb-1">
                    {biometricEnabled
                      ? t('security.biometric.disable')
                      : t('security.biometric.enable')}
                  </p>
                  <p className="text-sm text-gray-400">
                    {t('security.biometric.type')}: {BiometricAuthService.getBiometricType()}
                  </p>
                </div>
                <button
                  onClick={handleToggleBiometric}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    biometricEnabled ? 'bg-indigo-600' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      biometricEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Network Management Section */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-indigo-400" />
                  <CardTitle className="text-white">{t('settings.networkManagement')}</CardTitle>
                </div>
                <CardDescription className="mt-2">
                  {t('settings.networkManagementDesc')}
                </CardDescription>
              </div>
              <button
                onClick={() => setIsAddDialogOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('settings.addNetwork')}
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {networks.map((network) => (
              <Card
                key={network.id}
                className={`bg-gray-900/50 border-gray-700 hover:bg-gray-900/70 transition-colors ${
                  network.isDefault ? 'border-indigo-500' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Network Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-3xl">{network.icon || '🌐'}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-medium">{network.name}</h3>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${getChainColor(
                              network.chainId
                            )} text-white font-medium`}
                          >
                            {network.symbol}
                          </span>
                          {network.isDefault && (
                            <span className="text-xs px-2 py-0.5 rounded bg-indigo-500 text-white font-medium flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              {t('settings.default')}
                            </span>
                          )}
                          {network.isCustom && (
                            <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-medium">
                              {t('settings.custom')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>Chain ID: {network.chainId}</span>
                          <span>•</span>
                          <span className="truncate">{network.rpcUrl}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!network.isDefault && (
                        <button
                          onClick={() => handleSetDefault(network.id)}
                          className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                          title={t('settings.setAsDefault')}
                        >
                          {t('settings.setAsDefault')}
                        </button>
                      )}
                      {network.isCustom && (
                        <>
                          <button
                            onClick={() => handleEdit(network)}
                            className="p-1.5 hover:bg-indigo-500/20 rounded transition-colors"
                            title={t('common.edit')}
                          >
                            <Edit className="w-4 h-4 text-indigo-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(network.id)}
                            className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                            title={t('common.delete')}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </>
                      )}
                      <a
                        href={network.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                        title={t('settings.browser')}
                      >
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-indigo-500/10 border-indigo-500/30">
          <CardContent className="p-4">
            <p className="text-indigo-200 text-sm">
              {t('settings.networkInfo')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Network Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('settings.addNetworkTitle')}</DialogTitle>
            <DialogDescription>{t('settings.addNetworkDesc')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">{t('settings.networkName')} *</label>
              <Input
                type="text"
                placeholder={t('settings.networkNamePlaceholder')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">{t('settings.chainId')} *</label>
              <Input
                type="number"
                placeholder={t('settings.chainIdPlaceholder')}
                value={formData.chainId}
                onChange={(e) => setFormData({ ...formData, chainId: e.target.value })}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">{t('settings.symbol')} *</label>
              <Input
                type="text"
                placeholder={t('settings.symbolPlaceholder')}
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">{t('settings.rpcUrl')} *</label>
              <Input
                type="url"
                placeholder={t('settings.rpcUrlPlaceholder')}
                value={formData.rpcUrl}
                onChange={(e) => setFormData({ ...formData, rpcUrl: e.target.value })}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">{t('settings.explorer')}</label>
              <Input
                type="url"
                placeholder={t('settings.explorerPlaceholder')}
                value={formData.explorerUrl}
                onChange={(e) => setFormData({ ...formData, explorerUrl: e.target.value })}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>

            {validationError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
                {validationError}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setIsAddDialogOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleAddNetwork}
                disabled={isValidating}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isValidating ? t('settings.validating') : t('common.add')}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Network Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('settings.editNetworkTitle')}</DialogTitle>
            <DialogDescription>{t('settings.editNetworkDesc')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">{t('settings.networkName')} *</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">{t('settings.chainId')}</label>
              <Input
                type="number"
                value={formData.chainId}
                disabled
                className="bg-gray-900 border-gray-700 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">{t('settings.chainIdNotEditable')}</p>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">{t('settings.symbol')} *</label>
              <Input
                type="text"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">{t('settings.rpcUrl')} *</label>
              <Input
                type="url"
                value={formData.rpcUrl}
                onChange={(e) => setFormData({ ...formData, rpcUrl: e.target.value })}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">{t('settings.explorer')}</label>
              <Input
                type="url"
                value={formData.explorerUrl}
                onChange={(e) => setFormData({ ...formData, explorerUrl: e.target.value })}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>

            {validationError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
                {validationError}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleUpdateNetwork}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
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
