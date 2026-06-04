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

  // Abre el modal
  // const handleOpenStatusModal = (event: React.MouseEvent) => {
  //   event.preventDefault();
  //   setIsDropdownOpen(false);
  //   setIsModalOpen(true);
  // };

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
        className="hover:bg-blue-100 hover:cursor-pointer transition-colors duration-200"
      >
        <TableCell className="py-3">
          {pago.matricula.persona.nombre_completo}
        </TableCell>
        <TableCell className="py-3">{pago.concepto}</TableCell>
        <TableCell className="py-3">{pago.forma_pago.nombre}</TableCell>
        <TableCell className="py-3">{pago.fecha_pago}</TableCell>
        <TableCell className="py-3">
          {pago.estado ? (
            <CircleCheck className="text-green-500 w-5 h-5" />
          ) : (
            <CircleX className="text-red-500 w-5 h-5" />
          )}
        </TableCell>
        <TableCell className="py-3">
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
                onClick={handleFormPago}
                className={`cursor-pointer hover:bg-gray-100 transition-colors flex items-center space-x-2 text-blue-600`}
              >
                <ActionIcon className="h-4 w-4" />
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
