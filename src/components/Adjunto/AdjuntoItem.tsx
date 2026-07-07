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
        icon: <FileText className="w-8 h-8 text-red-500" />,
        bg: "bg-red-50 border-red-100",
      };
    }
    if (
      mimetype.includes("excel") ||
      mimetype.includes("spreadsheet") ||
      ["xlsx", "xls", "csv"].includes(ext)
    ) {
      return {
        icon: <FileSpreadsheet className="w-8 h-8 text-emerald-600" />,
        bg: "bg-emerald-50 border-emerald-100",
      };
    }
    if (
      mimetype.includes("word") ||
      mimetype.includes("officedocument.wordprocessingml") ||
      ["docx", "doc"].includes(ext)
    ) {
      return {
        icon: <FileCode className="w-8 h-8 text-blue-500" />,
        bg: "bg-blue-50 border-blue-100",
      };
    }
    if (
      mimetype.includes("image") ||
      ["png", "jpg", "jpeg", "svg", "webp"].includes(ext)
    ) {
      return {
        icon: <Image className="w-8 h-8 text-purple-500" />,
        bg: "bg-purple-50 border-purple-100",
      };
    }
    return {
      icon: <FileUp className="w-8 h-8 text-slate-500" />,
      bg: "bg-slate-50 border-slate-100",
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

  return (
    <div className="group relative bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full">
      <div>
        {/* Cabecera de la Tarjeta */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div
            className={`p-2.5 rounded-lg border ${fileConfig.bg} transition-transform group-hover:scale-105`}
          >
            {fileConfig.icon}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white">
              {/* CORREGIDO: Se pasa como función anónima ()=> para evitar ejecuciones inmediatas */}
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

        {/* Información del archivo */}
        <div className="space-y-1.5 mb-4">
          <h3 className="font-bold text-slate-800 text-sm break-words whitespace-normal group-hover:text-blue-600 transition-colors">
            {adjunto.titulo}
          </h3>
          <p className="text-xs text-slate-500 font-medium break-all whitespace-normal">
            {adjunto.originalname}
          </p>
        </div>
      </div>

      {/* Footer de la tarjeta */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium mt-auto">
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
