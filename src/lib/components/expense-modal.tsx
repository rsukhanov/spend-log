"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@lib/components/ui/dialog";
import { Button } from "@lib/components/ui/button";
import { Expense, formatDate, roundTo } from "@lib/components/main";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { useEffect, useMemo, useState } from "react";


const COLORS = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];



export default function ExpenseModal({
  isOpen,
  category,
  filteredCategoryExpenses,
  totalAmount,
  preferred_currency,
  onClose,
  onExpenseUpdated
}: {
  isOpen: boolean;
  category: string;
  filteredCategoryExpenses: Expense[];
  preferred_currency: string;
  totalAmount: number;
  onClose: () => void;
  onExpenseUpdated: (updatedExpense: Expense) => void;
}) {

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleSaveExpense = async (updatedExpense: Expense) => {
    const res = await fetch(`/api/expenses/update`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedExpense),
      credentials: 'include'
    });
    if (!res.ok) {
      alert("Ошибка при сохранении траты");
      return;
    }
    const savedExpense = await res.json() as Expense;
    if(!savedExpense) {
      alert("Ошибка при сохранении траты");
      return;
    }
    onExpenseUpdated(savedExpense);
    setIsEditModalOpen(false);
    setEditingExpense(null);
  };
  

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
  <>
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isEditModalOpen) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="border-0 rounded-2xl bg-white p-6 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          if (isEditModalOpen) {
            e.preventDefault();
            return;
          }
          e.preventDefault();
          onClose();
        }}
        onEscapeKeyDown={(e) => {
          if (isEditModalOpen) {
            e.preventDefault();
            return;
          }
          e.preventDefault();
          onClose();
        }}
        showCloseButton={false}
      >

      <DialogClose
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-all text-2xl"
      >
        ✕
      </DialogClose>

        <DialogHeader className="mb-2 shrink-0">
          <DialogTitle className="text-lg font-semibold">
            {category} — {totalAmount.toLocaleString()} {preferred_currency}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Распределение по подкатегориям
          </DialogDescription>
        </DialogHeader>

        {subcategoryData.length > 0 && (
          <div className="w-full h-40 mb-6 shrink-0">
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

        <ul className="space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent flex-1 pr-1">
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
                    onClick={() => handleEditClick(exp)}
                  >
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
     <EditExpenseModal
        isOpen={isEditModalOpen}
        expense={editingExpense}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
      />
  </>);
}


export const EXPENSE_SUB_CATEGORIES: Record<string, string> = {
  // --- ЖИЛЬЕ И КОММУНАЛЬНЫЕ УСЛУГИ ---
  "RENT": "Аренда жилья",
  "MORTGAGE": "Ипотека / Кредит на жильё",
  "UTILITIES": "Коммунальные услуги",
  "SUBSCRIPTIONS": "Подписки",
  "INSURANCE": "Страхование",
  "REPAIRS": "Ремонт и обслуживание",

  // --- ТРАНСПОРТ ---
  "TAXI": "Такси",
  "PUBLIC_TRANSPORT": "Общественный транспорт",
  "FUEL": "Топливо / Зарядка авто",
  "CAR_MAINTENANCE": "Обслуживание и ремонт авто",
  "CAR_INSURANCE": "Страхование авто",
  "PARKING": "Парковка и платные дороги",

  // --- ЕДА И ПИТАНИЕ ---
  "GROCERIES": "Продукты питания",
  "DINING_OUT": "Рестораны / Кафе",
  "COFFEE_SNACKS": "Кофе / Снеки",
  "FAST_FOOD": "Фастфуд",

  // --- ЗДОРОВЬЕ И УХОД ---
  "MEDICINES": "Лекарства / Аптека",
  "DOCTOR": "Приём врача / Медицинские услуги",
  "PERSONAL_CARE_SERVICES": "Уход за собой",

  // --- ЛИЧНЫЕ РАСХОДЫ И РАЗВИТИЕ ---
  "CLOTHING": "Одежда и обувь",
  "COSMETICS": "Косметика и гигиена",
  "PERSONAL_SHOPPING": "Личные покупки",
  "SELF_EDUCATION": "Самообразование / Курсы",
  "SELF_DEVELOPMENT": "Саморазвитие",

  // --- ДОСУГ И РАЗВЛЕЧЕНИЯ ---
  "MOVIES_CONCERTS": "Кино / Концерты / Театр",
  "COMPUTER_GAMES": "Компьютерные игры",
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
  "BANK_FEES": "Банковские переводы, комиссии",

  // --- СЕМЬЯ И БЛИЗКИЕ ---
  "CHILDREN": "Детские товары и расходы",
  "EDUCATION": "Образование / Секции",
  "HOME_PETS": "Домашние животные",
  "DONATIONS_PRESENTS": "Подарки / Пожертвования",

  // --- НЕПРЕДВИДЕННЫЕ ---
  "FORCED_PURCHASES": "Вынужденные покупки",
  "EMOTIONAL_PURCHASES": "Эмоциональные / Спонтанные покупки",
  "OTHER": "Прочее / Неизвестно",
};





