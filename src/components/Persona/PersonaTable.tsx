import { JSX, useCallback, useEffect, useState, useRef } from "react";
import { getPersonasPaginate } from "../../services/personaService";
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
import { Persona, PaginationType } from "@/interfaces/IPersona";
import { ParametroClase } from "@/params/parametroClase";
import { PersonaFilters, PersonaFiltersData } from "./PersonaFilters";

interface PersonaTableProps {
  nombreGrupo?: string;
}

export const PersonaTable: React.FC<PersonaTableProps> = ({ nombreGrupo }) => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  const [paginationInfo, setPaginationInfo] = useState<
    Omit<PaginationType, "currentPage" | "limit">
  >({
    totalPages: 1,
    totalItems: 0,
    nextPage: null,
    previousPage: null,
  });

  const [searchFilters, setSearchFilters] = useState<PersonaFiltersData>({
    search: "",
    documento: "",
  });

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= paginationInfo.totalPages) {
      setCurrentPage(page);
    }
  };

  const fetchData = useCallback(
    async (pageToFetch: number, filtersData: PersonaFiltersData) => {
      setIsLoading(true);

      const filters = {
        parametro_clase: ParametroClase.GRUPO,
        search: filtersData.search,
        numero_documento: filtersData.documento,
      };

      const tipoPersona = `grupo-${nombreGrupo || ""}`;

      try {
        const response = await getPersonasPaginate(
          pageToFetch,
          limit,
          tipoPersona,
          filters,
        );

        const { result, data, pagination: newPagination } = response;

        if (result && data) {
          setPersonas(data as Persona[]);

          if (newPagination) {
            setPaginationInfo({
              totalPages: newPagination.totalPages || 1,
              totalItems: newPagination.totalItems || 0,
              nextPage: newPagination.nextPage,
              previousPage: newPagination.previousPage,
            });

            setTotalPages(newPagination.totalPages || 1);
          }
        } else {
          setPersonas([]);
        }
      } catch (error) {
        console.error("Error al obtener personas", error);
      } finally {
        setIsLoading(false);
      }
    },
    [nombreGrupo, limit],
  );

  useEffect(() => {
    fetchData(currentPage, searchFilters);
  }, [currentPage, searchFilters, fetchData]);

  const handleSearchSubmit = (newFilters: PersonaFiltersData) => {
    console.log({ newFilters });
    setSearchFilters(newFilters);
    setCurrentPage(1); // Reiniciar a la primera página en cada búsqueda
  };

  const renderPaginationItems = (): JSX.Element[] => {
    const items: JSX.Element[] = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(paginationInfo.totalPages, currentPage + 2);

    if (startPage > 1) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={i === currentPage}
            className={`
              ${
                i === currentPage
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200 transition-colors"
              }
            `}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    if (endPage < paginationInfo.totalPages) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }
    return items;
  };

  return (
    <div className="w-full space-y-4 pt-2">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <PersonaFilters onSearch={handleSearchSubmit} />

        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[32%] py-4 px-4 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  Nombres y apellidos
                </TableHead>
                <TableHead className="w-[15%] py-4 px-4 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  Documento
                </TableHead>
                <TableHead className="w-[15%] py-4 px-4 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  Número documento
                </TableHead>
                <TableHead className="w-[15%] py-4 px-4 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  Email
                </TableHead>
                <TableHead className="w-[8%] py-4 px-4 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  Teléfono
                </TableHead>
                <TableHead className="w-[7%] py-4 px-4 text-slate-600 font-semibold text-xs uppercase tracking-wider text-center">
                  Estado
                </TableHead>
                <TableHead className="w-[8%] py-4 px-4 text-slate-600 font-semibold text-xs uppercase tracking-wider text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableSpinner colSpan={7} />
              ) : personas.length > 0 ? (
                personas.map((persona) => (
                  <PersonaRow
                    key={persona.id}
                    persona={persona}
                    grupo={nombreGrupo || ""}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                      <span className="text-sm font-medium">
                        No se encontraron registros
                      </span>
                      <p className="text-xs">
                        Intenta ajustar los filtros de búsqueda
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex items-center justify-between px-2">
        <div className="text-xs text-slate-500 font-medium">
          Mostrando <span className="text-slate-900">{personas.length}</span>{" "}
          registros de este grupo
        </div>

        <Pagination className="justify-end">
          <PaginationContent className="gap-1">
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                className={`
                  cursor-pointer border border-slate-200 text-slate-600 transition-all
                  hover:bg-slate-100 hover:text-slate-900
                  ${currentPage === 1 ? "pointer-events-none opacity-40" : ""}
                `}
              />
            </PaginationItem>

            {renderPaginationItems()}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                className={`
                  cursor-pointer border border-slate-200 text-slate-600 transition-all
                  hover:bg-slate-100 hover:text-slate-900
                  ${currentPage === totalPages ? "pointer-events-none opacity-40" : ""}
                `}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};
