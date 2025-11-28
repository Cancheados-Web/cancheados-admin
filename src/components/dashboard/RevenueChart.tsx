import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  data: Array<{
    month: string;
    revenue: number;
    booking_count: number;
  }>;
}

export default function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No revenue data available
      </div>
    );
  }

  // Format month for display
  const formattedData = data.map(item => ({
    ...item,
    month: new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12 }}
            label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            label={{ value: 'Bookings', angle: 90, position: 'insideRight' }}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'Revenue') {
                return [`$${value.toLocaleString()}`, 'Revenue'];
              }
              return [value, 'Bookings'];
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            stroke="#10b981"
            strokeWidth={2}
            name="Revenue"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="booking_count"
            stroke="#f97316"
            strokeWidth={2}
            name="Bookings"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}