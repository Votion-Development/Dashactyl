import React from "react";
import Main from "./pages/Index";
import { ContextWrapper } from "./Context";

export const App = () => {
  return (
    <ContextWrapper>
      <Main />
    </ContextWrapper>
  );
};

export default App;
