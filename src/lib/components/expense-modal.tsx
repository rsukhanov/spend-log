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
import { SP } from "next/dist/shared/lib/utils";
import { expenses_categories, CATEGORY_NAMES, EXPENSE_SUB_CATEGORIES} from "@lib/categories";


const COLORS = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];



export default function ExpenseModal({
  isOpen,
  category,
  filteredCategoryExpenses,
  totalAmount,
  preferred_currency,
  onClose,
  onExpenseUpdated,
  onExpenseDeleted
}: {
  isOpen: boolean;
  category: string;
  filteredCategoryExpenses: Expense[];
  preferred_currency: string;
  totalAmount: number;
  onClose: () => void;
  onExpenseUpdated: (updatedExpense: Expense) => void;
  onExpenseDeleted: (deletedExpenseId: string) => void;
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

  const handleDeleteExpense = async (expenseId: string) => {
    const res = await fetch(`/api/expenses/delete/${expenseId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!res.ok) {
      alert("Ошибка при удалении траты");
      return;
    }
    
    onExpenseDeleted(expenseId);
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
      value: roundTo(value, 2),
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
        onDelete={handleDeleteExpense}
      />
  </>);
}

function EditExpenseModal({ 
  isOpen, 
  expense, 
  onClose, 
  onSave,
  onDelete
}: { 
  isOpen: boolean; 
  expense: Expense | null;
  onClose: () => void;
  onSave: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
}) {
  const [merchant, setMerchant] = useState(expense?.merchant || "");
  const [subCategory, setSubCategory] = useState(expense?.sub_category || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (expense) {
      setMerchant(expense.merchant || "");
      setSubCategory(expense.sub_category || "");
    }
  }, [expense]);

  if (!isOpen)  return null;
  if (!expense) return null;

  const availableSubCategories = expenses_categories[expense.main_category];

  const hasChanges = 
    merchant !== expense.merchant || 
    subCategory !== expense.sub_category;

  const handleSave = async () => {
    if (!hasChanges) return;

    const updatedExpense = {
      ...expense,
      merchant: merchant,
      sub_category: subCategory,
    };
    setIsLoading(true);
    await onSave(updatedExpense);
    setIsLoading(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    await onDelete(expense.id);
    setIsLoading(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onClose();
      }}
    >
      <DialogContent
        className="border-0 rounded-2xl bg-white p-6 shadow-2xl max-w-3/4"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => isLoading && e.preventDefault()}
        onEscapeKeyDown={(e) => isLoading && e.preventDefault()}
        showCloseButton={false}
      >
        
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-all text-2xl z-40 ${isLoading ? 'pointer-events-none opacity-30' : ''}`}
          disabled={isLoading}
        >
          ✕
        </button>

        <DialogHeader>
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
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Магазин / Место покупки
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent transition-all disabled:opacity-50 disabled:bg-gray-50"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder={expense.merchant === 'to_ask' || expense.merchant === 'unknown' ? "Неизвестно" : expense.merchant}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Подкатегория ({CATEGORY_NAMES[expense.main_category]})
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent transition-all bg-white disabled:opacity-50 disabled:bg-gray-50"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              disabled={isLoading}
            >
              {availableSubCategories.map((subCat) => (
                <option key={subCat} value={subCat}>
                  {EXPENSE_SUB_CATEGORIES[subCat] || subCat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-6">
            <Button
              variant="outline"
              className="flex-1 border-red-100 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-200 hover:text-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                 <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"/>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2">
                  <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.25 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.25-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-3.536 6.19a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v9.75a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75V9.216Zm4.5 0a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v9.75a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75V9.216Zm4.5 0a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v9.75a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75V9.216Z" clipRule="evenodd" />
                </svg>
              )}
              Удалить
            </Button>

            <Button
              className="flex-1 bg-main hover:bg-main/90 text-white shadow-md shadow-main/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:bg-gray-400"
              onClick={handleSave}
              disabled={isLoading || !hasChanges}
            >
              {isLoading ? (
                 <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"/>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2">
                  <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .207 1.012l-7.5 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-15.28a.75.75 0 0 1 1.012-.207Z" clipRule="evenodd" />
                </svg>
              )}
              Сохранить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}