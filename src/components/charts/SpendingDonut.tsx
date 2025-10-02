"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatCurrency, type SpendingData } from '@/lib/utils'

interface SpendingDonutProps {
  data: SpendingData[]
}

export function SpendingDonut({ data }: SpendingDonutProps) {
  const renderLegend = (props: { payload?: Array<{ value: string; color: string }> }) => {
    const { payload } = props
    if (!payload || !Array.isArray(payload)) return null

    return (
      <ul className="flex flex-col gap-2 text-sm">
        {payload.map((entry, index: number) => {
          // Find the matching data entry by category name (entry.value)
          const dataEntry = data.find(d => d.category === entry.value)

          return (
            <li key={`legend-${index}`} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="flex-1">{entry.value}</span>
              <span className="font-semibold">
                {dataEntry ? formatCurrency(dataEntry.amount) : '$0.00'}
              </span>
            </li>
          )
        })}
      </ul>
    )
  }

  // Show empty state if no data
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        <p>No spending data available</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="amount"
          nameKey="category"
          label={(entry) => entry.category}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend content={renderLegend} />
      </PieChart>
    </ResponsiveContainer>
  )
}