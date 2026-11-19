import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as authApi from "../features/auth/api/auth";
import type {
    LoginCredenciales,
    UsuarioPublic,
} from "../features/auth/types/auth";

// solo estos datos se guardan en el navegador; nunca el token
export type UsuarioSesion = Pick<
    UsuarioPublic,
    "id" | "username" | "full_name" | "email" | "role"
>;

interface AuthState {
    usuario: UsuarioSesion | null;
    cargando: boolean;
    login: (credenciales: LoginCredenciales) => Promise<void>;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
    limpiarSesion: () => void;
}

function aSesion(perfil: UsuarioPublic): UsuarioSesion {
    return {
        id: perfil.id,
        username: perfil.username,
        full_name: perfil.full_name,
        email: perfil.email,
        role: perfil.role,
    };
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            usuario: null,
            // true hasta que checkSession confirme (o no) la sesión
            cargando: true,

            login: async (credenciales) => {
                await authApi.login(credenciales);
                const perfil = await authApi.obtenerPerfil();
                set({ usuario: aSesion(perfil) });
            },

            logout: async () => {
                try {
                    await authApi.cerrarSesion();
                } catch {
                    // aunque falle la petición, se limpia la sesión local
                }
                set({ usuario: null });
            },

            checkSession: async () => {
                set({ cargando: true });
                try {
                    const perfil = await authApi.obtenerPerfil();
                    set({ usuario: aSesion(perfil) });
                } catch {
                    set({ usuario: null });
                } finally {
                    set({ cargando: false });
                }
            },

            limpiarSesion: () => set({ usuario: null }),
        }),
        {
            name: "food-store-auth",
            partialize: (state) => ({ usuario: state.usuario }),
        },
    ),
);