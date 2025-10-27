import { useCallback, useEffect, useState } from "react";
import { getPersona } from "../../services/personaService";
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
import { PersonaRow } from "./PersonaRow";
import { TableSpinner } from "../../components/Common/TableSpinner";
import { Persona } from "@/interfaces/IPersona";

interface PersonaTableProps {
  nombreGrupo?: string;
}

export const PersonaTable: React.FC<PersonaTableProps> = ({ nombreGrupo }) => {
  const [personas, setPersonas] = useState<Persona[]>([]);
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
      //   const tipoPersona = nombreGrupo || "";

      const tipoPersona = `grupo-${nombreGrupo || ""}`;

      console.log({ tipoPersona });

      const response = await getPersona(tipoPersona);

      const { result, data } = response;

      if (result && data) {
        const dataPersonas = data as Persona[];
        setPersonas(dataPersonas);
      } else {
        setPersonas([]);
      }
    } catch (error) {
      console.error("Error al obtener personas", error);
    } finally {
      setIsLoading(false);
    }
  }, [nombreGrupo]);

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
                Nombres y apellidos
              </TableHead>
              <TableHead className="text-gray-600 font-medium">
                Tipo documento
              </TableHead>
              <TableHead className="text-gray-600 font-medium">
                Número documento
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
            ) : personas.length > 0 ? (
              personas.map((persona) => (
                <PersonaRow
                  key={persona.id}
                  persona={persona}
                  //   onStatusChange={handleDocumentoStatusChange}
                />
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-gray-500 py-6"
                >
                  No se encontraron personas registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
