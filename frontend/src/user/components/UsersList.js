import React from "react";

import UserItem from "./UserItem";

import Card from "../../shared/components/UIElements/Card";

const UsersList = (props) => {
  if (props.items.length === 0) {
    return (
      <div className="center">
        <Card>
          <h2>No users found.</h2>
        </Card>
      </div>
    );
  }

  return (
    <React.Fragment>
      <ul className="users-list">
        {props.items.map((user) => (
          <UserItem
            key={user.id}
            id={user.id}
            image={user.image}
            username={user.username}
            placeCount={user.places.length}
            onDelete={props.onDeleteUser}
          />
        ))}
      </ul>
    </React.Fragment>
  );
};

export default UsersList;
