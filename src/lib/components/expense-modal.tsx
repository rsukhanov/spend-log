"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@lib/components/ui/dialog";
import { Button } from "@lib/components/ui/button";
import { Expense, formatDate, roundTo } from "@lib/components/main";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { useMemo } from "react";

const COLORS = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];



export default function ExpenseModal({
  isOpen,
  category,
  filteredCategoryExpenses,
  totalAmount,
  preferred_currency,
  onClose,
}: {
  isOpen: boolean;
  category: string;
  filteredCategoryExpenses: Expense[];
  preferred_currency: string;
  totalAmount: number;
  onClose: () => void;
}) {

  const subcategoryData = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredCategoryExpenses.forEach(exp => {
      const sub = EXPENSE_SUB_CATEGORIES[exp.sub_category] || "Без подкатегории";
      totals[sub] = (totals[sub] || 0) + exp.amount_in_preferred_currency;
    });
    return Object.entries(totals).map(([name, value], index) => ({ 
      name, 
      value,
      color: COLORS[index % COLORS.length]
    }));
  }, [filteredCategoryExpenses]);

  const listData = useMemo(() => {
    return filteredCategoryExpenses.sort((a, b) => b.amount_in_preferred_currency - a.amount_in_preferred_currency);
  },[filteredCategoryExpenses]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        if (isOpen && onClose) onClose();
      }}
    >
      <DialogContent
        className="border-0 rounded-2xl bg-white p-6 shadow-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          e.preventDefault();
          onClose();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          onClose();
        }}
        showCloseButton={true}
      >
        <DialogHeader className="mb-2">
          <DialogTitle className="text-lg font-semibold">
            {category} — {totalAmount.toLocaleString()} {preferred_currency}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Распределение по подкатегориям
          </DialogDescription>
        </DialogHeader>

        {subcategoryData.length > 0 && (
          <div className="w-full h-40 mb-6">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={subcategoryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  cx="50%"
                  cy="50%"
                  animationBegin={0}
                  animationDuration={750}
                >
                  {subcategoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                    />
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
                      fontSize={10}
                      fontWeight="bold"
                    />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.9)",
                    borderRadius: "8px",
                    fontSize: "0.8rem"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        <ul className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {listData.length > 0 ? (
            listData.map((exp) => {
              const badgeColor = subcategoryData.find(sub => sub.name === EXPENSE_SUB_CATEGORIES[exp.sub_category])?.color;
              return (
              <li
                key={exp.id}
                className="flex justify-between items-center gap-1 bg-gray-50 hover:bg-gray-100 transition-all rounded-xl px-3 py-2"
              >
                 <div className="flex flex-col text-sm text-gray-700">
                  <span className="font-semibold whitespace-nowrap">
                    {roundTo(exp.amount_in_preferred_currency, 1)} {preferred_currency}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(exp.merchant === 'to_ask' || exp.merchant === 'unknown') ? "Неизвестно" : exp.merchant}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(new Date(exp.date))}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <div
                    className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full border transition-all 
                    min-w-0 max-w-[140px]"
                    style={{
                      borderColor: badgeColor ?? "#d1d5db",
                      color: badgeColor ?? "#374151",
                      backgroundColor: badgeColor ? `${badgeColor}05` : "#f9fafb", 
                    }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: badgeColor ?? "#9ca3af" }}
                    />
                    <p className="break-words whitespace-normal">
                      {EXPENSE_SUB_CATEGORIES[exp.sub_category]}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs rounded-lg border-gray-300 hover:bg-main hover:text-white transition w-8 h-8 p-0 flex items-center justify-center"
                    onClick={() => alert("Редактирование траты " + exp.amount_in_preferred_currency + " " + preferred_currency)}
                  >
                    {/* Иконка карандаша */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </Button>
                </div>
              </li>
            )})
          ) : (
            <p className="text-center text-sm text-gray-500 py-4">
              Нет трат в этой категории
            </p>
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}



const EXPENSE_SUB_CATEGORIES: Record<string, string> = {
  // --- ЖИЛЬЕ И КОММУНАЛЬНЫЕ УСЛУГИ ---
  "RENT": "Аренда жилья",
  "MORTGAGE": "Ипотека / Кредит на жильё",
  "UTILITIES": "Коммунальные услуги",
  "SUBSCRIPTIONS": "Подписки (Netflix, Spotify и т.д.)",
  "INSURANCE": "Страхование (жилья, жизни)",
  "REPAIRS": "Ремонт и обслуживание жилья",

  // --- ТРАНСПОРТ ---
  "TAXI": "Такси / Поделиться поездкой",
  "PUBLIC_TRANSPORT": "Общественный транспорт",
  "FUEL": "Топливо / Зарядка авто",
  "CAR_MAINTENANCE": "Обслуживание и ремонт авто",
  "CAR_INSURANCE": "Страхование авто",
  "PARKING": "Парковка и платные дороги",

  // --- ЕДА И ПИТАНИЕ ---
  "GROCERIES": "Продукты питания",
  "DINING_OUT": "Рестораны / Кафе",
  "COFFEE_SNACKS": "Кофе / Снеки на ходу",
  "FAST_FOOD": "Фастфуд",

  // --- ЗДОРОВЬЕ И УХОД ---
  "MEDICINES": "Лекарства / Аптека",
  "DOCTOR": "Приём врача / Медицинские услуги",
  "PERSONAL_CARE_SERVICES": "Уход за собой (Салон, Барбершоп)",

  // --- ЛИЧНЫЕ РАСХОДЫ И РАЗВИТИЕ ---
  "CLOTHING": "Одежда и обувь",
  "COSMETICS": "Косметика и гигиена",
  "PERSONAL_SHOPPING": "Личные покупки",
  "SELF_EDUCATION": "Самообразование / Курсы",
  "SELF_DEVELOPMENT": "Саморазвитие / Книги",

  // --- ДОСУГ И РАЗВЛЕЧЕНИЯ ---
  "MOVIES_CONCERTS": "Кино / Концерты / Театр",
  "COMPUTER_GAMES": "Компьютерные игры / Игровой контент",
  "ALCOHOL": "Алкоголь",
  "SMOKING": "Курение / Вейпинг",
  "GAMBLING": "Азартные игры / Лотереи",
  "HOBBIES": "Хобби / Спортивный инвентарь",

  // --- ПУТЕШЕСТВИЯ И ОТДЫХ ---
  "HOTELS": "Проживание / Отели",
  "FLIGHTS": "Авиабилеты / Поезда",
  "TOURS_ACTIVITIES": "Туры / Экскурсии",
  "TRAVEL_RESTAURANTS": "Питание в поездках",
  "TRAVEL_TRANSPORT": "Транспорт в поездках",

  // --- ФИНАНСЫ И ДОЛГИ ---
  "LOAN": "Выплата кредитов / Долгов",
  "TAXES": "Налоги и сборы",
  "SAVINGS_INVESTMENTS": "Накопления / Инвестиции",
  "BANK_FEES": "Банковские комиссии / Обслуживание счета",

  // --- СЕМЬЯ И БЛИЗКИЕ ---
  "CHILDREN": "Детские товары и расходы",
  "EDUCATION": "Образование (школа, секции)",
  "HOME_PETS": "Домашние животные / Товары для них",
  "DONATIONS_PRESENTS": "Подарки / Пожертвования",

  // --- НЕПРЕДВИДЕННЫЕ ---
  "FORCED_PURCHASES": "Вынужденные покупки / Неотложка",
  "EMOTIONAL_PURCHASES": "Эмоциональные / Спонтанные покупки",
  "OTHER": "Прочее / Неизвестно",
};