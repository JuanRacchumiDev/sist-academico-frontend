import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { ProgramaTable } from "./ProgramaTable";

export const ProgramaList = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Listado de programas
        </h1>
        <div className="flex space-x-3">
          <Link
            to={"/programa-academico/nuevo"}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            Nuevo programa
          </Link>
        </div>
      </div>
      <Card className="shadow-lg border-gray-200">
        <CardContent>
          <ProgramaTable />
        </CardContent>
      </Card>
    </div>
  );
};
