import { useState } from 'react';

const navigation = [
  ['Inicio', './index.html', 'home'],
  ['El club', './club.html', 'club'],
  ['Programas', './programas.html', 'programas'],
  ['Horarios', './horarios.html', 'horarios'],
  ['Costos', './costos.html', 'costos'],
  ['Políticas', './politicas.html', 'politicas'],
];

const classes = [
  { number: '01', title: 'Pequeños guerreros', category: 'Taekwondo Kids', age: 'De 4 a 7 años', text: 'Desarrollamos disciplina, confianza, respeto y perseverancia con una enseñanza cercana, divertida y llena de retos.' },
  { number: '02', title: 'Juvenil y formativo', category: 'Principiantes', age: 'Desde los 8 años', text: 'Fortalecemos la disciplina, la confianza, la técnica y el espíritu competitivo, acompañando a cada deportista en su proceso.' },
  { number: '03', title: 'Intermedios y avanzados', category: 'Proyección deportiva', age: 'Según nivel y progreso', text: 'Perfecciona tu técnica y continúa avanzando con el acompañamiento del equipo de instructores.' },
];

const schedules = [
  { level: 'Taekwondo Kids', age: '4 a 7 años', days: 'Lunes a jueves', kind: 'kids', times: [['Tarde', '17:15 – 18:15']] },
  { level: 'Principiantes', age: 'Desde los 8 años', days: 'Lunes a jueves', kind: 'beginner', times: [['Mañana', '08:00 – 09:15'], ['Tarde', '15:30 – 16:45'], ['Noche', '18:15 – 19:30']] },
  { level: 'Intermedios', age: 'De acuerdo con el nivel', days: 'Lunes a jueves', kind: 'intermediate', times: [['Mañana', '08:00 – 09:30'], ['Tarde', '15:30 – 17:00'], ['Noche', '18:00 – 19:30']] },
  { level: 'Avanzados', age: 'Nivel competitivo', days: 'Lunes a viernes', kind: 'advanced', times: [['Mañana', '08:00 – 09:30'], ['Tarde', '15:30 – 17:00'], ['Noche', '18:00 – 19:30']] },
];

const whatsappUrl = 'https://wa.me/593997984504?text=Hola%2C%20quisiera%20informaci%C3%B3n%20del%20Club%20Taewoong.';
const instagramUrl = 'https://www.instagram.com/tae.woong2024/';
const matrixAddress = 'N71C San José del Condado OE4-374, local 2';
const matrixMapUrl = 'https://www.google.com/maps/search/?api=1&query=N71C+San+Jose+del+Condado+OE4-374+local+2+Quito';
const pomasquiMapUrl = 'https://maps.app.goo.gl/dG8jZ2cRKmvSAYSr9';

const experiencePoints = ['Conocer el dojang y al instructor.', 'Integrarse al grupo de su edad y nivel.', 'Experimentar una clase real de Taekwondo.', 'Conocer nuestra metodología y nuestros valores.'];
const enrollmentIncludes = ['Registro del estudiante.', 'Organización de su ficha deportiva.', 'Ingreso formal al programa de entrenamiento.', 'Orientación inicial a padres y representantes.'];
const familyCommitments = ['La puntualidad y la asistencia constante.', 'El respeto hacia instructores y compañeros.', 'El cuidado del uniforme y las instalaciones.', 'El cumplimiento de las normas del club.', 'La disciplina dentro y fuera del dojang.'];

function Header({ current }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <>
    <div className="topbar"><span>📍 Matriz: El Condado · Sucursal: Pomasqui</span><span>Clase de experiencia · $2</span></div>
    <header className="site-header">
      <a className="brand" href="./index.html" aria-label="TAE WOONG, inicio"><img className="brand-logo" src="/taekwondo-logo.png" alt="Logo de TAE WOONG" /><span className="brand-copy"><strong>TAE WOONG</strong><small>Club especializado formativo<br />de Taekwondo</small></span></a>
      <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? '×' : '☰'}<span>Menú</span></button>
      <nav className={menuOpen ? 'site-nav nav-open' : 'site-nav'} aria-label="Navegación principal">
        {navigation.map(([label, href, key]) => <a key={key} className={current === key ? 'nav-link active' : 'nav-link'} href={href}>{label}</a>)}
        <a className="button button-primary nav-cta" href="./costos.html#experiencia" onClick={() => setMenuOpen(false)}>Clase de experiencia · $2</a>
      </nav>
    </header>
  </>;
}

