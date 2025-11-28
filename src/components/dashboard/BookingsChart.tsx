import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BookingsChartProps {
  data: Array<{
    month: string;
    booking_count: number;
  }>;
}

export default function BookingsChart({ data }: BookingsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No bookings data available
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
            tick={{ fontSize: 12 }}
            label={{ value: 'Number of Bookings', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: number) => [value, 'Bookings']}
          />
          <Legend />
          <Line 
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