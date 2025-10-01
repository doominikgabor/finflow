"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface SubscriptionBarProps {
  data: Array<{ category: string; total: number }>
}

export function SubscriptionBar({ data }: SubscriptionBarProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="category" type="category" width={100} />
        <Tooltip />
        <Bar dataKey="total" fill="#8B5CF6" name="Cost ($)" />
      </BarChart>
    </ResponsiveContainer>
  )
}