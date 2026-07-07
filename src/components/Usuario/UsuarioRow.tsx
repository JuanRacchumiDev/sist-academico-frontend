import { Usuario } from "../../interfaces/IUsuario";
import { TableCell, TableRow } from "../ui/table";
import {
  CircleCheck,
  CircleX,
  Edit,
  MoreHorizontal,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useState } from "react";

interface Props {
  usuario: Usuario;
  onStatusChange?: (UsuarioId: number) => void;
}

export const UsuarioRow: React.FC<Props> = ({ usuario }) => {
  console.log({ usuario });

  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const nuevoEstado = !usuario.estado;
  const action = nuevoEstado ? "activar" : "desactivar";
  const modalTitle = `${
    action.charAt(0).toUpperCase() + action.slice(1)
  } Usuario`;
  const modalMessage = `¿Deseas <strong>${action}</strong> el usuario: <strong>${usuario.name}</strong>?`;

  const handleShowDetail = () => {
    navigate(`/usuarios/editar/${usuario.id}`);
  };

  // Determinar texto y color de acción
  const actionText = usuario.estado ? "Desactivar" : "Activar";
  const ActionIcon = usuario.estado ? ToggleLeft : ToggleRight;
  const actionColor = usuario.estado ? "text-red-600" : "text-green-600";
  const hoverBgColor = usuario.estado
    ? "hover:bg-red-100"
    : "hover:bg-green-100";

  return (
    <>
      <TableRow
        key={usuario.id}
        className="hover:bg-blue-50/50 hover:cursor-pointer transition-colors duration-200 border-b border-slate-100"
      >
        <TableCell className="py-3 px-4 text-xs font-medium text-slate-700 whitespace-normal wrap-break-words">
          {usuario.name ?? "--"}
        </TableCell>

        <TableCell className="py-3 px-4 text-xs text-slate-600 whitespace-normal wrap-break-words">
          {usuario.email ?? "--"}
        </TableCell>
        <TableCell className="py-3 px-4 text-xs font-semibold text-slate-900 whitespace-normal wrap-break-words">
          {usuario.perfil.nombre ?? "--"}
        </TableCell>

        <TableCell className="py-3 px-2 text-xs text-slate-600 text-center tabular-nums">
          {usuario.persona?.nombre_completo}
        </TableCell>

        <TableCell className="py-3 px-2">
          <div className="flex justify-center">
            {usuario.estado ? (
              <CircleCheck className="text-green-500 w-4 h-4" />
            ) : (
              <CircleX className="text-red-400 w-4 h-4" />
            )}
          </div>
        </TableCell>
        <TableCell className="py-3 px-4 text-right">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger
              asChild
              className="focus:outline-none focus:ring-2 z-40 focus:ring-gray-400 focus:border-transparent transition duration-300 cursor-pointer"
            >
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú de acciones</span>
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="bg-white border shadow-lg"
            >
              <DropdownMenuLabel className="font-semibold text-gray-700">
                Acciones
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleShowDetail}
                className="cursor-pointer hover:bg-gray-100 transition-colors flex items-center space-x-2 text-blue-600"
              >
                <Edit className="h-4 w-4" />
                <span>Ver/Editar Detalle</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    </>
  );
};
