import type { ButtonHTMLAttributes } from "react";

type Variante = "primario" | "secundario" | "peligro";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variante?: Variante;
}

const ESTILOS: Record<Variante, string> = {
    primario: "bg-orange-600 text-white hover:bg-orange-700",
    secundario: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100",
    peligro: "bg-red-600 text-white hover:bg-red-700",
};

export default function Button({
    variante = "primario",
    type = "button",
    className = "",
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${ESTILOS[variante]} ${className}`}
            {...props}
        />
    );
}