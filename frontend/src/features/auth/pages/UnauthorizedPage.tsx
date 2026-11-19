import { Link } from "react-router-dom";
import Card from "../../../shared/ui/Card";

export default function UnauthorizedPage() {
    return (
        <Card className="mx-auto max-w-md text-center">
            <h1 className="text-xl font-semibold">Sin permiso</h1>
            <p className="mt-2 tetx-sm text-slate-600">
                No tenés permisos para ver esta pantalla
            </p>
            <Link to="/" className="mt-4 inline-block text-sm font-medium text-orange-600 hover:underline">
                Volver al inicio
            </Link>
        </Card>
    );
}