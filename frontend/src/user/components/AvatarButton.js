import React from "react";
import "./AvatarButton.css";
import { Dropdown, Image } from "semantic-ui-react";

const options = [
  { key: "user", text: "Account", icon: "user" },
  { key: "settings", text: "Settings", icon: "settings" },
  { key: "sign-out", text: "Sign Out", icon: "sign out" },
];

const AvatarButton = (props) => {
  const clicked = (key) => {
    console.log("clicked " + key);
  };

  const trigger = (
    <span>
      <Image avatar src={props.avatar} /> {props.name}
    </span>
  );

  //https://stackoverflow.com/questions/55142019/how-to-link-or-route-the-react-semantic-ui-dropdown-component could be VERY helpful
  return (
    <React.Fragment>
      <Dropdown
        trigger={trigger}
        options={options}
        pointing="top left"
        icon={null}
      />
      {/* <Dropdown
        floating
        labeled
        closeOnChange
        className="icon"
        direction="left">
        <Dropdown.Menu>
          <Dropdown.Header content="User Settings" />
          {avatarDropdownOptions.map((option) => (
            <Dropdown.Item
              key={option.value}
              {...option}
              onClick={() => clicked(option.key)}
            />
          ))}
        </Dropdown.Menu>
      </Dropdown> */}
    </React.Fragment>
  );
};

export default AvatarButton;