function Footer() {
  return <footer className="site-footer"><span>© 2026 TAE WOONG · Club Especializado Formativo de Taekwondo</span><a href="./politicas.html">Privacidad y uso de imagen</a><a href={instagramUrl} target="_blank" rel="noreferrer">Instagram</a><a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a><span>Formación · Disciplina · Valores · Superación</span></footer>;
}

function PageIntro({ eyebrow, title, text }) {
  return <div className="page-intro"><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{text && <p>{text}</p>}</div>;
}

function ScheduleCard({ item }) {
  return <article className={`schedule-card ${item.kind}`}>
    <div className="schedule-card-heading"><div><span className="schedule-kicker">{item.age}</span><h3>{item.level}</h3></div><span className="schedule-days">{item.days}</span></div>
    <div className="time-list">{item.times.map(([label, time]) => <div className="time-row" key={label}><span>{label}</span><strong>{time}</strong></div>)}</div>
    {item.kind === 'kids' && <p className="kids-note">Un espacio pensado para desarrollar coordinación, motricidad, disciplina, confianza y valores a través del Taekwondo.</p>}
  </article>;
}

function HomePage() {
  return <>
    <section className="hero home-hero">
      <div className="hero-copy"><div className="eyebrow">Disciplina · Perseverancia · Integridad</div><h1>Más que un deporte,<br /><em>un estilo de vida.</em></h1><p>Taekwondo para niñas, niños, jóvenes y adultos. Aprende, mejora tu condición física y gana confianza paso a paso, en un ambiente seguro y respetuoso.</p><div className="actions"><a className="button button-primary" href="./costos.html#experiencia">Agenda tu clase de experiencia · $2</a><a className="button button-outline" href="./programas.html">Conoce los programas</a></div></div>
      <div className="hero-badge"><img className="hero-logo" src="/taekwondo-logo.png" alt="TAE WOONG, Club Especializado Formativo de Taekwondo" /></div>
    </section>
    <div className="trust"><span>🥋 Grupos por edad y nivel</span><span>📍 Matriz: El Condado · Sucursal: Pomasqui</span><span>⭐ Clase de experiencia · $2</span></div>
    <section className="locations-section" id="sedes"><div className="locations-heading"><div className="eyebrow">Encuéntranos en Quito</div><h2>Dos sedes, el mismo propósito.</h2><p>Elige la sede y consulta cómo llegar. Los horarios publicados corresponden a Pomasqui.</p></div><div className="locations-grid"><article className="location-card"><span className="location-kind">Matriz</span><h3>El Condado</h3><p>{matrixAddress} · Quito</p><a className="button button-outline-dark" href={matrixMapUrl} target="_blank" rel="noreferrer">Ver ubicación en Google Maps ↗</a></article><article className="location-card location-card-featured"><span className="location-kind">Sucursal</span><h3>Pomasqui</h3><p>Consulta el pin de la sucursal y encuentra la ruta en el mapa.</p><a className="button button-red" href={pomasquiMapUrl} target="_blank" rel="noreferrer">Cómo llegar a Pomasqui ↗</a></article></div><div className="locations-contact"><span>¿Tienes dudas sobre sedes, clases o inscripción?</span><div className="social-links"><a className="text-link" href={whatsappUrl} target="_blank" rel="noreferrer">Escríbenos por WhatsApp <span>→</span></a><a className="text-link" href={instagramUrl} target="_blank" rel="noreferrer">Síguenos en Instagram <span>↗</span></a></div></div></section>
    <section className="home-welcome"><div className="home-welcome-copy"><div className="eyebrow">Desde 2022 · Quito</div><h2>Un camino para crecer y descubrir de lo que eres capaz.</h2><p>Conoce la historia de la Maestra Patricia Túqueres y el propósito que guía al Club Taewoong: formar personas dentro y fuera del dojang.</p><a className="text-link" href="./club.html">Conoce el club <span>→</span></a></div><div className="home-shortcuts"><a href="./programas.html"><span>01</span><strong>Programas</strong><small>Entrenamiento para cada etapa</small></a><a href="./horarios.html"><span>02</span><strong>Horarios</strong><small>Encuentra tu grupo y nivel</small></a><a href="./costos.html"><span>03</span><strong>Inscripción</strong><small>Costos, uniforme y beneficios</small></a></div></section>
    <section className="home-cta"><div><div className="eyebrow">El primer paso</div><h2>Tu formación comienza aquí.</h2></div><a className="button button-primary" href="./horarios.html">Ver horarios</a></section>
  </>;
}

