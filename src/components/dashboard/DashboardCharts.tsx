import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface TrendData {
  jour: string;
  remplissage: number;
  alertes: number;
}

export function AlertsChart({ data }: { data: TrendData[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="jour" stroke="currentColor" fontSize={12} />
        <YAxis stroke="currentColor" fontSize={12} />
        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }} />
        <Bar dataKey="alertes" fill="var(--status-alert)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function FillTrendChart({ data }: { data: TrendData[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="jour" stroke="currentColor" fontSize={12} />
        <YAxis stroke="currentColor" fontSize={12} />
        <Tooltip contentStyle={{ borderRadius: 8 }} />
        <Line type="monotone" dataKey="remplissage" stroke="var(--brand)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--cta)" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
