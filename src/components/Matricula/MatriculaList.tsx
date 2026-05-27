import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { MatriculaTable } from "./MatriculaTable";
import { Plus, Users, ArrowLeft } from "lucide-react";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";

export const MatriculaList = () => {
  const newRoute = `/matricula/nuevo`;

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
            Listado de <span className="text-blue-600">matrículas</span>
          </h1>
          <p className="text-sm text-slate-500">
            Administra, visualiza y gestiona la información de todas las
            matrículas registradas.
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
            <Plus className="w-5 h-5" /> Nueva matrícula
          </Link>
        </div>
      </div>

      <Card className="border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
        <CardContent className="p-0 sm:pt-0 sm:pl-3 sm:pr-3">
          <MatriculaTable />
        </CardContent>
      </Card>
    </div>
  );

  // return (
  //   <div>
  //     <div className="flex justify-between items-center mb-6">
  //       <h1 className="text-2xl font-bold text-gray-800">
  //         Listado de matrícula
  //       </h1>
  //       <div className="flex space-x-3">
  //         <Link
  //           to={"/matricula/nuevo"}
  //           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
  //         >
  //           Nueva matrícula
  //         </Link>
  //       </div>
  //     </div>
  //     <Card className="shadow-lg border-gray-200">
  //       <CardContent>
  //         <MatriculaTable />
  //       </CardContent>
  //     </Card>
  //   </div>
  // );
};