function ClubPage() {
  return <main className="inner-page">
    <section className="club-page"><PageIntro eyebrow="Nuestra historia · Desde 2022" title="Quiénes somos" text="TAEWOONG – Club Especializado Formativo de Taekwondo nace de la pasión por enseñar y formar nuevas generaciones." />
      <div className="about-grid"><div className="about-card"><div className="about-card-label"><span className="about-card-dot" /> TAEWOONG · DESDE 2022</div><div className="about-card-mark" aria-hidden="true">TW</div><div className="about-card-message"><b>Crece con<br /><span>propósito.</span></b><p>Cada cinturón representa un logro. El verdadero propósito es la persona en la que nos convertimos durante el camino.</p></div><div className="about-card-footer">Disciplina <i>·</i> Perseverancia <i>·</i> Integridad</div></div>
        <div className="about-story"><div className="eyebrow">Formación · Disciplina · Valores · Superación</div><h2>Formamos personas dentro y fuera del dojang.</h2><p className="body-copy">La Maestra Patricia Túqueres ha dedicado más de 20 años al Taekwondo y a la formación de nuevas generaciones. TAEWOONG nació en 2022 para compartir esa experiencia y pasión.</p><p className="body-copy">Su trayectoria como Referee Internacional, árbitra de Poomsae y Kyorugi, y líder del grupo de árbitros de la Federación Ecuatoriana de Taekwondo es parte de la esencia del club.</p><p className="body-copy">Nuestra matriz está en El Condado y contamos con una sucursal en Pomasqui. En ambas sedes acompañamos a cada alumno para que crezca, supere sus límites y descubra de lo que es capaz.</p>
          <div className="values"><div className="value"><strong>Disciplina</strong><p>Para avanzar.</p></div><div className="value"><strong>Perseverancia</strong><p>Para no rendirse.</p></div><div className="value"><strong>Integridad</strong><p>Para hacer siempre lo correcto.</p></div></div>
        </div>
      </div>
      <div className="club-promise"><div className="eyebrow">Nuestro compromiso</div><h2>Más que formar cinturones, <em>formamos personas.</em></h2><p>En Taewoong enseñamos Taekwondo con conocimiento, disciplina y humanidad. Queremos que cada estudiante pueda mirar atrás y decir:</p><blockquote>“Aquí aprendí a superarme.”</blockquote></div>
    </section>
  </main>;
}

function ProgramsPage() {
  return <main className="inner-page"><section className="programs-page"><PageIntro eyebrow="Entrenamiento para cada etapa" title="Tu formación comienza aquí." text="Desde los primeros pasos hasta el desarrollo técnico y competitivo, acompañamos a cada alumno en su crecimiento a través del Taekwondo." />
    <div className="program-grid">{classes.map((item) => <article className="card program-card" key={item.number}><div className="number">{item.number} / {item.category}</div><h2>{item.title}</h2><span className="age-label">{item.age}</span><p>{item.text}</p><a className="text-link" href="./horarios.html">Ver horarios <span>→</span></a></article>)}</div>
    <div className="program-note"><strong>¿No sabes en qué nivel comenzar?</strong><p>Escríbenos y te orientaremos para encontrar el grupo que corresponde a la edad, experiencia y proceso del deportista.</p><a className="button button-primary" href="./costos.html#experiencia">Conocer la clase de experiencia</a></div>
  </section></main>;
}

