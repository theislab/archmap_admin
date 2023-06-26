import { Grid } from "@mui/material";
import { Outlet } from "react-router-dom";
import CustomSidebar, { RouteConfig } from "./reusables/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "./features/auth/authSlice";
import { RootState } from "./store";

const PageLayout = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  let routes: RouteConfig[] = [];
  if (auth && auth.role !== "") {
    if (auth.role === "admin") {
      routes = [
        { path: "/admin", name: "Admin" },
        { path: "/atlas", name: "Atlases" },
      ];
    } else {
      routes = [{ path: "/atlas", name: "Atlases" }];
    }
  } else {
    routes = [
      { path: "/login", name: "Login" },
      { path: "/signup", name: "Sign Up" },
    ];
  }
  return (
    <Grid container>
      <Grid item md={2}>
        <CustomSidebar routes={routes} />
      </Grid>
      <Grid item md={8}>
        <Outlet /> {/* nested routes rendered here */}
      </Grid>
    </Grid>
  );
};

export default PageLayout;
