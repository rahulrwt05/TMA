import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FiMoreVertical, FiPlus, FiSearch, FiFilter } from "react-icons/fi";
import axios from "axios";
import TaskModal from "./TaskModal";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        "https://tma-bq16.onrender.com/api/tasks",
        { withCredentials: true }
      );
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await axios.post("https://tma-bq16.onrender.com/api/tasks", taskData, {
        withCredentials: true,
      });
      fetchTasks();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleUpdateTask = async (taskData) => {
    if (!selectedTask) return;
    try {
      await axios.put(
        `https://tma-bq16.onrender.com/api/tasks/${selectedTask._id}`,
        taskData,
        { withCredentials: true }
      );
      fetchTasks();
      setSelectedTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axios.delete(
          `https://tma-bq16.onrender.com/api/tasks/${taskId}`,
          { withCredentials: true }
        );
        fetchTasks();
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const updatedTasks = Array.from(tasks);
    const [reorderedItem] = updatedTasks.splice(result.source.index, 1);
    updatedTasks.splice(result.destination.index, 0, reorderedItem);

    setTasks(updatedTasks);

    try {
      await axios.put(
        "https://tma-bq16.onrender.com/api/tasks/reorder",
        {
          tasks: updatedTasks.map((task, index) => ({
            _id: task._id,
            order: index,
          })),
        },
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error updating task order:", error);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesPriority = !filterPriority || task.priority === filterPriority;
    const matchesCategory = !filterCategory || task.category === filterCategory;
    return matchesSearch && matchesPriority && matchesCategory;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <button
          onClick={() => {
            setSelectedTask(null);
            setIsModalOpen(true);
          }}
          className="flex items-center bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg"
        >
          <FiPlus className="mr-2" />
          Add Task
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {filteredTasks.map((task, index) => (
                <Draggable key={task._id} draggableId={task._id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="bg-white rounded-lg shadow-md p-4"
                    >
                      <div className="flex justify-between">
                        <h3 className="font-semibold">{task.title}</h3>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="text-red-500"
                        >
                          ×
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

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
        task={selectedTask}
      />
    </div>
  );
}
