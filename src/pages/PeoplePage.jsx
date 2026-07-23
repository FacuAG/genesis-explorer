import Layout from "../components/Layout";
import genesisData from "../data/genesis-v3.json";

export default function PeoplePage() {
  return (
    <Layout>
      <h1>Línea Mesiánica</h1>

      <ol>
        {genesisData.main_genealogy.map((name, i) => (
          <li key={i}>{name}</li>
        ))}
      </ol>
    </Layout>
  );
}