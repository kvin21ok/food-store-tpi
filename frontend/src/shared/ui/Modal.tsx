import type { ReactNode } from "react";

interface ModalProps {
    titulo: string;
    onCerrar: () => void;
    children: ReactNode;
}

export default function Modal({ titulo, onCerrar, children }: ModalProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={onCerrar}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={titulo}
                className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-start justify-between gap-4">
                    <h2 className="text-lg font-semibold">{titulo}</h2>
                    <button
                        type="button"
                        onClick={onCerrar}
                        aria-label="Cerrar"
                        className="text-slate-500 hover:text-slate-800"
                    >
                        ✕
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}