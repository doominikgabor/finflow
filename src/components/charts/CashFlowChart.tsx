"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CashFlowData } from '@/types'

interface CashFlowChartProps {
  data: CashFlowData[]
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="income"
          stroke="#10B981"
          strokeWidth={2}
          name="Income"
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke="#EF4444"
          strokeWidth={2}
          name="Expenses"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}