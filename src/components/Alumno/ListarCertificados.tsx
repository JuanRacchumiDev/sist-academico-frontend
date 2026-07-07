import React from "react";
import { Certificado } from "@/interfaces/ICertificado";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, QrCode, Hash } from "lucide-react";

interface ListarCertificadosProps {
  certificados: Certificado[];
}

export const ListarCertificados: React.FC<ListarCertificadosProps> = ({
  certificados,
}) => {
  if (certificados.length === 0) {
    return (
      <Card className="border-dashed border-slate-200 p-8 text-center text-muted-foreground shadow-sm">
        No se registran certificados digitales emitidos a tu nombre todavía.
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {certificados
        .filter((c) => c.estado)
        .map((cert) => (
          <Card
            key={cert.id}
            className="border-slate-200 shadow-md bg-white hover:border-indigo-200 transition-all group overflow-hidden"
          >
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              {/* Cabecera Tarjeta Certificado */}
              <div className="flex gap-3 items-start">
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 group-hover:bg-amber-100/70 transition-colors shrink-0">
                  <Award className="h-5 w-5 text-amber-600" />
                </div>
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {cert.tipoCertificado?.nombre || "Certificación"}
                  </span>
                  <h4 className="text-sm font-bold text-slate-800 line-clamp-2 pt-1 leading-snug">
                    {cert.nombre_impresion || "Certificado Académico"}
                  </h4>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Evento: {cert.programa?.titulo || "---"}
                  </p>
                </div>
              </div>

              {/* Código e Identificador QR */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-left font-mono">
                  <span className="block text-[9px] uppercase font-bold tracking-widest text-slate-400">
                    Código de Verificación
                  </span>
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Hash className="h-3 w-3 text-indigo-500" />
                    {cert.codigo_verificacion || "C-PROV"}
                  </span>
                </div>
                {cert.codigo_qr_path && (
                  <div className="p-1 bg-white border border-slate-200 rounded-lg shadow-inner">
                    <img
                      src={cert.codigo_qr_path}
                      alt="QR"
                      className="h-8 w-8 object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Acciones */}
              {cert.path_file && (
                <Button
                  size="sm"
                  className="w-full bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-sm rounded-xl gap-2 mt-2"
                  asChild
                >
                  <a
                    href={cert.path_file}
                    download={cert.filename || "certificado.pdf"}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download className="h-4 w-4" />
                    Descargar Certificado PDF
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
    </div>
  );
};
