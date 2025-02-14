"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Input } from "@/components/ui/input";
import { FaTrash, FaEdit } from "react-icons/fa";
import { MdCheckCircle, MdRadioButtonUnchecked } from "react-icons/md";

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "https://tma-bq16.onrender.com/api/tasks",
          { withCredentials: true }
        );
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reorderedTasks = Array.from(tasks);
    const [movedTask] = reorderedTasks.splice(result.source.index, 1);
    reorderedTasks.splice(result.destination.index, 0, movedTask);
    setTasks(reorderedTasks);

    try {
      await axios.put(
        "https://tma-bq16.onrender.com/api/tasks/reorder",
        {
          tasks: reorderedTasks.map((task, index) => ({
            ...task,
            order: index,
          })),
        },
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error updating task order:", error);
    }
  };

  const filteredTasks = tasks.filter(
    (task) =>
      filter === "all" ||
      (filter === "completed" ? task.completed : !task.completed)
  );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-white">
        Task Manager
      </h1>
      <div className="mb-4">
        <Input
          placeholder="Search tasks..."
          onChange={(e) => setFilter(e.target.value.toLowerCase())}
        />
      </div>
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={() => setFilter("all")}
          className="px-4 py-2 rounded bg-blue-500 text-white"
        >
          All
        </button>
        <button
          onClick={() => setFilter("completed")}
          className="px-4 py-2 rounded bg-green-500 text-white"
        >
          Completed
        </button>
        <button
          onClick={() => setFilter("pending")}
          className="px-4 py-2 rounded bg-yellow-500 text-white"
        >
          Pending
        </button>
      </div>
      {loading ? (
        <p className="text-gray-500 text-center">Loading tasks...</p>
      ) : filteredTasks.length === 0 ? (
        <p className="text-gray-500 text-center">No tasks found.</p>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {filteredTasks.map((task, index) => (
                  <Draggable
                    key={task._id}
                    draggableId={task._id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex justify-between items-center"
                      >
                        <div className="flex items-center gap-2">
                          {task.completed ? (
                            <MdCheckCircle className="text-green-500" />
                          ) : (
                            <MdRadioButtonUnchecked className="text-gray-500" />
                          )}
                          <span
                            className={
                              task.completed
                                ? "line-through text-gray-500"
                                : "text-gray-800 dark:text-white"
                            }
                          >
                            {task.title}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-blue-500 hover:text-blue-700">
                            <FaEdit />
                          </button>
                          <button className="text-red-500 hover:text-red-700">
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

export default TaskManager;
