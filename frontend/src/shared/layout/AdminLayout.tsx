import { NavLink, Outlet } from "react-router-dom";

const SECCIONES = [
    { to: "/admin/resumen", etiqueta: "Resumen" },
    { to: "/admin/categorias", etiqueta: "Categorías" },
    { to: "/admin/productos", etiqueta: "Productos" },
    { to: "/admin/pedidos", etiqueta: "Pedidos" },
    { to: "/admin/usuarios", etiqueta: "Usuarios" },
];

export default function AdminLayout() {
    return (
        <div className="space-y-6">
            <nav
                className="flex flex-wrap gap-2 border-b border-slate-200 pb-3"
                aria-label="Secciones del panel"
            >
                {SECCIONES.map((seccion) => (
                    <NavLink
                        key={seccion.to}
                        to={seccion.to}
                        className={({ isActive }) =>
                            `rounded-md px-3 py-1.5 text-sm font-medium ${
                            isActive
                            ? "bg-orange-600 text-white"
                            : "text-slate-600 hover:bg-slate-200"
                            }`
                        }
                    >
                        {seccion.etiqueta}
                    </NavLink>
                ))}
            </nav>
            <Outlet />
        </div>
    );
}