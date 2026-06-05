import { BellRing, Bot, ChartSpline, Gamepad2, HandCoins, SquareChartGantt } from 'lucide-react';

export const apiIcons = {
  HandCoins,
  SquareChartGantt,
  BellRing,
  ChartSpline,
  Gamepad2,
  Bot,
} as const;

export const getIcon = (iconName: keyof typeof apiIcons) => apiIcons[iconName] ?? Bot;
