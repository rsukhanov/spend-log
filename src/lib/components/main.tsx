"use client"

import { useUserStore } from "@lib/userStore";
import { useEffect, useState, useMemo  } from "react";
import { Button } from "./ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "./ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LabelList
} from "recharts";
import {LoadingSpin} from "@lib/components/loading-spin";

const ANIMATION_DURATION = 750;

interface Expense {
  id: string;
  date: string;
  amount_original: number;
  currency_original: string;
  amount_in_preferred_currency: number;
  main_category: string;
  sub_category: string;
  merchant: string;
  source: string;
  userId: string;
}

const TIME_RANGES = [
  { value: '-30', label: 'Last Month' },
  { value: '-7', label: 'Last Week' },
  { value: '0', label: 'Today' },
  { value: '+7', label: 'This Week' },
  { value: '+30', label: 'This Month' },  
];

const MONTH_NAMES = [
  "январь", "февраль", "март", "апрель", "май", "июнь",
  "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"
];
const formatDate = (date: Date) =>
  `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}`;

const TIME_RANGE_DAYS = {
  "-30": {
    start(now: Date) {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      start.setHours(0, 0, 0, 0);
      return start;
    },
    end(now: Date) {
      const end = new Date(now.getFullYear(), now.getMonth(), 0); 
      end.setHours(23, 59, 59, 999);
      return end;
    },
    label(now: Date) {
      const month = MONTH_NAMES[(now.getMonth() - 1 + 12) % 12];
      return `Траты за ${month}`;
    },
  },
  "-7": {
    start(now: Date) {
      const start = new Date(now);
      const day = start.getDay();
      const diff = day === 0 ? 7 : day; 
      start.setDate(now.getDate() - diff - 6);
      start.setHours(0, 0, 0, 0);
      return start;
    },
    end(now: Date) {
      const end = new Date(now);
      const day = end.getDay();
      const diff = day === 0 ? 7 : day;
      end.setDate(now.getDate() - diff);
      end.setHours(23, 59, 59, 999);
      return end;
    },
    label(now: Date) {
      return `Траты за прошлую неделю ${formatDate(this.start(now))} - ${formatDate(this.end(now))}`;
    },
  },
  "0": {
    start(now: Date) {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return start;
    },
    end(now: Date) {
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return end;
    },
    label(now: Date) {
      return `Траты за сегодня (${formatDate(now)})`;
    },
  },
  "+7": {
    start(now: Date){
      const start = new Date(now);
      const day = start.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      start.setDate(now.getDate() + diff);
      start.setHours(0, 0, 0, 0);
      return start;
    },
    end(now: Date){
      const end = new Date(now);
      const day = end.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      end.setDate(now.getDate() - diff);
      end.setHours(23, 59, 59, 999);
      return end;
    },
    label(now: Date){
      return `Траты за неделю ${formatDate(this.start(now))} - ${formatDate(this.end(now))}`;
    },
  },
  "+30": {
    start(now: Date) {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      return start;
    },
    end(now: Date) {
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return end;
    },
    label(now: Date) {
      const month = MONTH_NAMES[now.getMonth()];
      return `Траты за ${month}`;
    },
  },
};


const roundTo = (value: number, afterComma: number): number => {
  const factor = Math.pow(10, afterComma);
  return Math.round(value * factor) / factor;
}


