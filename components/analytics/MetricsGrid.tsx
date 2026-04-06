"use client"

import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts"

const tooltipStyle = {
  backgroundColor: "#0F0F0F", border: "1px solid #262626", borderRadius: "0px",
  color: "#FAFAFA", fontSize: "12px", fontFamily: "JetBrains Mono, monospace",
}

const contentData = [
  { month: "Oct", pieces: 8 }, { month: "Nov", pieces: 12 }, { month: "Dec", pieces: 15 },
  { month: "Jan", pieces: 20 }, { month: "Feb", pieces: 18 }, { month: "Mar", pieces: 28 },
]

const socialData = [
  { platform: "LinkedIn", followers: 4200 }, { platform: "Instagram", followers: 8900 },
  { platform: "Twitter", followers: 3100 }, { platform: "Facebook", followers: 2400 },
  { platform: "TikTok", followers: 12000 }, { platform: "YouTube", followers: 1800 },
]

const engagementData = [
  { week: "W1", rate: 3.2 }, { week: "W2", rate: 4.1 }, { week: "W3", rate: 3.8 },
  { week: "W4", rate: 5.2 }, { week: "W5", rate: 4.7 }, { week: "W6", rate: 6.1 },
]

const METRICS = [
  { label: "Content Generated", value: "148", delta: "+24%" },
  { label: "Total Reach", value: "82.4K", delta: "+18%" },
  { label: "Avg. Engagement", value: "4.8%", delta: "+1.2%" },
  { label: "Leads Generated", value: "312", delta: "+35%" },
  { label: "Revenue Influenced", value: "$48K", delta: "+22%" },
  { label: "AI Credits Used", value: "184", delta: "" },
]

export function AnalyticsOverview() {
  return (
    <div className="space-y-6">
      {/* KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {METRICS.map((m) => (
          <div key={m.label} className="border border-border bg-card p-4 space-y-2">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{m.label}</p>
            <p className="font-display text-2xl font-medium tracking-tight">{m.value}</p>
            {m.delta && <p className="text-xs text-green-400 font-mono">{m.delta}</p>}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-border bg-card p-5">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">Content Published</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={contentData}>
              <defs>
                <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF3D00" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FF3D00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#737373", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#262626" }} />
              <Area type="monotone" dataKey="pieces" stroke="#FF3D00" strokeWidth={1.5} fill="url(#cGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="border border-border bg-card p-5">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">Followers by Platform</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={socialData}>
              <XAxis dataKey="platform" tick={{ fontSize: 9, fill: "#737373", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
              <Bar dataKey="followers" fill="#FAFAFA" fillOpacity={0.15} stroke="#FAFAFA" strokeWidth={1} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="border border-border bg-card p-5">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">Engagement Rate (%)</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={engagementData}>
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#737373", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#262626" }} />
              <Line type="monotone" dataKey="rate" stroke="#FAFAFA" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
