import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { BatteryCharging, Signal } from "lucide-react";
import { Card, CardContent } from "@mui/material";
import './Dashboard.css';

const consumptionHistoryData = [
  { name: "Jan", value: 4 },
  { name: "Feb", value: 4.2 },
  { name: "Mar", value: 4.1 },
  { name: "Apr", value: 4.5 },
  { name: "May", value: 5.5 },
  { name: "Jun", value: 6.8 },
  { name: "Jul", value: 7.4 },
  { name: "Aug", value: 7.2 },
  { name: "Sep", value: 6.1 },
  { name: "Oct", value: 5.2 },
  { name: "Nov", value: 4.8 },
  { name: "Dec", value: 4.9 },
];

const CustomerDashboard = () => {
  return (
    <div className="screen">
      <div className="screen1">

        {/* Cards Grid */}
        <div className="grid grid-cols-3 gap-4 max-w-5xl mx-auto">
          {/* Water Consumption */}
          <Card sx={{ p: 2, width: "100%" }}>
            <CardContent>
              <h2 className="text-lg font-semibold flex items-center gap-2">💧 Water Consumption</h2>
              <p className="text-4xl font-bold">4.7 m³</p>
              <p className="text-green-600 text-sm">↓ 12% vs last week</p>
              <p className="text-sm text-gray-500">78% of 6m³</p>
            </CardContent>
          </Card>

          {/* Usage Comparison */}
          <Card sx={{ p: 2, width: "100%" }}>
            <CardContent>
              <h2 className="text-lg font-semibold flex items-center gap-2">⚖️ Usage Comparison</h2>
              <p className="text-sm">Your Consumption: <b>4.7 m³</b></p>
              <p className="text-sm">Neighborhood Avg: <b>5.2 m³</b></p>
              <p className="text-sm">City Avg: <b>5.8 m³</b></p>
            </CardContent>
          </Card>

          {/* Device Status */}
          <Card sx={{ p: 2, width: "100%" }}>
            <CardContent>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                📡 Device Status <span className="text-green-600 ml-auto">Online</span>
              </h2>
              <p className="flex items-center gap-2"><BatteryCharging className="w-5 h-5 text-green-500" /> Battery: 78%</p>
              <p className="flex items-center gap-2"><Signal className="w-5 h-5 text-green-500" /> Signal: 92%</p>
              <p className="text-sm text-gray-500">Last Reading: Today, 10:45 AM</p>
              <p className="text-sm text-gray-500">Firmware: v2.3.1</p>
            </CardContent>
          </Card>
        </div>

        {/* Consumption History Chart */}
        <Card className="p-4 mt-6 max-w-5xl mx-auto">
          <CardContent>
            <h2 className="text-lg font-semibold">📈 Consumption History</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={consumptionHistoryData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#007bff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default CustomerDashboard;
