import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

async function getTaskDetails(taskId: string) {
  const response = await axios.get(
    `http://localhost:3000/v1/user/task?taskId=${taskId}`,
    {
      headers: {
        Authorization:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcxNzIzMzU4M30.kf4PU_qnH7dXVupHv5IITw7q7jBeourLZoKZfVXMqDk",
      },
    }
  );
  return response.data;
}

export default function TaskDetails() {
  const { taskId } = useParams<{ taskId: string }>();
  console.log(taskId);

  const [result, setResult] = useState<
    Record<
      string,
      {
        count: number;
        option: {
          imageUrl: string;
        };
      }
    >
  >({});

  const [taskDetails, setTaskDetails] = useState<{
    title?: string;
  }>({});

  useEffect(() => {
    getTaskDetails(taskId ?? "").then((data) => {
      setResult(data.result);
      setTaskDetails(data.taskDetails);
    });
  }, [taskId]);

  if (!taskDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="task-details mt-24">
      <div className="text-2xl pt-20 flex justify-center">
        {taskDetails.title}
      </div>
      <div className="flex justify-center pt-8">
        {Object.keys(result || {}).map((taskId) => (
          <Task
            imageUrl={result[taskId].option.imageUrl}
            votes={result[taskId].count}
          />
        ))}
      </div>
    </div>
  );
}

function Task({ imageUrl, votes }: { imageUrl: string; votes: number }) {
  return (
    <div>
      <img className={"p-2 w-96 rounded-md"} src={imageUrl} />
      <div className="flex justify-center">{votes}</div>
    </div>
  );
}
