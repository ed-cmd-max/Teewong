import { useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase.js';

const today = () => new Date().toISOString().slice(0, 10);
const money = (value) => new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
const dateLabel = (value) => value ? new Intl.DateTimeFormat('es-EC', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`)) : 'Sin fecha';
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function dueDateForMonth(startValue, monthOffset) {
  const start = new Date(`${startValue}T12:00:00`);
  const firstOfMonth = new Date(start.getFullYear(), start.getMonth() + monthOffset, 1, 12);
  const lastDay = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth() + 1, 0).getDate();
  firstOfMonth.setDate(Math.min(start.getDate(), lastDay));
  return `${firstOfMonth.getFullYear()}-${String(firstOfMonth.getMonth() + 1).padStart(2, '0')}-${String(firstOfMonth.getDate()).padStart(2, '0')}`;
}

function makeReceipt(payment, student) {
  const receiptNo = `TW-${payment.payment_date.replaceAll('-', '')}-${payment.id.slice(0, 6).toUpperCase()}`;
  const printable = window.open('', '_blank', 'width=720,height=760');
  if (!printable) return false;
  printable.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Recibo ${receiptNo}</title><style>
    *{box-sizing:border-box}body{margin:0;padding:36px;font:15px Arial,sans-serif;color:#172b45}.receipt{max-width:620px;margin:auto;border:1px solid #d9e4ef;border-radius:16px;padding:32px}.brand{color:#4387c8;font-size:12px;font-weight:800;letter-spacing:.18em}.brand strong{display:block;margin-top:8px;color:#172b45;font-size:27px;letter-spacing:0}.rule{height:4px;margin:22px 0;background:#f0c95b}.title{display:flex;justify-content:space-between;align-items:center}.title h1{margin:0;font-size:22px}.title span{color:#6c8197;font-size:12px}.row{display:flex;justify-content:space-between;gap:24px;padding:13px 0;border-bottom:1px solid #e9eff5}.row span{color:#6c8197}.amount{margin-top:20px;padding:18px;border-radius:10px;background:#eef6fd;text-align:right}.amount span{display:block;color:#6c8197;font-size:12px}.amount strong{font-size:28px;color:#28669c}.note{margin-top:28px;color:#738398;font-size:12px;line-height:1.5}.actions{margin-top:24px;text-align:center}.actions button{padding:11px 18px;border:0;border-radius:7px;background:#4387c8;color:#fff;font-weight:bold;cursor:pointer}@media print{body{padding:0}.receipt{border:0;padding:12px}.actions{display:none}}</style></head><body><main class="receipt"><div class="brand">CLUB TAEWOONG<strong>Comprobante de pago</strong></div><div class="rule"></div><div class="title"><h1>Pensión mensual</h1><span>${escapeHtml(receiptNo)}</span></div><div class="row"><span>Deportista</span><strong>${escapeHtml(student.full_name)}</strong></div><div class="row"><span>Cédula</span><strong>${escapeHtml(student.cedula)}</strong></div><div class="row"><span>Fecha del pago</span><strong>${escapeHtml(dateLabel(payment.payment_date))}</strong></div><div class="row"><span>Mensualidad correspondiente</span><strong>${escapeHtml(dateLabel(payment.due_date))}</strong></div><div class="row"><span>Forma de pago</span><strong>${escapeHtml(payment.method)}</strong></div>${payment.reference ? `<div class="row"><span>Referencia</span><strong>${escapeHtml(payment.reference)}</strong></div>` : ''}<div class="amount"><span>Total recibido</span><strong>${escapeHtml(money(payment.amount))}</strong></div>${payment.notes ? `<p class="note">${escapeHtml(payment.notes)}</p>` : ''}<p class="note">TAEWOONG · Formación · Disciplina · Valores<br>Comprobante generado desde el aula virtual.</p><div class="actions"><button onclick="window.print()">Imprimir o guardar como PDF</button></div></main></body></html>`);
  printable.document.close();
  return true;
}

function PaymentRows({ rows, studentsById }) {
  if (!rows.length) return <div className="classroom-empty">Todavía no hay pagos registrados.</div>;
  return <div className="payment-record-list">{rows.map((payment) => <article className="payment-record" key={payment.id}><div><strong>{studentsById[payment.student_id]?.full_name || payment.student?.full_name || 'Deportista'}</strong><small>Pago {dateLabel(payment.payment_date)} · mensualidad de {dateLabel(payment.due_date)}</small></div><b>{money(payment.amount)}</b><button type="button" className="payment-receipt-button" onClick={() => makeReceipt(payment, studentsById[payment.student_id] || payment.student || { full_name: 'Deportista', cedula: '' })}>Generar recibo ↗</button></article>)}</div>;
}

export function StudentPayments({ student }) {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    supabase.from('student_payments').select('id,student_id,due_date,payment_date,amount,method,reference,notes,created_at').eq('student_id', student.id).order('payment_date', { ascending: false }).then(({ data, error: queryError }) => {
      if (!active) return;
      setPayments(data || []);
      if (queryError) setError('No se pudieron consultar tus comprobantes.');
    });
    return () => { active = false; };
  }, [student.id]);
  return <section className="classroom-panel"><div className="classroom-panel-heading"><div><span className="eyebrow">Tus comprobantes</span><h2>Historial de pagos</h2><p>Consulta o imprime los recibos registrados por el club.</p></div></div>{error ? <p className="classroom-error">{error}</p> : <PaymentRows rows={payments} studentsById={{ [student.id]: student }} />}</section>;
}

