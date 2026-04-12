import type { ClassGroup } from '@/types';

export function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 5; // Monday to Friday
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

export function isInTrial(trialStartDate: string | null | undefined): boolean {
  if (!trialStartDate) return false;
  const start = new Date(trialStartDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= 5;
}

export function getClassGroup(classLevel: string): ClassGroup {
  if (classLevel === 'lkg' || classLevel === 'ukg') return 'early';
  const num = parseInt(classLevel);
  if (isNaN(num)) return 'early';
  if (num <= 4) return 'early';
  if (num <= 8) return 'middle';
  return 'senior';
}

export function getCurrentDayNumber(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  let weekdays = 0;
  const current = new Date(start);

  while (current <= now) {
    if (isWeekday(current)) {
      weekdays++;
    }
    current.setDate(current.getDate() + 1);
  }

  return Math.max(1, weekdays);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getBoardDisplayName(board: string): string {
  switch (board) {
    case 'odia_board':
      return 'Odia Board';
    case 'cbse':
      return 'CBSE';
    case 'icse':
      return 'ICSE';
    default:
      return board;
  }
}

export function getBoardSlug(board: string): string {
  switch (board) {
    case 'odia_board':
      return 'OdiaBoard';
    case 'cbse':
      return 'CBSE';
    case 'icse':
      return 'ICSE';
    default:
      return board;
  }
}

export function classLevels(): string[] {
  return ['lkg', 'ukg', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
}

export function classDisplayName(level: string): string {
  if (level === 'lkg') return 'LKG';
  if (level === 'ukg') return 'UKG';
  return `Class ${level}`;
}
