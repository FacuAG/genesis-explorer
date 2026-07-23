import Layout from "../components/Layout";
import { getPromises } from "../services/genesisService";

export default function PromisesPage() {
  const promises = getPromises();

  return (
    <Layout>
      <h1>Promesas Mesiánicas</h1>

      {promises.map((promise) => (
        <div key={promise.id}>
          <h3>{promise.title}</h3>

          <p>
            Línea:
            {" "}
            {promise.through?.join(", ")}
          </p>
        </div>
      ))}
    </Layout>
  );
}