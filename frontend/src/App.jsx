// App.jsx — rutas de la aplicación
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Turnos from "./pages/Turnos";
import Cuenta from "./pages/Cuenta";
import Productos from "./pages/Productos";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/turnos" element={<Turnos />} />
        <Route path="/cuenta" element={<Cuenta />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
}
