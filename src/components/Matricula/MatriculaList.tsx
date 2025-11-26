import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { MatriculaTable } from "./MatriculaTable";

export const MatriculaList = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Listado de matrícula
        </h1>
        <div className="flex space-x-3">
          <Link
            to={"/matricula/nuevo"}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            Nueva matrícula
          </Link>
        </div>
      </div>
      <Card className="shadow-lg border-gray-200">
        <CardContent>
          <MatriculaTable />
        </CardContent>
      </Card>
    </div>
  );
};
