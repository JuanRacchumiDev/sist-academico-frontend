import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Save,
  BookOpen,
  FileText,
  Calendar,
  Layers,
  Loader2,
  Tag,
} from "lucide-react";
import { Programa } from "@/interfaces/IPrograma";
import { Modulo } from "@/interfaces/IModulo";
import {
  createModulosMultiple,
  getModulosByPrograma,
  updateModulosMultiple,
} from "../../services/moduloService";
import { formatDate } from "../../utils/dateUtils";
import { useToast } from "../../context/ToastContext";

const moduloSchema = z.object({
  modulos: z.array(
    z.object({
      id: z.number().optional(),
      titulo: z
        .string()
        .min(3, "El título es obligatorio (mínimo 3 caracteres)"),
      temario: z.string().nullable().optional(),
      orden: z.number().optional(),
    }),
  ),
});

type ModuloFormValues = z.infer<typeof moduloSchema>;

interface Props {
  programa: Programa;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ModuloSheetForm: React.FC<Props> = ({
  programa,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [existsModulos, setExistsModulos] = useState(false);

  const form = useForm<ModuloFormValues>({
    resolver: zodResolver(moduloSchema),
    defaultValues: { modulos: [] },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "modulos",
  });

  useEffect(() => {
    if (isOpen && programa.id) {
      const fetchModulos = async () => {
        setIsLoading(true);
        try {
          const response = await getModulosByPrograma(programa.id);

          console.log({ response });

          const { result, data } = response;

          if (result && Array.isArray(data) && data.length > 0) {
            setExistsModulos(true);
          } else {
            setExistsModulos(false);
          }

          const totalRequerido = programa.numero_modulos || 0;
          const modulosExistentes: Modulo[] =
            (programa.detalle_modulos as Modulo[]) || [];
          const itemsFormulario: any[] = [];

          for (let i = 0; i < totalRequerido; i++) {
            if (i < modulosExistentes.length) {
              const item = modulosExistentes[i];
              itemsFormulario.push({
                id: item.id,
                titulo: item.titulo || "",
                temario: item.temario || "",
                orden: item.orden || i + 1,
              });
            } else {
              itemsFormulario.push({
                titulo: "",
                temario: "",
                orden: i + 1,
              });
            }
          }

          replace(itemsFormulario);
        } catch (error) {
          console.error("Error cargando módulos:", error);
          showToast("error", "Error al obtener la lista de módulos.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchModulos();
    }
  }, [isOpen, programa]);

  const onSubmit = async (values: ModuloFormValues) => {
    if (!programa.id) return;

    setIsSubmitting(true);

    try {
      console.log({ values });

      const { modulos } = values;

      console.log({ modulos });

      const response = existsModulos
        ? await updateModulosMultiple(programa.id, modulos)
        : await createModulosMultiple(programa.id, modulos);

      console.log({ response });

      const { result, message, data } = response;

      if (result && data) {
        showToast("success", message || "Módulos actualizados correctamente");

        if (onSuccess) onSuccess();
        onClose();
      } else {
        showToast("error", message || "Error al actualizar los módulos");
        return;
      }
    } catch (error: any) {
      const errorMsg =
        error?.message || "Error al registrar/actualizar los módulos";
      showToast("error", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      {/* sm:max-w-xl expande el panel lateral hacia la izquierda manteniendo su anclaje a la derecha */}
      <SheetContent
        side="right"
        className="sm:max-w-xl w-full p-0 flex flex-col h-full bg-slate-50 border-l border-slate-200"
      >
        {/* CABECERA FIJA */}
        <SheetHeader className="py-4 px-6 bg-white border-b shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base font-bold text-slate-800 leading-snug">
                Configuración y Módulos
              </SheetTitle>
              <SheetDescription className="text-slate-500 text-xs mt-0.5 font-medium break-words">
                {programa.titulo}
              </SheetDescription>
            </div>
          </div>

          {/* ETIQUETAS DE CONTEXTO: Segmento, Tipo de Programa y Fechas */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] gap-1 py-0.5"
              >
                <Tag className="h-3 w-3 text-slate-400" />
                {programa.segmento?.nombre ?? "Sin Segmento"}
              </Badge>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] gap-1 py-0.5 font-semibold"
              >
                {programa.tipo_programa?.nombre ?? "Sin Tipo"}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-100">
              <div className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-slate-400" />
                <span>Módulos:</span>
                <strong className="text-slate-900 font-bold">
                  {programa.numero_modulos}
                </strong>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  {formatDate(programa.fecha_inicio)} —{" "}
                  {formatDate(programa.fecha_final)}
                </span>
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* CUERPO CON SCROLL Y ACORDEÓN */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-xs font-medium">
                Cargando estructura de módulos...
              </span>
            </div>
          ) : (
            <Form {...form}>
              <form
                id="modulo-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <Accordion type="multiple" className="space-y-3">
                  {fields.map((field, index) => {
                    const tituloActual = form.watch(`modulos.${index}.titulo`);
                    return (
                      <AccordionItem
                        key={field.id}
                        value={`item-${field.id}`}
                        className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 overflow-hidden transition-all hover:border-blue-200"
                      >
                        <AccordionTrigger className="hover:no-underline py-3 text-left flex items-start gap-3">
                          <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 font-bold text-xs px-2.5 py-1 rounded-md shrink-0 mt-0.5">
                            Módulo {index + 1}
                          </span>
                          <span className="text-xs font-semibold text-slate-800 leading-snug flex-1 whitespace-normal break-words">
                            {tituloActual?.trim() ? (
                              tituloActual
                            ) : (
                              <span className="text-slate-400 italic">
                                Pendiente de completar...
                              </span>
                            )}
                          </span>
                        </AccordionTrigger>

                        <AccordionContent className="pt-2 pb-4 border-t border-slate-100 space-y-3 mt-1">
                          {/* CAMPO: Título del módulo */}
                          <FormField
                            control={form.control}
                            name={`modulos.${index}.titulo`}
                            render={({ field: inputField }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-bold text-slate-700">
                                  Título del Módulo
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Ej. Fundamentos Técnicos e Introducción"
                                    {...inputField}
                                    className="border-slate-200 text-xs focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </FormControl>
                                <FormMessage className="text-[11px]" />
                              </FormItem>
                            )}
                          />

                          {/* CAMPO: Temario del módulo */}
                          <FormField
                            control={form.control}
                            name={`modulos.${index}.temario`}
                            render={({ field: textareaField }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-bold text-slate-700">
                                  Temario / Contenido
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    rows={3}
                                    placeholder="Escribe los temas detallados del módulo..."
                                    {...textareaField}
                                    value={textareaField.value || ""}
                                    className="border-slate-200 text-xs focus:ring-blue-500 focus:border-blue-500 resize-none"
                                  />
                                </FormControl>
                                <FormMessage className="text-[11px]" />
                              </FormItem>
                            )}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </form>
            </Form>
          )}
        </div>

        {/* PIE DE PÁGINA FIJO */}
        <div className="p-4 bg-white border-t mt-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              className="border-slate-200 text-slate-600 hover:bg-slate-50 text-xs h-9 px-4"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              form="modulo-form"
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 text-xs h-9 px-5"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-3.5 w-3.5" />
                  {existsModulos ? "Actualizar Cambios" : "Guardar Módulos"}
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
