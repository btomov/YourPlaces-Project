import React from "react";

const Avatar = (props) => {
  return (
    <div className={props.class} style={props.style}>
      <img
        src={props.image}
        alt={props.alt}
        style={{ width: props.width, height: props.height }}
      />
    </div>
  );
};

export default Avatar;
