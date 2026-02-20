import { useEffect, useState } from 'react';
import { DB } from '../core/supabase';

export default function Perfil() {
    const [user, setUser] = useState({});
    const [uploading, setUploading] = useState(false);
    // Estado extra para forzar refresco de imagen visualmente
    const [imgKey, setImgKey] = useState(Date.now());

    useEffect(() => {
        const cargarUser = async () => {
            const localUser = JSON.parse(localStorage.getItem('currentUser'));
            if (localUser) {
                // Pedimos datos frescos a Supabase para asegurar que tenemos la foto real
                const { data } = await DB.supabase
                    .from('users')
                    .select('*')
                    .eq('curp', localUser.curp)
                    .single();

                if (data) {
                    setUser(data);
                    // Actualizamos localStorage para que el Header también se entere
                    localStorage.setItem('currentUser', JSON.stringify(data));
                }
            }
        };
        cargarUser();
    }, []);

    const subirAvatar = async (event) => {
        try {
            setUploading(true);
            const file = event.target.files[0];
            if (!file) return;

            // Nombre único para el archivo
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.curp}.${fileExt}`; // Usamos CURP fijo para reemplazar la anterior
            const filePath = `${fileName}`;

            // 1. Subir (upsert: true reemplaza si ya existe)
            const { error: uploadError } = await DB.supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // 2. Obtener URL Pública
            const { data } = DB.supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Truco: Agregamos ?t=tiempo para que el navegador no use la caché vieja
            const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

            // 3. Actualizar Usuario en BD
            const { error: updateError } = await DB.supabase
                .from('users')
                .update({ avatar_url: publicUrl })
                .eq('curp', user.curp);

            if (updateError) throw updateError;

            // 4. Actualizar estado local y navegador
            const updatedUser = { ...user, avatar_url: publicUrl };
            setUser(updatedUser);
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            setImgKey(Date.now()); // Forzar re-render de la imagen

            alert("¡Foto actualizada con éxito!");
            // Opcional: Recargar página para actualizar el Header
            window.location.reload();

        } catch (error) {
            console.error(error);
            alert("Error subiendo imagen: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    // Usamos 'puntos' en minúscula (asegúrate de cambiarlo en Supabase)
    const puntos = user.puntos || 0;

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card border-0 shadow-sm text-center p-4">
                        <div className="position-relative mx-auto mb-3" style={{ width: '150px', height: '150px' }}>
                            <img
                                key={imgKey} // Clave para forzar actualización
                                src={user.avatar_url || "https://placehold.co/150x150?text=Sin+Foto"}
                                className="rounded-circle w-100 h-100 object-fit-cover border border-4 border-white shadow"
                                alt="Avatar"
                                onError={(e) => { e.target.src = "https://placehold.co/150x150?text=Error"; }}
                            />
                            <label htmlFor="upload" className="btn btn-dark btn-sm rounded-circle position-absolute bottom-0 end-0 shadow" style={{ cursor: 'pointer', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                📷
                            </label>
                            <input type="file" id="upload" hidden onChange={subirAvatar} disabled={uploading} />
                        </div>
                        {uploading && <small className="text-danger fw-bold">Subiendo... espera...</small>}

                        <h3 className="fw-bold mt-2">{user.nombre}</h3>
                        <span className="badge bg-danger rounded-pill px-3 py-2 mb-3">Sangre {user.sangre}</span>
                        <p className="text-muted small">Miembro desde 2026</p>
                    </div>
                </div>

                <div className="col-md-7">
                    <div className="card border-0 shadow-sm p-4 mb-4">
                        <h4 className="fw-bold text-danger">Estadísticas</h4>
                        <div className="row text-center mt-3">
                            <div className="col-6 border-end">
                                <h2 className="fw-bold mb-0">{puntos}</h2>
                                <small className="text-muted text-uppercase">Puntos XP</small>
                            </div>
                            <div className="col-6">
                                <h2 className="fw-bold mb-0">{user.nivel || 'Novato'}</h2>
                                <small className="text-muted text-uppercase">Rango Actual</small>
                            </div>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm p-4">
                        <h4 className="fw-bold mb-3">Medallero</h4>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <div className={`p-3 border rounded ${puntos >= 100 ? 'bg-warning-subtle border-warning' : 'bg-light text-muted'}`}>
                                    <h5>🩸 Primer Donante</h5>
                                    <small>Realiza tu primera donación (100 XP)</small>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className={`p-3 border rounded ${puntos >= 300 ? 'bg-success-subtle border-success' : 'bg-light text-muted'}`}>
                                    <h5>🦸 Súper Héroe</h5>
                                    <small>Acumula 3 donaciones (300 XP)</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}