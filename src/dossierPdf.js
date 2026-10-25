import { supabase } from './lib/supabase.js';

const esc = (value) => String(value ?? '—').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const humanDate = (value) => value ? new Intl.DateTimeFormat('es-EC', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${value.slice(0, 10)}T12:00:00Z`)) : '—';
const jsonObject = (value) => value && typeof value === 'object' ? value : {};
const textRows = (items, keys, labels) => items?.length ? `<table><thead><tr>${labels.map((label) => `<th>${esc(label)}</th>`).join('')}</tr></thead><tbody>${items.map((item) => `<tr>${keys.map((key) => `<td>${esc(item[key])}</td>`).join('')}</tr>`).join('')}</tbody></table>` : '<p class="muted">Sin registros.</p>';
const line = (label, value) => `<div class="field"><small>${esc(label)}</small><strong>${esc(value)}</strong></div>`;
const section = (title, content) => `<section class="report-section"><h2 class="section-title">${esc(title)}</h2>${content || '<p class="muted">Sin información registrada.</p>'}</section>`;

const printStyles = `
  @page{size:A4;margin:13mm 12mm 15mm}
  *{box-sizing:border-box}
  body{margin:0;background:#eef3f8;color:#1d3046;font:10pt/1.45 Arial,Helvetica,sans-serif}
  .sheet{max-width:930px;margin:22px auto;padding:28px 32px;background:#fff;border:1px solid #dce6ef;box-shadow:0 14px 45px #172b4612}
  .brand-bar{height:5px;margin:-28px -32px 23px;background:linear-gradient(90deg,#ef454b 0 16%,#f0c95b 16% 100%)}
  .report-header{display:grid;grid-template-columns:1fr 120px;gap:20px;align-items:center;padding-bottom:20px;border-bottom:1px solid #dce6ef}
  .brand-lockup{display:flex;align-items:center;gap:12px;margin-bottom:17px}
  .brand-lockup img{width:48px;height:48px;object-fit:contain;border:1px solid #e2eaf1;border-radius:50%;padding:4px}
  .brand-lockup strong{display:block;color:#172b46;font-size:14px;letter-spacing:.12em}
  .brand-lockup small{display:block;margin-top:3px;color:#73849a;font-size:8px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}
  .report-kicker{margin:0;color:#4387c8;font-size:8px;font-weight:900;letter-spacing:.19em;text-transform:uppercase}
  .report-header h1{margin:6px 0 2px;color:#152a45;font-size:25px;line-height:1.08;letter-spacing:-.04em}
  .report-header .student-id{margin:6px 0 0;color:#72849a;font-size:10px}
  .report-header .student-photo{width:105px;height:126px;justify-self:end;object-fit:cover;border:3px solid #f0c95b;border-radius:10px;background:#f2f7fb}
  .summary-chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}
  .summary-chips span{padding:5px 8px;border:1px solid #dce8f2;border-radius:99px;background:#f4f8fc;color:#42617f;font-size:8px;font-weight:800}
  .report-section{margin-top:18px;break-inside:auto}
  .section-title{display:flex;align-items:center;gap:9px;margin:0 0 9px;padding:0 0 7px;border-bottom:1px solid #dfe8f0;color:#23415f;font-size:11px;letter-spacing:.035em;break-after:avoid}
  .section-title:before{content:"";width:4px;height:17px;border-radius:3px;background:#4387c8}
  .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
  .field{min-height:43px;padding:7px 9px;border:1px solid #e4ecf3;border-radius:6px;background:#f9fbfd;overflow-wrap:anywhere;break-inside:avoid}
  .field small{display:block;margin-bottom:3px;color:#8191a2;font-size:7px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
  .field strong{display:block;color:#28435e;font-size:9px;font-weight:700}
  h3{margin:12px 0 6px;color:#42617f;font-size:9px}
  p{margin:7px 0;color:#4e6278;font-size:9px;line-height:1.55;overflow-wrap:anywhere}
  p b{color:#294866}
  table{width:100%;margin:7px 0 10px;border:1px solid #dfe8f0;border-collapse:collapse;font-size:8px;break-inside:auto}
  thead{display:table-header-group}tr{break-inside:avoid;break-after:auto}
  th{background:#edf4fa;color:#526d87;text-align:left;font-size:7px;font-weight:900;letter-spacing:.04em;text-transform:uppercase}
  td,th{padding:6px 7px;border:1px solid #dfe8f0;vertical-align:top;overflow-wrap:anywhere}
  tbody tr:nth-child(even){background:#f8fafc}td{color:#405770}
  .notes{padding:9px 11px;border-left:3px solid #f0c95b;border-radius:0 5px 5px 0;background:#fffaf0;white-space:pre-wrap}
  .muted{padding:9px 11px;border-radius:5px;background:#f7f9fb;color:#8292a3;font-size:8px}
  .report-footer{display:flex;justify-content:space-between;gap:12px;margin-top:22px;padding-top:10px;border-top:2px solid #f0c95b;color:#8291a1;font-size:7px}
  .actions{display:flex;justify-content:flex-end;gap:9px;margin-top:20px}
  .actions button{padding:11px 16px;border:0;border-radius:6px;background:#4387c8;color:#fff;font-weight:800;cursor:pointer}
  @media(max-width:600px){.sheet{margin:0;padding:22px 17px;border:0;box-shadow:none}.brand-bar{margin:-22px -17px 19px}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.report-header{grid-template-columns:1fr 84px}.report-header .student-photo{width:78px;height:96px}.report-header h1{font-size:20px}}
  @media print{body{background:#fff;font-size:9pt}.sheet{max-width:none;margin:0;padding:0;border:0;box-shadow:none}.brand-bar{margin:0 0 15px}.actions{display:none}.report-footer{break-inside:avoid}.report-section{margin-top:14px}a{color:inherit;text-decoration:none}}
`;

function evaluationTable(assessments, area, title) {
  const values = jsonObject(assessments?.[area]);
  const periods = [['initial', 'Inicial'], ['control1', 'Control 1'], ['control2', 'Control 2']];
  const keys = [...new Set(periods.flatMap(([key]) => Object.keys(jsonObject(values[key]))))];
  if (!keys.length) return '';
  return `<h3>${esc(title)}</h3><table><thead><tr><th>Indicador</th>${periods.map(([, label]) => `<th>${label}</th>`).join('')}</tr></thead><tbody>${keys.map((key) => `<tr><td>${esc(key.replaceAll('_', ' '))}</td>${periods.map(([period]) => `<td>${esc(values[period]?.[key])}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

export async function downloadStudentDossierPdf(student) {
  const printable = window.open('', '_blank', 'width=900,height=1000');
  if (!printable) { window.alert('Permite las ventanas emergentes para generar el PDF.'); return; }
  printable.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Ficha deportiva</title><style>${printStyles}</style></head><body><main class="sheet"><p>Preparando ficha…</p></main></body></html>`);
  printable.document.close();
  const [measurements, progress] = await Promise.all([
    supabase.from('student_measurements').select('*').eq('student_id', student.id).order('measurement_date'),
    supabase.from('progress_entries').select('title,details,created_at').eq('student_id', student.id).order('created_at', { ascending: false }),
  ]);
  const p = student;
  const profile = section('1 · Identificación y datos deportivos', `<div class="grid">${line('Nombre', p.full_name)}${line('Cédula', p.cedula)}${line('Código interno', p.internal_code)}${line('Fecha de nacimiento', humanDate(p.date_of_birth))}${line('Edad', p.date_of_birth ? `${new Date().getFullYear() - new Date(p.date_of_birth).getFullYear()} años` : '—')}${line('Fecha de ingreso', humanDate(p.enrollment_date))}${line('Sede', p.branch === 'el_condado' ? 'Matriz · El Condado' : p.branch === 'pomasqui' ? 'Sucursal · Pomasqui' : '—')}${line('Categoría', p.sport_category)}${line('Nivel', p.level)}${line('Cinturón', p.belt_rank)}${line('Poom / Dan', p.poom_dan_grade)}${line('Modalidad', p.modalities?.join(', '))}</div>`);
  const contacts = section('2 · Contacto y representante', `<div class="grid">${line('Teléfono', p.phone)}${line('Correo', p.email)}${line('Dirección', p.address)}${line('Institución educativa', p.educational_institution)}${line('Curso / año', p.course_year)}${line('Representante', p.guardian_name)}${line('Parentesco', p.guardian_relationship)}${line('Teléfono del representante', p.guardian_phone)}${line('Contacto de emergencia', p.emergency_contact_name)}${line('Teléfono de emergencia', p.emergency_contact_phone)}</div>`);
  const background = section('3 · Antecedentes deportivos', `<div class="grid">${line('Practicó Taekwondo antes', p.has_previous_taekwondo === true ? 'Sí' : p.has_previous_taekwondo === false ? 'No' : '—')}${line('Club anterior', p.previous_club)}${line('Tiempo de práctica', p.practice_duration)}${line('Otros deportes', p.other_sports)}${line('Última competencia', p.last_competition)}${line('Nivel del evento', p.last_competition_level)}</div><p class="notes">${esc(p.training_observations)}</p>`);
  const assessment = section('4 · Evaluación y rendimiento', evaluationTable(p.performance_assessments, 'physical', 'Condición física') + evaluationTable(p.performance_assessments, 'technical', 'Escala técnica y actitudinal'));
  const goals = section('5 · Objetivos y ruta deportiva', `<div class="grid">${line('Etapa actual', p.athlete_stage)}${line('Enfoque', p.training_focus?.join(', '))}</div><p><b>Corto plazo</b><br>${esc(p.short_term_goal)}</p><p><b>Mediano plazo</b><br>${esc(p.medium_term_goal)}</p><p><b>Largo plazo</b><br>${esc(p.long_term_goal)}</p>`);
  const competitions = section('6 · Competencias y logros', textRows(p.competition_records, ['date', 'event', 'modality', 'category', 'result', 'observation'], ['Fecha', 'Evento', 'Modalidad', 'Categoría', 'Resultado', 'Observación']) + `<p>Medallas: oro ${esc(p.medals_gold || 0)} · plata ${esc(p.medals_silver || 0)} · bronce ${esc(p.medals_bronze || 0)}<br>${esc(p.medals_summary)}</p>`);
  const grades = section('7 · Control de grados', textRows(p.grade_records, ['date', 'previous', 'obtained', 'evaluator', 'observations'], ['Fecha', 'Grado anterior', 'Grado obtenido', 'Evaluador', 'Observaciones']));
  const measurementRows = measurements.data || [];
  const measurementKeys = ['measurement_date', 'weight_kg', 'abdomen_cm', 'speed_20m_seconds', 'abdominal_reps_1min', 'flexibility_cm', 'endurance_6min_m', 'notes'];
  const measurementsSection = section('8 · Controles físicos fechados', textRows(measurementRows.map((row) => ({ ...row, measurement_date: humanDate(row.measurement_date), weight_kg: row.weight_kg == null ? '—' : `${row.weight_kg} kg`, abdomen_cm: row.abdomen_cm == null ? '—' : `${row.abdomen_cm} cm`, speed_20m_seconds: row.speed_20m_seconds == null ? '—' : `${row.speed_20m_seconds} s`, abdominal_reps_1min: row.abdominal_reps_1min == null ? '—' : `${row.abdominal_reps_1min} rep.`, flexibility_cm: row.flexibility_cm == null ? '—' : `${row.flexibility_cm} cm`, endurance_6min_m: row.endurance_6min_m == null ? '—' : `${row.endurance_6min_m} m` })), measurementKeys, ['Fecha', 'Peso', 'Abdomen', 'Velocidad 20 m', 'Abdominales / min', 'Flexibilidad', 'Resistencia 6 min', 'Observaciones']));
  const timeline = section('9 · Seguimiento formativo', textRows((progress.data || []).map((row) => ({ ...row, created_at: humanDate(row.created_at?.slice(0, 10)) })), ['created_at', 'title', 'details'], ['Fecha', 'Avance', 'Observación']));
  const imagePath = p.profile_photo_path;
  let image = '';
  if (imagePath) { const { data } = await supabase.storage.from('student-photos').createSignedUrl(imagePath, 300); if (data?.signedUrl) image = `<img class="student-photo" src="${esc(data.signedUrl)}" alt="Foto del estudiante">`; }
  const body = `${profile}${contacts}${background}${assessment}${goals}${competitions}${grades}${measurementsSection}${timeline}${section('10 · Seguimiento del entrenador', `<div class="grid">${line('Fortalezas', p.coach_strengths)}${line('Aspectos por mejorar', p.coach_improvements)}${line('Recomendaciones', p.coach_recommendations)}${line('Entrenador responsable', p.instructor_responsible)}${line('Fecha de revisión', humanDate(p.instructor_record_date))}${line('Etapa actual', p.athlete_stage)}</div>`)}<footer class="report-footer"><span>TAEWOONG · Disciplina · Perseverancia · Excelencia</span><span>Ficha privada del deportista · ${humanDate(new Date().toISOString().slice(0, 10))}</span></footer>`;
  printable.document.querySelector('.sheet').innerHTML = `<div class="brand-bar"></div><header class="report-header"><div><div class="brand-lockup"><img src="/taekwondo-logo.png" alt=""><div><strong>TAEWOONG</strong><small>Club especializado formativo de Taekwondo</small></div></div><p class="report-kicker">Expediente deportivo · ficha individual</p><h1>${esc(p.full_name)}</h1><p class="student-id">Cédula ${esc(p.cedula)} · Código ${esc(p.internal_code)}</p><div class="summary-chips"><span>${esc(p.branch === 'el_condado' ? 'Matriz · El Condado' : p.branch === 'pomasqui' ? 'Sucursal · Pomasqui' : 'Sede sin asignar')}</span><span>${esc(p.level)}</span><span>${esc(p.belt_rank || 'Cinturón por registrar')}</span></div></div>${image || '<div class="student-photo" aria-hidden="true"></div>'}</header>${body}<div class="actions"><button onclick="window.print()">Guardar como PDF / Imprimir</button></div>`;
  printable.document.title = `Ficha deportiva - ${p.full_name}`;
  await Promise.all([...printable.document.images].map((item) => item.decode().catch(() => {})));
  printable.focus();
  printable.print();
}
