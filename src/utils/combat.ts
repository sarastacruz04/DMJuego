// Helpers PUROS de la simulación del Boss: misma entrada → misma salida,
// sin tocar el store. Así son fáciles de probar y de explicar.

export const BOSS_NAME = 'Dragón Ceniciento';
export const BOSS_EMOJI = '🐉';
export const BOSS_MAX_HP = 150;

// Daño que recibe el Boss con el poder de combate actual
export const applyAttack = (bossHp: number, combatPower: number) =>
  Math.max(0, bossHp - combatPower);

// Contraataque: más agilidad = esquivas mejor; la sobrecarga te hace más lento
export const getBossRetaliation = (totalAgi: number, isOverloaded: boolean) =>
  Math.max(8, 30 - Math.floor(totalAgi / 2)) + (isOverloaded ? 5 : 0);
