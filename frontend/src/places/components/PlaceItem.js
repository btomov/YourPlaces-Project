import React, { useState, useContext, useEffect } from "react";
import UpdatePlace from "../pages/UpdatePlace";

import Card from "../../shared/components/UIElements/Card";
import Button from "../../shared/components/FormElements/Button";
import Modal from "../../shared/components/UIElements/Modal";
import Map from "../../shared/components/UIElements/Map";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { AuthContext } from "../../shared/context/auth-context";
import { useHttpClient } from "../../shared/hooks/http-hook";

const PlaceItem = (props) => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedPlace, setLoadedPlace] = useState();
  const [reloadPlace, setReloadPlace] = useState();
  const [showMap, setShowMap] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const auth = useContext(AuthContext);
  const openMapHandler = () => setShowMap(true);
  const closeMapHandler = () => setShowMap(false);

  const startEditHandler = (placeId) => {
    setIsEditing(true);
    props.onEditStart(placeId);
  };

  const stopEditHandler = () => {
    setIsEditing(false);
    setReloadPlace(!reloadPlace);
    props.onEditEnd();
  };
  const showDeleteWarningHandler = () => {
    setShowConfirmModal(true);
  };

  const cancelDeleteHandler = () => {
    setShowConfirmModal(false);
  };

  const confirmDeleteHandler = async () => {
    setShowConfirmModal(false);
    try {
      await sendRequest(
        process.env.REACT_APP_BACKEND_URL + `/places/${props.id}`,
        "DELETE",
        null,
        {
          Authorization: "Bearer " + auth.token,
        }
      );
      props.onDelete(props.id);
    } catch (err) {}
  };

  //TODO Need to re-grab the place data after we update it, so we'll be getting everything from the DB instead of through props. Means i won't need most of the props, can delete from placelist
  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/places/${props.id}`
        );
        setLoadedPlace(responseData.place);
      } catch (err) {}
    };
    fetchPlace();
  }, [sendRequest, props.id, reloadPlace]);

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {loadedPlace && (
        <Modal
          show={showMap}
          onCancel={closeMapHandler}
          header={loadedPlace.address}
          contentClass="place-item__modal-content"
          footerClass="place-item__modal-actions"
          footer={<Button onClick={closeMapHandler}>CLOSE</Button>}>
          <div className="map-container">
            <Map center={loadedPlace.coordinates} zoom={16} />
          </div>
        </Modal>
      )}
      <Modal
        show={showConfirmModal}
        onCancel={cancelDeleteHandler}
        header="Are you sure?"
        footerClass="place-item__modal-actions"
        footer={
          <React.Fragment>
            <Button inverse onClick={cancelDeleteHandler}>
              CANCEL
            </Button>
            <Button danger onClick={confirmDeleteHandler}>
              DELETE
            </Button>
          </React.Fragment>
        }>
        <p>
          Do you want to proceed and delete this place? Please note that it
          can't be undone thereafter.
        </p>
      </Modal>
      <li className="place-item">
        <Card className="place-item__content">
          {isLoading && <LoadingSpinner asOverlay />}

          {/* Load normal place if we're not editing */}
          {!isEditing && !isLoading && loadedPlace && (
            <div>
              <div className="place-item__image">
                <img
                  src={`${process.env.REACT_APP_ASSET_URL}/${loadedPlace.image}`}
                  alt={loadedPlace.title}
                />
              </div>
              <div className="place-item__info">
                <h2>{loadedPlace.title}</h2>
                <h3>{loadedPlace.address}</h3>
                <p>{loadedPlace.description}</p>
              </div>
              <div className="place-item__actions">
                <Button inverse onClick={openMapHandler}>
                  VIEW ON MAP
                </Button>
                {(auth.userId === props.creatorId || auth.isAdmin) && (
                  <Button onClick={() => startEditHandler(loadedPlace.id)}>
                    EDIT
                  </Button>
                )}

                {(auth.userId === props.creatorId || auth.isAdmin) && (
                  <Button danger onClick={showDeleteWarningHandler}>
                    DELETE
                  </Button>
                )}
              </div>
            </div>
          )}
          {/* Else, load the same form but with fields that we can edit instead. */}
          {isEditing && !isLoading && loadedPlace && (
            <UpdatePlace
              place={loadedPlace}
              placeId={props.id}
              setEditOff={stopEditHandler}
              image={`${process.env.REACT_APP_ASSET_URL}/${loadedPlace.image}`}
            />
          )}
        </Card>
      </li>
    </React.Fragment>
  );
};

export default PlaceItem;
