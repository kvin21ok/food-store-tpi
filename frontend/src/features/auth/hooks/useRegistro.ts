import { useMutation } from "@tanstack/react-query";
import { registrar } from "../api/auth";

export function useRegistro() {
    return useMutation({ mutationFn: registrar });
}