function EditExpenseModal({ 
  isOpen, 
  expense, 
  onClose, 
  onSave 
}: { 
  isOpen: boolean; 
  expense: Expense | null;
  onClose: () => void;
  onSave: (expense: Expense) => void;
}) {
  const [merchant, setMerchant] = useState(expense?.merchant || "");
  const [subCategory, setSubCategory] = useState(expense?.sub_category || "");

  if (!expense) return null;

  const availableSubCategories = expenses_categories[expense.main_category];

  const handleSave = () => {
    if (expense.merchant === merchant && expense.sub_category === subCategory) {
      onClose();
      return;
    }
    const updatedExpense = {
      ...expense,
      merchant: merchant ? merchant : expense.merchant,
      sub_category: subCategory ? subCategory : expense.sub_category,
    };
    onSave(updatedExpense);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="border-0 rounded-2xl bg-white p-6 shadow-2xl max-w-3/4"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          e.stopPropagation();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          onClose();
        }}
        showCloseButton={false}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-all text-2xl z-50"
        >
          ✕
        </button>

        <DialogHeader className="">
          <DialogTitle className="text-lg font-semibold">
            Редактировать трату
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Изменение магазина и подкатегории
          </DialogDescription>
          <div className="mt-2 p-2 bg-gray-50 rounded-lg text-center">
            <span className="font-medium text-gray-700">
              {roundTo(expense.amount_in_preferred_currency, 1)} {expense.currency_original}
            </span>
            {" | "}
            <span className="font-medium text-gray-700">
              {formatDate(new Date(expense.date))}
            </span>
            {/* <span className="block text-xs text-gray-600 mt-1">
              {CATEGORY_NAMES[expense.main_category]}
            </span> */}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Магазин / Место покупки
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent transition-all"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder={expense.merchant === 'to_ask' || expense.merchant === 'unknown' ? "Неизвестно" : expense.merchant}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Подкатегория ({CATEGORY_NAMES[expense.main_category]})
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent transition-all bg-white"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            >
              {availableSubCategories.map((subCat) => (
                <option key={subCat} value={subCat}>
                  {EXPENSE_SUB_CATEGORIES[subCat] || subCat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 border-gray-300 hover:bg-gray-50"
              onClick={onClose}
            >
              Отмена
            </Button>
            <Button
              className="flex-1 bg-main hover:bg-main/90 text-white"
              onClick={handleSave}
            >
              Сохранить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


const expenses_categories: Record<string, string[]> = {
  // аренда, коммуналка
   HOUSING: [ 
      "RENT",
      "MORTGAGE",
      'UTILITIES',
      "SUBSCRIPTIONS",
      "INSURANCE",
      "REPAIRS"
   ],

  // такси, транспорт, авто
  TRANSPORT: [
    "TAXI",
    "PUBLIC_TRANSPORT",
    "FUEL",
    "CAR_MAINTENANCE",
    "CAR_INSURANCE",
    "PARKING"
  ],

  // продукты, рестораны
  FOOD: [
    "GROCERIES",
    "DINING_OUT",
    "COFFEE_SNACKS",
    "FAST_FOOD"
  ],

  // медицина, аптека
  HEALTH: [
    "MEDICINES",
    "DOCTOR",
    "PERSONAL_CARE_SERVICES"
  ],
  
  // одежда, уход, личные покупки
  PERSONAL: [
    "CLOTHING",
    "COSMETICS",
    "PERSONAL_SHOPPING",
    "SELF_EDUCATION",
    "SELF_DEVELOPMENT"
  ],
  
  // досуг, игры, развлечения
  ENTERTAINMENT: [
    "MOVIES_CONCERTS",
    "COMPUTER_GAMES",
    "ALCOHOL",
    "SMOKING",
    "GAMBLING",
    "HOBBIES",
  ],
  
  // поездки, отдых
  TRAVEL: [
    "HOTELS",
    "FLIGHTS",
    "TOURS_ACTIVITIES",
    "TRAVEL_RESTAURANTS",
    "TRAVEL_TRANSPORT",
  ],
  
  // кредиты, налоги, сбережения
  FINANCIAL: [
    "LOAN",
    "TAXES",
    "SAVINGS_INVESTMENTS",
    "BANK_FEES",
  ],

  // дети, семья, животные
  FAMILY_PETS: [
    "CHILDREN",
    "EDUCATION",
    "HOME_PETS",
    "DONATIONS_PRESENTS",
  ],

  OTHER: [
    "FORCED_PURCHASES",
    "EMOTIONAL_PURCHASES",
    "OTHER",
  ]
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