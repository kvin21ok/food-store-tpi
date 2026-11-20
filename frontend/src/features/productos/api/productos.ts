import { axiosInstance } from "../../../shared/api/axiosInstance";
import type {
    FiltrosProductos,
    Producto,
    ProductoEdicion,
    ProductoInput,
    ProductosPaginados,
    StockInput,
} from "../types/producto";

export async function listarProductos(
    filtros: FiltrosProductos,
): Promise<ProductosPaginados> {
    const { data } = await axiosInstance.get<ProductosPaginados>("/productos", {
        params: filtros,
    });
    return data;
}

export async function crearProducto(datos: ProductoInput): Promise<Producto> {
    const { data } = await axiosInstance.post<Producto>("/productos", datos);
    return data;
}

export async function actualizarProducto(
    id: number,
    datos: ProductoEdicion,
): Promise<Producto> {
    const { data } = await axiosInstance.put<Producto>(`/productos/${id}`, datos);
    return data;
}

export async function actualizarStock(
    id: number,
    datos: StockInput,
): Promise<Producto> {
    const { data } = await axiosInstance.patch<Producto>(`/productos/${id}/stock`, datos);
    return data;
}

export async function eliminarProducto(id: number): Promise<void> {
    await axiosInstance.delete(`/productos/${id}`);
}