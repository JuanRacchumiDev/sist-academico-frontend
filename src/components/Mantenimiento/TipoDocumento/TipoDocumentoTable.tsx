import { useCallback, useEffect, useState } from "react";
import { getDetalle } from "../../../services/detalleParametroService";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { TipoDocumentoRow } from "./TipoDocumentoRow";
import { TableSpinner } from "../../../components/Common/TableSpinner";
import { DetalleParametro } from "@/interfaces/IDetalleParametro";

export const TipoDocumentoTable: React.FC = () => {
  const [tipoDocumentos, setTipoDocumentos] = useState<DetalleParametro[]>([]);
  //   const [pagination, setPagination] = useState<PaginationType>({
  //     currentPage: 1,
  //     limit: 10,
  //     totalPages: 1,
  //     totalItems: 0,
  //     nextPage: null,
  //     previousPage: null,
  //   });

  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getDetalle("tipo-documento");

      console.log("response tipodocumentos", response);

      const { result, data } = response;

      if (result && data) {
        const dataTipoDocumentos = data as DetalleParametro[];
        setTipoDocumentos(dataTipoDocumentos);
      } else {
        setTipoDocumentos([]);
      }
    } catch (error) {
      console.error(
        "Error al obtener documentos por tipo de contingencia",
        error
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="w-full space-y-4 pt-4">
      <div className="flex justify-end items-center space-x-2 pb-4"></div>
      <div className="rounded-md border border-gray-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="text-gray-600 font-medium">
                Nombre
              </TableHead>
              <TableHead className="text-gray-600 font-medium">
                Descripción
              </TableHead>
              <TableHead className="text-gray-600 font-medium">
                Abreviatura
              </TableHead>
              <TableHead className="text-gray-600 font-medium">
                Estado
              </TableHead>
              <TableHead className="text-gray-600 font-medium">
                Opciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSpinner colSpan={5} />
            ) : tipoDocumentos.length > 0 ? (
              tipoDocumentos.map((tipoDocumento) => (
                <TipoDocumentoRow
                  key={tipoDocumento.codigo}
                  tipoDocumento={tipoDocumento}
                  //   onStatusChange={handleDocumentoStatusChange}
                />
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-gray-500 py-6"
                >
                  No se encontraron tipo de documentos registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