export default function Main() {
  const { id, preferred_currency } = useUserStore();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('0');

  const getExpenses = async () => {
    setLoading(true);
    const res = await fetch(`api/expenses`, { 
      method: 'GET',
      headers: { 'userId': id }
    });
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    setExpenses(data);
    setLoading(false)
  }

  useEffect(() => {
    getExpenses();
  }, [preferred_currency]);

  const filteredExpenses = useMemo(() => {
    const now = new Date();

    const range = TIME_RANGE_DAYS[timeRange as keyof typeof TIME_RANGE_DAYS];
    if (!range) return expenses;

    const from = range.start(now);
    const to = range.end(now);

    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= from && expDate <= to;
    });
  }, [expenses, timeRange]);


  const chartData = useMemo(() => {
    const sums: Record<string, number> = {};
    filteredExpenses.forEach(exp => {
      const cat = exp.main_category || "OTHER";
      sums[cat] = (sums[cat] || 0) + roundTo(exp.amount_in_preferred_currency, 1);
    });
    return Object.entries(sums).map(([key, value]) => ({
      name: CATEGORY_NAMES[key] || key,
      value,
      color: CATEGORY_COLORS[key] || CATEGORY_COLORS.OTHER
    }));
  }, [filteredExpenses]);

  const totalAmount = useMemo(() => {
    return chartData.reduce((sum, entry) => sum + entry.value, 0);
  }, [chartData]);

  const listData = useMemo(() => {
    return chartData.sort((a, b) => b.value - a.value);    
  }, [chartData]);

  return (
    <main className="flex flex-col items-center min-h-full py-4 gap-[10px]">
      <div className="w-full rounded-2xl border border-gray-100 bg-white shadow-sm p-3">
        <div className="w-full grid grid-cols-6 grid-rows-2 gap-3 ">
          {TIME_RANGES.map((range, index) => {
            let gridColumn = `${index + 1} / span 2`
            let gridRow;
            if (index % 2 === 0) gridRow = 1;
            else gridRow = 2;
            const isActive = timeRange === range.value;
            return (
              <button 
                key={range.value} 
                style={{ 
                  gridColumn: gridColumn,                  
                  gridRow: gridRow,
                }}
                className={`
                  px-3 py-2 font-medium rounded-xl transition-all text-center
          min-h-[44px] flex items-center justify-center
                  ${isActive 
                    ? "bg-indigo-100 text-black font-bold shadow-md border border-indigo-200 text-base" 
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-700 text-[0.82rem]"
                  }
                `}
                onClick={() => setTimeRange(range.value)}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>


          <Card className="w-full gap-0  min-h-full rounded-2xl border border-gray-100 bg-white shadow-sm px-4">
            {loading 
          ? (<LoadingSpin text="Loading..."/>) 
          : ( <>
            <CardHeader className="text-center">
              <div className="flex flex-col items-center gap-1">
                <div className="text-3xl font-bold text-gray-900">
                  {roundTo(totalAmount, 0).toLocaleString()} {preferred_currency}
                </div>
                <div className="text-sm text-gray-500">
                  {TIME_RANGE_DAYS[timeRange as keyof typeof TIME_RANGE_DAYS]?.label(new Date())}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center w-full p-0">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={45}
                      paddingAngle={1}
                      animationBegin={0}
                      animationDuration={ANIMATION_DURATION}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                       <LabelList
                        dataKey="value"
                        position="inside"
                        formatter={(val: number) => {
                          const percent = (val * 100 / totalAmount)
                          if (percent < 5) return '';
                          return roundTo(percent, 1) + '%'
                        }}
                        fill="#fff"
                        fontSize={14}
                        fontWeight="bold"
                      />
                    </Pie>
                    <Tooltip />
                  </PieChart>
              </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">Нет данных для отображения</p>
              )}
              <ul className="w-full mt-3 space-y-1">
                {listData.map((entry, index) => (
                  <li key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }} 
                      />
                      <span>{entry.name}</span>
                    </div>
                    <span className="font-medium">{roundTo(entry.value, 0)} {preferred_currency}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            </>)}
          </Card> 
    </main>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  HOUSING: '#3B82F6',
  TRANSPORT: '#F97316',
  FOOD: '#22C55E',
  HEALTH: '#EF4444',
  PERSONAL: '#8B5CF6',
  ENTERTAINMENT: '#FACC15',
  TRAVEL: '#06B6D4',
  // FINANCIAL: '#84CC16',
  FINANCIAL: '#15803D',
  FAMILY_PETS: '#EC4899',
  OTHER: '#6B7280'
}

const CATEGORY_NAMES: Record<string, string> = {
  HOUSING: 'Жилье',
  TRANSPORT: 'Транспорт',
  FOOD: 'Еда',
  HEALTH: 'Здоровье',
  PERSONAL: 'Личное',
  ENTERTAINMENT: 'Развлечения',
  TRAVEL: 'Путешествия',
  FINANCIAL: 'Финансы',
  FAMILY_PETS: 'Семья',
  OTHER: 'Другое'
}

