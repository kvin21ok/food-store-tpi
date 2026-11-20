import type { Categoria } from "../../categorias/types/categoria";

export interface Producto {
    id: number;
    categoria_id: number;
    nombre: string;
    descripcion: string | null;
    precio_base: number;
    imagen_url: string | null;
    stock: number;
    disponible: boolean;
    activo: boolean;
    categoria: Categoria | null;
}

export interface ProductosPaginados {
        total: number;
    items: Producto[];
}

export interface FiltrosProductos {
    skip: number;
    limit: number;
    search?: string;
    categoria_id?: number;
    disponible?: boolean;
}

export interface ProductoInput {
    categoria_id: number;
    nombre: string;
    descripcion: string | null;
    precio_base: number;
    imagen_url: string | null;
    stock: number;
    disponible: boolean;
}

// la edición no toca stock ni disponibilidad (tienen su propio PATCH)
export interface ProductoEdicion {
    categoria_id?: number;
    nombre: string;
    descripcion: string | null;
    precio_base: number;
    imagen_url: string | null;
}

export interface StockInput {
    stock: number;
    disponible: boolean;
}