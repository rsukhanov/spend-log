"use client"
import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'


// Цвета для категорий
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

export default function Dashboard() {
  return null
}