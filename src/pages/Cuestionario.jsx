import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DB } from '../core/supabase';

export default function Cuestionario() {
    const navigate = useNavigate();
    const [answers, setAnswers] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Lógica simple: Si contesta "Sí" a enfermedades (p3), rechazar.
        if (answers.p3 === 'Si') {
            alert("⚠️ Por seguridad médica, no puedes donar en este momento. Consulta a un especialista.");
            return;
        }

        // Aprobar usuario
        const user = JSON.parse(sessionStorage.getItem('currentUser'));
        await DB.supabase.from('users').update({ cuestionario: true }).eq('curp', user.curp);

        // Actualizar sesión local
        const updatedUser = { ...user, cuestionario: true };
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));

        alert("✅ ¡Excelente! Eres apto para ser un héroe.");
        navigate('/dashboard');
    };

    const handleOption = (q, val) => setAnswers({ ...answers, [q]: val });

    return (
        <div className="container py-5 d-flex justify-content-center">
            <div className="card shadow-lg p-5" style={{ maxWidth: '700px', borderRadius: '20px' }}>
                <h2 className="text-center text-primary mb-4">🩺 Filtro de Salud</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="fw-bold mb-2">1. ¿Eres mayor de 18 años?</label><br />
                        <input type="radio" name="p1" onChange={() => handleOption('p1', 'Si')} required /> Sí &nbsp;
                        <input type="radio" name="p1" onChange={() => handleOption('p1', 'No')} /> No
                    </div>
                    <div className="mb-4">
                        <label className="fw-bold mb-2">2. ¿Pesas más de 50kg?</label><br />
                        <input type="radio" name="p2" onChange={() => handleOption('p2', 'Si')} required /> Sí &nbsp;
                        <input type="radio" name="p2" onChange={() => handleOption('p2', 'No')} /> No
                    </div>
                    <div className="mb-4">
                        <label className="fw-bold mb-2">3. ¿Padeces alguna enfermedad crónica transmisible por sangre (Hepatitis, VIH)?</label><br />
                        <input type="radio" name="p3" onChange={() => handleOption('p3', 'Si')} required /> Sí &nbsp;
                        <input type="radio" name="p3" onChange={() => handleOption('p3', 'No')} /> No
                    </div>
                    <button className="btn btn-primary w-100 fw-bold py-2 mt-3">Enviar Respuestas</button>
                </form>
            </div>
        </div>
    );
}