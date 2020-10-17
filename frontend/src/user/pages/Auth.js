import React, { useState, useContext } from "react";
import "react-toastify/dist/ReactToastify.min.css";

import { useHistory } from "react-router-dom";
import Card from "../../shared/components/UIElements/Card";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
import { toast } from "react-toastify";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";
import "./Auth.css";

const Auth = () => {
  const auth = useContext(AuthContext);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isRestoringPassword, setIsRestoringPassword] = useState(false);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const history = useHistory();
  const [formState, inputHandler, setFormData] = useForm(
    {
      email: {
        value: "",
        isValid: false,
      },
      password: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  const switchModeHandler = () => {
    if (!isLoginMode) {
      setFormData(
        {
          ...formState.inputs,
          username: undefined,
          image: undefined,
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {
      setFormData(
        {
          ...formState.inputs,
          username: {
            value: "",
            isValid: false,
          },
          image: {
            value: null,
            isValid: false,
          },
        },
        false
      );
    }
    setIsLoginMode((prevMode) => !prevMode);
  };

  const authSubmitHandler = async (event) => {
    event.preventDefault();

    if (isLoginMode && !isRestoringPassword) {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/users/login`,
          "POST",
          JSON.stringify({
            email: formState.inputs.email.value,
            password: formState.inputs.password.value,
          }),
          {
            "Content-Type": "application/json",
          }
        );
        console.log(responseData);
        auth.login(
          responseData.username,
          responseData.userId,
          responseData.token,
          responseData.isAdmin
        );
      } catch (err) {}
    } else if (!isLoginMode && !isRestoringPassword) {
      try {
        const formData = new FormData();
        formData.append("email", formState.inputs.email.value);
        formData.append("username", formState.inputs.username.value);
        formData.append("password", formState.inputs.password.value);
        formData.append("image", formState.inputs.image.value);
        console.log(formState.inputs.image.value);
        await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/users/signup`,
          "POST",
          formData
        );
        //Need to make notification stay while we reload the page. Maybe instead of redirecting to /verify on email click, we do "/" and show a notification?
        toast.info(
          "We have sent you an email! Please verify your account before logging in"
        );
        history.push("/");
      } catch (err) {}
    } else if (isRestoringPassword) {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/users/reset-password`,
        "POST",
        JSON.stringify({ email: formState.inputs.email.value }),
        {
          "Content-Type": "application/json",
        }
      );
      history.push("/");
      toast.info(
        "We have sent you an email containing a link to reset your password. Keep in mind it will only be valid for 5 minutes."
      );
    }
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Card className="authentication">
        {isLoading && <LoadingSpinner asOverlay />}
        <h2>{!isRestoringPassword ? "Login Required" : "Reset Password"}</h2>
        <hr />
        <form onSubmit={authSubmitHandler}>
          {!isLoginMode && !isRestoringPassword && (
            <Input
              element="input"
              id="username"
              type="text"
              label="Your username"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="Please enter a username."
              onInput={inputHandler}
            />
          )}
          {/* Register Mode */}
          {!isLoginMode && (
            <ImageUpload
              center
              id="image"
              onInput={inputHandler}
              errorText="Please provide an image."
            />
          )}
          {!isRestoringPassword && (
            <div>
              <Input
                element="input"
                id="email"
                type="email"
                label="E-Mail"
                validators={[VALIDATOR_EMAIL()]}
                errorText="Please enter a valid email address."
                onInput={inputHandler}
              />
              <Input
                element="input"
                id="password"
                type="password"
                label="Password"
                validators={[VALIDATOR_MINLENGTH(6)]}
                errorText="Please enter a valid password, at least 6 characters."
                onInput={inputHandler}
              />
            </div>
          )}
          {/* Reset Password Mode */}
          {isRestoringPassword && (
            <div>
              <Input
                element="input"
                id="email"
                type="text"
                label="Your email"
                validators={[VALIDATOR_REQUIRE(), VALIDATOR_EMAIL()]}
                errorText="Please enter an email."
                onInput={inputHandler}
              />
              <Button type="submit">Send Reset Email</Button>
            </div>
          )}

          {isLoginMode && !isRestoringPassword && (
            <div>
              <button
                className="reset-password-button"
                onClick={() => setIsRestoringPassword(true)}>
                Reset Password
              </button>
              <hr />
            </div>
          )}
          {!isRestoringPassword && (
            <Button type="submit" disabled={!formState.isValid}>
              {isLoginMode ? "LOGIN" : "SIGNUP"}
            </Button>
          )}
        </form>
        {!isRestoringPassword && (
          <Button inverse onClick={switchModeHandler}>
            SWITCH TO {isLoginMode ? "SIGNUP" : "LOGIN"}
          </Button>
        )}
      </Card>
    </React.Fragment>
  );
};

export default Auth;
