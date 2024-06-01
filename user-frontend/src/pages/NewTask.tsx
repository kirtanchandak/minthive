import { useState, ChangeEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface TaskPayload {
  title: string;
  options: { imageUrl: string }[];
  signature: string;
}

function NewTask() {
  let navigate = useNavigate();
  const [title, setTitle] = useState<string>("");
  const [images, setImages] = useState<string[]>([""]);

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const handleAddImage = () => {
    setImages([...images, ""]);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const payload: TaskPayload = {
      title,
      options: images.map((imageUrl) => ({ imageUrl })),
      signature: "sdljbglm",
    };

    try {
      const response = await axios.post(
        "http://localhost:3000/v1/user/task",
        payload,
        {
          headers: {
            Authorization:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcxNzIzMzU4M30.kf4PU_qnH7dXVupHv5IITw7q7jBeourLZoKZfVXMqDk",
          },
        }
      );
      navigate(`/task/${response.data.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="text-center">
        <p className="text-2xl font-bold mt-8">
          Post a task for the workers to give their valuable feedback!
        </p>
        <div className="flex justify-center">
          <div className="max-w-screen-lg w-full">
            <div className="text-2xl text-left pt-12 w-full pl-4">
              Create a task
            </div>

            <input
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setTitle(e.target.value)
              }
              type="text"
              id="task_title"
              className="ml-4 mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="What is your task?"
              required
            />

            <label className="pl-4 block mt-8 text-md font-medium text-gray-900 text-black">
              Add Images
            </label>

            {images.map((image, index) => (
              <input
                key={index}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleImageChange(index, e.target.value)
                }
                type="text"
                id={`image_${index}`}
                className="ml-4 mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Paste image URL here"
                value={image}
                required
              />
            ))}

            <button
              onClick={handleAddImage}
              type="button"
              className="ml-4 mt-4 text-white bg-blue-500 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2"
            >
              Add Another Image
            </button>

            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                type="button"
                className="mt-4 text-white bg-green-500 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2"
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
