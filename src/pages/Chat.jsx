import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { DB } from '../core/supabase';

export default function Chat() {
    const [searchParams] = useSearchParams();
    const hospital = searchParams.get('hospital');
    const reqId = searchParams.get('reqId');
    const pacienteNombre = searchParams.get('paciente') || 'el paciente';
    const user = JSON.parse(sessionStorage.getItem('currentUser')) || {};

    const [mensajes, setMensajes] = useState([]);
    const [input, setInput] = useState('');
    const [paso, setPaso] = useState(0);
    const chatEndRef = useRef(null);

    const addBotMsg = (text) => setMensajes(prev => [...prev, { text, isBot: true }]);
    const addUserMsg = (text) => setMensajes(prev => [...prev, { text, isBot: false }]);

    useEffect(() => {
        setTimeout(() => addBotMsg(`¡Hola ${user.nombre.split(' ')[0]}! Soy tu asistente de donación. 🤖`), 500);
        setTimeout(() => addBotMsg(`Estás a punto de aceptar donar para <b>${pacienteNombre}</b> en el <b>${hospital}</b>.`), 1500);
        setTimeout(() => addBotMsg(`¿Estás seguro que puedes asistir mañana? (Escribe 'Si')`), 2500);
    }, []);

    useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), [mensajes]);

    const handleSend = () => {
        if (!input.trim()) return;
        const msg = input.trim();
        addUserMsg(msg);
        setInput('');
        setTimeout(() => procesarRespuesta(msg.toLowerCase()), 800);
    };

    const procesarRespuesta = async (m) => {
        if (paso === 0) {
            if (m.includes('si') || m.includes('sí') || m.includes('claro')) {
                addBotMsg("¡Perfecto! Estoy reservando tu lugar en el sistema...");

                try {
                    // 1. Verificar y descontar unidad en la BD
                    const { data: solicitud } = await DB.supabase.from('solicitudes').select('*').eq('id', reqId).single();

                    if (solicitud && solicitud.unidades_necesarias > 0) {
                        const nuevasUnidades = solicitud.unidades_necesarias - 1;
                        const nuevoEstatus = nuevasUnidades <= 0 ? 'completada' : 'activa';

                        await DB.supabase.from('solicitudes')
                            .update({ unidades_necesarias: nuevasUnidades, estatus: nuevoEstatus })
                            .eq('id', reqId);

                        // 2. Guardar cita en el usuario
                        const nuevaCita = {
                            hospital: hospital,
                            fecha: new Date().toLocaleDateString(),
                            paciente: pacienteNombre,
                            solicitudId: reqId
                        };

                        const updatedUser = { ...user, citaActiva: nuevaCita };
                        await DB.supabase.from('users').update({ citaActiva: nuevaCita }).eq('curp', user.curp);
                        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));

                        addBotMsg(`✅ <b>¡Confirmado!</b><br>Te esperamos en ${hospital}.<br>Menciona que vas a donar para: ${pacienteNombre}.`);
                        addBotMsg("¡Eres un héroe! Nos vemos.");
                        setPaso(99); // Fin
                    } else {
                        addBotMsg("❌ Lo siento, parece que esta solicitud ya fue cubierta por otro héroe hace un momento.");
                        setPaso(99);
                    }
                } catch (e) {
                    addBotMsg("Ocurrió un error de conexión. Intenta nuevamente.");
                }
            } else {
                addBotMsg("Entendido. Cancelamos el proceso. No te preocupes, puedes volver cuando estés listo.");
                setPaso(99);
            }
        }
    };

    return (
        <div className="container py-5">
            <div className="card shadow-lg border-0 mx-auto" style={{ maxWidth: '600px', borderRadius: '20px' }}>
                <div className="card-header bg-danger text-white text-center fw-bold py-3" style={{ borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                    Asistente Virtual
                </div>
                <div className="card-body bg-light" style={{ height: '400px', overflowY: 'auto' }}>
                    {mensajes.map((msg, idx) => (
                        <div key={idx} className={`d-flex ${msg.isBot ? 'justify-content-start' : 'justify-content-end'} mb-3`}>
                            <div className={`p-3 rounded-4 shadow-sm ${msg.isBot ? 'bg-white text-dark' : 'bg-primary text-white'}`} style={{ maxWidth: '80%' }}>
                                <span dangerouslySetInnerHTML={{ __html: msg.text }} />
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
                {paso !== 99 && (
                    <div className="card-footer bg-white p-3">
                        <div className="input-group">
                            <input type="text" className="form-control border-0 bg-light" placeholder="Escribe tu respuesta..." value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} />
                            <button className="btn btn-danger rounded-circle ms-2" style={{ width: '45px', height: '45px' }} onClick={handleSend}>➤</button>
                        </div>
                    </div>
                )}
                {paso === 99 && (
                    <div className="card-footer bg-white p-3">
                        <Link to="/dashboard" className="btn btn-outline-dark w-100 rounded-pill">Volver al Inicio</Link>
                    </div>
                )}
            </div>
        </div>
    );
}