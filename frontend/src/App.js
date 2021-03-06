import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";

//import Users from "./user/pages/Users";
//import NewPlace from "./places/pages/NewPlace";
//import UserPlaces from "./places/pages/UserPlaces";
//import UpdatePlace from "./places/pages/UpdatePlace";
//import Auth from "./user/pages/Auth";
import MainNavigation from "./shared/components/Navigation/MainNavigation";
import LoadingSpinner from "./shared/components/UIElements/LoadingSpinner";
import { AuthContext } from "./shared/context/auth-context";
import { useAuth } from "./shared/hooks/auth-hook";
import { ToastContainer } from "react-toastify";

const Users = React.lazy(() => import("./user/pages/Users"));
const NewPlace = React.lazy(() => import("./places/pages/NewPlace"));
const UserPlaces = React.lazy(() => import("./places/pages/UserPlaces"));
const UpdatePlace = React.lazy(() => import("./places/pages/UpdatePlace"));
const Auth = React.lazy(() => import("./user/pages/Auth"));
const ConfirmEmail = React.lazy(() => import("./user/pages/ConfirmEmail"));
const ResetPassword = React.lazy(() => import("./user/pages/ResetPassword"));
const Settings = React.lazy(() => import("./user/pages/Settings"));
const Favourites = React.lazy(() => import("./user/pages/Favourites"));

const App = () => {
  const { username, token, login, logout, userId, isAdmin } = useAuth();
  let routes;

  if (token) {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:username/places" exact>
          <UserPlaces />
        </Route>
        <Route path="/places/new" exact>
          <NewPlace />
        </Route>
        <Route path="/places/:placeId">
          <UpdatePlace />
        </Route>
        <Route path="/verify/:tempToken">
          <ConfirmEmail />
        </Route>
        <Route path="/settings">
          <Settings />
        </Route>
        <Route path="/favourites">
          <Favourites />
        </Route>
        <Redirect to="/" />
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:username/places" exact>
          <UserPlaces />
        </Route>
        <Route path="/auth">
          <Auth />
        </Route>
        <Route path="/verify/:tempToken">
          <ConfirmEmail />
        </Route>
        <Route path="/reset-password/:identificationToken/:restorationToken">
          <ResetPassword />
        </Route>
        <Redirect to="/auth" />
      </Switch>
    );
  }

  return (
    <React.Fragment>
      <ToastContainer
        position="top-center"
        autoClose={10000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <span style={{ visibility: "hidden" }}>
        Horrible hackfix, without this my viewheight gets all messed up. Not
        good enough yet to figure out why..
      </span>
      <AuthContext.Provider
        value={{
          isLoggedIn: !!token,
          username: username,
          token: token,
          userId: userId,
          isAdmin: isAdmin,
          login: login,
          logout: logout,
        }}>
        <Router>
          <MainNavigation />
          <main>
            <Suspense
              fallback={
                <div className="center">
                  <LoadingSpinner />
                </div>
              }>
              {routes}
            </Suspense>
          </main>
        </Router>
      </AuthContext.Provider>
    </React.Fragment>
  );
};

export default App;
