import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import ErrorPage, { type ErrorKind } from "./ErrorPage";
import Navbar from "./Navbar";
import Footer from "./Footer";

/** Route-level error boundary: maps router/API errors onto the styled error pages. */
export default function RouteError() {
  const error = useRouteError();
  let kind: ErrorKind = 500;
  let detail: string | undefined;
  if (isRouteErrorResponse(error)) {
    kind = error.status === 404 ? 404 : error.status === 403 || error.status === 401 ? 403 : 500;
    detail = error.statusText || undefined;
  } else if (error instanceof Error) {
    detail = error.message;
  }
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1"><ErrorPage kind={kind} detail={detail} /></main>
      <Footer />
    </div>
  );
}
