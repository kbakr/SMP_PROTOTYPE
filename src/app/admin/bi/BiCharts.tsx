"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function BiCharts({
  data,
}: {
  data: { name: string; revenue: number; contribution: number }[];
}) {
  return (
    <div className="h-80 rounded-3xl bg-white/85 p-4">
      <h3 className="mb-2 font-display text-lg">Revenue vs contribution by campaign</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="revenue" fill="#e11d48" name="Revenue" />
          <Bar dataKey="contribution" fill="#0d9488" name="Contribution" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
