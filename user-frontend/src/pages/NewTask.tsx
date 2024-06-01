import { useState } from "react";

function NewTask() {
  const [title, setTitle] = useState("");
  return (
    <>
      <div className="text-center">
        <p className="text-2xl font-bold mt-8">
          Post a task for the workers to give thier valuable feedback!
        </p>
        <div className="flex justify-center">
          <div className="max-w-screen-lg w-full">
            <div className="text-2xl text-left pt-12 w-full pl-4">
              Create a task
            </div>

            <input
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              type="text"
              id="first_name"
              className="ml-4 mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="What is your task?"
              required
            />

            <label className="pl-4 block mt-8 text-md font-medium text-gray-900 text-black">
              Add Images
            </label>
            <div className="flex justify-center pt-4 max-w-screen-lg"></div>

            <div className="ml-4 pt-2 flex justify-center"></div>

            <div className="flex justify-center">
              <button
                type="button"
                className="mt-4 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
              >
                Submit Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NewTask;
