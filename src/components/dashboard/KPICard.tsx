"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ArrowUpIcon, ArrowDownIcon, InfoIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string
  numericValue?: number
  change: number
  trend: 'up' | 'down'
  onClick?: () => void
  tooltip?: string
  gradient?: string
}

export function KPICard({ title, value, numericValue, change, trend, onClick, tooltip, gradient }: KPICardProps) {
  const isPositive = trend === 'up'
  const TrendIcon = isPositive ? ArrowUpIcon : ArrowDownIcon
  const [startAnimation, setStartAnimation] = useState(false)

  useEffect(() => {
    setStartAnimation(true)
  }, [])

  const gradientClasses = gradient || 'from-purple-500/10 to-pink-500/10'

  return (
    <TooltipProvider>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className={cn(
            'relative overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl border-0',
            onClick && 'cursor-pointer'
          )}
          onClick={onClick}
        >
          {/* Gradient Background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradientClasses} opacity-50`} />

          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <div className="flex items-center gap-2">
              {tooltip && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <motion.div
                animate={{ y: isPositive ? [0, -3, 0] : [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <TrendIcon
                  className={`h-4 w-4 ${
                    isPositive ? 'text-green-500' : 'text-red-500'
                  }`}
                />
              </motion.div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">
              {numericValue !== undefined && startAnimation ? (
                <CountUp
                  start={0}
                  end={numericValue}
                  duration={2}
                  decimals={2}
                  prefix="$"
                  separator=","
                />
              ) : (
                value
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <motion.span
                className={cn(
                  'font-semibold',
                  isPositive ? 'text-green-600' : 'text-red-600'
                )}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {isPositive ? '↑' : '↓'} {Math.abs(change)}%
              </motion.span>{' '}
              from last month
            </p>
          </CardContent>

          {/* Shine effect on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}