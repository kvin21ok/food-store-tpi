import { useId } from "react";
import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    error?: string;
}

export default function Select({
    label,
    error,
    className = "",
    children,
    ...props
}: SelectProps) {
    const id = useId();
    return (
        <div className="space-y-1">
            <label htmlFor={id} className="block text-sm font-medium text-slate-700">
                {label}
            </label>
            <select
                id={id}
                aria-invalid={error ? true : undefined}
                className={`w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 ${
                error ? "border-red-500" : "border-slate-300"
                } ${className}`}
                {...props}
            >
                {children}
            </select>
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}