function SchedulePage() {
  return <main className="inner-page"><section className="schedule-section"><PageIntro eyebrow="Sucursal Pomasqui · Quito" title="Horarios de entrenamiento." text="Estos horarios corresponden a la sucursal de Pomasqui. La matriz de El Condado maneja horarios diferentes; contáctanos para consultar su disponibilidad." />
    <div className="schedule-location-link"><span>📍 Horarios de la sucursal Pomasqui</span><a href={pomasquiMapUrl} target="_blank" rel="noreferrer">Ver ubicación ↗</a></div>
    <div className="schedule-grid">{schedules.map((item) => <ScheduleCard item={item} key={item.level} />)}</div>
    <aside className="attendance-note"><span className="attendance-icon">✓</span><div><h2>Modalidad de asistencia</h2><p>En el proceso formativo no competitivo se requiere una asistencia mínima de <strong>3 días por semana</strong>, dentro de los horarios establecidos para cada nivel. Esta frecuencia favorece la continuidad, el aprendizaje técnico y el desarrollo físico y formativo.</p><p>En el nivel competitivo, la frecuencia se determina de acuerdo con los objetivos y la planificación deportiva de cada atleta.</p></div></aside>
    <p className="schedule-footnote">Elige tu horario, entrena con propósito y avanza paso a paso.</p>
  </section></main>;
}

function FeesPage() {
  return <main className="inner-page"><section className="fees-section"><PageIntro eyebrow="Inscripción clara y acompañamiento" title="Costos para empezar tu camino." text="Creemos que el Taekwondo es una herramienta para formar niños y jóvenes con disciplina, respeto, confianza y perseverancia. Conoce nuestra política de inscripción." />
    <div className="fees-grid">
      <article className="fee-card" id="experiencia"><span className="fee-label">Primera visita</span><h2>Clase de experiencia</h2><div className="fee-price">$2</div><p>Conoce nuestra metodología y vive una clase real con el grupo de tu edad y nivel.</p><ul className="check-list">{experiencePoints.map((item) => <li key={item}>{item}</li>)}</ul><p className="fee-note">La clase de experiencia no garantiza la inscripción. Primero buscamos que el estudiante se sienta cómodo y que la disciplina sea adecuada para él o ella.</p></article>
      <article className="fee-card"><span className="fee-label">Una sola vez al ingresar</span><h2>Matrícula</h2><div className="fee-price">$10</div><p>Corresponde al proceso de inscripción y reserva del cupo dentro del grupo.</p><ul className="check-list">{enrollmentIncludes.map((item) => <li key={item}>{item}</li>)}</ul><p className="fee-note">Se paga una sola vez al ingresar. Si el alumno se retira por más de 6 meses, deberá matricularse nuevamente y pagar el valor correspondiente.</p></article>
      <article className="fee-card fee-card-primary"><span className="fee-label">Programa mensual</span><h2>Pensión</h2><div className="fee-price">$30<small> / mes</small></div><p>La pensión mensual reserva el cupo y cubre la planificación del programa de entrenamiento.</p><ul className="check-list"><li>Cancelación dentro de los primeros días de cada mes.</li><li>La mensualidad no depende del número exacto de clases asistidas.</li><li>Las inasistencias personales no generan descuentos ni devoluciones.</li></ul><p className="fee-note">Una ausencia prolongada por una situación justificada podrá evaluarse de manera particular.</p></article>
    </div>
    <div className="uniform-panel"><div><span className="eyebrow">Uniforme e identidad</span><h2>Entrena con el uniforme Taewoong.</h2><p>Durante las primeras clases puedes asistir con ropa deportiva cómoda mientras te adaptas al entrenamiento.</p></div><div className="uniform-prices"><div><span>Dobok Taewoong</span><strong>Desde $45</strong><small>El costo varía según la calidad y la talla.</small></div><div><span>Camiseta oficial</span><strong>$12</strong></div></div></div>
    <div className="benefits-heading"><div className="eyebrow">Beneficios para crecer juntos</div><h2>Entrenar en familia también suma.</h2><p>Consulta qué beneficio aplica a tu familia o grupo.</p></div>
    <div className="benefits-grid">
      <article className="benefit-card"><span className="benefit-number">01</span><h3>Da tu primer paso</h3><p>Beneficio para alumnos nuevos referidos.</p><strong>Matrícula $5</strong><small>O descuento en uniforme. Pensión: $30.</small></article>
      <article className="benefit-card"><span className="benefit-number">02</span><h3>Hermanos o familiares</h3><p>Dos hermanos que entrenan en el club no pagan matrícula.</p><strong>$30 por persona / mes</strong></article>
      <article className="benefit-card"><span className="benefit-number">03</span><h3>Pack para 3</h3><p>Entrena con familiares o amigos.</p><strong>Sin matrícula</strong><small>Pensión de $25 por persona / mes.</small></article>
      <article className="benefit-card"><span className="benefit-number">04</span><h3>Trae un amigo</h3><p>Beneficio para ambos.</p><strong>Descuentos especiales</strong><small>Aplican a matrícula, implementos y uniformes. Pensión: $30.</small></article>
    </div>
  </section></main>;
}

