import { useEffect, useState } from 'react';
import AulaPage from './AulaPage.jsx';

const navigation = [
  ['Inicio', './index.html', 'home'],
  ['El club', './club.html', 'club'],
  ['Programas', './programas.html', 'programas'],
  ['Horarios', './horarios.html', 'horarios'],
  ['Costos', './costos.html', 'costos'],
  ['Políticas', './politicas.html', 'politicas'],
  ['Aula virtual', './aula.html', 'aula'],
  ['Galería', './index.html#galeria', 'galeria'],
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
const galleryImages = Object.entries(import.meta.glob('../fotos/*.jfif', { eager: true, query: '?url', import: 'default' })).sort(([first], [second]) => first.localeCompare(second)).map(([path, src], index) => ({ src, alt: 'Actividad de Taekwondo en Club Taewoong, foto ' + (index + 1) }));

const experiencePoints = ['Conocer el dojang y al instructor.', 'Integrarse al grupo de su edad y nivel.', 'Experimentar una clase real de Taekwondo.', 'Conocer nuestra metodología y nuestros valores.'];
const enrollmentIncludes = ['Registro del estudiante.', 'Organización de su ficha deportiva.', 'Ingreso formal al programa de entrenamiento.', 'Orientación inicial a padres y representantes.'];
const familyCommitments = ['La puntualidad y la asistencia constante.', 'El respeto hacia instructores y compañeros.', 'El cuidado del uniforme y las instalaciones.', 'El cumplimiento de las normas del club.', 'La disciplina dentro y fuera del dojang.'];

function Header({ current, onEnroll }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <>
    <div className="topbar"><span>📍 Matriz: El Condado · Sucursal: Pomasqui</span><span>Clase de experiencia · $2</span></div>
    <header className="site-header">
      <a className="brand" href="./index.html" aria-label="TAE WOONG, inicio"><img className="brand-logo" src="/taekwondo-logo.png" alt="Logo de TAE WOONG" /><span className="brand-copy"><strong>TAE WOONG</strong><small>Club especializado formativo<br />de Taekwondo</small></span></a>
      <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? '×' : '☰'}<span>Menú</span></button>
      <nav className={menuOpen ? 'site-nav nav-open' : 'site-nav'} aria-label="Navegación principal">
        {navigation.map(([label, href, key]) => <a key={key} className={current === key ? 'nav-link active' : 'nav-link'} href={href}>{label}</a>)}
        <button className="button button-primary nav-cta" type="button" onClick={() => { setMenuOpen(false); onEnroll(); }}>Inscríbete</button>
      </nav>
    </header>
  </>;
}

