import React, { useContext } from "react";
import { Dropdown, Image } from "semantic-ui-react";
import { Link, useHistory } from "react-router-dom";
import { AuthContext } from "../../shared/context/auth-context";

const AvatarButton = (props) => {
  const auth = useContext(AuthContext);
  const history = useHistory();

  const logoutAndRedirect = () => {
    auth.logout();
    history.push("/");
  };

  const trigger = (
    <span className="avatar">
      <Image avatar src={props.avatar} /> {props.username}
    </span>
  );

  return (
    <Dropdown trigger={trigger} pointing="top right" icon={null}>
      <Dropdown.Menu>
        <Dropdown.Item
          text="My Places"
          icon="user"
          as={Link}
          to={`/${auth.username}/places`}
        />
        <Dropdown.Item
          text="Settings"
          icon="settings"
          as={Link}
          to="/settings"
        />
        <Dropdown.Item
          text="Sign Out"
          icon="sign out"
          onClick={logoutAndRedirect}
        />
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default AvatarButton;
