import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase.js';

function publicImage(path) {
  const { data } = supabase.storage.from('gallery-photos').getPublicUrl(path);
  return data.publicUrl;
}

export default function GalleryManager({ instructorId }) {
  const [photos, setPhotos] = useState([]);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [permission, setPermission] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const refresh = async () => {
    const { data, error: queryError } = await supabase.from('gallery_photos').select('id,storage_path,caption,created_at').eq('published', true).order('created_at', { ascending: false });
    if (queryError) { setError('No se pudo cargar la galería. Comprueba que esté aplicada la migración de fotos.'); return; }
    setPhotos(data || []); setError('');
  };
  useEffect(() => { refresh(); }, []);

  const upload = async (event) => {
    event.preventDefault();
    if (!file || !permission) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) { setError('Elige una foto JPG, PNG o WebP de máximo 8 MB.'); return; }
    setBusy(true); setError(''); setFeedback('');
    const safeName = file.name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]/g, '-').slice(-90);
    const storagePath = `${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from('gallery-photos').upload(storagePath, file, { contentType: file.type, upsert: false });
    if (uploadError) { setBusy(false); setError('No se pudo subir la foto. ' + uploadError.message); return; }
    const { error: insertError } = await supabase.from('gallery_photos').insert({ instructor_id: instructorId, storage_path: storagePath, caption: caption.trim() || null, published: true });
    if (insertError) {
      await supabase.storage.from('gallery-photos').remove([storagePath]);
      setBusy(false); setError('La foto se subió pero no se pudo publicar. ' + insertError.message); return;
    }
    setFile(null); setCaption(''); setPermission(false); event.target.reset();
    await refresh(); setBusy(false); setFeedback('Foto publicada en la galería del sitio.');
  };

  const remove = async (photo) => {
    if (!window.confirm('¿Retirar esta foto de la galería pública?')) return;
    setBusy(true); setError(''); setFeedback('');
    const { error: rowError } = await supabase.from('gallery_photos').delete().eq('id', photo.id);
    if (rowError) { setBusy(false); setError('No se pudo retirar la foto. ' + rowError.message); return; }
    const { error: fileError } = await supabase.storage.from('gallery-photos').remove([photo.storage_path]);
    await refresh(); setBusy(false);
    setFeedback(fileError ? 'Se retiró de la web; el archivo quedó guardado en Storage.' : 'Foto retirada de la galería.');
  };

  return <div className="instructor-area-content"><section className="classroom-panel"><div className="classroom-panel-heading"><div><span className="eyebrow">Galería · sitio público</span><h2>Publicar fotografías</h2><p>Las fotos publicadas aparecerán en la galería de la página principal.</p></div><span className="classroom-panel-number">{String(photos.length).padStart(2, '0')}</span></div><form className="classroom-form classroom-grid-form" onSubmit={upload}><label className="classroom-full-field">Fotografía (JPG, PNG o WebP · máximo 8 MB)<input type="file" accept="image/jpeg,image/png,image/webp" required onChange={(event) => setFile(event.target.files?.[0] || null)} /></label><label className="classroom-full-field">Texto alternativo / descripción<input value={caption} onChange={(event) => setCaption(event.target.value)} maxLength="180" placeholder="Ej.: Estudiantes practicando poomsae en Pomasqui" /></label><label className="gallery-permission classroom-full-field"><input type="checkbox" checked={permission} onChange={(event) => setPermission(event.target.checked)} /><span>Confirmo que cuento con autorización para publicar la imagen de las personas que aparecen en esta fotografía.</span></label><button className="button button-primary classroom-submit" disabled={busy || !file || !permission}>{busy ? 'Publicando…' : 'Publicar en la galería'} <span>↑</span></button></form>{feedback && <p className="classroom-success" role="status">{feedback}</p>}{error && <p className="classroom-error" role="alert">{error}</p>}</section><section className="classroom-panel"><div className="classroom-panel-heading"><div><span className="eyebrow">Fotos visibles en la web</span><h2>Administrar galería</h2><p>Retira cualquier imagen que ya no quieras mostrar.</p></div></div>{photos.length ? <div className="gallery-admin-grid">{photos.map((photo) => <article key={photo.id}><img src={publicImage(photo.storage_path)} alt={photo.caption || 'Fotografía publicada en la galería'} /><div><small>{photo.caption || 'Sin descripción'}</small><button type="button" className="student-photo-remove" disabled={busy} onClick={() => remove(photo)}>Retirar foto</button></div></article>)}</div> : <div className="classroom-empty">Aún no hay fotografías añadidas desde el panel. Las fotos originales del sitio seguirán visibles.</div>}</section></div>;
}
