import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import Paginacion from "./Paginacion";

interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    getRowId: (fila: T) => string;
    porPagina?: number;
}

// tabla con paginación del lado del cliente (el panel pide limit=100)
export default function DataTable<T>({
    data,
    columns,
    getRowId,
    porPagina = 10,
}: DataTableProps<T>) {
    const table = useReactTable({
        data,
        columns,
        getRowId,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: porPagina } },
    });

    const { pageIndex, pageSize } = table.getState().pagination;

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        {table.getHeaderGroups().map((grupo) => (
                            <tr key={grupo.id}>
                                {grupo.headers.map((header) => (
                                    <th key={header.id} className="px-4 py-3 font-medium">
                                        {header.isPlaceholder
                                        ? null
                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {table.getRowModel().rows.map((fila) => (
                            <tr key={fila.id}>
                                {fila.getVisibleCells().map((celda) => (
                                    <td key={celda.id} className="px-4 py-3 align-middle">
                                        {flexRender(celda.column.columnDef.cell, celda.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Paginacion
                pagina={pageIndex + 1}
                total={data.length}
                porPagina={pageSize}
                onCambiar={(pagina) => table.setPageIndex(pagina - 1)}
            />
        </div>
    );
}