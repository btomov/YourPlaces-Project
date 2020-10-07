import React, { useEffect } from "react";
import { useHttpClient } from "../../shared/hooks/http-hook";
import Card from "../../shared/components/UIElements/Card";
import Button from "../../shared/components/FormElements/Button";
import Input from "../../shared/components/FormElements/Input";
import { useForm } from "../../shared/hooks/form-hook";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";

const ResetPassword = (props) => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const [formState, inputHandler, setFormData] = useForm({
    email: {
      value: "",
    },
  });

  //   useEffect(() => {
  //     const verifyUser = async () => {
  //       try {
  //         await sendRequest(
  //           process.env.REACT_APP_BACKEND_URL + "/reset-password",
  //           "POST",
  //           null
  //         );
  //       } catch (err) {}
  //     };
  //     verifyUser();
  //   }, [sendRequest]);

  const resetSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/users/reset-password`,
        "POST",
        JSON.stringify({ email: formState.inputs.email.value }),
        {
          "Content-Type": "application/json",
        }
        //" })
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div className="place-list center">
        <Card>
          <form onSubmit={resetSubmitHandler}>
            <Input
              element="input"
              id="email"
              type="text"
              label="Your email"
              validators={[VALIDATOR_REQUIRE(), VALIDATOR_EMAIL()]}
              errorText="Please enter an email."
              onInput={inputHandler}
            />
            <Button>Reset Password</Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
