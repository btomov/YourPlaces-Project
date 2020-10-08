import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useHttpClient } from "../../shared/hooks/http-hook";
import Card from "../../shared/components/UIElements/Card";
import Button from "../../shared/components/FormElements/Button";
import Input from "../../shared/components/FormElements/Input";
import { useForm } from "../../shared/hooks/form-hook";
import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_CONFIRM_PASSWORD,
} from "../../shared/util/validators";

const ResetPassword = (props) => {
  //const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const { sendRequest } = useHttpClient();
  const resetToken = useParams().resetToken;
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
    const verifyUser = async () => {
      try {
        await sendRequest(
          process.env.REACT_APP_BACKEND_URL + "/reset-password",
          "POST",
          null
        );
      } catch (err) {}
    };
    verifyUser();
  }, [sendRequest]);

  const resetSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append("password", formState.inputs.password_repeat.value);
      formData.append(
        "password_repeat",
        formState.inputs.password_repeat.value
      );
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/reset-password`,
        "POST",
        formData,
        {
          "Content-Type": "application/json",
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div className="place-list center">
        <Card style={{ width: "300px" }}>
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
      </div>
    </div>
  );
};

export default ResetPassword;
