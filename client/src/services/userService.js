import { supabase } from "./supabase";


export const userService = {
    async getProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    },

    async updateProfile(profile) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(profile)
                .eq('id', profile.id)
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    },

    async updateStatus(status) {
        try {
            const user = supabase.auth.user();
            if (!user) throw new Error('User not authenticated');
            const { data, error } = await supabase
                .from('profiles')
                .update({ status })
                .eq('id', user.id)
                .select();
            if (error) throw error;
            return data[0];
        }
        catch (error) {
            console.error('Error updating status:', error);
            throw error;
        }
    },

    async getUserByEmail(email) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', email)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching user by email:', error);
            return null;
        }
    }
};