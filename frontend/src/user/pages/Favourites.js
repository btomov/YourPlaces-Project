import React, { useContext, useState, useEffect } from "react";
import PlaceList from "./../../places/components/PlaceList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";

const Favourites = (props) => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedPlaces, setLoadedPlaces] = useState();

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/places/user/${auth.username}`,
          "POST",
          JSON.stringify({ findFavourites: true }),
          {
            "Content-Type": "application/json",
          }
        );
        setLoadedPlaces(responseData.favouritePlaces);
      } catch (err) {}
    };
    fetchPlaces();
  }, [sendRequest, auth.username]);
  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedPlaces && (
        <PlaceList username={auth.username} items={loadedPlaces} />
      )}
    </React.Fragment>
  );
};

export default Favourites;
