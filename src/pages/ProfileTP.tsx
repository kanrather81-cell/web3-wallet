import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import {
  Wallet,
  History,
  Settings,
  HelpCircle,
  ChevronRight,
  Shield,
  Bell,
  Globe,
  Lock,
  FileText,
} from 'lucide-react';

const menuItems = [
  {
    section: '钱包',
    items: [
      { icon: Wallet, label: '钱包管理', path: '/wallets', color: 'text-blue-600' },
      { icon: History, label: '交易历史', path: '/history', color: 'text-purple-600' },
    ],
  },
  {
    section: '设置',
    items: [
      { icon: Settings, label: '通用设置', path: '/settings', color: 'text-gray-600' },
      { icon: Shield, label: '安全中心', path: '/settings#security', color: 'text-green-600' },
      { icon: Bell, label: '通知设置', path: '/settings#notifications', color: 'text-orange-600' },
      { icon: Globe, label: '语言设置', path: '/settings#language', color: 'text-indigo-600' },
      { icon: Lock, label: '隐私设置', path: '/settings#privacy', color: 'text-red-600' },
    ],
  },
  {
    section: '帮助',
    items: [
      { icon: HelpCircle, label: '帮助中心', path: '/help', color: 'text-cyan-600' },
      { icon: FileText, label: '用户协议', path: '/terms', color: 'text-teal-600' },
    ],
  },
];

export function ProfileTP() {
  const navigate = useNavigate();

  // 模拟用户数据
  const totalAssets = 12345.67;
  const walletAddress = '0x1234...5678';

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      {/* 顶部用户信息卡片 */}
      <div className="bg-gradient-tp text-white px-6 pt-12 pb-8 rounded-b-[32px] shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border-4 border-white/30">
            <span className="text-3xl font-bold">W</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1">我的钱包</h2>
            <p className="text-sm opacity-90 font-mono">{walletAddress}</p>
          </div>
        </div>

        {/* 资产总览 */}
        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-90 mb-1">总资产 (USD)</p>
                <p className="text-2xl font-bold">${totalAssets.toLocaleString()}</p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium transition-colors"
              >
                查看详情
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 功能菜单 */}
      <div className="px-4 mt-6 space-y-4">
        {menuItems.map((section, sectionIdx) => (
          <div key={sectionIdx}>
            <h3 className="text-sm font-semibold text-gray-500 mb-3 px-2">{section.section}</h3>
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-0">
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={itemIdx}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                        itemIdx !== section.items.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`${item.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-gray-900">{item.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* 版本信息 */}
      <div className="px-4 mt-8 mb-4">
        <p className="text-center text-sm text-gray-400">
          Multi-Chain Wallet v1.0.0
        </p>
      </div>
    </div>
  );
}
