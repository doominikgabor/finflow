"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface SpendingData {
  category: string
  amount: number
  fill: string
}

interface SpendingDonutProps {
  data: SpendingData[]
}

export function SpendingDonut({ data }: SpendingDonutProps) {
  const renderLegend = (props: any) => {
    const { payload } = props
    return (
      <ul className="flex flex-col gap-2 text-sm">
        {payload.map((entry: any, index: number) => (
          <li key={`legend-${index}`} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="flex-1">{entry.value}</span>
            <span className="font-semibold">{formatCurrency(data[index].amount)}</span>
          </li>
        ))}
      </ul>
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