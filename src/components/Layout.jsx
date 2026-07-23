import { Link } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div>
      <nav
        style={{
          padding: "15px",
          display: "flex",
          gap: "15px",
          borderBottom: "1px solid #ddd"
        }}
      >
        <Link to="/">Inicio</Link>
        <Link to="/timeline">Timeline</Link>
        <Link to="/people">Personas</Link>
        <Link to="/genealogy">Genealogía</Link>
        <Link to="/covenants">Pactos</Link>
        <Link to="/promises">Promesas</Link>
        <Link to="/questions">Preguntas</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>

      <div style={{ padding: "20px" }}>
        {children}
      </div>
    </div>
  );
}