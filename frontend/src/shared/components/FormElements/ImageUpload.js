import React, { useRef, useState, useEffect } from "react";
import Avatar from "../UIElements/Avatar";

import Button from "./Button";

const ImageUpload = (props) => {
  const [file, setFile] = useState();
  const [previewUrl, setPreviewUrl] = useState();
  const [isValid, setIsValid] = useState(false);

  const filePickerRef = useRef();

  useEffect(() => {
    if (!file) {
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  }, [file]);

  const pickedHandler = (event) => {
    let pickedFile;
    let fileIsValid = isValid;
    if (event.target.files && event.target.files.length === 1) {
      pickedFile = event.target.files[0];
      setFile(pickedFile);
      setIsValid(true);
      fileIsValid = true;
    } else {
      setIsValid(false);
      fileIsValid = false;
    }
    // props.onInput(props.id, pickedFile, fileIsValid);
    getSignedRequest(pickedFile);
  };

  const getSignedRequest = (file) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/sign-s3?file-name=${file.name}&file-type=${file.type}`);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          uploadFile(file, response.signedRequest, response.url);
        } else {
          alert("Could not get signed URL.");
        }
      }
    };
    xhr.send();
  };

  function uploadFile(file, signedRequest, url) {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedRequest);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          document.getElementsByClassName("image-upload__preview").src = url;
          document.getElementById("avatar-url").value = url;
        } else {
          alert("Could not upload file.");
        }
      }
    };
    xhr.send(file);
  }

  const pickImageHandler = () => {
    filePickerRef.current.click();
  };

  return (
    <div className="form-control">
      <input
        id={props.id}
        ref={filePickerRef}
        style={{ display: "none" }}
        type="file"
        accept=".jpg,.png,.jpeg"
        onChange={pickedHandler}
      />

      <div className={`image-upload ${props.center && "center"}`}>
        {props.isAvatar && (
          <Avatar
            image={previewUrl || props.image}
            alt={"Preview avatar"}
            width={"60px"}
            height={"60px"}
          />
        )}
        {/* Not avatar */}
        {!props.isAvatar && (
          <div className={`image-upload__preview ${props.wide && "wide"}`}>
            {(previewUrl || props.image) && (
              <img src={previewUrl || props.image} alt="Preview" />
            )}
            {!previewUrl && !props.image && <p>Please pick an image.</p>}
          </div>
        )}
        <Button type="button" onClick={pickImageHandler} isHref={props.isHref}>
          {props.buttonText || "PICK IMAGE"}
        </Button>
      </div>
      {!isValid && <p>{props.errorText}</p>}
    </div>
  );
};

export default ImageUpload;
