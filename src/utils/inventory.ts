import type { InventoryItem, MovementType, StockMovement } from '../types';

export const balanceOf = (itemId: string, movements: StockMovement[]) =>
movements.filter((m) => m.itemId === itemId).reduce((s, m) => s + m.qty, 0);

export const isLow = (item: InventoryItem, balance: number) => item.active && balance <= item.reorderLevel;

export const suggestedReorder = (item: InventoryItem, balance: number) =>
item.targetQty !== null ? Math.max(item.targetQty - balance, 0) : null;

export const MOVEMENT_LABELS: Record<MovementType, string> = {
  opening: 'Opening balance',
  received: 'Received',
  used: 'Event usage',
  adjustment: 'Adjustment',
  count: 'Count correction'
};

export function withRunningBalance(itemId: string, movements: StockMovement[]) {
  const list = movements.filter((m) => m.itemId === itemId).sort((a, b) => a.at.localeCompare(b.at));
  let bal = 0;
  return list.map((m) => {
    bal += m.qty;
    return { ...m, balance: bal };
  });
}