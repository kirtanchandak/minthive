import axios from "axios";
import { useEffect, useState } from "react";

interface Task {
  id: number;
  amount: number;
  title: string;
  options: {
    id: number;
    image_url: string;
    task_id: number;
  }[];
}

function Tasks() {
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:3000/v1/worker/nextTask", {
        headers: {
          Authorization:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTcxNzI2NjgwMn0.i1FWio4VIHj9lb45_sP-UGf3TEMaRRD-9NpnJe-GXYs",
        },
      })
      .then((res) => {
        setCurrentTask(res.data?.task);
        console.log(currentTask);
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
        setCurrentTask(null);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <>
      {currentTask ? (
        <>
          <div className="text-2xl pt-20 flex justify-center">
            {currentTask.title}
            <div className="pl-4">{submitting && "Submitting..."}</div>
          </div>
          <div className="flex justify-center pt-8">
            {currentTask.options.map((option) => (
              <Option
                onSelect={async () => {
                  setSubmitting(true);
                  try {
                    const response = await axios.post(
                      "http://localhost:3000/v1/worker/submission",
                      {
                        taskId: currentTask.id.toString(),
                        selection: option.id.toString(),
                      },
                      {
                        headers: {
                          Authorization:
                            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTcxNzI2NjgwMn0.i1FWio4VIHj9lb45_sP-UGf3TEMaRRD-9NpnJe-GXYs",
                        },
                      }
                    );

                    const nextTask = response.data.nextTask;
                    if (nextTask) {
                      setCurrentTask(nextTask);
                    } else {
                      setCurrentTask(null);
                    }
                    // refresh the user balance in the appbar
                  } catch (e) {
                    console.log(e);
                  }
                  setSubmitting(false);
                }}
                key={option.id}
                imageUrl={option.image_url}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <p>Please checkback after some time, there are no pending tasks!</p>
        </>
      )}
    </>
  );
}

export default Tasks;

function Option({
  imageUrl,
  onSelect,
}: {
  imageUrl: string;
  onSelect: () => void;
}) {
  return (
    <div>
      <img
        onClick={onSelect}
        className={"p-2 w-96 rounded-md"}
        src={imageUrl}
      />
    </div>
  );
}
