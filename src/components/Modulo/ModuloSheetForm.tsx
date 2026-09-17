import React, { useEffect, useState } from "react";
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
  Calendar,
  Layers,
  Loader2,
  Tag,
  FileText,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
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

// Esquema de validación Zod actualizado usando exclusivamente `plan`
const moduloItemSchema = z.object({
  id: z.number().optional(),
  titulo: z.string().min(3, "El título es obligatorio (mínimo 3 caracteres)"),
  temario: z.string().nullable().optional(),
  orden: z.number().optional(),
  plan_existe: z.boolean().optional(),
  plan_url: z.string().nullable().optional(),
  plan: z
    .custom<File>((val) => val instanceof File, "Debe ser un archivo válido")
    .optional()
    .nullable(),
});

const moduloSchema = z.object({
  modulos: z.array(moduloItemSchema),
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
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);

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
          const { result, data } = response;

          let modulosExistentes: Modulo[] = [];

          if (result && Array.isArray(data) && data.length > 0) {
            setExistsModulos(true);
            modulosExistentes = data;
          } else if (
            Array.isArray(programa.detalle_modulos) &&
            programa.detalle_modulos.length > 0
          ) {
            setExistsModulos(true);
            modulosExistentes = programa.detalle_modulos as Modulo[];
          } else {
            setExistsModulos(false);
          }

          const totalRequerido = programa.numero_modulos || 0;
          const itemsFormulario: ModuloFormValues["modulos"] = [];
          const initialOpenKeys: string[] = [];

          for (let i = 0; i < totalRequerido; i++) {
            const itemKey = `item-${i}`;

            if (i < modulosExistentes.length) {
              const item = modulosExistentes[i];
              itemsFormulario.push({
                id: item.id,
                titulo: item.titulo || "",
                temario: item.temario || "",
                orden: item.orden || i + 1,
                plan_existe: item.plan_existe ?? false,
                plan_url: item.plan_url ?? null,
                plan: null,
              });
            } else {
              itemsFormulario.push({
                titulo: "",
                temario: "",
                orden: i + 1,
                plan_existe: false,
                plan_url: null,
                plan: null,
              });
            }

            if (i < 2) {
              initialOpenKeys.push(itemKey);
            }
          }

          replace(itemsFormulario);
          setOpenAccordionItems(initialOpenKeys);
        } catch (error) {
          console.error("Error cargando módulos:", error);
          showToast("error", "Error al obtener la lista de módulos.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchModulos();
    } else {
      form.reset({ modulos: [] });
      setOpenAccordionItems([]);
      setExistsModulos(false);
    }
  }, [isOpen, programa, replace, form, showToast]);

  const handleExpandAll = () => {
    setOpenAccordionItems(fields.map((_, idx) => `item-${idx}`));
  };

  const handleCollapseAll = () => {
    setOpenAccordionItems([]);
  };

  const onSubmit = async (values: ModuloFormValues) => {
    if (!programa.id) return;

    setIsSubmitting(true);

    try {
      const { modulos } = values;

      console.log({ modulos });

      const response = existsModulos
        ? await updateModulosMultiple(programa.id, modulos)
        : await createModulosMultiple(programa.id, modulos);

      const { result, message, data } = response;

      if (result && data) {
        showToast("success", message || "Módulos guardados correctamente");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        showToast("error", message || "Error al procesar los módulos");
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Error al registrar/actualizar los módulos";
      showToast("error", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="sm:max-w-2xl w-full p-0 flex flex-col h-full bg-slate-50 border-l border-slate-200"
      >
        {/* CABECERA FIJA */}
        <SheetHeader className="py-4 px-6 bg-white border-b shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base font-bold text-slate-800 leading-snug">
                Configuración de Módulos
              </SheetTitle>
              <SheetDescription className="text-slate-500 text-xs mt-0.5 font-medium truncate">
                {programa.titulo}
              </SheetDescription>
            </div>
          </div>

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

        {/* BARRAS DE HERRAMIENTAS RÁPIDAS */}
        {!isLoading && fields.length > 0 && (
          <div className="px-6 py-2 bg-slate-100/80 border-b border-slate-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Mostrando {fields.length} módulos
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExpandAll}
                className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium hover:underline"
              >
                <ChevronDown className="h-3 w-3" />
                Expandir todos
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-800 font-medium hover:underline"
              >
                <ChevronUp className="h-3 w-3" />
                Colapsar todos
              </button>
            </div>
          </div>
        )}

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
                <Accordion
                  type="multiple"
                  value={openAccordionItems}
                  onValueChange={setOpenAccordionItems}
                  className="space-y-3"
                >
                  {fields.map((field, index) => {
                    const tituloActual = form.watch(`modulos.${index}.titulo`);
                    const planFile = form.watch(`modulos.${index}.plan`);
                    const planExiste = form.watch(
                      `modulos.${index}.plan_existe`,
                    );
                    const planUrl = form.watch(`modulos.${index}.plan_url`);

                    const tienePlan = Boolean(planFile) || Boolean(planExiste);

                    return (
                      <AccordionItem
                        key={field.id}
                        value={`item-${index}`}
                        className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 overflow-hidden transition-all hover:border-blue-200"
                      >
                        <AccordionTrigger className="hover:no-underline py-3 text-left flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 font-bold text-xs px-2.5 py-1 rounded-md shrink-0">
                              Mód. {index + 1}
                            </span>
                            <span className="text-xs font-semibold text-slate-800 leading-snug truncate">
                              {tituloActual?.trim() ? (
                                tituloActual
                              ) : (
                                <span className="text-slate-400 italic">
                                  Pendiente de título...
                                </span>
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 pr-1">
                            {tienePlan ? (
                              <Badge
                                variant="outline"
                                className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] gap-1 py-0 px-2 font-medium"
                              >
                                <FileText className="h-3 w-3 text-emerald-600" />
                                PDF
                              </Badge>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-normal hidden sm:inline-block">
                                Sin PDF
                              </span>
                            )}
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="pt-3 pb-4 border-t border-slate-100 space-y-4 mt-1">
                          {/* CAMPO: Título */}
                          <FormField
                            control={form.control}
                            name={`modulos.${index}.titulo`}
                            render={({ field: inputField }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-bold text-slate-700 flex items-center justify-between">
                                  <span>
                                    Título del Módulo{" "}
                                    <span className="text-red-500">*</span>
                                  </span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Ej. Fundamentos Técnicos e Introducción"
                                    autoComplete="off"
                                    {...inputField}
                                    className="border-slate-200 text-xs focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </FormControl>
                                <FormMessage className="text-[11px]" />
                              </FormItem>
                            )}
                          />

                          {/* CAMPO: Temario */}
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
                                    autoComplete="off"
                                    className="border-slate-200 text-xs focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[70px]"
                                  />
                                </FormControl>
                                <FormMessage className="text-[11px]" />
                              </FormItem>
                            )}
                          />

                          {/* CAMPO: Subida de Plan (PDF) */}
                          <FormField
                            control={form.control}
                            name={`modulos.${index}.plan`}
                            render={({
                              field: { value, onChange, ...fieldProps },
                            }) => (
                              <FormItem>
                                <div className="flex items-center justify-between">
                                  <FormLabel className="text-xs font-bold text-slate-700">
                                    Plan del Módulo (PDF)
                                  </FormLabel>
                                  {planExiste && planUrl && (
                                    <a
                                      href={planUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 px-2 py-0.5 rounded border border-blue-100 transition-colors"
                                    >
                                      <Download className="h-3 w-3" />
                                      <span>Descargar plan actual</span>
                                      <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                                    </a>
                                  )}
                                </div>
                                <FormControl>
                                  <Input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0] || null;
                                      onChange(file);
                                    }}
                                    {...fieldProps}
                                    className="border-slate-200 text-xs focus:ring-blue-500 focus:border-blue-500"
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
                  {existsModulos ? "Actualizar Módulos" : "Guardar Módulos"}
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
