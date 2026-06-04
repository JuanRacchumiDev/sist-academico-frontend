import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Matricula } from "../../interfaces/IMatricula";
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ListFilter,
  ArrowLeft,
  Link,
  Wallet,
  Hash,
  Loader2,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { getDetalleFiltered } from "../../services/detalleParametroService";
import {
  getModulosPendientes,
  getModulosCancelados,
} from "../../services/matriculaService";
import { createPago } from "../../services/pagoService";
import {
  ModuloPendiente,
  ModuloPagado,
  PagoResponse,
  Pago,
} from "../../interfaces/IPago";
import {
  DetalleParametro,
  DetalleParametroFilters,
} from "../../interfaces/IDetalleParametro";
import { ParametroClase } from "../../params/parametroClase";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RequiredLabel } from "../Common/RequiredLabel";

const loadFormasPago = async () => {
  const filters: DetalleParametroFilters = {
    parametro_clase: ParametroClase.FORMA_PAGO,
    en_persona: false,
    en_empresa: false,
    estado: true,
  };
  const response = await getDetalleFiltered(filters);
  return response.result && response.data
    ? (response.data as DetalleParametro[])
    : [];
};

const loadModulosPendientes = async (matriculaId: number) => {
  const response = await getModulosPendientes(matriculaId);
  console.log("load módulos pendientes de pago para matrícula: ", matriculaId);
  console.log({ response });
  return response.result && response.data
    ? (response.data.modulos as ModuloPendiente[])
    : [];
};

const loadModulosPagados = async (matriculaId: number) => {
  const response = await getModulosCancelados(matriculaId);
  console.log("load módulos cancelados para matrícula: ", matriculaId);
  console.log({ response });
  return response.result && response.data
    ? (response.data.modulos as ModuloPagado[])
    : [];
};

interface FormularioPagoProps {
  matriculaSeleccionada: Matricula;
  idModulo?: number;
  idInstitucion: number;
  onSave?: (pago: Pago) => void;
  onCancel: () => void;
}

export const baseFormSchema = z.object({
  idFormaPago: z.string().min(1, "Debe seleccionar una forma de pago"),
  concepto: z.string().default(""),
  numeroModulo: z.coerce.number().min(1, "Debe seleccionar un módulo"),
  numeroOperacion: z.string().default(""),
  fechaPago: z.date({ message: "La fecha de pago es requerida" }),
  cantidadEfectivo: z.coerce.number().default(0),
  cantidadOperacion: z.coerce.number().default(0),
  formaPagoNombre: z.string().optional(),
});

export const formSchema = baseFormSchema.superRefine((val, ctx) => {
  const nombreForma = val.formaPagoNombre?.toLowerCase() ?? "";

  if (nombreForma.includes("efectivo")) {
    if (val.cantidadEfectivo <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El monto en efectivo es requerido",
        path: ["cantidadEfectivo"],
      });
    }
  }

  if (
    nombreForma.includes("plin") ||
    nombreForma.includes("transferencia") ||
    nombreForma.includes("yape")
  ) {
    if (val.cantidadOperacion <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El monto remoto es requerido",
        path: ["cantidadOperacion"],
      });
    }

    if (!val.numeroOperacion || val.numeroOperacion.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El código de operación es requerido para el monto remoto",
        path: ["numeroOperacion"],
      });
    }
  }

  if (nombreForma.includes("mixto")) {
    if (val.cantidadEfectivo <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El monto en efectivo es requerido",
        path: ["cantidadEfectivo"],
      });
    }

    if (val.cantidadOperacion <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El monto remoto es requerido",
        path: ["cantidadOperacion"],
      });
    }

    if (!val.numeroOperacion || val.numeroOperacion.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El código de operación es requerido para el monto remoto",
        path: ["numeroOperacion"],
      });
    }
  }
});

type TFormInput = z.input<typeof formSchema>;
type TFormOutput = z.output<typeof formSchema>;

const today = new Date();

