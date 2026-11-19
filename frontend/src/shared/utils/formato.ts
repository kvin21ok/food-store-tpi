const MONEDA = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
});

const FECHA_HORA = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
});

export function formatearPrecio(valor: number): string {
    return MONEDA.format(valor);
}

export function formatearFecha(iso: string): string {
    return FECHA_HORA.format(new Date(iso));
}