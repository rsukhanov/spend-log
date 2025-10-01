"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@lib/components/ui/card"
import { Button } from "@lib/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@lib/components/ui/dialog"
import { useUserStore } from "@lib/userStore"
import { LoadingSpin } from "./loading-spin"

export type Currency = 'UAH' | 'PLN' | 'USD' | 'EUR'

export interface CurrencyOption {
  code: Currency
  symbol: string
  flag: string
}

export const CURRENCIES: CurrencyOption[] = [
  {
    code: 'UAH',
    symbol: '₴',
    flag: '🇺🇦',
  },
  {
    code: 'PLN',
    symbol: 'zł',
    flag: '🇵🇱',
  },
  {
    code: 'USD',
    symbol: '$',
    flag: '🇺🇸',
  },
  {
    code: 'EUR',
    symbol: '€',
    flag: '🇪🇺',
  }
]

interface CurrencyModalProps {
  preferredCurrency?: Currency | undefined
  isOpen: boolean
  onCurrencySelect: (currency: Currency) => void
  onClose?: () => void
  isLoading?: boolean
}

export function CurrencyModal({ isOpen, onCurrencySelect, preferredCurrency, onClose, isLoading }: CurrencyModalProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | undefined>(preferredCurrency)
  const [isMounted, setIsMounted] = useState(false)

  // Для предотвращения гидратации
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleCurrencySelect = (currency: Currency) => {
    setSelectedCurrency(currency)
    // Небольшая задержка для анимации перед вызовом колбэка
    setTimeout(() => {
      onCurrencySelect(currency)
    }, 300)
  }

  if (!isMounted) return null

  return (
    <Dialog open={isOpen} onOpenChange={() => {
      if (isOpen && onClose && preferredCurrency) 
        onClose();
    }}>
      <DialogContent 
        className="sm:max-w-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          e.preventDefault()
          if (preferredCurrency && onClose) {
            onClose();
          } 
        }} 
        onEscapeKeyDown={(e) => {
          e.preventDefault()
          if (preferredCurrency && onClose) {
            onClose();
          }
        }}
        showCloseButton={preferredCurrency ? true : false}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Выберите валюту
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Эта валюта будет использоваться по умолчанию для всех операций
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {CURRENCIES.map((currency) => (
            <CurrencyCard
              key={currency.code}
              currency={currency}
              isSelected={selectedCurrency === currency.code}
              onClick={() => handleCurrencySelect(currency.code)}
            />
          ))}
        </div>

        {isLoading ? (
          <LoadingSpin text="Устанавливаем валюту..."/>
        ) : (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Вы сможете изменить валюту в настройках позже
            </p>
          </div>
        )}
        
      </DialogContent>
    </Dialog>
  )
}

// Компонент карточки валюты
interface CurrencyCardProps {
  currency: CurrencyOption
  isSelected: boolean
  onClick: () => void
}

function CurrencyCard({ currency, isSelected, onClick }: CurrencyCardProps) {
  return (
    <Card 
      className={`
        cursor-pointer transition-all duration-200 border-2
        hover:shadow-md hover:scale-105 active:scale-95
        ${isSelected 
          ? 'border-primary bg-primary/5 shadow-md scale-105' 
          : 'border-border hover:border-primary/50'
        }
      `}
      onClick={onClick}
    >
      <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-2xl">{currency.flag}</span>
          <span className={`
            text-xl font-bold
            ${isSelected ? 'text-primary' : 'text-foreground'}
          `}>
            {currency.symbol}
          </span>
        </div>

        <div className={`
          font-semibold text-sm
          ${isSelected ? 'text-primary' : 'text-foreground'}
        `}>
          {currency.code}
        </div>

{isSelected && (
          <div className="absolute top-2 right-2">
            <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </CardContent>

    </Card>
  )
}


export default function CurrencyModalExport() {
  const {id, preferred_currency, setPreferedCurrency} = useUserStore();
  const [isOpen, setIsOpen] = useState(!preferred_currency);
  const [isLoading, setIsLoading] = useState(false);

  const handleCurrencySelect = async (currency: Currency) => {
    setIsLoading(true);
    const res = await fetch(`/api/currency`, { 
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id, currency })
    });
    if (!res.ok) {
      alert("Ошибка при смене валюты");
      return;
    }
    setPreferedCurrency(currency)
    handleClose();
  }

  const handleClose = () => {
    setIsOpen(false);
    setIsLoading(false);
  }

  if (!isOpen){
    return <p onClick={() => setIsOpen(true)} className="cursor-pointer text-black underline decoration-1 underline-offset-4 transition-all">{preferred_currency}</p>
  }
  return (
    <CurrencyModal 
      isOpen={isOpen}
      onCurrencySelect={handleCurrencySelect}
      preferredCurrency={preferred_currency}
      onClose={handleClose}
      isLoading={isLoading}
    />
  )
}