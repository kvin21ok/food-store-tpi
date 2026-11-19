import type { ReactNode } from "react";

interface EstadoVacioProps {
    titulo: string;
    descripcion?: string;
    children?: ReactNode;
}

export default function EstadoVacio({ titulo, descripcion, children }: EstadoVacioProps) {
    return (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-lg font-semibold text-slate-700">{titulo}</h2>
            {descripcion && <p className="mt-1 text-sm text-slate-500">{descripcion}</p>}
            {children && <div className="mt-4">{children}</div>}
        </div>
    );
}