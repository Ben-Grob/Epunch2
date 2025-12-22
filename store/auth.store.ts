import { getCurrentUser, signOut } from "@/lib/appwrite";
import { User } from "@/type";
import { create } from 'zustand';

type AuthState = {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;

    setIsAuthenticated: (value: boolean) => void;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;

    fetchAuthenticatedUser: () => Promise<void>;
    signOut: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    user: null,
    isLoading: true,

    setIsAuthenticated: (value) => set({ isAuthenticated: value }),
    setUser: (user) => set({ user }),
    setLoading: (value) => set({isLoading: value}),

    fetchAuthenticatedUser: async () => {
        console.log("FETCHING INFO FROM APPWRITE    ")
        set({isLoading: true});

        try {
            const user = await getCurrentUser();

            if (user && 'email' in user) {
                set({ isAuthenticated: true, user: user as unknown as User });
                console.log("User is authenticated");
            }
            else {
                set( { isAuthenticated: false, user: null } );
                console.log("User is not authenticated");
            }
        } catch (e) {
            console.log('fetchAuthenticatedUser error', e);
            set({ isAuthenticated: false, user: null })
        } finally {
            set({ isLoading: false });
        }
    },

    signOut: async () => {
        try {
            await signOut();
            set({ isAuthenticated: false, user: null });
            console.log("User signed out successfully");
        } catch (e) {
            console.error('Sign out error:', e);
            // Still clear the auth state even if signOut fails
            set({ isAuthenticated: false, user: null });
        }
    }
}))

export default useAuthStore;