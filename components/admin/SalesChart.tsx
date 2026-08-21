'use client'

import React, { useState } from 'react'
import { TrendingUp, Calendar } from 'lucide-react'

const chartData: Record<string, { labels: string[]; values: number[]; orders: number[] }> = {
  '7d': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [12400, 18500, 15200, 24800, 31200, 42100, 38900],
    orders: [14, 21, 18, 29, 36, 48, 44]
  },
  '30d': {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    values: [85000, 112000, 98000, 142000],
    orders: [98, 128, 114, 162]
  },
  '3m': {
    labels: ['Month 1', 'Month 2', 'Month 3'],
    values: [320000, 410000, 480000],
    orders: [380, 490, 560]
  },
  '1y': {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    values: [1200000, 1450000, 1820000, 2100000],
    orders: [1400, 1720, 2150, 2480]
  }
}

export default function SalesChart() {
  const [period, setPeriod] = useState<'7d' | '30d' | '3m' | '1y'>('7d')
  const current = chartData[period]
  const maxValue = Math.max(...current.values)

  const totalPeriodRevenue = current.values.reduce((a, b) => a + b, 0)
  const totalPeriodOrders = current.orders.reduce((a, b) => a + b, 0)

  return (
    <div className="bg-white rounded-xl border border-border p-6 shadow-sm space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-xl font-semibold text-charcoal">Sales Analytics</h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp size={12} /> +18.4%
            </span>
          </div>
          <p className="text-xs text-mid mt-0.5">Revenue & order trends across selected timeframe</p>
        </div>

        {/* Time filters */}
        <div className="flex items-center gap-1 bg-[#f5f1ea] p-1 rounded-lg border border-border self-start sm:self-auto">
          {[
            { key: '7d', label: '7 Days' },
            { key: '30d', label: '30 Days' },
            { key: '3m', label: '3 Months' },
            { key: '1y', label: '1 Year' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setPeriod(tab.key as any)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                period === tab.key
                  ? 'bg-white text-charcoal font-semibold shadow-xs'
                  : 'text-mid hover:text-charcoal'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 px-4 bg-[#faf7f2] rounded-lg border border-border/60 text-xs">
        <div>
          <span className="text-mid block">Period Revenue</span>
          <strong className="font-serif text-lg text-charcoal">₹{totalPeriodRevenue.toLocaleString('en-IN')}</strong>
        </div>
        <div>
          <span className="text-mid block">Total Orders</span>
          <strong className="font-serif text-lg text-charcoal">{totalPeriodOrders}</strong>
        </div>
        <div>
          <span className="text-mid block">Avg. Order Value</span>
          <strong className="font-serif text-lg text-charcoal">₹{Math.round(totalPeriodRevenue / (totalPeriodOrders || 1)).toLocaleString('en-IN')}</strong>
        </div>
        <div>
          <span className="text-mid block">Conversion Rate</span>
          <strong className="font-serif text-lg text-charcoal">3.8%</strong>
        </div>
      </div>

      {/* Bar Visualizer */}
      <div className="pt-4">
        <div className="flex items-end gap-3 sm:gap-6 h-48 sm:h-56 pb-2 border-b border-border/80">
          {current.values.map((val, idx) => {
            const heightPercent = Math.round((val / maxValue) * 100)
            const label = current.labels[idx]
            const orders = current.orders[idx]

            return (
              <div key={label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-charcoal text-cream text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap shadow-md z-10">
                  ₹{val.toLocaleString('en-IN')} ({orders} orders)
                </div>

                {/* Bar */}
                <div className="w-full max-w-[48px] bg-beige rounded-t-md overflow-hidden flex flex-col justify-end transition-all group-hover:bg-gold/20 h-full">
                  <div
                    className="w-full bg-charcoal group-hover:bg-wine transition-all duration-500 rounded-t-md"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                {/* X-axis Label */}
                <span className="text-[11px] text-mid font-medium truncate max-w-full text-center">
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
