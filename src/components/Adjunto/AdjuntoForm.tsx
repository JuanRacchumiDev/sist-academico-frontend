import { useEffect, useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useToast } from "../../context/ToastContext";
import { Spinner } from "../../components/Common/Spinner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RequiredLabel } from "../../components/Common/RequiredLabel";
import {
  ArrowLeft,
  Save,
  XCircle,
  UploadCloud,
  FileCheck,
  FileText,
  ExternalLink,
} from "lucide-react";

import { getProgramas } from "../../services/programaService";
import { getModulosByPrograma } from "../../services/moduloService";
import {
  createAdjunto,
  getAdjuntoById,
  updateAdjunto,
} from "../../services/adjuntoService";
import { Programa } from "@/interfaces/IPrograma";
import { Modulo } from "@/interfaces/IModulo";
import { Adjunto } from "@/interfaces/IAdjunto";
import SearchableCombobox from "../../components/Common/SearchableCombobox";

const MAX_FILE_SIZE = 5242880; // 5MB

const formSchema = z.object({
  idPrograma: z
    .string({ message: "El programa es requerido" })
    .min(1, "El programa es requerido"),
  idModulo: z.string().optional().nullable(),
  nombre: z
    .string({ message: "El nombre es requerido" })
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  adjunto_file: z
    .instanceof(File)
    .nullable()
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      `El archivo debe ser menor a 5MB`,
    ),
});

