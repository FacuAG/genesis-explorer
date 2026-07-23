import Layout from "../components/Layout";
import { getQuestions } from "../services/genesisService";

export default function QuestionsPage() {
  const questions = getQuestions();

  return (
    <Layout>
      <h1>Preguntas Difíciles</h1>

      {questions.map((question) => (
        <div key={question.id}>
          <h3>{question.title}</h3>
        </div>
      ))}
    </Layout>
  );
}