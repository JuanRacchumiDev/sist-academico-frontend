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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Save, BookOpen, LayoutList } from "lucide-react";
import { Programa } from "@/interfaces/IPrograma";
import {
  createModulosMultiple,
  updateModulosMultiple,
  getModulosByPrograma,
} from "../../services/moduloService";
import { useToast } from "../../context/ToastContext";
import { replace } from "react-router-dom";

const moduloSchema = z.object({
  modulos: z.array(
    z.object({
      id: z.number().optional(),
      titulo: z.string().min(3, "El título es demasiado corto"),
    }),
  ),
});

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
  const [existsModulos, setExistsModulos] = useState(false);

  const form = useForm<z.infer<typeof moduloSchema>>({
    resolver: zodResolver(moduloSchema),
    defaultValues: { modulos: [] },
    // defaultValues: {
    //   modulos: Array.from({ length: programa.numero_modulos || 0 }, () => ({
    //     titulo: "",
    //   })),
    // },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "modulos",
  });

  useEffect(() => {
    if (isOpen && programa.id) {
      const fetchModulos = async () => {
        try {
          const response = await getModulosByPrograma(programa.id);

          const { result, data } = response;

          if (result && data.length > 0) {
            replace(data.map((m: any) => ({ id: m.id, titulo: m.titulo })));
            setExistsModulos(true);
          } else {
            const emptyFields = Array.from(
              { length: programa.numero_modulos || 0 },
              () => ({
                titulo: "",
              }),
            );

            replace(emptyFields);
            setExistsModulos(false);
          }
        } catch (error) {
          console.error("Error cargando módulos", error);
        }
      };
      fetchModulos();
    }
  }, [isOpen, programa.id, programa.numero_modulos, replace]);

  const onSubmit = async (values: z.infer<typeof moduloSchema>) => {
    if (!programa.id) return;

    setIsSubmitting(true);

    try {
      const { modulos } = values;

      const response = existsModulos
        ? await updateModulosMultiple(programa.id, modulos)
        : await createModulosMultiple(programa.id, modulos);

      //   const response = await createModulosMultiple(programa.id, modulos);

      if (response.result) {
        showToast("success", response.message || "Cambios guardados con éxito");
        if (onSuccess) onSuccess();
        onClose();
        // form.reset();
      }
    } catch (error: any) {
      const errorMsg = error.message || "No se pudieron registrar los módulos";
      showToast("error", errorMsg);

      if (error.errors) {
        console.table(error.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md w-full p-0 flex flex-col h-full bg-slate-50">
        {/* CABECERA FIJA */}
        <SheetHeader className="py-3 px-6 bg-white border-b shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg mt-1">
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-lg font-bold text-slate-800 leading-tight">
                Estructura de Módulos
              </SheetTitle>
              <SheetDescription className="text-slate-500 text-sm mt-0.5 block italic">
                {programa.titulo}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* CUERPO CON SCROLL - Contenedor centrado */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Form {...form}>
            <form
              id="modulo-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="max-w-sm mx-auto space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-600">
                  Total requeridos:{" "}
                  <span className="text-blue-600 font-bold">
                    {programa.numero_modulos}
                  </span>
                </span>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-blue-300"
                >
                  <div className="bg-slate-100/50 px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      Módulo {index + 1}
                    </span>
                    <LayoutList className="h-3 w-3 text-slate-300" />
                  </div>

                  <div className="p-4">
                    <FormField
                      control={form.control}
                      name={`modulos.${index}.titulo`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-slate-700">
                            Título descriptivo
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej. Fundamentos iniciales..."
                              {...field}
                              className="border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </form>
          </Form>
        </div>

        {/* PIE DE PÁGINA FIJO - Evita el desbordamiento */}
        <div className="p-6 bg-white border-t mt-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex gap-3 max-w-sm mx-auto">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              form="modulo-form" // Conecta el botón externo con el form interno
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Guardando..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {existsModulos ? "Actualizar cambios" : "Guardar cambios"}
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
