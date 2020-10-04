import React, { useEffect } from "react";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { useParams } from "react-router-dom";
import Card from "../../shared/components/UIElements/Card";
import Button from "../../shared/components/FormElements/Button";

const ConfirmEmail = () => {
  const { sendRequest } = useHttpClient();

  const tempToken = useParams().tempToken;

  useEffect(() => {
    const verifyUser = async () => {
      try {
        await sendRequest(
          process.env.REACT_APP_BACKEND_URL + "/users/verify/" + tempToken,
          "POST"
        );
      } catch (err) {}
    };
    verifyUser();
  }, [sendRequest, tempToken]);

  return (
    <div>
      <div className="place-list center">
        <Card>
          <h2>You have successfully verified your email!</h2>
          <Button to="/auth">Login</Button>
        </Card>
      </div>
    </div>
  );
};

export default ConfirmEmail;
