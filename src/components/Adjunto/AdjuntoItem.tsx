import React from "react";
import { Adjunto } from "@/interfaces/IAdjunto";
import {
  FileText,
  FileSpreadsheet,
  FileUp,
  Image,
  FileCode,
  MoreVertical,
  Download,
  Trash2,
  Edit,
  GraduationCap,
  Bookmark,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

interface AdjuntoItemProps {
  adjunto: Adjunto;
}

export const AdjuntoItem: React.FC<AdjuntoItemProps> = ({ adjunto }) => {
  const navigate = useNavigate();

  const handleShowDetail = () => {
    navigate(`/adjunto/editar/${adjunto.id}`);
  };

  const getFileConfig = (mimetype: string, originalname: string) => {
    const ext = originalname.split(".").pop()?.toLowerCase() || "";

    if (mimetype.includes("pdf") || ext === "pdf") {
      return {
        icon: <FileText className="w-7 h-7 text-red-500" />,
        bg: "bg-red-50/80 border-red-100",
      };
    }
    if (
      mimetype.includes("excel") ||
      mimetype.includes("spreadsheet") ||
      ["xlsx", "xls", "csv"].includes(ext)
    ) {
      return {
        icon: <FileSpreadsheet className="w-7 h-7 text-emerald-600" />,
        bg: "bg-emerald-50/80 border-emerald-100",
      };
    }
    if (
      mimetype.includes("word") ||
      mimetype.includes("officedocument.wordprocessingml") ||
      ["docx", "doc"].includes(ext)
    ) {
      return {
        icon: <FileCode className="w-7 h-7 text-blue-500" />,
        bg: "bg-blue-50/80 border-blue-100",
      };
    }
    if (
      mimetype.includes("image") ||
      ["png", "jpg", "jpeg", "svg", "webp"].includes(ext)
    ) {
      return {
        icon: <Image className="w-7 h-7 text-purple-500" />,
        bg: "bg-purple-50/80 border-purple-100",
      };
    }
    return {
      icon: <FileUp className="w-7 h-7 text-slate-500" />,
      bg: "bg-slate-50/80 border-slate-100",
    };
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const fileConfig = getFileConfig(
    adjunto.mimetype || "",
    adjunto.originalname || "",
  );

  const nombrePrograma = adjunto.programa?.titulo || "Sin programa asignado";
  const tipoPrograma = adjunto.programa?.tipo_programa?.nombre || "General";

  return (
    <div className="group relative bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between h-full">
      <div>
        {/* Cabecera: Icono de Archivo, Badge Tipo Programa y Menú */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`p-2 rounded-lg border ${fileConfig.bg} transition-transform group-hover:scale-105 shrink-0`}
            >
              {fileConfig.icon}
            </div>

            {/* Badge para Tipo de Programa */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60 truncate max-w-[130px]">
              <Bookmark className="w-2.5 h-2.5 text-slate-400 shrink-0" />
              <span className="truncate">{tipoPrograma}</span>
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0">
              <MoreVertical className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white">
              <DropdownMenuItem
                onClick={handleShowDetail}
                className="gap-2 text-slate-600 cursor-pointer"
              >
                <Edit className="w-4 h-4" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-slate-600 cursor-pointer">
                <Download className="w-4 h-4" /> Descargar
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer">
                <Trash2 className="w-4 h-4" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Contenido Principal */}
        <div className="space-y-2 mb-4">
          {/* Título del Adjunto */}
          <h3 className="font-bold text-slate-800 text-sm leading-snug break-words group-hover:text-blue-600 transition-colors">
            {adjunto.titulo || "Sin título"}
          </h3>

          {/* Nombre del Programa con Icono */}
          <div className="flex items-start gap-1.5 text-xs text-slate-600 font-medium">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2 leading-tight" title={nombrePrograma}>
              {nombrePrograma}
            </span>
          </div>

          {/* Nombre Original del Archivo */}
          <p className="text-[11px] text-slate-400 font-normal break-all truncate">
            {adjunto.originalname}
          </p>
        </div>
      </div>

      {/* Footer de la tarjeta */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium mt-auto">
        <span>{formatBytes(adjunto.size || 0)}</span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
            adjunto.estado
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          {adjunto.estado ? "Activo" : "Inactivo"}
        </span>
      </div>
    </div>
  );
};
