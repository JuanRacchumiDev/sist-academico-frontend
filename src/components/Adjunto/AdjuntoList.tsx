import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { AdjuntoTable } from "./AdjuntoTable";
import { AdjuntoGrid } from "./AdjuntoGrid";
import { Plus, Users, FolderOpen, ArrowLeft } from "lucide-react";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";

export const AdjuntoList = () => {
  const newRoute = `/adjunto/nuevo`;

  return (
    <div className="animate-in fade-in duration-200">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-500">
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Gestión Académica
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Repositorio de <span className="text-indigo-600">Adjuntos</span>
          </h1>
          <p className="text-xs text-slate-500">
            Administra, visualiza y descarga la documentación cargada en los
            programas y módulos.
          </p>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "hidden sm:flex gap-1.5 border-slate-200 text-slate-600 hover:bg-slate-50 text-xs px-3 h-8",
            )}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Panel Principal
          </Link>

          <Link
            to={newRoute}
            className={cn(
              buttonVariants({ size: "sm" }), // Tamaño ajustado a 'sm' para entorno compacto
              "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs gap-1.5 px-3 h-8 text-xs font-medium transition-colors",
            )}
          >
            <Plus className="w-4 h-4" /> Nuevo adjunto
          </Link>
        </div>
      </div>

      {/* Renderizado directo del mosaico (Removido el Card global rígido para dejar que las tarjetas resalten) */}
      <div className="border-slate-200 shadow-sm rounded-lg overflow-hidden bg-white">
        <AdjuntoGrid />
      </div>
    </div>
  );

  // return (
  //   <div className="animate-in fade-in duration-500">
  //     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
  //       <div className="space-y-1">
  //         <div className="flex items-center gap-2 text-slate-500 mb-1">
  //           <Users className="w-4 h-4" />
  //           <span className="text-xs font-semibold uppercase tracking-wider">
  //             Gestión Académica
  //           </span>
  //         </div>
  //         <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
  //           Listado de <span className="text-blue-600">adjuntos</span>
  //         </h1>
  //         <p className="text-sm text-slate-500">
  //           Administra, visualiza y gestiona la información de todos los
  //           adjuntos registrados.
  //         </p>
  //       </div>

  //       <div className="flex items-center gap-3">
  //         <Link
  //           to="/dashboard"
  //           className={cn(
  //             buttonVariants({ variant: "outline", size: "sm" }),
  //             "hidden sm:flex gap-2 border-slate-200 text-slate-600 hover:bg-slate-50",
  //           )}
  //         >
  //           <ArrowLeft className="w-4 h-4" />
  //           Panel Principal
  //         </Link>

  //         <Link
  //           to={newRoute}
  //           className={cn(
  //             buttonVariants({ size: "default" }),
  //             "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2 px-5",
  //           )}
  //         >
  //           <Plus className="w-5 h-5" /> Nuevo adjunto
  //         </Link>
  //       </div>
  //     </div>

  //     <Card className="border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
  //       <CardContent className="p-0 sm:pt-0 sm:pl-3 sm:pr-3">
  //         <AdjuntoTable />
  //       </CardContent>
  //     </Card>
  //   </div>
  // );
};
