import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { RecoilRoot } from "recoil";
import AuthProvider from "./components/AuthProvider";
import { BrowserRouter } from "react-router-dom";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found in index.html");
}

ReactDOM.createRoot(rootElement).render(
  <RecoilRoot>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </RecoilRoot>
);
