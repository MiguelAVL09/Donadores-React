import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DB } from '../core/supabase';

export default function Registro() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: '', curp: '', correo: '', telefono: '', sangre: '', pass: '', confirm: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.pass !== formData.confirm) return alert("Las contraseñas no coinciden.");
        setLoading(true);

        const { data } = await DB.supabase.from('users').select('*').eq('curp', formData.curp).single();
        if (data) {
            setLoading(false);
            return alert("Este CURP ya está registrado.");
        }

        const newUser = {
            curp: formData.curp,
            nombre: formData.nombre,
            correo: formData.correo,
            telefono: formData.telefono,
            sangre: formData.sangre,
            password: formData.pass,
            rol: 'donador',
            aceptoAviso: false,
            cuestionario: false,
            puntos: 0,
            nivel: 'Novato'
        };

        const { error } = await DB.supabase.from('users').insert([newUser]);

        if (!error) {
            alert("¡Registro Exitoso! Inicia sesión para continuar.");
            navigate('/');
        } else {
            alert("Error al registrar: " + error.message);
        }
        setLoading(false);
    };

    return (
        <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: '100vh' }}>
            <div className="card shadow p-5 border-0" style={{ width: '500px', borderRadius: '15px' }}>
                <h2 className="text-center mb-4 text-danger fw-bold">Únete a la Causa 🩸</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" id="nombre" className="form-control mb-2" placeholder="Nombre Completo" onChange={handleChange} required />
                    <input type="text" id="curp" className="form-control mb-2" placeholder="CURP" onChange={handleChange} required />
                    <input type="email" id="correo" className="form-control mb-2" placeholder="Correo Electrónico" onChange={handleChange} required />
                    <input type="tel" id="telefono" className="form-control mb-2" placeholder="Teléfono Celular" onChange={handleChange} required />

                    <select id="sangre" className="form-select mb-2" onChange={handleChange} required>
                        <option value="">Tipo de Sangre...</option>
                        {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    <input type="password" id="pass" className="form-control mb-2" placeholder="Contraseña" onChange={handleChange} required />
                    <input type="password" id="confirm" className="form-control mb-4" placeholder="Confirmar Contraseña" onChange={handleChange} required />

                    <button type="submit" className="btn btn-danger w-100 fw-bold" disabled={loading}>
                        {loading ? 'Registrando...' : 'Crear Cuenta'}
                    </button>
                </form>
                <div className="text-center mt-3">
                    <Link to="/" className="text-decoration-none text-muted">¿Ya tienes cuenta? Ingresa aquí</Link>
                </div>
            </div>
        </div>
    );
}