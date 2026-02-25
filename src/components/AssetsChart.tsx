import ReactECharts from 'echarts-for-react';
import type { ChainBalance } from '../lib/hooks';

interface AssetsChartProps {
  balances: ChainBalance[];
}

export function AssetsChart({ balances }: AssetsChartProps) {
  const data = balances
    .filter((b) => !b.isLoading && !b.error && parseFloat(b.formattedBalance) > 0)
    .map((balance) => ({
      name: balance.chainName,
      value: parseFloat(balance.formattedBalance),
    }));

  if (data.length === 0) {
    return null;
  }

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} {a}',
    },
    series: [
      {
        name: 'Balance',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          color: '#fff',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        data: data,
        color: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
      },
    ],
  };

  return (
    <div className="w-full h-[300px]">
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
