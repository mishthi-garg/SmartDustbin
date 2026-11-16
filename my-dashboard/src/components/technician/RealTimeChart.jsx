import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function RealTimeChart({ title, data, dataKey, color, unit = '', current }) {
  const gid = `grad-${dataKey}`

  return (
    <section className="panel">
      <div className="rt-head">
        <div className="panel-head"><small>LAST 1 HOUR</small><h3>{title}</h3></div>
        <b className="rt-value">{current ?? '--'}<small>{unit}</small></b>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="t" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip />
          <Area
            type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2}
            fill={`url(#${gid})`} dot={false} isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  )
}