export default function PaymentsPanel({ students, instructorId }) {
  const [studentId, setStudentId] = useState(students[0]?.id || '');
  const [paymentDate, setPaymentDate] = useState(today());
  const [amount, setAmount] = useState('30');
  const [method, setMethod] = useState('efectivo');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [payments, setPayments] = useState([]);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const selected = students.find((student) => student.id === studentId) || null;
  const studentsById = useMemo(() => Object.fromEntries(students.map((student) => [student.id, student])), [students]);

  useEffect(() => { if (!students.some((student) => student.id === studentId)) setStudentId(students[0]?.id || ''); }, [students, studentId]);
  const refresh = async () => {
    if (!studentId) { setPayments([]); return; }
    const { data, error: queryError } = await supabase.from('student_payments').select('id,student_id,due_date,payment_date,amount,method,reference,notes,created_at').eq('student_id', studentId).order('payment_date', { ascending: false });
    if (queryError) setError('No se pudieron cargar los pagos. Ejecuta la migración de documentos y pagos en Supabase.');
    else { setPayments(data || []); setError(''); }
  };
  useEffect(() => { refresh(); }, [studentId]);

  const pendingDueDates = useMemo(() => {
    if (!selected?.enrollment_date) return [];
    const now = new Date();
    const todayValue = today();
    const dues = [];
    for (let month = 0; month < 240; month += 1) {
      const due = dueDateForMonth(selected.enrollment_date, month);
      if (due > todayValue) break;
      if (!payments.some((payment) => payment.due_date === due)) dues.push(due);
      const start = new Date(`${selected.enrollment_date}T12:00:00`);
      if (new Date(start.getFullYear(), start.getMonth() + month, 1).getTime() > now.getTime()) break;
    }
    return dues;
  }, [selected?.enrollment_date, payments]);
  const [dueDate, setDueDate] = useState('');
  useEffect(() => { setDueDate((current) => pendingDueDates.includes(current) ? current : pendingDueDates[0] || ''); }, [pendingDueDates]);

  const submit = async (event) => {
    event.preventDefault();
    if (!selected || !dueDate || Number(amount) <= 0) return;
    setBusy(true); setError(''); setFeedback('');
    const { error: insertError } = await supabase.from('student_payments').insert({ student_id: selected.id, instructor_id: instructorId, due_date: dueDate, payment_date: paymentDate, amount: Number(amount), method, reference: reference.trim() || null, notes: notes.trim() || null });
    if (insertError) {
      setError(insertError.code === '23505' ? 'Ya existe un pago registrado para esa fecha mensual.' : 'No se pudo registrar el pago. Comprueba que esté aplicada la migración en Supabase.');
    } else {
      setFeedback('Pago registrado. Ya puedes generar su recibo.');
      setReference(''); setNotes('');
      await refresh();
    }
    setBusy(false);
  };

  return <div className="instructor-area-content"><section className="classroom-panel"><div className="classroom-panel-heading"><div><span className="eyebrow">Control mensual</span><h2>Registrar pago y generar recibo</h2><p>La fecha mensual se calcula desde la fecha de ingreso de cada deportista. Puedes elegir una mensualidad pendiente y registrar el día en que pagó.</p></div></div>{students.length ? <form className="classroom-form classroom-grid-form payment-form" onSubmit={submit}><label>Deportista<select value={studentId} onChange={(event) => setStudentId(event.target.value)}>{students.map((student) => <option key={student.id} value={student.id}>{student.full_name} · {student.cedula}</option>)}</select></label><label>Mensualidad pendiente<select value={dueDate} onChange={(event) => setDueDate(event.target.value)} required disabled={!pendingDueDates.length}><option value="">{selected?.enrollment_date ? 'No hay mensualidades pendientes' : 'Registra primero la fecha de ingreso en la ficha'}</option>{pendingDueDates.map((date) => <option value={date} key={date}>{dateLabel(date)}</option>)}</select></label><label>Fecha en que se recibió<input type="date" value={paymentDate} max={today()} onChange={(event) => setPaymentDate(event.target.value)} required /></label><label>Valor recibido (USD)<input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required /></label><label>Forma de pago<select value={method} onChange={(event) => setMethod(event.target.value)}><option value="efectivo">Efectivo</option><option value="transferencia">Transferencia</option><option value="tarjeta">Tarjeta</option><option value="otro">Otro</option></select></label><label>Referencia opcional<input value={reference} onChange={(event) => setReference(event.target.value)} maxLength="100" placeholder="N.º de transferencia" /></label><label className="classroom-full-field">Nota opcional<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows="2" maxLength="500" placeholder="Observaciones del pago" /></label><button className="button button-primary classroom-submit" disabled={busy || !dueDate}>{busy ? 'Guardando…' : 'Registrar pago'} <span>→</span></button></form> : <div className="classroom-empty">Crea primero una cuenta de estudiante.</div>}{feedback && <p className="classroom-success">{feedback}</p>}{error && <p className="classroom-error" role="alert">{error}</p>}</section><section className="classroom-panel"><div className="classroom-panel-heading"><div><span className="eyebrow">Recibos emitidos</span><h2>Historial del estudiante</h2><p>Los recibos se pueden imprimir o guardar como PDF.</p></div></div><PaymentRows rows={payments} studentsById={studentsById} /></section></div>;
}
