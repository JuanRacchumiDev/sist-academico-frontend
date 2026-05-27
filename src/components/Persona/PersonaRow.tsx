import { Persona } from "../../interfaces/IPersona";
import { TableCell, TableRow } from "../ui/table";
import {
  AlertTriangle,
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
import { useToast } from "../../context/ToastContext";
import { useState } from "react";
import { ConfirmDialog } from "@/components/Common/ConfirmDialog";

interface Props {
  persona: Persona;
  grupo: string;
}

export const PersonaRow: React.FC<Props> = ({ persona, grupo }) => {
  const { showToast } = useToast();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // ⬅️ Estado para el modal
  const [isProcessing, setIsProcessing] = useState(false); // ⬅️ Estado para el loading

  const navigate = useNavigate();

  const nuevoEstado = !persona.estado;
  const action = nuevoEstado ? "activar" : "desactivar";
  const modalTitle = `${
    action.charAt(0).toUpperCase() + action.slice(1)
  } Empresa`;
  const modalMessage = `¿Deseas <strong>${action}</strong> la persona: <strong>${persona.nombre_completo}</strong>?`;

  const handleShowDetail = () => {
    navigate(`/personas/${grupo}/editar/${persona.id}`);
  };

  // Abre el modal
  const handleOpenStatusModal = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsDropdownOpen(false);
    setIsModalOpen(true);
  };

  // Cierra el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirmStatus = async () => {
    setIsProcessing(true);

    try {
      showToast("error", "Error de conexión al intentar actualizar.");
    } catch (error) {
      console.error("Error en la actualización de estado:", error);
      showToast("error", "Error de conexión al intentar actualizar.");
    } finally {
      setIsProcessing(false); // Desactiva el loading
      handleCloseModal(); // Cierra el modal
    }
  };

  // Determinar texto y color de acción
  const actionText = persona.estado ? "Desactivar" : "Activar";
  const ActionIcon = persona.estado ? ToggleLeft : ToggleRight;
  const actionColor = persona.estado ? "text-red-600" : "text-green-600";
  const hoverBgColor = persona.estado
    ? "hover:bg-red-100"
    : "hover:bg-green-100";

  return (
    <>
      <TableRow
        key={persona.id}
        className="hover:bg-blue-50/50 hover:cursor-pointer transition-colors duration-200 border-b border-slate-100"
      >
        <TableCell className="py-3 px-4 text-xs font-medium text-slate-700 whitespace-normal wrap-break-words">
          {persona.nombre_completo}
        </TableCell>
        <TableCell className="py-3 px-4 text-xs text-slate-600 whitespace-normal wrap-break-words">
          {persona.tipo_documento?.nombre}
        </TableCell>
        <TableCell className="py-3 px-4 text-xs text-slate-600 whitespace-normal wrap-break-words">
          {persona.numero_documento}
        </TableCell>
        <TableCell className="py-3 px-4 text-xs text-slate-600 whitespace-normal wrap-break-words">
          {persona.email}
        </TableCell>
        <TableCell className="py-3 px-4 text-xs text-slate-600 whitespace-normal wrap-break-words">
          {persona.telefono}
        </TableCell>
        <TableCell className="py-3 px-2">
          {persona.estado ? (
            <CircleCheck className="text-green-500 w-4 h-4" />
          ) : (
            <CircleX className="text-red-500 w-4 h-4" />
          )}
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
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleOpenStatusModal}
                className={`cursor-pointer ${hoverBgColor} transition-colors flex items-center space-x-2 ${actionColor}`}
              >
                <ActionIcon className="h-4 w-4" />
                <span>{actionText} Persona</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <ConfirmDialog
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmStatus}
        title={modalTitle}
        message={<span dangerouslySetInnerHTML={{ __html: modalMessage }} />}
        confirmText={actionText}
        isProcessing={isProcessing}
        icon={
          <AlertTriangle
            className={persona.estado ? "text-red-500" : "text-green-500"}
          />
        }
      />
    </>
  );
};
