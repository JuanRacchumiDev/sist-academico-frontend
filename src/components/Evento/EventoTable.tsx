import { useCallback, useEffect, useState } from "react";
import { getEvento } from "../../services/eventoService";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { EventoRow } from "./EventoRow";
import { TableSpinner } from "../../components/Common/TableSpinner";
import { Evento } from "@/interfaces/IEvento";

export const EventoTable = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
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
      const response = await getEvento();

      const { result, data } = response;

      if (result && data) {
        const dataEventos = data as Evento[];
        setEventos(dataEventos);
      } else {
        setEventos([]);
      }
    } catch (error) {
      console.error("Error al obtener eventos", error);
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
              <TableHead className="text-gray-600 font-medium">Tipo</TableHead>
              <TableHead className="text-gray-600 font-medium">
                Categoría
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
            ) : eventos.length > 0 ? (
              eventos.map((evento) => (
                <EventoRow
                  key={evento.id}
                  evento={evento}
                  //   onStatusChange={handleDocumentoStatusChange}
                />
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-gray-500 py-6"
                >
                  No se encontraron eventos registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
