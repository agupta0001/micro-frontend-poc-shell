import {
  Fragment,
  lazy,
  ReactNode,
  Suspense,
  useEffect,
  useState,
} from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
} from "react-router-dom";

const TestComponent1 = lazy(() => import("microf_1/Test1"));
const TestComponent2 = lazy(() => import("microf_1/Test2"));

const loadNestedRoutes = async () => {
  return Promise.allSettled([
    // eslint-disable-next-line import/no-unresolved
    import("microf_1/App"),
  ]).then((results) =>
    results.filter((r) => r.status === "fulfilled").map((r) => r.value)
  );
};

export default function App() {
  const [routes, setRoutes] = useState<(() => ReactNode[])[]>([]);
  const [status, setStatus] = useState<string>("idle");

  useEffect(() => {
    loadNestedRoutes()
      .then((results) => {
        setRoutes(results.map((result) => result.default));
        setStatus("success");
      })
      .catch((error) => {
        setStatus("error");
        setRoutes([]);
        console.error(error);
      });
  }, []);

  console.log({ routes });

  const router =
    status === "success"
      ? createBrowserRouter(
          createRoutesFromElements(
            <>
              <Route path="/" element={<h1>Hello from app</h1>} />
              <Route path="/test1" element={<TestComponent1 />} />
              <Route path="/test2" element={<TestComponent2 />} />
              <Route element={<Outlet />} path="/microf_1">
                {routes.map(
                  (route, index) =>
                    typeof route === "function" && (
                      <Fragment key={index}>{route()}</Fragment>
                    )
                )}
              </Route>
            </>
          )
        )
      : null;

  if (!router) return "Loading...";

  return (
    <div>
      <Suspense fallback="Loading...">
        <RouterProvider router={router} />
      </Suspense>
    </div>
  );
}
