import { axiosInstance } from "../../../shared/api/axiosInstance";
import type {
    LoginCredenciales,
    RegistroDatos,
    UsuarioPublic,
} from "../types/auth";

export async function login(credenciales: LoginCredenciales): Promise<void> {
    // /auth/token espera un formulario 0Auth2, no JSON
    await axiosInstance.post(
        "/auth/token",
        new URLSearchParams({
            username: credenciales.username,
            password: credenciales.password
        }),
    );
}

export async function obtenerPerfil(): Promise<UsuarioPublic> {
    const { data } = await axiosInstance.get<UsuarioPublic>("/auth/me");
    return data;
}

export async function cerrarSesion(): Promise<void> {
    await axiosInstance.post("/auth/logout");
}

export async function registrar(datos: RegistroDatos): Promise<UsuarioPublic> {
    const { data } = await axiosInstance.post<UsuarioPublic>("/auth/register", datos);
    return data; 
}