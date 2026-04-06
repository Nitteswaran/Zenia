"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { PLATFORM_CONFIG } from "@/lib/social/platforms"

interface PlatformBreakdownProps {
  data: { platform: string; value: number }[]
  height?: number
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="border border-border bg-card px-3 py-2 text-xs font-mono">
      <p className="font-bold">{d.name}</p>
      <p className="text-muted-foreground">{d.value.toLocaleString()}</p>
    </div>
  )
}

export function PlatformBreakdown({ data, height = 240 }: PlatformBreakdownProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center border border-border bg-card/30" style={{ height }}>
        <p className="text-sm text-muted-foreground">No platform data</p>
      </div>
    )
  }

  const chartData = data.map((d) => ({
    name: PLATFORM_CONFIG[d.platform as keyof typeof PLATFORM_CONFIG]?.name ?? d.platform,
    value: d.value,
    color: PLATFORM_CONFIG[d.platform as keyof typeof PLATFORM_CONFIG]?.color ?? "#737373",
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          strokeWidth={0}
          dataKey="value"
        >
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} opacity={0.85} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="square"
          iconSize={8}
          wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
