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
import ExpenseModal from "@lib/components/expense-modal";
import { CATEGORY_NAMES } from "@lib/categories";

export interface Expense {
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
  { value: '-30', label: 'Last Months' },
  { value: '-7', label: 'Last Week' },
  { value: '0', label: 'Today' },
  { value: '+7', label: 'This Week' },
  { value: '+30', label: 'This Month' },  
];

const MONTH_NAMES = [
  "январь", "февраль", "март", "апрель", "май", "июнь",
  "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"
];
// const MONTH_SLUGS = [
//   "jan", "feb", "mar", "apr", "may", "jun",
//   "jul", "aug", "sep", "oct", "nov", "dec"
// ]
// const MONTH_SLUGS = [
//   "янв", "фев", "мар", "апр", "май", "июн",
//   "июл", "авг", "сен", "окт", "ноя", "дек"
// ]
export const formatDate = (date: Date) =>
  `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}`;

const TIME_RANGE_DAYS = {
 "-30": {
    start(now: Date, monthOffset: number = -1) {
      const start = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
      start.setHours(0, 0, 0, 0);
      return start;
    },
    end(now: Date, monthOffset: number = -1) {
      const end = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 0); 
      end.setHours(23, 59, 59, 999);
      return end;
    },
    label(now: Date, monthOffset: number = -1) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
      const month = MONTH_NAMES[targetDate.getMonth()];
      const year = targetDate.getFullYear();
      const currentYear = now.getFullYear();
      
      return `Траты за ${month}${year !== currentYear ? ` ${year}` : ''}`;
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
      const end = new Date(this.start(now));
      end.setDate(end.getDate() + 6);
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
      const end = new Date(this.start(now));
      end.setDate(end.getDate() + 6);
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


export const roundTo = (value: number, afterComma: number): number => {
  const factor = Math.pow(10, afterComma);
  return Math.round(value * factor) / factor;
}


export default function Main() {
  const { id, preferred_currency } = useUserStore();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('0');
  const [selectedPastMonth, setSelectedPastMonth] = useState<number>(-1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getExpenses = async () => {
    setLoading(true);
    const res = await fetch(`api/expenses/${preferred_currency}`, { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    setExpenses(data);
    setLoading(false)
  }

  const availableMonths = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthsSet = new Set<string>();
    
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const expenseMonth = expenseDate.getMonth();
      const expenseYear = expenseDate.getFullYear();
      
      if (expenseYear < currentYear || (expenseYear === currentYear && expenseMonth < currentMonth)) {
        monthsSet.add(`${expenseYear}-${expenseMonth}`);
      }
    });
    
    return Array.from(monthsSet)
      .map(monthStr => {
        const [year, month] = monthStr.split('-').map(Number);
        return { year, month };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
  }, [expenses]);

  useEffect(() => {
    getExpenses();
  }, [preferred_currency]);

  const filteredExpenses = useMemo(() => {
    const now = new Date();

    const range = TIME_RANGE_DAYS[timeRange as keyof typeof TIME_RANGE_DAYS];
    if (!range) return expenses;

    let from, to;

    if (timeRange === '-30' && selectedPastMonth) {
      from = range.start(now, selectedPastMonth);
      to = range.end(now, selectedPastMonth);
    } else {
      from = range.start(now);
      to = range.end(now);
    }

    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= from && expDate <= to;
    });
  }, [expenses, timeRange, selectedPastMonth]);


  const chartData = useMemo(() => {
    const sums: Record<string, number> = {};
    filteredExpenses.forEach(exp => {
      const cat = exp.main_category || "OTHER";
      sums[cat] = (sums[cat] || 0) + exp.amount_in_preferred_currency;
    });
    return Object.entries(sums).map(([key, value]) => ({
      name: CATEGORY_NAMES[key] || key,
      value: roundTo(value, 2),
      color: CATEGORY_COLORS[key] || CATEGORY_COLORS.OTHER
    }));
  }, [filteredExpenses]);

   const listData = useMemo(() => {
    return chartData.sort((a, b) => b.value - a.value);
  }, [chartData]);

  const totalAmount = useMemo(() => {
    return chartData.reduce((sum, entry) => sum + entry.value, 0);
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
            
            if (timeRange === '-30' && range.value === '-30') {
              const currentLabel = availableMonths.find(({year, month}) => {
                const value = month - (new Date().getMonth()) + (year - new Date().getFullYear()) * 12;
                return value === selectedPastMonth;
              });

              return (
                <div 
                  key={range.value}
                  style={{ 
                    gridColumn: gridColumn,                  
                    gridRow: gridRow,
                  }}
                  className="relative"
                >
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`
                      w-full px-2 py-2 font-medium rounded-xl transition-all text-center
                      min-h-[44px] flex items-center justify-center relative
                      ${isActive 
                        ? "bg-indigo-100 text-black shadow-md border border-indigo-200 text-base" 
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-700 text-[0.82rem]"
                      }
                    `}
                  >
                    <span className="flex-1 flex items-center justify-center gap-1">
                      {currentLabel ? (
                        <>
                          <span className="font-medium">{MONTH_NAMES[currentLabel.month]}</span>
                          {currentLabel.year !== new Date().getFullYear() && (
                            <span className="text-[0.6rem] opacity-60 flex-shrink-0">{currentLabel.year}</span>
                          )}
                        </>
                      ) : (
                        <span className="">{MONTH_NAMES[(new Date().getMonth() - 1 + 12) % 12]}</span>
                      )}
                      </span>
                    <svg 
                      className={`w-4 h-4 ml-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <>
                      {/* Overlay для закрытия при клике вне */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      
                      {/* Dropdown меню */}
                      <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {availableMonths.map(({year, month}) => {
                          const value = month - (new Date().getMonth()) + (year - new Date().getFullYear()) * 12;
                          const label = `${MONTH_NAMES[month]}${year !== new Date().getFullYear() ? ` ${year}` : ''}`;
                          const isSelected = value === selectedPastMonth;
                          
                          return (
                            <button
                              key={`${year}-${month}`}
                              onClick={() => {
                                setSelectedPastMonth(value);
                                setTimeRange('-30');
                                setIsDropdownOpen(false);
                              }}
                              className={`
                                w-full px-4 py-3 text-left text-sm transition-colors
                                hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl
                                flex items-center justify-between
                                ${isSelected 
                                  ? 'bg-indigo-50 text-indigo-600 font-medium' 
                                  : 'text-gray-700'
                                }
                              `}
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium">{MONTH_NAMES[month]}</span>
                                {year !== new Date().getFullYear() && (
                                  <span className="text-[0.6rem] opacity-60 flex-shrink-0">{year}</span>
                                )}
                              </div>
                              {isSelected && (
                                <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          );
                        })}
                        
                        {availableMonths.length === 0 && (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            Нет доступных месяцев
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            }
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
              {roundTo(totalAmount, 1).toLocaleString()} {preferred_currency}
            </div>
            <div className="text-sm text-gray-500">
              {selectedPastMonth 
                ? TIME_RANGE_DAYS[timeRange as keyof typeof TIME_RANGE_DAYS]?.label(new Date(), selectedPastMonth)
                : TIME_RANGE_DAYS[timeRange as keyof typeof TIME_RANGE_DAYS]?.label(new Date())
              }
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
                  animationDuration={750}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                    <LabelList
                    dataKey="value"
                    position="inside"
                    formatter={(label: React.ReactNode) => {
                      const val = typeof label === "number" ? label : Number(label);
                      if (!val || isNaN(val)) return '';
                      const percent = (val * 100 / totalAmount);
                      if (percent < 5) return '';
                      return `${roundTo(percent, 1)}%`;
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
          <ul className="w-full mt-3 space-y-2">
            {listData.map((entry, index) => (
              <li key={index}>
                <button
                  onClick={() => setSelectedCategory(entry.name)}
                  className="flex w-full items-center justify-between text-sm p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="font-medium text-gray-800">{entry.name}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="font-semibold">
                      {roundTo(entry.value, 1)} {preferred_currency}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 opacity-60 group-hover:opacity-100 transition"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              </li>
            ))}
          </ul>

        </CardContent>
        </>)}
      </Card> 
      {selectedCategory && (
        <ExpenseModal
          isOpen={!!selectedCategory}
          category={selectedCategory}

          filteredCategoryExpenses={filteredExpenses.filter(exp => selectedCategory === CATEGORY_NAMES[exp.main_category])}

          totalAmount={listData.find(item => item.name === selectedCategory)?.value || 0}

          preferred_currency={preferred_currency!}
          onClose={() => setSelectedCategory(null)}
          onExpenseUpdated={getExpenses}
          onExpenseDeleted={getExpenses}
        />
      )}
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
  FINANCIAL: '#15803D',
  FAMILY_PETS: '#EC4899',
  OTHER: '#6B7280',
  SPORT: '#E11D48',
}