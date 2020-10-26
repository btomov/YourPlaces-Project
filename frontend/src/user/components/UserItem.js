import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../shared/components/FormElements/Button";

import Modal from "../../shared/components/UIElements/Modal";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHttpClient } from "../../shared/hooks/http-hook";

import Avatar from "../../shared/components/UIElements/Avatar";
import Card from "../../shared/components/UIElements/Card";
import { AuthContext } from "../../shared/context/auth-context";

const UserItem = (props) => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const showDeleteWarningHandler = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setShowConfirmModal(true);
  };

  const cancelDeleteHandler = () => {
    setShowConfirmModal(false);
  };

  const confirmDeleteHandler = async (event) => {
    setShowConfirmModal(false);
    try {
      await sendRequest(
        process.env.REACT_APP_BACKEND_URL + `/users/${props.id}`,
        "DELETE",
        null,
        {
          Authorization: "Bearer " + auth.token,
        }
      );
      props.onDelete(props.id);
    } catch (err) {}
  };

  const auth = useContext(AuthContext);
  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
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
          Do you want to proceed and delete this user? Please note that it can't
          be undone.
        </p>
      </Modal>

      <li className="user-item">
        <Card className="user-item__content">
          {isLoading && <LoadingSpinner asOverlay />}
          <Link to={`/${props.username}/places`}>
            <div className="user-item__image">
              <Avatar
                class="avatar"
                //Needs to be changed to grab from AWS
                image={`${process.env.REACT_APP_ASSET_URL}/${props.image}`}
                alt={props.username}
              />
            </div>
            <div className="user-item__info">
              <h2>{props.username}</h2>
              <h3>
                {props.placeCount} {props.placeCount === 1 ? "Place" : "Places"}
              </h3>
            </div>
            {auth.isAdmin && auth.isLoggedIn && (
              <Button danger onClick={showDeleteWarningHandler}>
                DELETE USER
              </Button>
            )}
          </Link>
        </Card>
      </li>
    </React.Fragment>
  );
};

export default UserItem;
