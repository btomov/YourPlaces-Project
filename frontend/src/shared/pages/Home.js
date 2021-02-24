import React from "react";
import sliderPic1 from "../../img/slider-pic-1.png";
import navPic from "../../img/navbar-background.png";
import section3Bgr from "../../img/section3-bgr.jpg";
import section4Bgr from "../../img/section4-bgr.jpg";
import cardPic1 from "../../img/card-pic-1.png";
import cardPic2 from "../../img/card-pic-2.png";
import cardPic3 from "../../img/card-pic-3.png";
import SemanticCard from "../../shared/components/UIElements/SemanticCard";
import { Button } from "semantic-ui-react";

//This is the home page
//The header will take up the entire length of the page
//Content of the page will be smaller tho
//I want to have the header right up on top
//Then i want a container perhaps? That has all the other stuff
const Home = () => {
  return (
    <React.Fragment>
      <div className="slider">
        {/* Probably not gonna be a slider, too big */}
        <img src={sliderPic1} alt="slider pic 1" className="slider-picture" />
      </div>
      <img src={navPic} alt="slider pic 1" className="cutOffUpwards" />
      <div className="letsGoDiv">
        <h1>LET'S GO</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
          ultrices pretium condimentum. Pellentesque blandit augue tellus, ut
          lacinia urna dictum sit amet
        </p>
      </div>
      <div className="cardsButtonDiv">
        {/* The three cards */}
        <div className="cardsDiv">
          <SemanticCard
            description="asd"
            image={cardPic1}
            className="semanticCard"
          />
          <SemanticCard
            description="asd"
            image={cardPic2}
            className="semanticCard"
          />
          <SemanticCard
            description="asd"
            image={cardPic3}
            className="semanticCard"
          />
        </div>
        <Button style={{ marginBottom: "3rem" }}>Let's go!</Button>
      </div>
      {/* Section 3 */}
      <div className="splitColoredDiv">
        <div className="splitColoredDiv-left">
          <img src={section3Bgr} alt="Section 3 left background"></img>
        </div>
        <div className="splitColoredDiv-right">
          <div className="text">
            <p>Discount up to 50% All Excursions</p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
              ultrices pretium condimentum
            </p>
            <Button>Read more</Button>
          </div>
        </div>
      </div>
      {/* Section 4 */}
      <div className="splitColoredDiv">
        <div className="splitColoredDiv2-right">
          <img src={section4Bgr} alt="Section 3 left background"></img>
        </div>
        <div className="splitColoredDiv2-left">
          <div className="text">
            <p>January's Promo: Buy 1 Get 1 Free!</p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
              ultrices pretium condimentum
            </p>
            <Button>Read more</Button>
          </div>
        </div>
      </div>
      {/* Section 5 */}
      <div className="section-4">
        <img
          src={navPic}
          alt="nav background/"
          className="main-navigation__background"
        />
        <div className="section-4__text">
          <h1>Subscribe to our newsletter</h1>
          <p>Subscribe to get all the news</p>
          <div>
            <input
              className="section-4__email"
              type="text"
              placeholder="Your Email"></input>
            <button className="section-4__button">Subscribe</button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
export default Home;
