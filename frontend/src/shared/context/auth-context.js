import { createContext } from "react";

export const AuthContext = createContext({
  isLoggedIn: false,
  isAdmin: false,
  username: null,
  userId: null,
  token: null,
  login: () => {},
  logout: () => {},
});
