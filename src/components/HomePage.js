import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const submitHandler = () => {
    navigate(`/room/${input}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="flex flex-col items-center space-y-4">
        <input
          className="px-4 py-2 border rounded-md"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          type="text"
          placeholder="Enter Room ID.."
        />
        <button
          className="px-4 py-2 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600"
          onClick={submitHandler}
        >
          Join
        </button>
      </div>
    </div>
  );
};

export default HomePage;
