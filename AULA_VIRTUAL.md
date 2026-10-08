# Activar el aula virtual de TAEWOONG

El aula está integrada al sitio, pero necesita un proyecto de Supabase para guardar cuentas, avances y archivos privados. No se deben guardar contraseñas ni claves de servicio en React o en Git.

## 1. Crear y preparar Supabase

1. Crea un proyecto para Club Taewoong. La URL y publishable key se usan en el navegador; la clave secreta de servidor nunca se pega en el sitio.
2. En Supabase → SQL Editor, ejecuta el contenido de `supabase/migrations/20261004000000_virtual_classroom.sql`.
3. Para añadir fichas individuales, en el mismo SQL Editor ejecuta también `supabase/migrations/20261006000000_student_profiles.sql`. Esta actualización agrega los datos de contacto, sede, nacimiento y una foto privada por estudiante.
4. Para completar la ficha deportiva, ejecuta además `supabase/migrations/20261007000000_complete_student_dossier.sql`. Agrega antecedentes deportivos, evaluaciones, objetivos, competencias, grados y seguimiento del entrenador. Ejecuta después `supabase/migrations/20261007000001_complete_dossier_details.sql` para guardar por separado el grado Kup y el rango Poom/Dan, los conteos de medallas y las firmas gráficas del deportista, representante y entrenador.
5. En Authentication → Sign In / Providers, desactiva el registro público por correo. Las cuentas las crea el instructor desde el aula.
6. En Authentication → Users, agrega la primera cuenta del instructor con este correo interno, donde los dígitos son su cédula: `0100000000@login.taewoong.invalid`. Establece una contraseña segura y confirma el usuario. Ese correo es solo un identificador interno; no se usa para enviar mensajes.
7. En SQL Editor, asigna el rol al usuario inicial (reemplaza nombre y cédula):

```sql
update public.profiles p
set role = 'instructor', full_name = 'Nombre del instructor', cedula = '0100000000'
from auth.users u
where p.id = u.id
  and u.email = '0100000000@login.taewoong.invalid';
```

La cuenta inicial se crea en Supabase y se eleva explícitamente desde SQL. La función de creación de alumnos siempre asigna el rol `student`; nunca acepta roles desde el navegador.

## 2. Publicar la función segura para crear alumnos

En Supabase → Edge Functions → Deploy a new function → Via Editor, crea una función llamada `create-student` y reemplaza el ejemplo por el contenido de `supabase/functions/create-student/index.ts`. Mantén activa la verificación JWT y despliega la función.

Supabase inyecta `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` en el entorno de Edge Functions. El código lee esas variables en el servidor. No intentes crear una variable secreta que empiece por `SUPABASE_`: ese prefijo está reservado por la plataforma, y la clave privilegiada nunca debe ir al navegador ni al repositorio.

La función comprueba que quien la llama tenga perfil `instructor` y crea cuentas como estudiantes; nunca acepta el rol desde el navegador.
## 3. Conectar el sitio

La URL y la publishable key de Supabase ya están declaradas en `netlify.toml`; son valores públicos necesarios en el frontend. La publishable key está diseñada para el navegador, mientras que una secret/service-role key nunca debe aparecer en el sitio ni en Git.

Para desarrollo local, copia `.env.example` como `.env.local` y completa los mismos valores. El ignore de Git excluye los archivos `.env*` excepto el ejemplo vacío.

Conecta el sitio de Netlify al repositorio `ed-cmd-max/Teewong` y a la rama `master`; el comando `npm run build` y la carpeta `dist` ya están configurados. La ruta es `/aula.html` y el enlace aparece en el menú y el pie de página.

## Privacidad y capacidades

- Los estudiantes inician sesión con cédula y contraseña; su correo interno se genera como `<cedula>@login.taewoong.invalid`.
- El instructor puede crear cuentas, elegir nivel, registrar grado/cinturón y dejar observaciones fechadas.
- El instructor puede completar una ficha deportiva por pestañas: identificación, contacto, foto, antecedentes, evaluaciones físicas y técnicas, objetivos, competencias, ascensos de grado, ruta deportiva y seguimiento. Las fotos se guardan en un bucket privado y cada estudiante solo puede ver la suya.
- Cada estudiante solo consulta su perfil, su historial y recursos compartidos con su nivel (o con todos).
- Los archivos se guardan en un bucket privado, con URLs firmadas temporales. Límite configurado: 50 MB por archivo.
- Los niveles disponibles son Taekwondo Kids, Principiantes / Novatos, Intermedios y Avanzados.
- Las reglas de acceso están en la migración SQL y Storage RLS; no dependen de ocultar pantallas.

No cargues cédulas reales ni información de alumnos hasta que la función esté desplegada, exista una cuenta inicial de instructor y se hayan comprobado los permisos RLS.




