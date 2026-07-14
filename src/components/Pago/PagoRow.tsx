import { Pago } from "../../interfaces/IPago";
import { TableCell, TableRow } from "../ui/table";
import {
  AlertTriangle,
  CircleCheck,
  CircleX,
  Edit,
  MoreHorizontal,
  ToggleLeft,
  ToggleRight,
  FileDown,
  FileBadge,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useToast } from "../../context/ToastContext";
import { useState } from "react";
import { ConfirmDialog } from "@/components/Common/ConfirmDialog";
import { downloadFile } from "../../utils/fileUtils";
import { formatDate } from "@/utils/dateUtils";

interface Props {
  pago: Pago;
  onStatusChange?: (pagoId: number) => void;
}

export const PagoRow: React.FC<Props> = ({ pago }) => {
  const { showToast } = useToast();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // ⬅️ Estado para el modal
  const [isProcessing, setIsProcessing] = useState(false); // ⬅️ Estado para el loading

  const navigate = useNavigate();

  const nuevoEstado = !pago.estado;
  const action = nuevoEstado ? "activar" : "desactivar";
  const modalTitle = `${action.charAt(0).toUpperCase() + action.slice(1)} Pago`;
  const modalMessage = `¿Deseas <strong>${action}</strong> el pago: <strong>${pago.id}</strong>?`;

  console.log({ pago });

  const handleShowDetail = () => {
    navigate(`/pago/editar/${pago.id}`);
  };

  const handleFormPago = () => {
    navigate(`/pago/nuevo`);
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
  const actionText = pago.estado ? "Desactivar" : "Activar";
  const ActionIcon = pago.estado ? ToggleLeft : ToggleRight;
  const actionColor = pago.estado ? "text-red-600" : "text-green-600";
  const hoverBgColor = pago.estado ? "hover:bg-red-100" : "hover:bg-green-100";

  return (
    <>
      <TableRow
        key={pago.id}
        className="hover:bg-slate-50/80 hover:cursor-pointer transition-colors duration-150 border-b border-slate-100"
      >
        <TableCell className="py-2 px-3 text-xs font-medium text-slate-500">
          {pago.matricula.persona.nombre_completo}
        </TableCell>
        <TableCell className="py-2 px-3 text-xs font-medium text-slate-500">
          {pago.concepto}
        </TableCell>
        <TableCell className="py-2 px-3 text-xs font-medium text-slate-500">
          {pago.forma_pago.nombre}
        </TableCell>
        <TableCell className="py-2 px-3 text-xs font-medium text-slate-500">
          {formatDate(pago.fecha_pago)}
        </TableCell>
        <TableCell className="py-2 px-3 text-center">
          <div className="flex items-center justify-center">
            {pago.estado ? (
              <CircleCheck className="text-emerald-500 w-4 h-4 stroke-[2.5]" />
            ) : (
              <CircleX className="text-rose-500 w-4 h-4 stroke-[2.5]" />
            )}
          </div>
        </TableCell>

        <TableCell className="py-2 px-3 text-right">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-7 w-7 p-0 focus-visible:ring-1 focus-visible:ring-slate-400 focus-visible:ring-offset-0"
              >
                <span className="sr-only">Abrir menú de acciones</span>
                <MoreHorizontal className="h-3.5 w-3.5 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="bg-white border border-slate-200 shadow-md min-w-[140px] text-xs p-1 rounded-md"
            >
              <DropdownMenuLabel className="font-medium text-slate-400 px-2 py-1 text-[10px] uppercase tracking-wider">
                Acciones
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100" />

              <DropdownMenuItem
                onClick={handleShowDetail}
                className="cursor-pointer hover:bg-slate-50 rounded-sm py-1 px-2 flex items-center gap-2 text-slate-700"
              >
                <Edit className="h-3.5 w-3.5 text-slate-400" />
                <span>Ver/Editar detalle</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-100" />

              <DropdownMenuItem
                onClick={handleFormPago}
                className={`cursor-pointer rounded-sm py-1 px-2 flex items-center gap-2 font-medium`}
              >
                <ActionIcon className="h-3.5 w-3.5" />
                <span>Nuevo Pago</span>
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
            className={pago.estado ? "text-red-500" : "text-green-500"}
          />
        }
      />
    </>
  );
};
