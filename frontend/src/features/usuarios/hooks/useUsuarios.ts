import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    activarUsuario,
    desactivarUsuario,
    listarUsuarios,
} from "../api/usuarios";

export function useUsuarios() {
    return useQuery({
        queryKey: ["usuarios"],
        queryFn: listarUsuarios,
    });
}

export function useActivarUsuario() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => activarUsuario(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["usuarios"] }),
    });
}

export function useDesactivarUsuario() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => desactivarUsuario(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["usuarios"] }),
    });
}