import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { PersonaTable } from "./PersonaTable";

interface PersonaListProps {
  nombreGrupo?: string;
}

/**
 * Función auxiliar para obtener los mensajes descriptivos
 */
const getNombresDescriptivos = (
  group: string | undefined
): { singular: string; plural: string; buttonPrefix: string } => {
  const defaultNombres = {
    singular: "Persona",
    plural: "Personas",
    buttonPrefix: "Nueva",
  };
  if (!group) return defaultNombres;

  // Mapeo de grupos a nombres descriptivos
  const mapping: {
    [key: string]: { singular: string; plural: string; buttonPrefix: string };
  } = {
    alumno: { singular: "Alumno", plural: "Alumnos", buttonPrefix: "Nuevo" },
    promotor: {
      singular: "Promotor",
      plural: "Promotores",
      buttonPrefix: "Nuevo",
    },
    cobrador: {
      singular: "Cobrador",
      plural: "Cobradores",
      buttonPrefix: "Nuevo",
    },
  };

  return mapping[group.toLowerCase()] || defaultNombres;
};

export const PersonaList: React.FC<PersonaListProps> = ({ nombreGrupo }) => {
  // Obtener los nombres dinámicos basados en el grupo
  const nombres = getNombresDescriptivos(nombreGrupo);

  // Construir la ruta de nuevo registro de forma dinámica: /personas/[nombreGrupo]/nuevo
  const newRoute = nombreGrupo
    ? `/personas/${nombreGrupo}/nuevo`
    : "/personas/nuevo";

  // Construir el texto del botón: Nuevo/a [Nombre Singular]
  const buttonText = `${nombres.buttonPrefix} ${nombres.singular}`;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Listado de {nombres.plural}
        </h1>
        <div className="flex space-x-3">
          <Link
            to={newRoute}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            {buttonText}
          </Link>
        </div>
      </div>
      <Card className="shadow-lg border-gray-200">
        <CardContent>
          <PersonaTable nombreGrupo={nombreGrupo} />
        </CardContent>
      </Card>
    </div>
  );
};
