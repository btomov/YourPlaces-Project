import React from "react";
import { Card, Icon } from "semantic-ui-react";

// const extra = (
//   <a>
//     <Icon name='user' />
//     16 Friends
//   </a>
// )

const SemanticCard = (props) => (
  <Card
    image={props.image}
    header={props.header}
    description={props.description}
    extra={props.extra}
  />
);

export default SemanticCard;
