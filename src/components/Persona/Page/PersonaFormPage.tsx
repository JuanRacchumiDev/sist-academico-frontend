import { useParams } from "react-router-dom";
import { PersonaForm } from "../PersonaForm";

export const PersonaFormPage = () => {
  const { nombreGrupo } = useParams<{ nombreGrupo: string }>();
  return (
    <div>
      <PersonaForm nombreGrupo={nombreGrupo} />
    </div>
  );
};
