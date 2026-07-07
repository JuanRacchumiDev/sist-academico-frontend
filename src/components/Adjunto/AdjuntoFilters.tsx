import { Search, Calendar, RefreshCw } from "lucide-react";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Programa } from "../../interfaces/IPrograma";

export interface AdjuntoFiltersData {
  idPrograma: string;
  fechaInicio: string;
  fechaFinal: string;
}

interface AdjuntoFiltersProps {
  onSearch: (filters: AdjuntoFiltersData) => void;
  programas: Programa[];
}

export const AdjuntoFilters: React.FC<AdjuntoFiltersProps> = ({
  onSearch,
  programas,
}) => {
  const [filters, setFilters] = useState<AdjuntoFiltersData>({
    idPrograma: "all",
    fechaInicio: "",
    fechaFinal: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Limpiamos los valores "all" antes de enviar al servicio
    const cleanFilters = {
      ...filters,
      idPrograma: filters.idPrograma === "all" ? "" : filters.idPrograma,
    };
    onSearch(cleanFilters);
  };

  const handleReset = () => {
    const resetValues = {
      idPrograma: "all",
      fechaInicio: "",
      fechaFinal: "",
    };
    setFilters(resetValues);
    onSearch({ idPrograma: "", fechaInicio: "", fechaFinal: "" });
  };

  return (
    <form
      onSubmit={handleSearch}
      className="p-4 bg-slate-50/50 border-b border-slate-200 rounded-xl w-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-3 space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-wider flex items-center gap-1">
            Programa
          </label>
          <Select
            value={filters.idPrograma}
            onValueChange={(value) => handleSelectChange("idPrograma", value)}
          >
            <SelectTrigger className="bg-white border-slate-200 w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los programas</SelectItem>
              {programas.map((item) => (
                <SelectItem key={item.id} value={item.id?.toString() || ""}>
                  {item.titulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-3 space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Fecha de Inicio
          </label>
          <div className="relative">
            <Input
              type="date"
              name="fechaInicio"
              placeholder="Fecha de Inicio"
              value={filters.fechaInicio}
              onChange={handleInputChange}
              className="bg-white border-slate-200 focus:ring-blue-500 w-full"
            />
          </div>
        </div>

        <div className="md:col-span-3 space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Fecha Final
          </label>
          <div className="relative">
            <Input
              type="date"
              name="fechaFinal"
              placeholder="Fecha Final"
              value={filters.fechaFinal}
              onChange={handleInputChange}
              className="bg-white border-slate-200 focus:ring-blue-500 w-full"
            />
          </div>
        </div>

        <div className="md:col-span-2 flex gap-2">
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
          >
            Filtrar
          </Button>
          <Button
            type="button"
            onClick={handleReset}
            variant="outline"
            className="border-slate-200 text-slate-600 hover:bg-slate-100 p-2"
            title="Limpiar filtros"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </form>
  );
};
