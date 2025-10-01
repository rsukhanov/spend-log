"use client"

import { useUserStore } from "@lib/userStore";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

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
  { value: 'last_month', label: 'Last Month' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },  
];



export default function Main() {
  const { id, preferred_currency } = useUserStore();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [timeRange, setTimeRange] = useState('today');

  useEffect(() => {
    const getExpenses = async () => {
      const res = await fetch(`api/expenses`, { 
        method: 'GET',
        headers: { 'userId': id }
      });
      if (!res.ok) {
        alert("Failed to fetch expenses");
        return;
      }
      const data = await res.json();
      setExpenses(data);
    }
    getExpenses();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center py-4">
      <div className="w-full max-w-sm mx-auto rounded-2xl border border-gray-100 bg-white shadow-sm p-3">
        <div className="w-full grid grid-cols-6 grid-rows-2 gap-3 ">
          {TIME_RANGES.map((range, index) => {
            let gridColumn = `${index + 1} / span 2`
            let gridRow;

            if (index % 2 === 0) {
              gridRow = 1;
            } else {
              gridRow = 2;
            }
            
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
    </main>
  )
}




const CATEGORY_COLORS: Record<string, string> = {
  HOUSING: '#3B82F6',
  TRANSPORT: '#EF4444',
  FOOD: '#10B981',
  HEALTH: '#8B5CF6',
  PERSONAL: '#F59E0B',
  ENTERTAINMENT: '#EC4899',
  TRAVEL: '#06B6D4',
  FINANCIAL: '#84CC16',
  FAMILY_PETS: '#F97316',
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

