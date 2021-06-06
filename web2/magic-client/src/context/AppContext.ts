import { AppConfigType } from "assets/types/types";
import React from "react";
const AppContext = React.createContext<AppConfigType | undefined>(undefined);
export default AppContext;
