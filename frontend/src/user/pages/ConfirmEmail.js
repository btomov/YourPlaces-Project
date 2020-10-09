import React, { useEffect } from "react";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { useParams, useHistory } from "react-router-dom";
import Card from "../../shared/components/UIElements/Card";
import Button from "../../shared/components/FormElements/Button";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";

const ConfirmEmail = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const history = useHistory();
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

  const clearErrorAndRedirect = () => {
    clearError();
    history.push("/");
  };

  return (
    <div>
      <ErrorModal error={error} onClear={clearErrorAndRedirect} />
      {isLoading && <LoadingSpinner asOverlay />}
      {!isLoading && (
        <div className="place-list center">
          <Card>
            <h2>You have successfully verified your email!</h2>
            <Button to="/auth">Login</Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ConfirmEmail;
