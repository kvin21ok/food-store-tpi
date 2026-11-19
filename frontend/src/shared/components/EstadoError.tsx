import Button from "../ui/Button";

interface EstadoErrorProps {
    mensaje: string;
    onReintentar?: () => void;
}

export default function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
    return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center"
        role="alert"
        >
            <p className="text-sm text-red-700">{mensaje}</p>
            {onReintentar && (
                <Button variante="secundario" className="mt-3" onClick={onReintentar}>
                    Reintentar
                </Button>
            )}
        </div>
    );
}