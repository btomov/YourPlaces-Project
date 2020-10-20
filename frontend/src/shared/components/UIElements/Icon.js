// icon.js
import React from "react";
import IcoMoon from "react-icomoon";
const iconSet = require("./../../../img/selection.json");

const Icon = ({ ...props }) => {
  return <IcoMoon iconSet={iconSet} {...props} />;
};

export default Icon;
