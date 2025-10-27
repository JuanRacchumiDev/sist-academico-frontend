import { useParams } from "react-router-dom";
import { PersonaList } from "../PersonaList";

export const PersonaListPage = () => {
  const { nombreGrupo } = useParams<{ nombreGrupo: string }>();
  return (
    <div>
      <PersonaList nombreGrupo={nombreGrupo} />
    </div>
  );
};
