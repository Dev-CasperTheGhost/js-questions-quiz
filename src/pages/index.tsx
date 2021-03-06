import * as React from "react";
import Head from "next/head";
import { QuestionView } from "components/Question/Question";
import { Parser } from "lib/Parser";
import { GetStaticProps } from "next";
import { Question } from "types/Question";
import { getRandomQuestion } from "lib/questions";
import { SplashScreen } from "components/Splash/SplashScreen";
import { useRouter } from "next/dist/client/router";
import { AllQuestionsCompletedModal } from "components/Modal/AllQuestionsCompleted";

interface Props {
  questions: Question[];
}

export default function Index({ questions }: Props) {
  const router = useRouter();

  const [started, setStarted] = React.useState<boolean>(false);
  const [handledQuestions, setHandledQuestions] = React.useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = React.useState<Question | null>(null);

  React.useEffect(() => {
    /** for testing only */
    if (process.env.NODE_ENV === "development" && router.query.force) {
      const question = questions.find((v) => v.number === (router.query.force as string));

      if (question) {
        setCurrentQuestion(question);
      }
    } else {
      setCurrentQuestion(getRandomQuestion(questions));
    }
  }, [questions, router.query]);

  function handleNextQuestion() {
    setHandledQuestions((p) => p + 1);

    if (handledQuestions + 1 === questions.length) return;

    setCurrentQuestion(getRandomQuestion(questions));
  }

  if (started && !currentQuestion) {
    return <p>loading question..</p>;
  }

  if (!started) {
    return (
      <>
        <Head>
          <title>JavaScript Questions Quiz</title>
        </Head>

        <SplashScreen onStart={() => setStarted(true)} />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Question #{currentQuestion.number} - JavaScript Questions Quiz</title>
      </Head>

      {handledQuestions === questions.length ? <AllQuestionsCompletedModal /> : null}

      <QuestionView
        score={`${handledQuestions}/${questions.length}`}
        handleNextQuestion={handleNextQuestion}
        question={currentQuestion}
      />
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const parser = new Parser();
  const questions = await parser.loadPage();

  return {
    props: {
      questions,
    },
    // every hour
    revalidate: 60 * 60,
  };
};
