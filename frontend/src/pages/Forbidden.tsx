import ErrorPage from "../components/ErrorPage";

export default function Forbidden() {
  return <ErrorPage kind={403} />;
}