export const AdjuntoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [programas, setProgramas] = useState<Programa[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [
    programaSeleccionadoTieneModulos,
    setProgramaSeleccionadoTieneModulos,
  ] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  // Estado para rastrear el archivo previamente subido
  const [existingFilepath, setExistingFilepath] = useState<string | null>(null);
  const [existingOriginalName, setExistingOriginalName] = useState<
    string | null
  >(null);

  const isEditMode = !!id;

  const inputErrorClass = (invalid: boolean) =>
    invalid
      ? "border-red-500 focus-visible:ring-red-500 bg-red-50/10 focus:border-red-500"
      : "border-slate-200 focus-visible:ring-blue-600 focus:border-blue-600 transition-all duration-200";

  const handleGoBack = () => {
    navigate(`/adjunto/`);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idPrograma: "",
      idModulo: null,
      nombre: "",
      adjunto_file: null,
    },
  });

  const watchIdPrograma = form.watch("idPrograma");
  const watchFile = form.watch("adjunto_file");
  const { isSubmitting } = form.formState;

  // Detectar cambios en el Programa y validar existencia real de módulos relacionales
  useEffect(() => {
    const handleProgramaChange = async () => {
      if (!watchIdPrograma) {
        setModulos([]);
        setProgramaSeleccionadoTieneModulos(false);
        form.setValue("idModulo", null);
        return;
      }

      try {
        const response = await getModulosByPrograma(+watchIdPrograma);

        const { result, data } = response;

        if (result && data && data.length > 0) {
          setModulos(data);
          setProgramaSeleccionadoTieneModulos(true);
        } else {
          setModulos([]);
          setProgramaSeleccionadoTieneModulos(false);
          form.setValue("idModulo", null);
        }
      } catch (error) {
        console.error("Error al cargar módulos", error);
        showToast(
          "error",
          "Ocurrió un error inesperado al buscar los módulos del programa.",
        );
        setModulos([]);
        setProgramaSeleccionadoTieneModulos(false);
        form.setValue("idModulo", null);
      }
    };

    handleProgramaChange();
  }, [watchIdPrograma, form]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const responseProgramas = await getProgramas();
        if (responseProgramas.result && responseProgramas.data) {
          setProgramas(responseProgramas.data as Programa[]);
        }

        if (isEditMode && id) {
          const responseAdjunto = await getAdjuntoById(+id);
          console.log({ responseAdjunto });
          const { result, data } = responseAdjunto;

          if (result && data) {
            const adjunto = data as Adjunto;

            setExistingFilepath(adjunto.filepath || null);
            setExistingOriginalName(adjunto.originalname || null);

            form.reset({
              idPrograma: adjunto.id_programa?.toString() || "",
              idModulo: adjunto.id_modulo?.toString() || null,
              nombre: adjunto.titulo,
              adjunto_file: null,
            });
          }
        }
      } catch (error) {
        console.error("Error al obtener datos iniciales", error);
        showToast("error", "Error al cargar los datos del formulario.");
      }
    };

    fetchInitialData();
  }, [id, isEditMode, form, showToast]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      form.setValue("adjunto_file", e.dataTransfer.files[0], {
        shouldValidate: true,
      });
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = new FormData();
      const { idPrograma, idModulo, nombre, adjunto_file } = values;

      if (isEditMode) {
        formData.append("_method", "PATCH");
      }

      formData.append("titulo", nombre);
      formData.append("id_programa", idPrograma);

      if (programaSeleccionadoTieneModulos && idModulo) {
        formData.append("id_modulo", idModulo);
      } else {
        formData.append("id_modulo", "");
      }

      if (adjunto_file) {
        formData.append("file", adjunto_file);
      }

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      const response =
        isEditMode && id
          ? await updateAdjunto(+id, formData, config)
          : await createAdjunto(formData, config);

      const { result, message } = response;

      if (response && result) {
        showToast(
          "success",
          message ||
            (isEditMode ? "Adjunto actualizado" : "Adjunto registrado"),
        );
        navigate(`/adjunto`);
      } else {
        showToast("error", message || "Error al procesar el adjunto");
      }
    } catch (error) {
      console.error("Error al registrar adjunto", error);
      showToast("error", "Error crítico al registrar el adjunto");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <Card className="shadow-xl border border-slate-100 bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="border-b border-slate-100 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gradient-to-r from-slate-50/50 to-white gap-4">
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <FileText className="h-6 w-6" />
              </span>
              {isEditMode ? `Editar Adjunto` : `Nuevo Archivo Adjunto`}
            </CardTitle>
            <CardDescription className="text-slate-500 text-sm font-normal pl-11">
              {isEditMode
                ? `Modifique el archivo o ubicación del adjunto en el sistema`
                : `Asigne y cargue un adjunto a un programa o módulo específico`}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={handleGoBack}
            className="border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl px-4 py-2 text-sm font-medium transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2 text-slate-500" />
            Volver al listado
          </Button>
        </CardHeader>

        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Sección 01 */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-sm shadow-blue-200">
                    1
                  </span>
                  <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                    Relación Institucional y Metadatos
                  </h3>
                  <div className="h-px bg-slate-100 flex-1"></div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="idPrograma"
                    render={({ field, fieldState }) => (
                      <FormItem className="w-full">
                        <RequiredLabel>Programa académico</RequiredLabel>
                        <SearchableCombobox<Programa>
                          placeholder="Buscar un programa"
                          options={programas}
                          value={field.value}
                          onChange={field.onChange}
                          displayKey="titulo"
                          valueKey="id"
                          searchKeys={["titulo"]}
                          isInvalid={fieldState.invalid}
                          renderOption={(programa) => (
                            <span className="font-semibold text-gray-900">
                              {programa.titulo}
                            </span>
                          )}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {programaSeleccionadoTieneModulos && (
                    <FormField
                      control={form.control}
                      name="idModulo"
                      render={({ field, fieldState }) => (
                        <FormItem className="flex flex-col gap-1 w-full transition-all duration-300 animate-in fade-in slide-in-from-top-2">
                          <RequiredLabel>
                            <span className="text-slate-700 font-medium">
                              Módulo del Programa
                            </span>
                          </RequiredLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? ""}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={`h-11 rounded-xl shadow-sm w-full text-left ${inputErrorClass(fieldState.invalid)}`}
                              >
                                <SelectValue placeholder="Seleccione el módulo correspondiente..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl shadow-lg border-slate-100 max-h-60">
                              {modulos.map((m) => (
                                <SelectItem
                                  value={m.id.toString()}
                                  key={m.id}
                                  className="cursor-pointer focus:bg-slate-50 rounded-lg whitespace-normal py-2"
                                >
                                  {m.titulo || `Módulo ${m.id}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs text-red-500 font-medium" />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field, fieldState }) => (
                      <FormItem className="flex flex-col gap-1 w-full">
                        <RequiredLabel>
                          <span className="text-slate-700 font-medium">
                            Nombre del Documento / Adjunto
                          </span>
                        </RequiredLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej. Sílabo Integrado, Guía de Aprendizaje Ciclo I..."
                            autoComplete="off"
                            maxLength={150}
                            {...field}
                            className={`h-11 rounded-xl shadow-sm placeholder:text-slate-400 ${inputErrorClass(fieldState.invalid)}`}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-500 font-medium" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Sección 02 */}
              <div className="space-y-6 pt-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-sm shadow-blue-200">
                    2
                  </span>
                  <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                    Carga del Archivo Binario
                  </h3>
                  <div className="h-px bg-slate-100 flex-1"></div>
                </div>

                <FormField
                  control={form.control}
                  name="adjunto_file"
                  render={({ field, fieldState }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <div
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 group text-center
                            ${isDragActive ? "border-blue-500 bg-blue-50/40" : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/50"}
                            ${fieldState.invalid ? "border-red-300 bg-red-50/10 hover:border-red-400" : ""}
                          `}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept=".pdf,.docx,.xlsx"
                            onChange={(e) =>
                              field.onChange(e.target.files?.[0] ?? null)
                            }
                          />

                          {watchFile ? (
                            <>
                              <div className="p-4 rounded-full bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                                <FileCheck className="h-8 w-8" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-semibold text-slate-800 line-clamp-1 max-w-md px-4">
                                  {watchFile.name}
                                </p>
                                <p className="text-xs text-slate-400 font-medium">
                                  Tamaño: {formatBytes(watchFile.size)}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  field.onChange(null);
                                  if (fileInputRef.current)
                                    fileInputRef.current.value = "";
                                }}
                                className="mt-1 h-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 text-xs px-3 font-medium"
                              >
                                Quitar archivo seleccionado
                              </Button>
                            </>
                          ) : existingFilepath ? (
                            <>
                              {/* AQUÍ SE MUESTRA EL ARCHIVO SI EXISTE EN EL FILEPATH */}
                              <div className="p-4 rounded-full bg-blue-50 text-blue-600 shadow-sm">
                                <FileText className="h-8 w-8" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                                  Archivo actualmente guardado:
                                </p>
                                <p className="text-sm font-medium text-slate-700 line-clamp-1 max-w-md px-4">
                                  {existingOriginalName || "Ver archivo actual"}
                                </p>
                                <a
                                  href={`http://sistacademico-ipede/storage/${existingFilepath}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-800 underline font-medium"
                                >
                                  Visualizar archivo actual{" "}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                              <p className="text-xs text-slate-400 mt-2 italic">
                                Siga arrastrando o haga click aquí si desea
                                **reemplazar** este archivo.
                              </p>
                            </>
                          ) : (
                            <>
                              <div className="p-4 rounded-full bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:scale-105 transition-all duration-200 shadow-sm">
                                <UploadCloud className="h-8 w-8" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-semibold text-slate-700">
                                  Suelte su archivo aquí o{" "}
                                  <span className="text-blue-600 group-hover:text-blue-700 underline underline-offset-2">
                                    explore localmente
                                  </span>
                                </p>
                                <p className="text-xs text-slate-400 font-normal">
                                  Soporta formatos PDF, Word o Excel de hasta
                                  5MB.
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 font-medium mt-1.5" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSubmitting}
                  onClick={() => {
                    form.reset();
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="w-full sm:w-auto h-11 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-medium px-5 text-sm transition-all"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Limpiar campos
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/10 rounded-xl px-6 text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4 animate-spin text-white" />
                      Procesando carga...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditMode
                        ? "Actualizar Registro"
                        : "Guardar y Publicar"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
