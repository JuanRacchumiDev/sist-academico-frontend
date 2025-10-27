import React from "react";
import { FormLabel } from "../ui/form";

export const RequiredLabel: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <FormLabel>{children} *</FormLabel>;
