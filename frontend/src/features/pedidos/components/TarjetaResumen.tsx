import Card from "../../../shared/ui/Card";

interface TarjetaResumenProps {
    titulo: string;
    valor: string;
    acento?: string;
}

export default function TarjetaResumen({
    titulo,
    valor,
    acento = "text-slate-900",
}: TarjetaResumenProps) {
    return (
        <Card className="p-5">
            <p className="text-sm text-slate-500">{titulo}</p>
            <p className={`mt-1 text-3xl font-bold ${acento}`}>{valor}</p>
        </Card>
    );
}