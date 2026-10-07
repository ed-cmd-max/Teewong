import { useCallback, useEffect, useMemo, useState } from 'react';
import { classroomLevels, levelLabel, supabase } from './lib/supabase.js';

const levelId = (id) => classroomLevels.some((level) => level.id === id) ? id : classroomLevels[0].id;
const dateLabel = (value) => new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium' }).format(new Date(value));
const dateOnlyLabel = (value) => value ? new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium' }).format(new Date(`${value}T12:00:00`)) : 'Por registrar';

function ConfigNotice() {
  return <main className="classroom-shell"><section className="classroom-config"><div className="eyebrow">Aula virtual · TAEWOONG</div><h1>El espacio de aprendizaje<br />de cada deportista.</h1><p>El aula ya está integrada al sitio. Para activar el acceso seguro hay que crear el proyecto Supabase, aplicar las migraciones y configurar las variables de entorno de Netlify.</p><ol><li>Crear el proyecto Supabase para Taewoong.</li><li>Ejecutar las migraciones <code>20261004000000_virtual_classroom.sql</code> y <code>20261006000000_student_profiles.sql</code> en SQL Editor.</li><li>Configurar <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> en Netlify.</li><li>Publicar la función segura para crear cuentas y registrar al instructor.</li></ol><p className="classroom-privacy-note">Las contraseñas y avances no se guardan en este navegador. El aula se habilita cuando el backend quede conectado.</p></section></main>;
}

function Login({ onLogin, error, busy }) {
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const submit = (event) => { event.preventDefault(); onLogin(cedula.replace(/\D/g, ''), password); };
  return <main className="classroom-shell"><div className="classroom-login-wrap"><div className="classroom-login-art"><span className="classroom-mark">道</span><span className="eyebrow">Formación · Disciplina · Valores</span><h1>Tu camino<br />continúa aquí.</h1><p>Un espacio para revisar tus avances, repasar lo aprendido y encontrar materiales de tu nivel.</p><div className="classroom-level-pills">{classroomLevels.map((level) => <span key={level.id}>{level.label}</span>)}</div></div><section className="classroom-login-card"><span className="classroom-login-icon">TW</span><div className="eyebrow">Acceso de miembros</div><h2>Entra a tu aula.</h2><p>Usa la cédula y la contraseña que te entregó el instructor.</p><form onSubmit={submit} className="classroom-form"><label>Cédula<input value={cedula} onChange={(event) => setCedula(event.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="numeric" autoComplete="username" placeholder="10 dígitos" required /></label><label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Tu contraseña" required /></label>{error && <p className="classroom-error" role="alert">{error}</p>}<button className="button button-primary classroom-submit" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar al aula'} <span>→</span></button></form><small className="classroom-login-help">¿Aún no tienes cuenta o necesitas ayuda? Escríbenos por WhatsApp al <a href="https://wa.me/593997984504" target="_blank" rel="noreferrer">099 798 4504</a>.</small></section></div></main>;
}

function StudentPhoto({ path, name, className = '' }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    let active = true;
    setUrl('');
    if (!path || !supabase) { setUrl(''); return () => { active = false; }; }
    supabase.storage.from('student-photos').createSignedUrl(path, 300).then(({ data, error }) => {
      if (active) setUrl(error ? '' : data.signedUrl);
    }).catch(() => { if (active) setUrl(''); });
    return () => { active = false; };
  }, [path]);
  return url
    ? <img className={className} src={url} alt={`Foto de ${name}`} />
    : <span className={`${className} classroom-photo-fallback`} aria-label={`Sin foto de ${name}`}>{name?.trim()?.slice(0, 1)?.toUpperCase() || '?'}</span>;
}

