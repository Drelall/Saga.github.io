class Storage {
    static async saveRPs(rps) {
        try {
            const { data, error } = await supabase
                .from('rps')
                .upsert(rps);
                
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            throw error;
        }
    }

    static async getRPs() {
        try {
            const { data, error } = await supabase
                .from('rps')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Erreur lors de la récupération:', error);
            return [];
        }
    }

    static async savePartners(partners) {
        try {
            const { data, error } = await supabase
                .from('partners')
                .upsert(partners);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            throw error;
        }
    }

    static async getPartners() {
        try {
            const { data, error } = await supabase
                .from('partners')
                .select('*');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Erreur lors de la récupération:', error);
            return [];
        }
    }

    static async deleteRP(id) {
        try {
            const { error } = await supabase
                .from('rps')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            throw error;
        }
    }

    static async updateRP(id, data) {
        try {
            const { error } = await supabase
                .from('rps')
                .update(data)
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            throw error;
        }
    }
}