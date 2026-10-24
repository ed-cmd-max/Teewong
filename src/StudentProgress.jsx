import { useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase.js';

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const dateLabel = (value) => value ? new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`)) : '—';
const metricList = [
  { key: 'weight_kg', label: 'Peso', unit: 'kg', decimals: 1, hint: 'Solo seguimiento deportivo' },
  { key: 'abdomen_cm', label: 'Abdomen', unit: 'cm', decimals: 1, hint: 'Medición en cm' },
  { key: 'speed_20m_seconds', label: 'Velocidad · 20 m', unit: 's', decimals: 2, hint: 'Menor tiempo es más rápido' },
  { key: 'abdominal_reps_1min', label: 'Abdominales · 1 min', unit: 'reps', decimals: 0, hint: 'Repeticiones correctas' },
  { key: 'flexibility_cm', label: 'Flexibilidad', unit: 'cm', decimals: 1, hint: 'Usa siempre la misma prueba' },
  { key: 'endurance_6min_m', label: 'Resistencia · 6 min', unit: 'm', decimals: 0, hint: 'Distancia recorrida' },
];

function TrendChart({ rows, metric }) {
  const points = rows.map((row, index) => ({ index, value: Number(row[metric.key]) })).filter((point) => Number.isFinite(point.value));
  if (points.length < 2) return <div className="fitness-chart-empty">Registra al menos dos controles para ver la tendencia.</div>;
  const values = points.map((point) => point.value);
  const low = Math.min(...values); const high = Math.max(...values); const spread = high - low || 1;
  const coords = points.map((point, index) => ({ x: 18 + index * (264 / (points.length - 1)), y: 74 - ((point.value - low) / spread) * 54 }));
  return <div className="fitness-chart-wrap"><svg className="fitness-chart" viewBox="0 0 300 92" role="img" aria-label={`Tendencia de ${metric.label}`}><line x1="18" y1="74" x2="282" y2="74"/><polyline points={coords.map(({ x, y }) => `${x},${y}`).join(' ')}/>{coords.map(({ x, y }, index) => <circle key={index} cx={x} cy={y} r="4" />)}</svg><div className="fitness-chart-dates"><span>{dateLabel(rows[0].measurement_date)}</span><span>{dateLabel(rows.at(-1).measurement_date)}</span></div></div>;
}

function MetricsOverview({ rows }) {
  if (!rows.length) return <div className="classroom-empty">Tu instructor aún no registra controles físicos. Cuando los agregue, verás aquí tus mediciones y su evolución.</div>;
  const latest = rows.at(-1);
  return <><div className="fitness-metric-grid">{metricList.map((metric) => {
    const value = latest[metric.key];
    const previous = [...rows.slice(0, -1)].reverse().find((row) => row[metric.key] != null)?.[metric.key];
    const delta = value != null && previous != null ? Number(value) - Number(previous) : null;
    return <article className="fitness-metric-card" key={metric.key}><small>{metric.label}</small><strong>{value == null ? '—' : `${Number(value).toFixed(metric.decimals)} ${metric.unit}`}</strong><span>{delta == null ? 'Primer registro' : `${delta > 0 ? '+' : ''}${delta.toFixed(metric.decimals)} ${metric.unit} desde el control anterior`}</span></article>;
  })}</div><div className="fitness-chart-grid">{metricList.filter((metric) => rows.some((row) => row[metric.key] != null)).map((metric) => <article className="fitness-chart-card" key={metric.key}><div><strong>{metric.label}</strong><small>{metric.hint}</small></div><TrendChart rows={rows} metric={metric} /></article>)}</div><div className="fitness-history"><h3>Controles registrados</h3><div className="fitness-history-scroll"><table><thead><tr><th>Fecha</th>{metricList.map((metric) => <th key={metric.key}>{metric.label}</th>)}<th>Nota del instructor</th></tr></thead><tbody>{[...rows].reverse().map((row) => <tr key={row.id}><td>{dateLabel(row.measurement_date)}</td>{metricList.map((metric) => <td key={metric.key}>{row[metric.key] == null ? '—' : `${row[metric.key]} ${metric.unit}`}</td>)}<td>{row.notes || '—'}</td></tr>)}</tbody></table></div></div></>;
}

export function StudentFitnessProgress({ studentId }) {
  const [rows, setRows] = useState([]); const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    supabase.from('student_measurements').select('*').eq('student_id', studentId).order('measurement_date').then(({ data, error: queryError }) => {
      if (!active) return;
      setRows(data || []); setError(queryError ? 'No se pudo cargar tu progreso físico.' : '');
    });
    return () => { active = false; };
  }, [studentId]);
  return <section className="classroom-panel fitness-panel"><div className="classroom-panel-heading"><div><span className="eyebrow">Tu evolución · controles fechados</span><h2>Progreso físico</h2><p>Consulta tus mediciones y la tendencia entre controles registrados por el instructor.</p></div><span className="classroom-panel-number">{String(rows.length).padStart(2, '0')}</span></div>{error ? <p className="classroom-error" role="alert">{error}</p> : <MetricsOverview rows={rows} />}<p className="fitness-privacy-note">Las mediciones son de seguimiento deportivo y se muestran solo en tu cuenta y en la del instructor.</p></section>;
}

export function FitnessProgressEditor({ students, instructorId }) {
  const [studentId, setStudentId] = useState(students[0]?.id || '');
  const [measurementDate, setMeasurementDate] = useState(today());
  const [values, setValues] = useState({});
  const [notes, setNotes] = useState('');
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false); const [feedback, setFeedback] = useState(''); const [error, setError] = useState('');
  const selected = useMemo(() => students.find((item) => item.id === studentId) || null, [students, studentId]);
  const refresh = async () => {
    if (!studentId) { setRows([]); return; }
    const { data, error: queryError } = await supabase.from('student_measurements').select('*').eq('student_id', studentId).order('measurement_date');
    setRows(data || []); setError(queryError ? 'No se pudieron cargar los controles. Comprueba que esté aplicada la migración de progreso físico.' : '');
  };
  useEffect(() => { if (!students.some((student) => student.id === studentId)) setStudentId(students[0]?.id || ''); }, [students, studentId]);
  useEffect(() => { refresh(); setFeedback(''); }, [studentId]);
  const submit = async (event) => {
    event.preventDefault();
    if (!selected) return;
    const payload = Object.fromEntries(metricList.map(({ key }) => [key, values[key] === '' ? null : Number(values[key])]));
    if (!Object.values(payload).some((value) => value != null)) { setError('Registra al menos una medición.'); return; }
    setBusy(true); setFeedback(''); setError('');
    const { error: insertError } = await supabase.from('student_measurements').insert({ student_id: studentId, instructor_id: instructorId, measurement_date: measurementDate, notes: notes.trim() || null, ...payload });
    setBusy(false);
    if (insertError) { setError('No se pudo guardar el control. ' + insertError.message); return; }
    setValues({}); setNotes(''); setFeedback('Control físico guardado en el historial del estudiante.'); await refresh();
  };
  return <section className="classroom-panel fitness-panel"><div className="classroom-panel-heading"><div><span className="eyebrow">Seguimiento · rendimiento</span><h2>Registrar control físico</h2><p>Guarda cada medición con su fecha; el estudiante verá su historial y las gráficas.</p></div><span className="classroom-panel-number">04</span></div>{students.length ? <form className="classroom-form classroom-grid-form fitness-form" onSubmit={submit}><label>Estudiante<select value={studentId} onChange={(event) => setStudentId(event.target.value)}>{students.map((student) => <option key={student.id} value={student.id}>{student.full_name} · {student.cedula}</option>)}</select></label><label>Fecha del control<input type="date" max={today()} value={measurementDate} onChange={(event) => setMeasurementDate(event.target.value)} required /></label>{metricList.map((metric) => <label key={metric.key}>{metric.label}<span className="fitness-input-unit">{metric.unit}</span><input type="number" min="0" step={metric.decimals ? '0.1' : '1'} value={values[metric.key] ?? ''} onChange={(event) => setValues((current) => ({ ...current, [metric.key]: event.target.value }))} placeholder="Opcional" /></label>)}<label className="classroom-full-field">Observaciones<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows="2" maxLength="1000" placeholder="Condiciones de la prueba, observaciones del entrenador…" /></label><button className="button button-primary classroom-submit" disabled={busy}>{busy ? 'Guardando…' : 'Guardar control'} <span>→</span></button></form> : <div className="classroom-empty">Primero crea una cuenta de estudiante.</div>}{feedback && <p className="classroom-success" role="status">{feedback}</p>}{error && <p className="classroom-error" role="alert">{error}</p>}{selected && <div className="fitness-admin-preview"><h3>Historial · {selected.full_name}</h3><MetricsOverview rows={rows} /></div>}</section>;
}
