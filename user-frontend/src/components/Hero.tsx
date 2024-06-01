import React from "react";

function Hero() {
  return (
    <>
      <div className="text-center">
        <p className="text-3xl font-bold mt-24">
          Welcome to <span className="text-green-500">minthive🪙</span>, the
          ultimate data labelling platform!!
        </p>
        <a href="/newTask">
          <button className="mt-3 px-3 py-2 bg-green-500 rounded-lg shadow-lg text-white text-md">
            Create a task
          </button>
        </a>
      </div>
    </>
  );
}

export default Hero;