export const PagoForm: React.FC<FormularioPagoProps> = ({
  matriculaSeleccionada,
  idModulo,
  idInstitucion,
  onSave,
  onCancel,
}) => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formasPago, setFormasPago] = useState<DetalleParametro[]>([]);
  const [modulosPendientes, setModulosPendientes] = useState<ModuloPendiente[]>(
    [],
  );
  const [modulosPagados, setModulosPagados] = useState<ModuloPagado[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const inputErrorClass = (invalid: boolean) =>
    invalid
      ? "border-red-500 focus:ring-red-500 focus-visible:ring-red-500"
      : "focus:ring-blue-500";

  const form = useForm<TFormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idFormaPago: "",
      concepto: "",
      numeroModulo: "",
      numeroOperacion: "",
      fechaPago: today,
      cantidadEfectivo: 0,
      cantidadOperacion: 0,
      formaPagoNombre: "",
    },
  });

  const { watch, setValue, reset } = form;
  const currentFormaPago = watch("idFormaPago");
  const currentCantidadEfectivo = watch("cantidadEfectivo") || 0;
  const currentCantidadOperacion = watch("cantidadOperacion") || 0;
  const totalRecibido =
    Number(currentCantidadEfectivo) + Number(currentCantidadOperacion);

  const { isSubmitting, errors } = form.formState;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [listFormasPago, listModulosPendientes, listModulosPagados] =
          await Promise.all([
            loadFormasPago(),
            loadModulosPendientes(matriculaSeleccionada.id),
            loadModulosPagados(matriculaSeleccionada.id),
          ]);

        setFormasPago(listFormasPago);
        setModulosPendientes(listModulosPendientes);
        setModulosPagados(listModulosPagados);
      } catch (error) {
        console.error("Error al cargar los catálogos formulario", error);
        showToast("error", "Error al cargar los catálogos del formulario.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [matriculaSeleccionada.id]);

  // Manejar el cambio de forma de pago para mapear el nombre al esquema de validación
  const handleFormaPagoChange = (val: string) => {
    setValue("idFormaPago", val);
    const seleccionado = formasPago.find((f) => f.codigo?.toString() === val);
    setValue("formaPagoNombre", seleccionado?.nombre ?? "", {
      shouldValidate: true,
    });
  };

  const onSubmit: SubmitHandler<TFormOutput> = async (values) => {
    try {
      console.log({ values });

      const fechaPagoStr = values.fechaPago
        ? format(values.fechaPago, "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd");

      const payload: Pago = {
        id_matricula: matriculaSeleccionada.id,
        id_institucion: matriculaSeleccionada.id_institucion ?? idInstitucion,
        id_formapago: +values.idFormaPago,
        concepto: values.concepto,
        numero_modulo: values.numeroModulo,
        numero_operacion: values.numeroOperacion,
        fecha_pago: fechaPagoStr,
        // fecha_vencimiento: values.fechaVencimiento,
        cantidad_efectivo: values.cantidadEfectivo,
        cantidad_operacion: values.cantidadOperacion,
        estado: true,
      };

      console.log({ payload });

      const response = await createPago(payload);
      console.log("response pago");
      console.log({ response });

      const { result, message } = response as PagoResponse;

      if (result) {
        showToast("success", "Pago registrado con éxito");
        if (onSave) onSave(payload);
        handleCancelar();
      } else {
        showToast("error", message || "Error al procesar la matrícula");
      }
    } catch (error) {
      console.error("Error en submit de pago", error);
      showToast(
        "error",
        "Ocurrió un error inesperado al procesar el formulario.",
      );
    }
  };

  const handleCancelar = () => {
    reset();
    onCancel();
  };

  const formaPagoSeleccionada = formasPago.find(
    (f) => f.codigo?.toString() === currentFormaPago,
  );
  const nombreForma = formaPagoSeleccionada?.nombre?.toLowerCase() ?? "";
  const mostrarEfectivo =
    nombreForma.includes("efectivo") || nombreForma.includes("mixto");
  const mostrarDigital =
    nombreForma.includes("transferencia") ||
    nombreForma.includes("yape") ||
    nombreForma.includes("plin") ||
    nombreForma.includes("depósito") ||
    nombreForma.includes("deposito") ||
    nombreForma.includes("mixto");

  return (
    <div className="max-w-6xl mx-auto bg-slate-50 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
      {/* Encabezado Principal */}
      <div className="bg-slate-950 px-8 py-5 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          {/* Enlace Volver */}
          {/* <Link
            to="/matricula"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors mb-2 group font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            Volver a Matrículas
          </Link> */}
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <CreditCard className="text-indigo-400 w-6 h-6" />
            Caja Chica: Registro de Pago
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Estudiante:{" "}
            <span className="font-bold text-slate-200">
              {matriculaSeleccionada?.persona?.nombre_completo}
            </span>
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Matrícula Referencia:
          </span>
          <span className="text-indigo-400 font-mono font-bold text-sm">
            #{matriculaSeleccionada?.id ?? "0"}
          </span>
        </div>
      </div>

      {/* Grid de 2 Columnas Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 bg-white">
        {/* COLUMNA IZQUIERDA: Formulario de Registro de Pago (7 Columnas de 12) */}
        <div className="lg:col-span-7 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
            <span className="flex items-center justify-center bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full text-xs font-bold">
              1
            </span>
            Datos de la Transacción
          </h3>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="numeroModulo"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col w-full">
                    <RequiredLabel>Seleccionar módulo por pagar</RequiredLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        setValue(
                          "concepto",
                          val ? `Pago de Módulo N° ${val}` : "",
                        );
                      }}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={`w-full ${inputErrorClass(fieldState.invalid)}`}
                        >
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {modulosPendientes.length === 0 ? (
                          <SelectItem value="0" disabled>
                            🎉 ¡Todos los módulos están pagados!
                          </SelectItem>
                        ) : (
                          modulosPendientes.map((mod) => (
                            <SelectItem
                              key={mod.numero_modulo}
                              value={mod.numero_modulo.toString()}
                            >
                              Módulo N° {mod.numero_modulo} (Pendiente)
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Concepto del Pago */}
              <FormField
                control={form.control}
                name="concepto"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <RequiredLabel>Concepto del Recibo</RequiredLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ej. Pago de Matrícula - Modulo I"
                        className={inputErrorClass(fieldState.invalid)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Selector de Forma de Pago */}
              <FormField
                control={form.control}
                name="idFormaPago"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col w-full">
                    <RequiredLabel>Forma de pago</RequiredLabel>
                    <Select
                      onValueChange={handleFormaPagoChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={`w-full ${inputErrorClass(fieldState.invalid)}`}
                        >
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {formasPago.map((fp) => (
                          <SelectItem
                            value={fp.codigo!.toString()}
                            key={fp.codigo}
                          >
                            {fp.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campos Dinámicos de Arqueo de Valores */}
              {(mostrarEfectivo || mostrarDigital) && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Arqueo de Valores
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mostrarEfectivo && (
                      <FormField
                        control={form.control}
                        name="cantidadEfectivo"
                        render={({ field, fieldState }) => (
                          <FormItem
                            className={mostrarDigital ? "" : "md:col-span-2"}
                          >
                            <FormLabel className="text-xs font-medium text-slate-600">
                              Monto Efectivo Recibido (S/.)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                value={(field.value as number | string) ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                className={inputErrorClass(fieldState.invalid)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {mostrarDigital && (
                      <>
                        <FormField
                          control={form.control}
                          name="cantidadOperacion"
                          render={({ field, fieldState }) => (
                            <FormItem
                              className={mostrarEfectivo ? "" : "md:col-span-2"}
                            >
                              <FormLabel className="text-xs font-medium text-slate-600">
                                Monto Remoto / App (S/.)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...field}
                                  value={(field.value as number | string) ?? ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className={inputErrorClass(
                                    fieldState.invalid,
                                  )}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="numeroOperacion"
                          render={({ field, fieldState }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-xs font-medium text-slate-600">
                                Código Único de Operación
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ej: OPE-987123"
                                  className={`uppercase font-mono ${inputErrorClass(fieldState.invalid)}`}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Totalizador */}
              <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-xl shadow-inner mt-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Total Neto a Recibir:
                </span>
                <span className="text-2xl font-mono font-black text-emerald-400">
                  S/. {totalRecibido.toFixed(2)}
                </span>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelar}
                  className="rounded-xl hover:bg-slate-100"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Procesando Pago...
                    </>
                  ) : (
                    "Emitir y Guardar Pago"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* COLUMNA DERECHA: Control de Historiales */}
        <div className="lg:col-span-5 bg-slate-50/60 p-6 md:p-8 flex flex-col space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <ListFilter className="text-indigo-600 w-5 h-5" />
              Estado Analítico de Módulos
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Monitoreo en tiempo real de los módulos registrados bajo esta
              matrícula.
            </p>
          </div>

          {/* Módulos pendientes */}

          {/* <div className="space-y-3">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Créditos Pendientes / En Proceso
            </span>
            {loading ? (
              <p className="text-xs text-slate-400">Cargando módulos...</p>
            ) : modulosPendientes.length === 0 ? (
              <div className="p-4 border border-dashed border-slate-200 text-center text-xs text-slate-400 rounded-xl bg-white">
                El alumno no registra saldos pendientes.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {modulosPendientes.map((det) => (
                  <div
                    key={det.numero_modulo}
                    onClick={() => setValue("numeroModulo", det.numero_modulo)}
                    className={`p-3.5 border rounded-xl bg-white shadow-sm transition cursor-pointer flex justify-between items-center ${
                      watch("numeroModulo") === det.numero_modulo
                        ? "border-amber-500 ring-2 ring-amber-200 bg-amber-50/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-800">
                        Módulo N° {det.numero_modulo}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-800 rounded-md">
                      Por pagar
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div> */}

          {/* Módulos pagados */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Historial de Módulos Cancelados
            </span>
            {modulosPagados.length === 0 ? (
              <div className="p-4 border border-dashed border-slate-200 text-center text-xs text-slate-400 rounded-xl bg-white">
                No se registran transacciones previas aprobadas.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {modulosPagados.map((modPagado, index) => {
                  const totalFila =
                    (Number(modPagado.cantidad_efectivo) || 0) +
                    (Number(modPagado.cantidad_operacion) || 0);

                  return (
                    <div
                      key={index}
                      className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-emerald-200 transition-all flex flex-col gap-2"
                    >
                      {/* Cabecera del item */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="text-xs font-bold text-slate-800 leading-tight">
                            {modPagado.concepto ||
                              `Pago de Módulo N° ${modPagado.numero_modulo}`}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md shrink-0">
                          S/. {totalFila.toFixed(2)}
                        </span>
                      </div>

                      {/* Detalles en Grid de Metadatos */}
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1.5 border-t border-slate-100 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {modPagado.fecha_pago
                            ? format(
                                parseISO(modPagado.fecha_pago),
                                "dd/MM/yyyy",
                              )
                            : "---"}
                        </span>
                        <span className="flex items-center gap-1.5 truncate">
                          <Wallet className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">
                            {modPagado.nombre_formapago || "No especificado"}
                          </span>
                        </span>

                        {/* Desglose de montos si es mixto o específico */}
                        <div className="col-span-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] bg-slate-50 p-1.5 rounded-md mt-0.5 text-slate-600">
                          {!!modPagado.cantidad_efectivo && (
                            <span>
                              EFEC:{" "}
                              <strong className="font-mono text-slate-700">
                                S/.
                                {Number(modPagado.cantidad_efectivo).toFixed(2)}
                              </strong>
                            </span>
                          )}
                          {!!modPagado.cantidad_operacion && (
                            <span>
                              REMOTO:{" "}
                              <strong className="font-mono text-slate-700">
                                S/.
                                {Number(modPagado.cantidad_operacion).toFixed(
                                  2,
                                )}
                              </strong>
                            </span>
                          )}
                          {modPagado.numero_operacion && (
                            <span className="flex items-center gap-0.5 font-mono text-indigo-600 ml-auto font-medium">
                              <Hash className="w-3 h-3" />{" "}
                              {modPagado.numero_operacion}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
