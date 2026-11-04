import ErrorPage from "../components/ErrorPage";

export default function ServerError() {
  return <ErrorPage kind={500} />;
}
