import { useId } from "react";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
}

export default function Textarea({
    label,
    error,
    className = "",
    ...props
}: TextareaProps) {
    const id = useId();
    return (
        <div className="space-y-1">
            <label htmlFor={id} className="block text-sm font-medium text-slate-700">
                {label}
            </label>
            <textarea
                id={id}
                aria-invalid={error ? true : undefined}
                className={`w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 ${
                    error ? "border-red-500" : "border-slate-300"
                } ${className}`}
                {...props}
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}