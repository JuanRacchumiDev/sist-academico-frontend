import { JSX, useCallback, useEffect, useState } from "react";
import { getUsuariosPaginate } from "../../services/usuarioService";
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
import { UsuarioRow } from "./UsuarioRow";
import { TableSpinner } from "../../components/Common/TableSpinner";
import { Usuario, PaginationType } from "@/interfaces/IUsuario";
import { UsuarioFilters, UsuarioFiltersData } from "./UsuarioFilters";
import { getDetalleFiltered } from "../../services/detalleParametroService";
import {
  DetalleParametro,
  DetalleParametroFilters,
} from "@/interfaces/IDetalleParametro";
import { ParametroClase } from "@/params/parametroClase";

const loadPerfiles = async () => {
  // Definiendo perfiles
  let listPerfiles: DetalleParametro[] = [];

  const filterPerfiles: DetalleParametroFilters = {
    parametro_clase: ParametroClase.PERFIL,
    en_persona: false,
    en_empresa: false,
    estado: true,
  };

  const responsePerfiles = await getDetalleFiltered(filterPerfiles);

  const { result: resultPerfiles, data: dataPerfiles } = responsePerfiles;

  if (resultPerfiles && dataPerfiles) {
    listPerfiles = dataPerfiles as DetalleParametro[];
  }

  return listPerfiles;
};

export const UsuarioTable = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [perfiles, setPerfiles] = useState<DetalleParametro[]>([]);

  const [paginationInfo, setPaginationInfo] = useState<
    Omit<PaginationType, "currentPage" | "limit">
  >({
    totalPages: 1,
    totalItems: 0,
    nextPage: null,
    previousPage: null,
  });

  const [searchFilters, setSearchFilters] = useState<UsuarioFiltersData>({
    email: "",
    id_perfil: "",
  });

  useEffect(() => {
    const loadCatalogos = async () => {
      const dataPerfiles = await loadPerfiles();
      setPerfiles(dataPerfiles);
    };
    loadCatalogos();
  }, []);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= paginationInfo.totalPages) {
      setCurrentPage(page);
    }
  };

  const fetchData = useCallback(
    async (pageToFetch: number, filtersData: UsuarioFiltersData) => {
      setIsLoading(true);

      const filters = {
        email: filtersData.email,
        id_perfil: filtersData.id_perfil,
      };

      try {
        const response = await getUsuariosPaginate(pageToFetch, limit, filters);

        const { result, data, pagination: newPagination } = response;

        if (result && data) {
          setUsuarios(data as Usuario[]);

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
          setUsuarios([]);
        }
      } catch (error) {
        console.error("Error al obtener usuarios", error);
      } finally {
        setIsLoading(false);
      }
    },
    [limit],
  );

  useEffect(() => {
    fetchData(currentPage, searchFilters);
  }, [currentPage, searchFilters, fetchData]);

  const handleSearchSubmit = (newFilters: UsuarioFiltersData) => {
    setSearchFilters(newFilters);
    setCurrentPage(1); // Resetear a la primera página al filtrar
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
      <UsuarioFilters onSearch={handleSearchSubmit} perfiles={perfiles} />

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="w-[12%] py-4 px-4 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                Nombre de usuario
              </TableHead>
              <TableHead className="w-[12%] py-4 px-4 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                Email
              </TableHead>
              <TableHead className="w-[25%] py-4 px-4 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                Perfil
              </TableHead>
              <TableHead className="w-[10%] py-4 px-2 text-slate-600 font-semibold text-xs uppercase tracking-wider text-center">
                Persona
              </TableHead>
              <TableHead className="w-[7%] py-4 px-2 text-slate-600 font-semibold text-xs uppercase tracking-wider text-center">
                Estado
              </TableHead>
              <TableHead className="w-[8%] py-4 px-4 text-slate-600 font-semibold text-xs uppercase tracking-wider text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSpinner colSpan={6} />
            ) : usuarios.length > 0 ? (
              usuarios.map((usuario) => (
                <UsuarioRow key={usuario.id} usuario={usuario} />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
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
      <div className="flex items-center justify-between px-2">
        <div className="text-xs text-slate-500 font-medium">
          Mostrando <span className="text-slate-900">{usuarios.length}</span>{" "}
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
