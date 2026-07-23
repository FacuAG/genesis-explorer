import Layout from "../components/Layout";
import {
  getPeople,
  getTimelineEvents,
  getLocations,
  getCovenants,
  getQuestions
} from "../services/genesisService";

export default function DashboardPage() {
  return (
    <Layout>
      <h1>Genesis Explorer</h1>

      <h2>Estadísticas</h2>

      <ul>
        <li>Personas: {getPeople().length}</li>
        <li>Eventos: {getTimelineEvents().length}</li>
        <li>Ubicaciones: {getLocations().length}</li>
        <li>Pactos: {getCovenants().length}</li>
        <li>Preguntas: {getQuestions().length}</li>
      </ul>
    </Layout>
  );
}