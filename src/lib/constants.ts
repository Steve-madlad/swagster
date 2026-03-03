export const methodColorMap = {
  GET: {
    solid: 'bg-tropic-green',
    custom: 'bg-[#10b981]',
    light: 'bg-tropic-green/30',
    hoverLight: 'hover:bg-tropic-green/60 focus-visible:bg-tropic-green/60',
  },
  POST: {
    solid: 'bg-tropic-blue',
    custom: 'bg-tropic-blue',
    light: 'bg-tropic-blue/30',
    hoverLight: 'hover:bg-tropic-blue/60 focus-visible:bg-tropic-blue/60',
  },
  PUT: {
    solid: 'bg-tropic-pink',
    custom: 'bg-tropic-pink',
    light: 'bg-tropic-pink/30',
    hoverLight: 'hover:bg-tropic-pink/60 focus-visible:bg-tropic-pink/60',
  },
  PATCH: {
    solid: 'bg-tropic-yellow',
    custom: 'bg-tropic-yellow',
    light: 'bg-tropic-yellow/30',
    hoverLight: 'hover:bg-tropic-yellow/60 focus-visible:bg-tropic-yellow/60',
  },
  DELETE: {
    solid: 'bg-tropic-red',
    custom: 'bg-tropic-red',
    light: 'bg-tropic-red/30',
    hoverLight: 'hover:bg-tropic-red/60 focus-visible:bg-tropic-red/60',
  },
} as const;

export const routeConfig: Record<string, string> = {
  '/about': 'Aboout Us',
};