function StudentProfileEditor({ student, progressEntries, onSaved }) {
  const [form, setForm] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const photoPreview = useMemo(() => photoFile ? URL.createObjectURL(photoFile) : '', [photoFile]);

  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview); }, [photoPreview]);

  useEffect(() => {
    if (!student) { setForm({}); setPhotoFile(null); setRemovePhoto(false); return; }
    setForm({
      full_name: student.full_name || '',
      date_of_birth: student.date_of_birth || '',
      phone: student.phone || '',
      guardian_name: student.guardian_name || '',
      guardian_phone: student.guardian_phone || '',
      emergency_contact_name: student.emergency_contact_name || '',
      emergency_contact_phone: student.emergency_contact_phone || '',
      level: levelId(student.level),
      belt_rank: student.belt_rank || '',
      branch: student.branch || '',
    });
    setPhotoFile(null);
    setRemovePhoto(false);
    setFeedback('');
  }, [student?.id]);

  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    if (!student || !form.full_name?.trim()) return;
    if (photoFile && (!['image/jpeg', 'image/png', 'image/webp'].includes(photoFile.type) || photoFile.size > 5 * 1024 * 1024)) {
      setFeedback('La foto debe ser JPG, PNG o WebP y pesar máximo 5 MB.');
      return;
    }
    setBusy(true); setFeedback('');
    let nextPhotoPath = removePhoto ? null : student.profile_photo_path;
    let uploadedPhotoPath = '';
    if (photoFile) {
      const extension = photoFile.type === 'image/png' ? 'png' : photoFile.type === 'image/webp' ? 'webp' : 'jpg';
      uploadedPhotoPath = `${student.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from('student-photos').upload(uploadedPhotoPath, photoFile, { contentType: photoFile.type, upsert: false });
      if (uploadError) { setBusy(false); setFeedback(`No se pudo subir la foto. ${uploadError.message}`); return; }
      nextPhotoPath = uploadedPhotoPath;
    }
    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name.trim(),
      date_of_birth: form.date_of_birth || null,
      phone: form.phone.trim() || null,
      guardian_name: form.guardian_name.trim() || null,
      guardian_phone: form.guardian_phone.trim() || null,
      emergency_contact_name: form.emergency_contact_name.trim() || null,
      emergency_contact_phone: form.emergency_contact_phone.trim() || null,
      level: form.level,
      belt_rank: form.belt_rank.trim() || null,
      branch: form.branch || null,
      profile_photo_path: nextPhotoPath,
      updated_at: new Date().toISOString(),
    }).eq('id', student.id).eq('role', 'student');
    if (error) {
      if (uploadedPhotoPath) await supabase.storage.from('student-photos').remove([uploadedPhotoPath]);
      setFeedback(`No se pudo guardar la ficha. ${error.message}`);
      setBusy(false);
      return;
    }
    if ((photoFile || removePhoto) && student.profile_photo_path) {
      await supabase.storage.from('student-photos').remove([student.profile_photo_path]);
    }
    setBusy(false); setFeedback('Ficha del estudiante guardada.'); setPhotoFile(null); setRemovePhoto(false); onSaved();
  };

  return <section className="classroom-panel"><div className="classroom-panel-heading"><div><span className="eyebrow">Ficha individual</span><h2>{student ? student.full_name : 'Selecciona un estudiante'}</h2><p>Datos de contacto, sede, nivel, cinturón y fotografía.</p></div></div>{!student ? <div className="classroom-empty">Crea una cuenta de estudiante o selecciónala de la lista para completar su ficha.</div> : <><div className="student-profile-editor-grid"><div className="student-profile-photo-column">{photoPreview ? <img className="student-profile-photo" src={photoPreview} alt="Vista previa de la foto seleccionada" /> : <StudentPhoto path={removePhoto ? '' : student.profile_photo_path} name={student.full_name} className="student-profile-photo" />}<label className="classroom-file-label">Foto del estudiante<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { setPhotoFile(event.target.files?.[0] || null); setRemovePhoto(false); }} /><small>JPG, PNG o WebP · máximo 5 MB</small></label>{student.profile_photo_path && <button className="student-photo-remove" type="button" onClick={() => { setPhotoFile(null); setRemovePhoto(true); }}>Quitar foto</button>}</div><form className="classroom-form classroom-grid-form student-profile-form" onSubmit={submit}><label>Nombre completo<input value={form.full_name || ''} onChange={(event) => update('full_name', event.target.value)} required minLength="3" /></label><label>Cédula<input value={student.cedula || ''} readOnly /></label><label>Fecha de nacimiento<input type="date" value={form.date_of_birth || ''} max={new Date().toISOString().slice(0, 10)} onChange={(event) => update('date_of_birth', event.target.value)} /></label><label>Teléfono del estudiante<input type="tel" value={form.phone || ''} onChange={(event) => update('phone', event.target.value)} placeholder="Número de contacto" /></label><label>Madre, padre o representante<input value={form.guardian_name || ''} onChange={(event) => update('guardian_name', event.target.value)} /></label><label>Teléfono del representante<input type="tel" value={form.guardian_phone || ''} onChange={(event) => update('guardian_phone', event.target.value)} /></label><label>Contacto de emergencia<input value={form.emergency_contact_name || ''} onChange={(event) => update('emergency_contact_name', event.target.value)} /></label><label>Teléfono de emergencia<input type="tel" value={form.emergency_contact_phone || ''} onChange={(event) => update('emergency_contact_phone', event.target.value)} /></label><label>Sede<select value={form.branch || ''} onChange={(event) => update('branch', event.target.value)}><option value="">Seleccionar sede</option><option value="el_condado">Matriz · El Condado</option><option value="pomasqui">Sucursal · Pomasqui</option></select></label><label>Nivel<select value={form.level || classroomLevels[0].id} onChange={(event) => update('level', event.target.value)}>{classroomLevels.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label>Cinturón / grado actual<input value={form.belt_rank || ''} onChange={(event) => update('belt_rank', event.target.value)} placeholder="Ej.: Blanco punta amarilla" /></label><button className="button button-primary classroom-submit student-profile-save" disabled={busy}>{busy ? 'Guardando ficha…' : 'Guardar ficha'} <span>→</span></button>{feedback && <p className={feedback.includes('guardada') ? 'classroom-success' : 'classroom-error'} role="status">{feedback}</p>}</form></div><div className="student-profile-history"><div><span className="eyebrow">Seguimiento formativo</span><h3>Historial de avances</h3></div>{progressEntries.length ? <div className="student-timeline">{progressEntries.map((entry) => <article key={entry.id}><span className="student-timeline-dot"/><small>{dateLabel(entry.created_at)}</small><h4>{entry.title}</h4><p>{entry.details}</p></article>)}</div> : <div className="classroom-empty">Aún no hay avances registrados para este estudiante.</div>}</div></>}</section>;
}

function StudentCreator({ onCreated }) {
  const [form, setForm] = useState({ full_name: '', cedula: '', level: 'principiantes', password: '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [canRepair, setCanRepair] = useState(false);
  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  const submitAction = async (action) => {
    if (form.full_name.trim().length < 3 || form.cedula.replace(/\D/g, '').length !== 10 || form.password.length < 10) {
      setError('Completa el nombre, los 10 dígitos de la cédula y una contraseña de al menos 10 caracteres.');
      return;
    }
    if (action === 'repair' && !window.confirm('Se actualizará el perfil existente y se reemplazará su contraseña por la que escribiste. ¿Continuar?')) return;
    setBusy(true); setMessage(''); setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Tu sesión de instructora terminó. Inicia sesión de nuevo.');
      const { data, error: invokeError } = await supabase.functions.invoke('create-student', {
        body: { ...form, cedula: form.cedula.replace(/\D/g, ''), action },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (invokeError) {
        let detail = invokeError.message || 'La función de Supabase rechazó la solicitud.';
        if (invokeError.context instanceof Response) {
          try {
            const payload = await invokeError.context.clone().json();
            if (typeof payload?.error === 'string') detail = payload.error;
          } catch { /* Keep the original Functions error when the response is not JSON. */ }
        }
        throw new Error(detail);
      }
      if (data?.error) throw new Error(data.error);
      setMessage(data.repaired
        ? `Acceso actualizado para ${data.full_name}. Entrega la nueva contraseña en privado.`
        : `Cuenta creada para ${data.full_name}. Entrega al representante la cédula como usuario y la contraseña inicial de forma privada.`);
      setForm({ full_name: '', cedula: '', level: 'principiantes', password: '' });
      setCanRepair(false);
      onCreated();
    } catch (reason) {
      const detail = reason.message || 'No se pudo crear la cuenta.';
      setError(detail);
      setCanRepair(detail.includes('Ya existe una cuenta con esa cédula.'));
    } finally { setBusy(false); }
  };

  return <section className="classroom-panel"><div className="classroom-panel-heading"><div><span className="eyebrow">01 · Acceso seguro</span><h2>Crear cuenta de estudiante</h2><p>El instructor asigna el nivel y una contraseña inicial privada.</p></div><span className="classroom-panel-number">01</span></div><form className="classroom-form classroom-grid-form" onSubmit={(event) => { event.preventDefault(); submitAction('create'); }}><label>Nombre completo<input value={form.full_name} onChange={(event) => update('full_name', event.target.value)} autoComplete="name" required minLength="3" placeholder="Nombre y apellido" /></label><label>Cédula<input value={form.cedula} onChange={(event) => update('cedula', event.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="numeric" required placeholder="10 dígitos" /></label><label>Nivel<select value={form.level} onChange={(event) => update('level', event.target.value)}>{classroomLevels.map((level) => <option key={level.id} value={level.id}>{level.label}</option>)}</select></label><label>Contraseña inicial<input type="password" value={form.password} onChange={(event) => update('password', event.target.value)} minLength="10" required autoComplete="new-password" placeholder="Mínimo 10 caracteres" /></label><button className="button button-primary classroom-submit" disabled={busy}>{busy ? 'Procesando…' : 'Crear cuenta'} <span>→</span></button></form>{error && <p className="classroom-error" role="alert">{error}</p>}{canRepair && <button className="button classroom-submit" type="button" disabled={busy} onClick={() => submitAction('repair')}>{busy ? 'Actualizando…' : 'Actualizar cuenta existente y restablecer contraseña'}</button>}{message && <p className="classroom-success" role="status">{message}</p>}<p className="classroom-form-note">La cuenta se crea con la cédula como usuario. La contraseña no se envía ni se muestra de nuevo; entrégala en privado.</p></section>;
}
function ProgressEditor({ students, onSaved }) {
  const [studentId, setStudentId] = useState('');
  const [level, setLevel] = useState('principiantes');
  const [beltRank, setBeltRank] = useState('');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  useEffect(() => {
    if (!students.length) { setStudentId(''); return; }
    if (!studentId || !students.some((student) => student.id === studentId)) {
      setStudentId(students[0].id); setLevel(levelId(students[0].level)); setBeltRank(students[0].belt_rank || '');
    }
  }, [students, studentId]);
  const selectStudent = (id) => { const student = students.find((item) => item.id === id); setStudentId(id); setLevel(levelId(student?.level)); setBeltRank(student?.belt_rank || ''); };
  const submit = async (event) => {
    event.preventDefault(); if (!studentId) return;
    setBusy(true); setFeedback('');
    const { error } = await supabase.rpc('record_student_progress', { p_student_id: studentId, p_level: level, p_belt_rank: beltRank, p_title: title.trim(), p_details: details.trim() });
    setBusy(false);
    if (error) setFeedback(error.message);
    else { setFeedback('Avance guardado en la ficha del estudiante.'); setTitle(''); setDetails(''); onSaved(); }
  };
  return <section className="classroom-panel"><div className="classroom-panel-heading"><div><span className="eyebrow">02 · Seguimiento formativo</span><h2>Registrar avance</h2><p>Actualiza el nivel y cinturón y deja una nota en su historial.</p></div><span className="classroom-panel-number">02</span></div>{students.length ? <form className="classroom-form classroom-grid-form" onSubmit={submit}><label>Estudiante<select value={studentId} onChange={(event) => selectStudent(event.target.value)}>{students.map((student) => <option key={student.id} value={student.id}>{student.full_name} · {student.cedula}</option>)}</select></label><label>Nivel actual<select value={level} onChange={(event) => setLevel(event.target.value)}>{classroomLevels.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label>Cinturón / grado<input value={beltRank} onChange={(event) => setBeltRank(event.target.value)} placeholder="Ej.: Blanco punta amarilla" /></label><label>Nombre del avance<input value={title} onChange={(event) => setTitle(event.target.value)} minLength="2" maxLength="120" required placeholder="Ej.: Mejora en poomsae" /></label><label className="classroom-full-field">Observación del instructor<textarea value={details} onChange={(event) => setDetails(event.target.value)} minLength="2" maxLength="3000" required rows="4" placeholder="Describe el progreso, una fortaleza o el siguiente objetivo…" /></label><button className="button button-primary classroom-submit" disabled={busy}>{busy ? 'Guardando…' : 'Guardar avance'} <span>→</span></button></form> : <div className="classroom-empty">Primero crea una cuenta de estudiante para registrar su progreso.</div>}{feedback && <p className={feedback.includes('guardado') ? 'classroom-success' : 'classroom-error'} role="status">{feedback}</p>}</section>;
}

function MaterialPublisher({ onPublished }) {
  const [title, setTitle] = useState(''); const [description, setDescription] = useState(''); const [level, setLevel] = useState('all'); const [file, setFile] = useState(null); const [busy, setBusy] = useState(false); const [feedback, setFeedback] = useState('');
  const submit = async (event) => {
    event.preventDefault(); if (!file) return;
    setBusy(true); setFeedback('');
    const { data: { user } } = await supabase.auth.getUser();
    const folder = level === 'all' ? 'all' : level;
    const safeName = file.name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]/g, '-').slice(-100);
    const storagePath = `${folder}/${crypto.randomUUID()}_${safeName}`;
    const { error: uploadError } = await supabase.storage.from('study-materials').upload(storagePath, file, { contentType: file.type, upsert: false });
    if (uploadError) { setBusy(false); setFeedback(uploadError.message); return; }
    const { error: insertError } = await supabase.from('study_materials').insert({ instructor_id: user.id, title: title.trim(), description: description.trim(), level: level === 'all' ? null : level, storage_path: storagePath, original_name: file.name, content_type: file.type });
    if (insertError) { await supabase.storage.from('study-materials').remove([storagePath]); setBusy(false); setFeedback(insertError.message); return; }
    setTitle(''); setDescription(''); setFile(null); event.target.reset(); setBusy(false); setFeedback('Material publicado en el aula.'); onPublished();
  };
  return <section className="classroom-panel"><div className="classroom-panel-heading"><div><span className="eyebrow">03 · Recursos de aprendizaje</span><h2>Publicar material</h2><p>Comparte apuntes, guías, imágenes o videos con un nivel.</p></div><span className="classroom-panel-number">03</span></div><form className="classroom-form classroom-grid-form" onSubmit={submit}><label>Título del material<input value={title} onChange={(event) => setTitle(event.target.value)} required minLength="2" maxLength="120" placeholder="Ej.: Guía de posiciones básicas" /></label><label>Visible para<select value={level} onChange={(event) => setLevel(event.target.value)}><option value="all">Todos los niveles</option>{classroomLevels.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label className="classroom-full-field">Descripción<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows="3" maxLength="1000" placeholder="Qué deben repasar los estudiantes…" /></label><label className="classroom-file-label classroom-full-field">Archivo (PDF, imagen o video · máximo 50 MB)<input type="file" accept="application/pdf,image/jpeg,image/png,video/mp4,video/webm,.docx" onChange={(event) => setFile(event.target.files?.[0] || null)} required />{file && <small>{file.name} · {(file.size / (1024 * 1024)).toFixed(1)} MB</small>}</label><button className="button button-primary classroom-submit" disabled={busy}>{busy ? 'Subiendo…' : 'Publicar material'} <span>↑</span></button></form>{feedback && <p className={feedback.includes('publicado') ? 'classroom-success' : 'classroom-error'} role="status">{feedback}</p>}</section>;
}

function InstructorDashboard({ profile, onSignOut }) {
  const [students, setStudents] = useState([]); const [entries, setEntries] = useState([]); const [progressHistory, setProgressHistory] = useState([]); const [materials, setMaterials] = useState([]); const [error, setError] = useState(''); const [selectedStudentId, setSelectedStudentId] = useState('');
  const refresh = useCallback(async () => {
    const [studentResult, entryResult, materialResult] = await Promise.all([
      supabase.from('profiles').select('id,full_name,cedula,level,belt_rank,created_at,date_of_birth,phone,guardian_name,guardian_phone,emergency_contact_name,emergency_contact_phone,branch,profile_photo_path').eq('role', 'student').order('full_name'),
      supabase.from('progress_entries').select('id,student_id,title,details,created_at').order('created_at', { ascending: false }).limit(8),
      supabase.from('study_materials').select('id,title,level,created_at,original_name').order('created_at', { ascending: false }).limit(8),
    ]);
    const historyResult = selectedStudentId
      ? await supabase.from('progress_entries').select('id,student_id,title,details,created_at').eq('student_id', selectedStudentId).order('created_at', { ascending: false })
      : { data: [], error: null };
    const firstError = studentResult.error || entryResult.error || materialResult.error || historyResult.error;
    if (firstError) setError(firstError.message); else setError('');
    const nextStudents = studentResult.data || [];
    setStudents(nextStudents); setSelectedStudentId((current) => nextStudents.some((student) => student.id === current) ? current : nextStudents[0]?.id || ''); setEntries(entryResult.data || []); setProgressHistory(historyResult.data || []); setMaterials(materialResult.data || []);
  }, [selectedStudentId]);
  useEffect(() => { refresh(); }, [refresh]);
  const studentById = useMemo(() => Object.fromEntries(students.map((student) => [student.id, student])), [students]);
  const selectedStudent = students.find((student) => student.id === selectedStudentId) || null;
  return <main className="classroom-shell"><div className="classroom-dashboard"><div className="classroom-dashboard-top"><div><span className="eyebrow">Aula virtual · Panel de instructor</span><h1>Bienvenida, {profile.full_name.split(' ')[0]}.</h1><p>Administra cuentas, acompaña el progreso y comparte recursos.</p></div><button className="classroom-signout" onClick={onSignOut}>Cerrar sesión ↗</button></div>{error && <p className="classroom-error" role="alert">{error}</p>}<div className="classroom-stats"><article><span>Estudiantes activos</span><strong>{students.length}</strong></article><article><span>Avances recientes</span><strong>{entries.length}</strong></article><article><span>Materiales publicados</span><strong>{materials.length}</strong></article></div><StudentCreator onCreated={refresh} /><ProgressEditor students={students} onSaved={refresh} /><MaterialPublisher onPublished={refresh} /><section className="classroom-panel"><div className="classroom-panel-heading"><div><span className="eyebrow">Tu grupo</span><h2>Estudiantes</h2><p>Selecciona un perfil para abrir su ficha y completar sus datos.</p></div></div>{students.length ? <div className="classroom-roster">{students.map((student) => <article className={student.id === selectedStudentId ? 'classroom-roster-selected' : ''} key={student.id}><span className="classroom-roster-initial">{student.full_name.slice(0, 1).toUpperCase()}</span><div><strong>{student.full_name}</strong><small>Cédula · {student.cedula}</small></div><span className="classroom-level-chip">{levelLabel(student.level)}</span><span className="classroom-belt">{student.belt_rank || 'Cinturón sin registrar'}</span><button className="student-roster-open" type="button" onClick={() => setSelectedStudentId(student.id)}>{student.id === selectedStudentId ? 'Ficha abierta' : 'Abrir ficha →'}</button></article>)}</div> : <div className="classroom-empty">Aún no hay cuentas. Puedes crear la primera arriba.</div>}</section><StudentProfileEditor student={selectedStudent} progressEntries={progressHistory} onSaved={refresh} /><section className="classroom-panel"><div className="classroom-panel-heading"><div><span className="eyebrow">Actividad del aula</span><h2>Últimos avances y materiales</h2></div></div><div className="classroom-recent-grid"><div><h3>Avances</h3>{entries.length ? entries.slice(0, 5).map((entry) => <article className="classroom-recent-item" key={entry.id}><span>{dateLabel(entry.created_at)}</span><strong>{entry.title}</strong><small>{studentById[entry.student_id]?.full_name || 'Estudiante'}</small></article>) : <p className="classroom-muted">Todavía no hay avances registrados.</p>}</div><div><h3>Material publicado</h3>{materials.length ? materials.slice(0, 5).map((material) => <article className="classroom-recent-item" key={material.id}><span>{dateLabel(material.created_at)} · {levelLabel(material.level)}</span><strong>{material.title}</strong><small>{material.original_name}</small></article>) : <p className="classroom-muted">Todavía no hay materiales.</p>}</div></div></section></div></main>;
}

function StudentDashboard({ profile, onSignOut }) {
  const [entries, setEntries] = useState([]); const [materials, setMaterials] = useState([]); const [error, setError] = useState(''); const [openingId, setOpeningId] = useState('');
  useEffect(() => {
    let active = true;
    Promise.all([
      supabase.from('progress_entries').select('id,title,details,created_at').order('created_at', { ascending: false }),
      supabase.from('study_materials').select('id,title,description,level,storage_path,original_name,content_type,created_at').order('created_at', { ascending: false }),
    ]).then(([progressResult, materialResult]) => {
      if (!active) return;
      const firstError = progressResult.error || materialResult.error;
      if (firstError) setError(firstError.message);
      setEntries(progressResult.data || []); setMaterials(materialResult.data || []);
    });
    return () => { active = false; };
  }, []);
  const openMaterial = async (material) => {
    setOpeningId(material.id);
    const { data, error: signedError } = await supabase.storage.from('study-materials').createSignedUrl(material.storage_path, 120);
    setOpeningId('');
    if (signedError) { setError('No se pudo abrir el archivo. Inténtalo de nuevo.'); return; }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  };
  return <main className="classroom-shell"><div className="classroom-dashboard student-dashboard"><div className="classroom-dashboard-top"><div><span className="eyebrow">Aula virtual · {levelLabel(profile.level)}</span><h1>Hola, {profile.full_name.split(' ')[0]}.</h1><p>Este es tu espacio de aprendizaje en Club Taewoong.</p></div><button className="classroom-signout" onClick={onSignOut}>Cerrar sesión ↗</button></div>{error && <p className="classroom-error" role="alert">{error}</p>}<section className="student-welcome"><div className="student-welcome-person"><StudentPhoto path={profile.profile_photo_path} name={profile.full_name} className="student-self-photo" /><div><span className="eyebrow">Tu proceso</span><h2>Avanza con propósito.</h2><p>Revisa los comentarios de tu instructor y encuentra aquí los recursos compartidos para tu grupo.</p></div></div><div className="student-belt-card"><small>NIVEL / CINTURÓN</small><strong>{levelLabel(profile.level)}</strong><span>{profile.belt_rank || 'Consulta con tu instructor'}</span></div></section><section className="classroom-panel student-member-details"><div className="classroom-panel-heading"><div><span className="eyebrow">Tus datos</span><h2>Mi ficha</h2><p>La información registrada por tu instructor.</p></div></div><div className="student-member-grid"><div><small>Sede</small><strong>{profile.branch === 'el_condado' ? 'Matriz · El Condado' : profile.branch === 'pomasqui' ? 'Sucursal · Pomasqui' : 'Por asignar'}</strong></div><div><small>Fecha de nacimiento</small><strong>{dateOnlyLabel(profile.date_of_birth)}</strong></div><div><small>Teléfono</small><strong>{profile.phone || 'Por registrar'}</strong></div><div><small>Representante</small><strong>{profile.guardian_name || 'Por registrar'}</strong></div></div></section><div className="student-classroom-columns"><section className="classroom-panel"><div className="classroom-panel-heading"><div><span className="eyebrow">Seguimiento personal</span><h2>Mis avances</h2></div><span className="classroom-panel-number">{String(entries.length).padStart(2, '0')}</span></div>{entries.length ? <div className="student-timeline">{entries.map((entry) => <article key={entry.id}><span className="student-timeline-dot"/><small>{dateLabel(entry.created_at)}</small><h3>{entry.title}</h3><p>{entry.details}</p></article>)}</div> : <div className="classroom-empty">Cuando tu instructor registre un avance, aparecerá aquí.</div>}</section><section className="classroom-panel"><div className="classroom-panel-heading"><div><span className="eyebrow">Biblioteca del dojang</span><h2>Material de estudio</h2></div><span className="classroom-panel-number">{String(materials.length).padStart(2, '0')}</span></div>{materials.length ? <div className="student-material-list">{materials.map((material) => <article key={material.id}><span className="student-material-icon">{material.content_type.startsWith('video/') ? '▶' : material.content_type.startsWith('image/') ? '▧' : 'PDF'}</span><div><strong>{material.title}</strong><small>{material.description || material.original_name}</small><small>{levelLabel(material.level)} · {dateLabel(material.created_at)}</small></div><button className="student-material-open" onClick={() => openMaterial(material)} disabled={openingId === material.id}>{openingId === material.id ? '…' : 'Abrir ↗'}</button></article>)}</div> : <div className="classroom-empty">Aún no hay recursos para tu grupo. Tu instructor podrá publicar material aquí.</div>}</section></div></div></main>;
}

export default function AulaPage() {
  const [session, setSession] = useState(null); const [profile, setProfile] = useState(null); const [loading, setLoading] = useState(Boolean(supabase)); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const loadProfile = useCallback(async (activeSession) => {
    if (!activeSession || !supabase) { setSession(null); setProfile(null); setLoading(false); return; }
    setSession(activeSession);
    const { data, error: profileError } = await supabase.from('profiles').select('id,role,full_name,cedula,level,belt_rank,date_of_birth,phone,guardian_name,guardian_phone,emergency_contact_name,emergency_contact_phone,branch,profile_photo_path').eq('id', activeSession.user.id).single();
    if (profileError) { setError('No se pudo cargar tu perfil. Comprueba la configuración del aula o contacta al instructor.'); setProfile(null); }
    else { setError(''); setProfile(data); }
    setLoading(false);
  }, []);
  useEffect(() => {
    if (!supabase) { setLoading(false); return undefined; }
    supabase.auth.getSession().then(({ data }) => loadProfile(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => { setLoading(true); setTimeout(() => loadProfile(nextSession), 0); });
    return () => subscription.unsubscribe();
  }, [loadProfile]);
  const login = async (cedula, password) => {
    if (cedula.length !== 10) { setError('Escribe los 10 dígitos de tu cédula.'); return; }
    setBusy(true); setError('');
    const { error: loginError } = await supabase.auth.signInWithPassword({ email: `${cedula}@login.taewoong.invalid`, password });
    if (loginError) setError('Cédula o contraseña incorrectas. Si necesitas ayuda, escribe al instructor.');
    setBusy(false);
  };
  const signOut = async () => { await supabase.auth.signOut(); setProfile(null); setSession(null); };
  if (!supabase) return <ConfigNotice />;
  if (loading) return <main className="classroom-shell"><div className="classroom-loading">Preparando tu aula…</div></main>;
  if (!session) return <Login onLogin={login} error={error} busy={busy} />;
  if (!profile) return <main className="classroom-shell"><section className="classroom-config"><h1>No se pudo abrir tu perfil.</h1><p>{error || 'Contacta al instructor para revisar el acceso.'}</p><button className="classroom-signout" onClick={signOut}>Cerrar sesión</button></section></main>;
  if (profile.role === 'instructor') return <InstructorDashboard profile={profile} onSignOut={signOut} />;
  return <StudentDashboard profile={profile} onSignOut={signOut} />;
}

