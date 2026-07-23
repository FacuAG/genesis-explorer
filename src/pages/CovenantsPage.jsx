import Layout from "../components/Layout";
import { getCovenants } from "../services/genesisService";

export default function CovenantsPage() {
  const covenants = getCovenants();

  return (
    <Layout>
      <h1>Pactos</h1>

      {covenants.map((covenant) => (
        <div key={covenant.id}>
          <h3>{covenant.name}</h3>

          <p>
            Participantes:
            {" "}
            {covenant.participants.join(", ")}
          </p>
        </div>
      ))}
    </Layout>
  );
}