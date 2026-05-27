import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { PersonaTable } from "./PersonaTable";
import { Plus, Users, ArrowLeft } from "lucide-react"; // Iconos para el toque profesional
import { buttonVariants } from "../ui/button"; // Si usas shadcn, aprovecha sus variantes
import { cn } from "@/lib/utils";

interface PersonaListProps {
  nombreGrupo?: string;
}

/**
 * Función auxiliar para obtener los mensajes descriptivos
 */
const getNombresDescriptivos = (
  group: string | undefined,
): { singular: string; plural: string; buttonPrefix: string } => {
  const defaultNombres = {
    singular: "Persona",
    plural: "Personas",
    buttonPrefix: "Nueva",
  };

  if (!group) return defaultNombres;

  const mapping: Record<
    string,
    { singular: string; plural: string; buttonPrefix: string }
  > = {
    alumno: { singular: "Alumno", plural: "Alumnos", buttonPrefix: "Nuevo" },
    promotor: {
      singular: "Promotor",
      plural: "Promotores",
      buttonPrefix: "Nuevo",
    },
    cobrador: {
      singular: "Cobrador",
      plural: "Cobradores",
      buttonPrefix: "Nuevo",
    },
  };

  return mapping[group.toLowerCase()] || defaultNombres;
};

export const PersonaList: React.FC<PersonaListProps> = ({ nombreGrupo }) => {
  // Obtener los nombres dinámicos basados en el grupo
  const nombres = getNombresDescriptivos(nombreGrupo);

  // Construir la ruta de nuevo registro de forma dinámica: /personas/[nombreGrupo]/nuevo
  const newRoute = nombreGrupo
    ? `/personas/${nombreGrupo}/nuevo`
    : "/personas/nuevo";

  // Construir el texto del botón: Nuevo/a [Nombre Singular]
  const buttonText = `${nombres.buttonPrefix} ${nombres.singular}`;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Gestión Académica
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Listado de <span className="text-blue-600">{nombres.plural}</span>
          </h1>
          <p className="text-sm text-slate-500">
            Administra, visualiza y gestiona la información de todos los{" "}
            {nombres.plural.toLowerCase()} registrados.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "hidden sm:flex gap-2 border-slate-200 text-slate-600 hover:bg-slate-50",
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Panel Principal
          </Link>

          <Link
            to={newRoute}
            className={cn(
              buttonVariants({ size: "default" }),
              "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2 px-5",
            )}
          >
            <Plus className="w-5 h-5" />
            {buttonText}
          </Link>
        </div>
      </div>

      <Card className="border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
        <CardContent className="p-0 sm:pt-0 sm:pl-3 sm:pr-3">
          <PersonaTable nombreGrupo={nombreGrupo} />
        </CardContent>
      </Card>
    </div>
  );
};
