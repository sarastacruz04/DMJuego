// Paleta y espaciados centralizados (tema oscuro)
export const colors = {
  background: '#0f172a',
  card: '#1e293b',
  border: '#334155',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
  gold: '#facc15',
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
  mana: '#6366f1',
  terminalBg: '#020617',
  terminalText: '#4ade80',
  equippedGlow: '#facc15',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
};

export const MIN_TOUCH = 44;

// Umbrales de color de las barras (presentación, no dominio)
export const hpBarColor = (hp: number) => {
  if (hp > 60) return colors.green;
  if (hp > 30) return colors.yellow;
  return colors.red;
};

export const weightBarColor = (ratio: number) => {
  if (ratio <= 0.7) return colors.green;
  if (ratio <= 1) return colors.yellow;
  return colors.red;
};
