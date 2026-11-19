import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import UnauthorizedPage from "../features/auth/pages/UnauthorizedPage";
import CarritoPage from "../features/pedidos/pages/CarritoPage";
import CheckoutPage from "../features/pedidos/pages/CheckoutPage";
import MisPedidosPage from "../features/pedidos/pages/MisPedidosPage";
import CatalogoPage from "../features/productos/pages/CatalogoPage";
import MainLayout from "../shared/layout/MainLayout";
import Card from "../shared/ui/Card";
import ProtectedRoute from "./ProtectedRoute";

function Pendiente({ titulo }: { titulo: string }) {
    return (
        <Card>
            <h1 className="text-xl font-semibold">{titulo}</h1>
            <p className="mt-2 text-sm text-slate-600">
                Esta pantalla se construye en un próximo hito.
            </p>
        </Card>
    );
}

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    {/* públicas */}
                    <Route path="/" element={<CatalogoPage />} />
                    <Route path="/carrito" element={<CarritoPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />

                    {/* con sesión */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/mis-pedidos" element={<MisPedidosPage />} />
                    </Route>

                    {/* solo admin */}
                    <Route element={<ProtectedRoute roles={["admin"]} />}>
                        <Route path="/admin/resumen" element={<Pendiente titulo="Resumen" />} />
                        <Route path="/admin/categorias" element={<Pendiente titulo="Categorías" />} />
                        <Route path="/admin/productos" element={<Pendiente titulo="Productos" />} />
                        <Route path="/admin/pedidos" element={<Pendiente titulo="Pedidos" />} />
                        <Route path="/admin/usuarios" element={<Pendiente titulo="Usuarios" />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}