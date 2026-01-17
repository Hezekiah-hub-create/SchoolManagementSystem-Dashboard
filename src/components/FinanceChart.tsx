"use client";

import Image from "next/image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";

const FinanceChart = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/finances");
        if (response.ok) {
          const finances = await response.json();
          // Process data to group by month
          const monthlyData: { [key: string]: { income: number; expense: number } } = {};

          finances.forEach((finance: any) => {
            const date = new Date(finance.date);
            const month = date.toLocaleString("default", { month: "short" });
            if (!monthlyData[month]) {
              monthlyData[month] = { income: 0, expense: 0 };
            }
            if (finance.type === "income") {
              monthlyData[month].income += finance.amount;
            } else if (finance.type === "expense") {
              monthlyData[month].expense += finance.amount;
            }
          });

          const chartData = Object.keys(monthlyData).map((month) => ({
            name: month,
            income: monthlyData[month].income,
            expense: monthlyData[month].expense,
          }));

          setData(chartData);
        }
      } catch (error) {
        console.error("Error fetching finance data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Finance</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tick={{ fill: "#000000ff" }}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis axisLine={false} tick={{ fill: "#000000ff" }} tickLine={false} tickMargin={20} />
          <Tooltip />
          <Legend
            align="center"
            verticalAlign="top"
            wrapperStyle={{ paddingTop: "10px", paddingBottom: "30px" }}
          />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#0d2249ff"
            strokeWidth={3}
          />
          <Line type="monotone" dataKey="expense" stroke="#8a1818ff" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinanceChart;
