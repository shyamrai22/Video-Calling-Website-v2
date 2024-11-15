import React, { useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { APP_ID, SERVER_SECRET } from "./constant";

const VideoPage = () => {
  const { id } = useParams();
  const roomID = id;
  const myCallContainerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const initMeeting = async () => {
      try {
        // Generate Kit Token
        const appID = APP_ID;
        const serverSecret = SERVER_SECRET;
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomID,
          Date.now().toString(),
          "lalit"
        );

        // Log kitToken for debugging
        console.log("kitToken:", kitToken);

        // Create instance object from Kit Token
        const zp = ZegoUIKitPrebuilt.create(kitToken);

        // Log zp object for debugging
        console.log("ZegoUIKitPrebuilt instance:", zp);

        if (zp && typeof zp.joinRoom === "function") {
          // Start the call
          zp.joinRoom({
            container: myCallContainerRef.current,
            sharedLinks: [
              {
                name: "Personal link",
                url:
                  window.location.protocol +
                  "//" +
                  window.location.host +
                  window.location.pathname +
                  "?roomID=" +
                  roomID,
              },
            ],
            scenario: {
              mode: ZegoUIKitPrebuilt.OneONoneCall,
            },
          });
          
          // Capture frames every 5 seconds
          setInterval(captureFrame, 5000);
        } else {
          console.error(
            "joinRoom method is not available on ZegoUIKitPrebuilt instance."
          );
        }
      } catch (error) {
        console.error("Error initializing meeting:", error);
      }
    };

    const captureFrame = async () => {
      const videoElement = myCallContainerRef.current.querySelector("video");
      if (videoElement) {
        const canvas = canvasRef.current;
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const context = canvas.getContext("2d");
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        // Convert canvas to blob and send to backend
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg"));
        const formData = new FormData();
        formData.append("image", blob);

        fetch("https://dima806-huggingface.onrender.com", { // Change to deployed URL when ready
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Emotion detection result:", data);
          })
          .catch((error) => {
            console.error("Error detecting emotion:", error);
          });
      }
    };

    if (myCallContainerRef.current) {
      initMeeting();
    }
  }, [roomID]);

  return (
    <div
      className="flex items-center justify-center w-full h-screen bg-gray-100"
      ref={myCallContainerRef}
    >
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default VideoPage;
