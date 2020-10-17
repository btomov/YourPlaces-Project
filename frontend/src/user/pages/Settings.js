import React, { useEffect, useContext, useState } from "react";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { useHistory } from "react-router-dom";
import Button from "../../shared/components/FormElements/Button";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import Avatar from "../../shared/components/UIElements/Avatar";
import Input from "../../shared/components/FormElements/Input";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";

import { useForm } from "../../shared/hooks/form-hook";
import { AuthContext } from "../../shared/context/auth-context";
import "./Settings.css";

const Settings = (props) => {
  const auth = useContext(AuthContext);
  const history = useHistory();
  const userId = auth.userId;
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [userData, setUserData] = useState();
  const [forceUpdate, setForceUpdate] = useState();

  const [formState, inputHandler, setFormData] = useForm(
    {
      username: {
        value: "",
        isValid: true,
      },
      email: {
        value: "",
        isValid: true,
      },
      image: {
        value: null,
        isValid: true,
      },
    },
    false
  );
  //Fetch user we're working on
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL + "/users/" + userId
        );
        setUserData(responseData.user);
        console.log("ping");
      } catch (err) {}
    };
    fetchUser();
  }, [sendRequest, userId, forceUpdate]);

  //Set inital form data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("pong");
        setFormData(
          {
            username: {
              value: userData.username,
              isValid: true,
            },
            email: {
              value: userData.email,
              isValid: true,
            },
            image: {
              value: userData.image,
              isValid: true,
            },
          },
          true
        );
      } catch (err) {}
    };
    fetchUser();
  }, [setFormData, userData, forceUpdate]);

  // const forceUpdate = () =>{
  //   forceUpdate =
  // }

  const updateUserSubmitHandler = async (event) => {
    event.preventDefault();
    setForceUpdate(!forceUpdate);
    try {
      const formData = new FormData();
      formData.append("email", formState.inputs.email.value);
      formData.append("username", formState.inputs.username.value);
      formData.append("image", formState.inputs.image.value);
      // formData.append("password", formState.inputs.password.value);

      const responseData = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/users/update-user-settings/${userData._id}`,
        "PATCH",
        formData
      );
      console.log(responseData);
      //history.go(0);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container">
      <div className="sidebar">
        <ul className="side-nav">
          <li className="side-nav__item">Edit Profile</li>
          <li className="side-nav__item">Change Password</li>
        </ul>
      </div>

      {/* Main settings window */}
      {userData && (
        <div className="settings">
          <div className="settings__profile-picture">
            {/* Bad class naming */}
            <div className="settings__username">
              <ImageUpload
                id="image"
                isHref
                isAvatar
                buttonText={"Change Profile Picture"}
                onInput={inputHandler}
                image={`${process.env.REACT_APP_ASSET_URL}/${userData.image}`}
              />
              <span className="settings__username-name">
                {userData.username}
              </span>
            </div>
          </div>
          <form className="settings__form" onSubmit={updateUserSubmitHandler}>
            <div className="settings__form-username">
              <Input
                id="username"
                element="input"
                type="text"
                label="Username"
                errorText="Please enter a valid username."
                onInput={inputHandler}
                initialValue={userData.username}
                initialValid={true}
              />
            </div>
            <div className="settings__form-email">
              <Input
                id="email"
                element="input"
                type="email"
                label="Email"
                errorText="Please enter a valid email."
                onInput={inputHandler}
                initialValue={userData.email}
                initialValid={true}
              />
            </div>
            <Button className="submitButton" type="submit">
              Update settings
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Settings;
