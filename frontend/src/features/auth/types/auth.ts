export type Rol = "user" | "admin";

export interface UsuarioPublic {
    id: number;
    username: string;
    full_name: string;
    email: string;
    role: Rol;
    disabled: boolean;
    created_at: string;
}

export interface LoginCredenciales {
    username: string;
    password: string;
}

export interface RegistroDatos {
    username: string;
    full_name: string;
    email: string;
    password: string;
}