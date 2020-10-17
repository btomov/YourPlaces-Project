import React, { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
//import { useHistory } from "react-router-dom";
import { useHttpClient } from "../../../shared/hooks/http-hook";
import { AuthContext } from "../../context/auth-context";
import "./NavLinks.css";
import AvatarButton from "../../../user/components/AvatarButton";

const NavLinks = (props) => {
  const { sendRequest } = useHttpClient();
  const [userData, setUserData] = useState();
  const auth = useContext(AuthContext);
  //const history = useHistory();

  useEffect(() => {
    if (auth.isLoggedIn && auth.userId) {
      const fetchUser = async () => {
        try {
          const responseData = await sendRequest(
            `${process.env.REACT_APP_BACKEND_URL}/users/${auth.userId}`
          );
          setUserData(responseData.user);
        } catch (err) {}
      };
      fetchUser();
    }
  }, [sendRequest, auth.isLoggedIn, auth.userId, auth.username, auth]);
  return (
    <ul className="nav-links">
      <li>
        <NavLink to="/" exact>
          ALL USERS
        </NavLink>
      </li>
      {/* {auth.isLoggedIn && (
        <li>
          <NavLink to={`/${auth.username}/places`}>MY PLACES</NavLink>
        </li>
      )} */}
      {auth.isLoggedIn && (
        <li>
          <NavLink to="/places/new">ADD PLACE</NavLink>
        </li>
      )}
      {!auth.isLoggedIn && (
        <li>
          <NavLink to="/auth">AUTHENTICATE</NavLink>
        </li>
      )}
      {auth.isLoggedIn && userData && (
        <div className="isLoggedIn">
          <AvatarButton
            avatar={`${process.env.REACT_APP_ASSET_URL}/${userData.image}`}
            username={auth.username}
          />
        </div>
      )}
      {/* {auth.isLoggedIn && (
        <li>
          <button onClick={()=>auth.logout()}>LOGOUT</button>
        </li>
      )} */}
    </ul>
  );
};

export default NavLinks;
