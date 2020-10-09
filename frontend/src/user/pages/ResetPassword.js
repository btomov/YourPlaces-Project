import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useHttpClient } from "../../shared/hooks/http-hook";
import Card from "../../shared/components/UIElements/Card";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import Button from "../../shared/components/FormElements/Button";
import Input from "../../shared/components/FormElements/Input";
import { useForm } from "../../shared/hooks/form-hook";
import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_CONFIRM_PASSWORD,
} from "../../shared/util/validators";

const ResetPassword = (props) => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  //Send request to backend with hashed token, there we unhash and return something.
  const [isValidToken, setIsValidToken] = useState(false);
  const [userId, setUserId] = useState();
  const identificationToken = useParams().identificationToken;
  const restorationToken = useParams().restorationToken;
  const history = useHistory();

  const [formState, inputHandler] = useForm(
    {
      password: {
        value: "",
        isValid: false,
      },
      password_repeat: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  //Make a request to check if the token is even valid. If not, display a message
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/users/reset-password/${identificationToken}/${restorationToken}`
        );
        if (responseData.isValidToken) {
          setIsValidToken(true);
        }
        setUserId(responseData.userId);
      } catch (err) {}
    };
    verifyToken();
  }, [sendRequest, identificationToken, restorationToken]);

  const resetSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/users/reset-password`,
        "PATCH",
        JSON.stringify({ password: formState.inputs.password.value, userId }),
        {
          "Content-Type": "application/json",
        }
      );
      history.push("/");
    } catch (error) {
      console.log(error);
    }
  };

  const clearErrorAndRedirect = () => {
    clearError();
    history.push("/");
  };

  return (
    <div>
      <ErrorModal error={error} onClear={clearErrorAndRedirect} />

      <div className="place-list center">
        {isLoading && <LoadingSpinner asOverlay />}

        {isValidToken && !isLoading && (
          <Card style={{ width: "300px" }}>
            {/* This may not work well, TODO. */}
            {!isValidToken && !isLoading && "Invalid or expired token."}

            <form onSubmit={resetSubmitHandler}>
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
              <Button type="submit" disabled={!formState.isValid}>
                Reset Password
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
