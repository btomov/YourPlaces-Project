import { useState, useCallback, useEffect } from "react";
//import { useHttpClient } from "../../shared/hooks/http-hook";

let logoutTimer;

export const useAuth = () => {
  const [token, setToken] = useState(false);
  const [userId, setUserId] = useState();
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState();
  const [tokenExpirationDate, setTokenExpirationDate] = useState();
  // const [favPlaces, setFavPlaces] = useState();
  //const { sendRequest } = useHttpClient();

  const login = useCallback((username, uid, token, isAdmin, expirationDate) => {
    setToken(token);
    setUserId(uid);
    setUsername(username);
    setIsAdmin(isAdmin);
    const tokenExpirationDate =
      expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
    setTokenExpirationDate(tokenExpirationDate);
    // localStorage.setItem("favouritePlaces", JSON.stringify(favPlaces));
    localStorage.setItem(
      "userData",
      JSON.stringify({
        username: username,
        userId: uid,
        token: token,
        expiration: tokenExpirationDate.toISOString(),
        isAdmin: isAdmin,
      })
    );
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUserId(null);
    setIsAdmin(null);
    setUsername(null);
    setTokenExpirationDate(null);
    localStorage.removeItem("userData");
    localStorage.removeItem("favouritePlaces");
  }, []);

  useEffect(() => {
    if (token && tokenExpirationDate) {
      const remainingTime =
        tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate]);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("userData"));
    if (
      storedData &&
      storedData.token &&
      new Date(storedData.expiration) > new Date()
    ) {
      login(
        storedData.username,
        storedData.userId,
        storedData.token,
        storedData.isAdmin,
        new Date(storedData.expiration)
      );
    }
  }, [login]);

  return { username, token, login, logout, userId, isAdmin };
};
