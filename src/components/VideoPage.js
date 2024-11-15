import React, { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { APP_ID, SERVER_SECRET } from "./constant";

const VideoPage = () => {
  const { id } = useParams();
  const roomID = id;
  const myCallContainerRef = useRef(null);
  const [emotionData, setEmotionData] = useState(null);
  const [cameraId, setCameraId] = useState(null);  // Add state for cameraId

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
          "guest"
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);

        if (zp && typeof zp.joinRoom === "function") {
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
            onRoomUserUpdate: (updateType, userList) => {
              // Handle users joining or leaving the room
            },
          });

          // Set a unique camera ID based on room or user
          setCameraId(roomID); // or any unique identifier per user

          // Capture frames every 3 seconds for emotion detection
          setInterval(captureFrame, 3000);
        } else {
          console.error("joinRoom method is not available on ZegoUIKitPrebuilt instance.");
        }
      } catch (error) {
        console.error("Error initializing meeting:", error);
      }
    };

    const captureFrame = async () => {
      const videoElement = myCallContainerRef.current.querySelector("video");
      if (videoElement) {
        const canvas = document.createElement("canvas");
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const context = canvas.getContext("2d");
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg"));
        const formData = new FormData();
        formData.append("image", blob);

        // Send frame to the server for emotion detection
        fetch(`https://dima806-huggingface.onrender.com`, {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            setEmotionData(data);
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
    <div className="relative w-full h-screen bg-gray-100">
      <div ref={myCallContainerRef} className="absolute top-0 left-0 w-full h-full"></div>

      {emotionData && (
        <div className="absolute top-4 left-4 bg-white p-4 rounded shadow-lg">
          <h3 className="text-lg font-bold">Emotion Prediction</h3>
          <ul>
            {emotionData.map((emotion, index) => (
              <li key={index} className="text-sm">
                {emotion.label}: {Math.round(emotion.score * 100)}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VideoPage;
