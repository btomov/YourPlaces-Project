import React, { useEffect, useContext, useState } from "react";
import { useHttpClient } from "../../shared/hooks/http-hook";
import Button from "../../shared/components/FormElements/Button";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import Input from "../../shared/components/FormElements/Input";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
import { toast } from "react-toastify";
import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_CONFIRM_PASSWORD,
} from "../../shared/util/validators";

import { useForm } from "../../shared/hooks/form-hook";
import { AuthContext } from "../../shared/context/auth-context";
import "./Settings.css";

const Settings = (props) => {
  const auth = useContext(AuthContext);
  const userId = auth.userId;
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [userData, setUserData] = useState();
  const [forceUpdate, setForceUpdate] = useState();
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  const updateUserSubmitHandler = async (event) => {
    event.preventDefault();
    setForceUpdate(!forceUpdate); //Doesnt work
    if (!isChangingPassword) {
      try {
        const formData = new FormData();
        formData.append("email", formState.inputs.email.value);
        formData.append("username", formState.inputs.username.value);
        formData.append("image", formState.inputs.image.value);
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/users/update-user-settings/${userData._id}`,
          "PATCH",
          formData
        );
        //If username is changed force logout
        if (formState.inputs.username.value !== userData.username) {
          auth.logout();
          toast.info(
            "You have to log back in for your username change to take effect."
          );
        }
        console.log(responseData);
      } catch (err) {
        console.log(err);
      }
    } else {
      //IS changing password
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/users/reset-password`,
          "PATCH",
          JSON.stringify({
            oldPassword: formState.inputs.oldPassword.value,
            password: formState.inputs.password.value,
            userId: userData._id,
          }),
          {
            "Content-Type": "application/json",
            Authorization: "Bearer " + auth.token,
          }
        );
        if (responseData) {
          auth.logout();
          toast.info(
            "Your password has been changed successfully, please log back in."
          );
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && <LoadingSpinner asOverlay />}

      <div className="container">
        <div className="sidebar">
          <ul className="side-nav">
            <li
              onClick={() => setIsChangingPassword(false)}
              className="side-nav__item">
              Edit Profile
            </li>
            <li
              onClick={() => setIsChangingPassword(true)}
              className="side-nav__item">
              Change Password
            </li>
          </ul>
        </div>

        {/* Main settings window */}
        {userData && !isLoading && (
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
              {!isChangingPassword && (
                <div>
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
                </div>
              )}
              {isChangingPassword && (
                <div className="settings__form-password">
                  <Input
                    element="input"
                    id="oldPassword"
                    type="password"
                    label="Enter old password"
                    validators={[VALIDATOR_MINLENGTH(6)]}
                    errorText="Please enter a valid password, at least 6 characters."
                    onInput={inputHandler}
                  />
                  <Input
                    element="input"
                    id="password"
                    type="password"
                    label="Enter new password"
                    validators={[VALIDATOR_MINLENGTH(6)]}
                    errorText="Please enter a valid password, at least 6 characters."
                    onInput={inputHandler}
                  />
                  <Input
                    element="input"
                    id="password_repeat"
                    type="password"
                    label="Repeat new password"
                    validators={[
                      VALIDATOR_CONFIRM_PASSWORD(formState.inputs.password),
                    ]}
                    errorText="Passwords need to match."
                    onInput={inputHandler}
                  />
                </div>
              )}
              <Button className="submitButton" type="submit">
                Update settings
              </Button>
            </form>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default Settings;