function Footer() {
  return <footer className="site-footer"><span>© 2026 TAE WOONG · Club Especializado Formativo de Taekwondo</span><a href="./politicas.html">Privacidad y uso de imagen</a><a href="./aula.html">Aula virtual</a><a href={instagramUrl} target="_blank" rel="noreferrer">Instagram</a><a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a><span>Formación · Disciplina · Valores · Superación</span></footer>;
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

function GallerySection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const activeImage = galleryImages[activeIndex];
  const visibleThumbnails = Array.from({ length: Math.min(5, galleryImages.length) }, (_, offset) => (activeIndex + offset - 2 + galleryImages.length) % galleryImages.length);
  const moveImage = (step) => setActiveIndex((index) => (index + step + galleryImages.length) % galleryImages.length);

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const handleKeys = (event) => {
      if (event.key === 'Escape') setLightboxOpen(false);
      if (event.key === 'ArrowLeft') moveImage(-1);
      if (event.key === 'ArrowRight') moveImage(1);
    };
    document.addEventListener('keydown', handleKeys);
    document.body.classList.add('gallery-open');
    return () => {
      document.removeEventListener('keydown', handleKeys);
      document.body.classList.remove('gallery-open');
    };
  }, [lightboxOpen]);

  if (!activeImage) return null;
  const imageCount = String(galleryImages.length).padStart(2, '0');
  const currentCount = String(activeIndex + 1).padStart(2, '0');
  const progress = ((activeIndex + 1) / galleryImages.length) * 100;

  return <section className="gallery-section" id="galeria">
    <div className="gallery-heading">
      <div><div className="eyebrow">La vida en el dojang</div><h2>Crece en cada movimiento.</h2><p>Entrenamientos, compañerismo y pequeños logros que construyen grandes caminos.</p></div>
      <div className="gallery-heading-mark"><span>TAEWOONG</span><strong>{imageCount}</strong><small>momentos<br />para recordar</small></div>
    </div>
    <div className="gallery-layout">
      <div className="gallery-stage">
        <button className="gallery-feature-image" type="button" onClick={() => setLightboxOpen(true)} aria-label="Ampliar fotografía actual">
          <img key={activeImage.src} src={activeImage.src} alt={activeImage.alt} />
          <span className="gallery-image-shade" />
          <span className="gallery-feature-copy"><small>FORMACIÓN · DISCIPLINA · VALORES</small><strong>Más que un deporte.<br /><em>Un estilo de vida.</em></strong></span>
        </button>
        <button className="gallery-arrow gallery-arrow-prev" type="button" onClick={() => moveImage(-1)} aria-label="Fotografía anterior">‹</button>
        <button className="gallery-arrow gallery-arrow-next" type="button" onClick={() => moveImage(1)} aria-label="Fotografía siguiente">›</button>
        <div className="gallery-stage-count"><strong>{currentCount}</strong><span>/ {imageCount}</span></div>
      </div>
      <aside className="gallery-side">
        <div className="gallery-side-copy"><span className="gallery-kicker">Un paso a la vez</span><h3>Disciplina que se vive.<br /><em>Confianza que crece.</em></h3><p>Cada clase es una oportunidad para aprender, esforzarse y celebrar el camino junto al equipo.</p></div>
        <div className="gallery-progress" role="progressbar" aria-label="Progreso de la galería" aria-valuenow={activeIndex + 1} aria-valuemin="1" aria-valuemax={galleryImages.length}><span style={{ width: progress + '%' }} /></div>
        <div className="gallery-thumb-heading"><span>Explora los momentos</span><span>{currentCount} / {imageCount}</span></div>
        <div className="gallery-thumbnails">{visibleThumbnails.map((index) => <button className={index === activeIndex ? 'gallery-thumb active' : 'gallery-thumb'} type="button" key={galleryImages[index].src} onClick={() => setActiveIndex(index)} aria-label={'Mostrar fotografía ' + (index + 1)} aria-current={index === activeIndex ? 'true' : undefined}><img src={galleryImages[index].src} alt="" loading="lazy" /><span>{String(index + 1).padStart(2, '0')}</span></button>)}</div>
        <button className="gallery-expand" type="button" onClick={() => setShowAll(!showAll)}>{showAll ? 'Ocultar galería completa' : 'Ver todas las fotografías'}<span>{showAll ? '−' : '+'}</span></button>
      </aside>
    </div>
    {showAll && <div className="gallery-all-grid">{galleryImages.map((image, index) => <button className="gallery-all-item" type="button" key={image.src} onClick={() => { setActiveIndex(index); setLightboxOpen(true); }} aria-label={'Abrir fotografía ' + (index + 1)}><img src={image.src} alt={image.alt} loading="lazy" /><span>{String(index + 1).padStart(2, '0')}</span></button>)}</div>}
    {lightboxOpen && <div className="gallery-lightbox" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setLightboxOpen(false); }}><div className="gallery-lightbox-panel" role="dialog" aria-modal="true" aria-label="Galería de fotografías"><button className="gallery-close" type="button" onClick={() => setLightboxOpen(false)} aria-label="Cerrar galería">×</button><button className="gallery-lightbox-arrow gallery-lightbox-prev" type="button" onClick={() => moveImage(-1)} aria-label="Fotografía anterior">‹</button><img src={activeImage.src} alt={activeImage.alt} /><button className="gallery-lightbox-arrow gallery-lightbox-next" type="button" onClick={() => moveImage(1)} aria-label="Fotografía siguiente">›</button><span className="gallery-lightbox-count">{currentCount} / {imageCount}</span></div></div>}
  </section>;
}
function EnrollmentModal({ onClose }) {
  const [accepted, setAccepted] = useState(false);
  const enrollmentMessage = 'Hola, he leído y acepto los términos y condiciones del Club Taewoong. Quiero continuar con el proceso de inscripción.';
  const enrollmentUrl = 'https://wa.me/593997984504?text=' + encodeURIComponent(enrollmentMessage);
  return <div className="enrollment-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="enrollment-modal" role="dialog" aria-modal="true" aria-labelledby="enrollment-title">
      <button className="enrollment-close" type="button" onClick={onClose} aria-label="Cerrar términos">×</button>
      <div className="eyebrow">Antes de continuar</div><h2 id="enrollment-title">Términos y condiciones de inscripción</h2>
      <div className="terms-scroll">
        <h3>1. Clase de experiencia</h3><p>La clase de experiencia tiene un valor de $2 y permite conocer el dojang, al instructor, el grupo correspondiente y la metodología del club. No garantiza la inscripción.</p>
        <h3>2. Matrícula y pensión</h3><p>La matrícula es de $10 y se paga una sola vez al ingresar. Si el alumno se retira por más de 6 meses, deberá matricularse nuevamente. La pensión mensual es de $30 y debe cancelarse dentro de los primeros días de cada mes.</p>
        <h3>3. Asistencia y pagos</h3><p>El proceso formativo requiere una asistencia mínima de 3 días por semana. La pensión reserva el cupo y cubre la planificación mensual; las inasistencias personales no generan descuentos ni devoluciones. Las ausencias prolongadas justificadas podrán evaluarse de manera particular.</p>
        <h3>4. Uniformes, exámenes y actividades</h3><p>El dobok Taewoong cuesta desde $45, según calidad y talla, y la camiseta oficial cuesta $12. Los exámenes de ascenso tienen un valor independiente. Competencias, seminarios y actividades externas son voluntarios y pueden tener costos adicionales.</p>
        <h3>5. Beneficios familiares</h3><p>Los beneficios para hermanos, familiares, grupos y alumnos referidos dependen de las condiciones descritas en la página de costos y deben confirmarse con el club al momento de la inscripción.</p>
        <h3>6. Compromiso de estudiantes y familias</h3><p>La familia acompañará el proceso procurando puntualidad, asistencia constante, respeto a instructores y compañeros, cuidado del uniforme e instalaciones, y cumplimiento de las normas del club.</p>
        <h3>7. Privacidad y uso de imagen</h3><p>Los datos personales se utilizarán para fines administrativos, deportivos y de comunicación del club. La autorización para publicar imágenes es voluntaria y se solicita por separado. Para menores de edad debe decidir su padre, madre o representante legal. Aceptar estos términos no autoriza el uso de imagen.</p>
        <p>Revisa también las <a href="./costos.html" target="_blank" rel="noreferrer">condiciones y tarifas</a> y la <a href="./politicas.html" target="_blank" rel="noreferrer">política de privacidad</a>.</p>
      </div>
      <label className="terms-accept"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} /><span>He leído y acepto los términos y condiciones de inscripción del Club Taewoong.</span></label>
      <p className="terms-separate-consent">El uso de imagen requiere una autorización independiente; esta casilla no la concede.</p>
      <div className="enrollment-actions"><button className="button button-outline-dark" type="button" onClick={onClose}>Volver</button><a className={accepted ? 'button button-primary' : 'button button-disabled'} href={accepted ? enrollmentUrl : undefined} target={accepted ? '_blank' : undefined} rel={accepted ? 'noreferrer' : undefined} aria-disabled={!accepted} onClick={(event) => { if (!accepted) event.preventDefault(); }}>Aceptar y continuar por WhatsApp</a></div>
    </section>
  </div>;
}
function HomePage({ onEnroll }) {
  return <>
    <section className="hero home-hero">
      <div className="hero-copy"><div className="eyebrow">Disciplina · Perseverancia · Integridad</div><h1>Más que un deporte,<br /><em>un estilo de vida.</em></h1><p>Taekwondo para niñas, niños, jóvenes y adultos. Aprende, mejora tu condición física y gana confianza paso a paso, en un ambiente seguro y respetuoso.</p><div className="actions"><a className="button button-primary" href="./costos.html#experiencia">Agenda tu clase de experiencia · $2</a><a className="button button-outline" href="./programas.html">Conoce los programas</a><button className="button button-primary" type="button" onClick={onEnroll}>Inscríbete</button></div></div>
      <div className="hero-badge"><img className="hero-logo" src="/taekwondo-logo.png" alt="TAE WOONG, Club Especializado Formativo de Taekwondo" /></div>
    </section>
    <div className="trust"><span>🥋 Grupos por edad y nivel</span><span>📍 Matriz: El Condado · Sucursal: Pomasqui</span><span>⭐ Clase de experiencia · $2</span></div>
    <section className="locations-section" id="sedes"><div className="locations-heading"><div className="eyebrow">Encuéntranos en Quito</div><h2>Dos sedes, el mismo propósito.</h2><p>Elige la sede y consulta cómo llegar. Los horarios publicados corresponden a Pomasqui.</p></div><div className="locations-grid"><article className="location-card"><span className="location-kind">Matriz</span><h3>El Condado</h3><p>{matrixAddress} · Quito</p><a className="button button-outline-dark" href={matrixMapUrl} target="_blank" rel="noreferrer">Ver ubicación en Google Maps ↗</a></article><article className="location-card location-card-featured"><span className="location-kind">Sucursal</span><h3>Pomasqui</h3><p>Consulta el pin de la sucursal y encuentra la ruta en el mapa.</p><a className="button button-red" href={pomasquiMapUrl} target="_blank" rel="noreferrer">Cómo llegar a Pomasqui ↗</a></article></div><div className="locations-contact"><span>¿Tienes dudas sobre sedes, clases o inscripción?</span><div className="social-links"><a className="text-link" href={whatsappUrl} target="_blank" rel="noreferrer">Escríbenos por WhatsApp <span>→</span></a><a className="text-link" href={instagramUrl} target="_blank" rel="noreferrer">Síguenos en Instagram <span>↗</span></a></div></div></section>
    <section className="home-welcome"><div className="home-welcome-copy"><div className="eyebrow">Desde 2022 · Quito</div><h2>Un camino para crecer y descubrir de lo que eres capaz.</h2><p>Conoce la historia de la Maestra Patricia Túqueres y el propósito que guía al Club Taewoong: formar personas dentro y fuera del dojang.</p><a className="text-link" href="./club.html">Conoce el club <span>→</span></a></div><div className="home-shortcuts"><a href="./programas.html"><span>01</span><strong>Programas</strong><small>Entrenamiento para cada etapa</small></a><a href="./horarios.html"><span>02</span><strong>Horarios</strong><small>Encuentra tu grupo y nivel</small></a><a href="./costos.html"><span>03</span><strong>Inscripción</strong><small>Costos, uniforme y beneficios</small></a></div></section>
    <GallerySection />
    <section className="home-cta"><div><div className="eyebrow">El primer paso</div><h2>Tu formación comienza aquí.</h2></div><div className="actions"><a className="button button-outline-dark" href="./horarios.html">Ver horarios</a><button className="button button-primary" type="button" onClick={onEnroll}>Inscríbete</button></div></section>
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
  const [enrollmentOpen, setEnrollmentOpen] = useState(false);
  const openEnrollment = () => setEnrollmentOpen(true);
  const closeEnrollment = () => setEnrollmentOpen(false);
  const filename = window.location.pathname.split('/').pop() || 'index.html';
  const routes = {
    'index.html': ['home', <HomePage onEnroll={openEnrollment} />],
    'club.html': ['club', <ClubPage />],
    'programas.html': ['programas', <ProgramsPage />],
    'horarios.html': ['horarios', <SchedulePage />],
    'costos.html': ['costos', <FeesPage />],
    'politicas.html': ['politicas', <PoliciesPage />],
    'aula.html': ['aula', <AulaPage />],
  };
  const [current, page] = routes[filename] || routes['index.html'];
  return <><Header current={current} onEnroll={openEnrollment} />{page}<Footer />{enrollmentOpen && <EnrollmentModal onClose={closeEnrollment} />}</>;
}

export default App;

