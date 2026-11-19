import axios from "axios";

const SIN_CONEXION =
    "No se pudo conectar con el servidor. Verificar que el backend esté funcionando.";

function textoDeDetail(detail: unknown): string | null {
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
        const mensajes = detail
            .map((item: unknown) => 
                typeof item === "object" && item !== null && "msg" in item ? String(item.msg) : null,
            )
            .filter((mensaje): mensaje is string => mensaje !== null);
        return mensajes.length > 0 ? mensajes.join(". ") : null;
    }
    return null
}

export function obtenerDetail(error: unknown): string | null {
    if(!axios.isAxiosError(error)) return null;
    const data: unknown = error.response?.data;
    if (typeof data === "object" && data !== null && "detail" in data) {
        return textoDeDetail(data.detail);
    }
    return null;
}

export function handleApiError(
    error: unknown,
    porDefecto = "Ocurrió un error inesperado",
): string {
    if (axios.isAxiosError(error) && !error.response) return SIN_CONEXION;
    return obtenerDetail(error) ?? porDefecto;
}