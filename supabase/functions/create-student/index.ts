import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return response({ error: 'Method not allowed' }, 405);

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return response({ error: 'Inicia sesión como instructor.' }, 401);

  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !anonKey || !serviceRoleKey) return response({ error: 'La función aún no está configurada.' }, 500);

  const callerClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } });
  const adminClient = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: { user }, error: userError } = await callerClient.auth.getUser();
  if (userError || !user) return response({ error: 'Sesión inválida. Vuelve a ingresar.' }, 401);

  const { data: instructor, error: roleError } = await adminClient.from('profiles')
    .select('role').eq('id', user.id).maybeSingle();
  if (roleError || instructor?.role !== 'instructor') return response({ error: 'Solo el instructor puede crear cuentas.' }, 403);

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return response({ error: 'Solicitud inválida.' }, 400); }
  const fullName = typeof body.full_name === 'string' ? body.full_name.trim() : '';
  const cedula = typeof body.cedula === 'string' ? body.cedula.replace(/\D/g, '') : '';
  const level = body.level;
  const password = typeof body.password === 'string' ? body.password : '';
  const validLevels = ['taekwondo_kids', 'principiantes', 'intermedios', 'avanzados'];
  if (fullName.length < 3 || fullName.length > 100) return response({ error: 'Escribe el nombre completo del estudiante.' }, 400);
  if (cedula.length !== 10) return response({ error: 'La cédula debe tener 10 dígitos.' }, 400);
  if (!validLevels.includes(String(level))) return response({ error: 'Selecciona un nivel válido.' }, 400);
  if (password.length < 10) return response({ error: 'La contraseña inicial debe tener al menos 10 caracteres.' }, 400);

  const email = `${cedula}@login.taewoong.invalid`;
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, cedula, level },
  });
  if (error) return response({ error: error.message.includes('already') ? 'Ya existe una cuenta con esa cédula.' : 'No se pudo crear la cuenta del estudiante.' }, 400);

  // Keep the profile complete even if the auth.users trigger is missing or has older logic.
  const { error: profileError } = await adminClient.from('profiles').upsert({
    id: data.user.id,
    role: 'student',
    full_name: fullName,
    cedula,
    level: String(level),
  }, { onConflict: 'id' });
  if (profileError) {
    await adminClient.auth.admin.deleteUser(data.user.id);
    return response({ error: 'La cuenta se creó, pero no se pudieron guardar los datos del estudiante. Revisa la migración de perfiles.' }, 500);
  }

  return response({ user_id: data.user.id, full_name: fullName, cedula, level });
});
