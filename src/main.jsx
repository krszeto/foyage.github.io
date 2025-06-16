import "./index.css";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
} from "@apollo/client";
import * as ReactDOM from "react-dom/client";
import FoyageHome from "./FoyageHome.jsx";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import CreatePlan from "./plan/CreatePlan.jsx";
import Plan from "./plan/Plan.jsx";
import AllPlans from "./plan/AllPlans.jsx";
import RegisterUser from "./plan/RegisterUser.jsx";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const client = new ApolloClient({
  // uri: "http://localhost:8000/graphql/",
  uri: "https://tbbchpcgyn.us-west-2.awsapprunner.com/graphql/",
  cache: new InMemoryCache(),
});

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/foyage.github.io/" element={<FoyageHome />} />
      <Route path="/foyage.github.io/user/:id/trip/new" element={<CreatePlan />} />
      <Route path="/foyage.github.io/trip/:trip_id" element={<Plan />} />
      <Route path="/foyage.github.io/register" element={<RegisterUser />} />
      <Route path="/foyage.github.io/trips/all" element={<AllPlans />} />
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById("root"));

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

root.render(
  <ApolloProvider client={client}>
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  </ApolloProvider>
);
