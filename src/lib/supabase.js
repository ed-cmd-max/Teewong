import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
}) : null;

export const classroomLevels = [
  { id: 'taekwondo_kids', label: 'Taekwondo Kids' },
  { id: 'principiantes', label: 'Principiantes / Novatos' },
  { id: 'intermedios', label: 'Intermedios' },
  { id: 'avanzados', label: 'Avanzados' },
];

export const levelLabel = (level) => classroomLevels.find((item) => item.id === level)?.label ?? 'Todos los niveles';