function PoliciesPage() {
  return <main className="inner-page"><section className="policy-section"><PageIntro eyebrow="Información para las familias" title="Políticas del Club Taewoong." text="Un proceso claro, cuidado y compartido para cada estudiante y su familia." />
    <div className="policy-list">
      <details className="policy-item"><summary>Exámenes y ascenso de cinturón<span>+</span></summary><div className="policy-content"><p>El ascenso forma parte del proceso formativo y depende del progreso, la asistencia, la disciplina y el dominio técnico del estudiante. Los exámenes se programan periódicamente y tienen un valor independiente de la pensión. El objetivo es demostrar que cada estudiante está preparado para avanzar, no solo cambiar el color del cinturón.</p></div></details>
      <details className="policy-item"><summary>Competencias y actividades<span>+</span></summary><div className="policy-content"><p>La participación en competencias, festivales, seminarios y actividades externas es voluntaria. Puede tener costos adicionales de inscripción, transporte, alimentación, implementos u otros. La participación competitiva dependerá del nivel, la preparación y las características de cada estudiante.</p></div></details>
      <details className="policy-item"><summary>Compromiso de las familias<span>+</span></summary><div className="policy-content"><p>El progreso de un estudiante también se fortalece con el acompañamiento de su familia. Les invitamos a apoyar el proceso respetando:</p><ul className="check-list">{familyCommitments.map((item) => <li key={item}>{item}</li>)}</ul></div></details>
      <details className="policy-item"><summary>Privacidad y uso de imagen<span>+</span></summary><div className="policy-content"><p>En Club Taewoong protegemos la privacidad y seguridad de nuestros estudiantes y sus familias. Los datos personales proporcionados se utilizarán exclusivamente para fines administrativos, deportivos y de comunicación relacionados con las actividades del club, procurando mantenerlos protegidos y confidenciales.</p><p>Durante clases, entrenamientos, exámenes, competencias y eventos podrán captarse fotografías o videos con fines institucionales y deportivos. Su publicación en redes sociales, página web o material promocional estará sujeta a la autorización correspondiente.</p><p>En el caso de niños, niñas y adolescentes, el padre, madre o representante legal podrá elegir expresamente entre <strong>“Sí autorizo”</strong> y <strong>“No autorizo”</strong> el uso de imagen. La autorización es voluntaria y no condiciona la inscripción, participación ni permanencia en el club.</p><p>Para consultas o solicitudes relacionadas con datos personales o uso de imagen, puede comunicarse directamente con Club Taewoong.</p></div></details>
    </div>
  </section></main>;
}

function App() {
  const filename = window.location.pathname.split('/').pop() || 'index.html';
  const routes = {
    'index.html': ['home', <HomePage />],
    'club.html': ['club', <ClubPage />],
    'programas.html': ['programas', <ProgramsPage />],
    'horarios.html': ['horarios', <SchedulePage />],
    'costos.html': ['costos', <FeesPage />],
    'politicas.html': ['politicas', <PoliciesPage />],
  };
  const [current, page] = routes[filename] || routes['index.html'];
  return <><Header current={current} />{page}<Footer /></>;
}

export default App;
