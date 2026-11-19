import axios from "axios";
import { useAuthStore } from "../../store/authStore";
import { obtenerDetail } from "./handleApiError";

const API_URL: string = import.meta.env.VITE_API_URL;
const RUTAS_EXCLUIDAS = ["/auth/token", "/auth/me"];
const CUENTA_DESACTIVADA = "Cuenta de usuario desactivada";

export const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
        if (axios.isAxiosError(error) && error.response) {
            const { status } = error.response;
            const url = error.config?.url ?? "";
            const excluida = RUTAS_EXCLUIDAS.some((ruta) => url.includes(ruta));
            const desactivada =
                status === 400 && obtenerDetail(error) === CUENTA_DESACTIVADA;
            
            if ((status === 401 && !excluida) || desactivada) {
                useAuthStore.getState().limpiarSesion();
            }
        }
        return Promise.reject(error);
    },
)