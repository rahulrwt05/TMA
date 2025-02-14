import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FiMoreVertical, FiPlus, FiSearch, FiFilter } from 'react-icons/fi';
import axios from 'axios';
import TaskModal from './TaskModal';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tasks', {
        withCredentials: true
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await axios.post('http://localhost:5000/api/tasks', taskData, {
        withCredentials: true
      });
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/${selectedTask._id}`, taskData, {
        withCredentials: true
      });
      fetchTasks();
      setSelectedTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
          withCredentials: true
        });
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTasks(items);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = !filterPriority || task.priority === filterPriority;
    const matchesCategory = !filterCategory || task.category === filterCategory;
    return matchesSearch && matchesPriority && matchesCategory;
  });

  const priorityColors = {
    Critical: 'bg-red-100 text-red-800',
    Urgent: 'bg-yellow-100 text-yellow-800',
    Important: 'bg-blue-100 text-blue-800',
    Someday: 'bg-gray-100 text-gray-800'
  };

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
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="Urgent">Urgent</option>
            <option value="Important">Important</option>
            <option value="Someday">Someday</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">All Categories</option>
            <option value="Today's Tasks">Today's Tasks</option>
            <option value="Upcoming Week">Upcoming Week</option>
            <option value="Monthly Goals">Monthly Goals</option>
            <option value="Yearly Goals">Yearly Goals</option>
          </select>
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
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{task.title}</h3>
                          {task.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center mt-2 space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${priorityColors[task.priority]}`}>
                              {task.priority}
                            </span>
                            <span className="text-sm text-gray-500">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                            <span className="text-sm text-gray-500">
                              {task.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setIsModalOpen(true);
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                          >
                            <FiMoreVertical className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full"
                          >
                            ×
                          </button>
                        </div>
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
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
        task={selectedTask}
      />
    </div>
  );
}