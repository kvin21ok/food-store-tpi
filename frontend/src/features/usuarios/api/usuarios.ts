import { axiosInstance } from "../../../shared/api/axiosInstance";
import type { UsuarioPublic } from "../../auth/types/auth";

export async function listarUsuarios(): Promise<UsuarioPublic[]> {
    const { data } = await axiosInstance.get<UsuarioPublic[]>("/admin/usuarios");
    return data;
}

export async function activarUsuario(id: number): Promise<UsuarioPublic> {
    const { data } = await axiosInstance.post<UsuarioPublic>(`/admin/usuarios/${id}/activar`);
    return data;
}

export async function desactivarUsuario(id: number): Promise<UsuarioPublic> {
    const { data } = await axiosInstance.post<UsuarioPublic>(`/admin/usuarios/${id}/desactivar`);
    return data;
}