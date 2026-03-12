export type SportType = 'swim' | 'bike' | 'run' | 'strength' | 'rest';

export interface Workout {
  id: string;
  title: string;
  sport: SportType;
  date: string;
  duration: number; // minutes
  distance?: number; // km
  avgHr?: number;
  maxHr?: number;
  avgPace?: string;
  calories?: number;
  tss?: number;
  rpe?: number;
  notes?: string;
  source: 'strava' | 'manual' | 'planned';
}

export interface CalendarEvent {
  id: string;
  title: string;
  sport: SportType;
  date: string;
  duration: number;
  completed: boolean;
  rpe?: number;
  notes?: string;
}

export const SPORTS: SportType[] = ['swim', 'bike', 'run', 'strength', 'rest'];

export const sportColors: Record<SportType, string> = {
  swim: 'bg-swim text-swim-foreground',
  bike: 'bg-bike text-bike-foreground',
  run: 'bg-run text-run-foreground',
  strength: 'bg-strength text-strength-foreground',
  rest: 'bg-rest text-rest-foreground',
};

export const sportIconBg: Record<SportType, string> = {
  swim:     'bg-swim/15 text-swim-foreground',
  bike:     'bg-bike/15 text-bike-foreground',
  run:      'bg-run/15 text-run-foreground',
  strength: 'bg-strength/15 text-strength-foreground',
  rest:     'bg-rest/15 text-rest-foreground',
};

export const sportBorderLeft: Record<SportType, string> = {
  swim:     'border-l-swim',
  bike:     'border-l-bike',
  run:      'border-l-run',
  strength: 'border-l-strength',
  rest:     'border-l-rest',
};

export const sportLabels: Record<SportType, string> = {
  swim: 'Плавание',
  bike: 'Велосипед',
  run: 'Бег',
  strength: 'Сила',
  rest: 'Отдых',
};

export const sportEmoji: Record<SportType, string> = {
  swim: '🏊',
  bike: '🚴',
  run: '🏃',
  strength: '💪',
  rest: '😴',
};

export function mapWorkout(row: Record<string, unknown>): Workout {
  return {
    id:       row.id       as string,
    title:    row.title    as string,
    sport:    row.sport    as SportType,
    date:     row.date     as string,
    duration: row.duration as number,
    distance: row.distance != null ? row.distance as number : undefined,
    avgHr:    row.avg_hr   != null ? row.avg_hr   as number : undefined,
    maxHr:    row.max_hr   != null ? row.max_hr   as number : undefined,
    avgPace:  row.avg_pace != null ? row.avg_pace as string : undefined,
    calories: row.calories != null ? row.calories as number : undefined,
    tss:      row.tss      != null ? row.tss      as number : undefined,
    rpe:      row.rpe      != null ? row.rpe      as number : undefined,
    notes:    row.notes    != null ? row.notes    as string : undefined,
    source:   row.source   as 'strava' | 'manual' | 'planned',
  };
}

export function mapCalendarEvent(row: Record<string, unknown>): CalendarEvent {
  return {
    id:        row.id        as string,
    title:     row.title     as string,
    sport:     row.sport     as SportType,
    date:      row.date      as string,
    duration:  row.duration  as number,
    completed: row.completed as boolean,
    rpe:   row.rpe   != null ? row.rpe   as number : undefined,
    notes: row.notes != null ? row.notes as string : undefined,
  };
}
