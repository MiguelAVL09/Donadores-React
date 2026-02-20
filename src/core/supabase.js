import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://actngtevzjyuwxhxhdqh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjdG5ndGV2emp5dXd4aHhoZHFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NzA5NDksImV4cCI6MjA4NjM0Njk0OX0.v6ExK23ui9dng06FIrDPUlFrNM0glQI7zVG7JAsdLS8';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const DB = {
    supabase: supabase,

    saveUser: async (newUser) => {
        const { error } = await supabase.from('users').insert([newUser]);
        if (error) console.error("Error guardando usuario:", error.message);
        return !error;
    },

    findUser: async (curp, password) => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('curp', curp)
            .eq('password', password)
            .single();

        if (error && error.code !== 'PGRST116') console.error("Error Login:", error.message);
        return data;
    },

    exists: async (curp, correo) => {
        if (!curp) return false;

        const { data, error } = await supabase
            .from('users')
            .select('curp')
            .or(`curp.eq.${curp},correo.eq.${correo}`);

        return data && data.length > 0;
    },

    updateUser: async (user) => {
        const { error } = await supabase
            .from('users')
            .update(user)
            .eq('curp', user.curp);
        if (error) console.error("Error actualizando usuario:", error.message);
        return !error;
    },

    getAllUsers: async () => {
        const { data, error } = await supabase.from('users').select('*');
        if (error) {
            console.error("Error getAllUsers:", error.message);
            return [];
        }
        return data || [];
    },

    updateLocation: async (user, lat, lng) => {
        if (!user || !user.curp) return;
        const { error } = await supabase
            .from('users')
            .update({ lat, lng })
            .eq('curp', user.curp);
        if (error) console.error("Error GPS:", error.message);
    },

    updateUserRole: async (curp, nuevoRol) => {
        const { error } = await supabase
            .from('users')
            .update({ rol: nuevoRol })
            .eq('curp', curp);

        if (error) console.error("Error rol:", error.message);
        return !error;
    },

    getNotifications: async (curp) => {
        const { data } = await supabase
            .from('notificaciones_medicas')
            .select('*')
            .eq('curpUsuario', curp)
            .order('fecha', { ascending: false });
        return data || [];
    },

    markAllAsRead: async (curp) => {
        await supabase
            .from('notificaciones_medicas')
            .update({ leida: true })
            .eq('curpUsuario', curp);
    }
};