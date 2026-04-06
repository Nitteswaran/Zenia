"use client"

import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const areaData = [
  { day: "Mar 1", credits: 2 }, { day: "Mar 5", credits: 5 }, { day: "Mar 10", credits: 8 },
  { day: "Mar 15", credits: 6 }, { day: "Mar 20", credits: 12 }, { day: "Mar 25", credits: 9 },
  { day: "Mar 30", credits: 14 },
]

const barData = [
  { platform: "LinkedIn", count: 12 }, { platform: "Instagram", count: 8 },
  { platform: "Twitter", count: 15 }, { platform: "Facebook", count: 6 },
  { platform: "TikTok", count: 4 },
]

const lineData = [
  { month: "Oct", contacts: 140 }, { month: "Nov", contacts: 170 }, { month: "Dec", contacts: 200 },
  { month: "Jan", contacts: 230 }, { month: "Feb", contacts: 280 }, { month: "Mar", contacts: 310 },
]

const pieData = [
  { name: "Active", value: 3, color: "#FF3D00" },
  { name: "Draft", value: 5, color: "#262626" },
  { name: "Paused", value: 2, color: "#737373" },
  { name: "Completed", value: 4, color: "#4a4a4a" },
]

const tooltipStyle = {
  backgroundColor: "#0F0F0F",
  border: "1px solid #262626",
  borderRadius: "0px",
  color: "#FAFAFA",
  fontSize: "12px",
  fontFamily: "JetBrains Mono, monospace",
}

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {/* AI Credits Usage */}
      <div className="border border-border bg-card p-5">
        <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">AI Credits (30d)</p>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={areaData}>
            <defs>
              <linearGradient id="creditsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF3D00" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#FF3D00" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#737373", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#262626" }} />
            <Area type="monotone" dataKey="credits" stroke="#FF3D00" strokeWidth={1.5} fill="url(#creditsGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Content by Platform */}
      <div className="border border-border bg-card p-5">
        <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">Posts by Platform</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={barData}>
            <XAxis dataKey="platform" tick={{ fontSize: 10, fill: "#737373", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
            <Bar dataKey="count" fill="#FF3D00" fillOpacity={0.85} stroke="#FF3D00" strokeWidth={0} radius={[0, 0, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Contact Growth */}
      <div className="border border-border bg-card p-5">
        <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">Contact Growth</p>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={lineData}>
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#737373", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#262626" }} />
            <Line type="monotone" dataKey="contacts" stroke="#FF3D00" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Campaign Status */}
      <div className="border border-border bg-card p-5">
        <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">Campaign Status</p>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={100} height={140}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={45} dataKey="value" strokeWidth={0}>
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 flex-1">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div className="h-2 w-2 shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground font-mono">{item.name}</span>
                <span className="ml-auto font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
