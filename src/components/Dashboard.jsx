import { useState, useEffect } from "react";
import { FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";
import axios from "axios";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    urgent: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        "https://tma-bq16.onrender.com/api/tasks",
        {
          withCredentials: true,
        }
      );
      const tasks = response.data;

      // Calculate stats
      const completed = tasks.filter(
        (task) => task.status === "Completed"
      ).length;
      const pending = tasks.filter(
        (task) => task.status === "In Progress"
      ).length;
      const urgent = tasks.filter(
        (task) => task.priority === "Critical" || task.priority === "Urgent"
      ).length;

      setStats({
        total: tasks.length,
        completed,
        pending,
        urgent,
      });

      // Sort tasks by creation date for recent activity
      const sortedTasks = [...tasks].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecentActivity(sortedTasks.slice(0, 5));
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold mt-2">{value}</p>
        </div>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={stats.total}
          icon={FiClock}
          color="text-blue-500"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={FiCheckCircle}
          color="text-green-500"
        />
        <StatCard
          title="In Progress"
          value={stats.pending}
          icon={FiClock}
          color="text-yellow-500"
        />
        <StatCard
          title="Urgent"
          value={stats.urgent}
          icon={FiAlertCircle}
          color="text-red-500"
        />
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="space-y-4">
            {recentActivity.map((task) => (
              <div
                key={task._id}
                className="flex items-center justify-between py-3 border-b last:border-0 border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-3 ${
                      task.priority === "Critical"
                        ? "bg-red-500"
                        : task.priority === "Urgent"
                        ? "bg-yellow-500"
                        : task.priority === "Important"
                        ? "bg-blue-500"
                        : "bg-gray-500"
                    }`}
                  ></div>
                  <div>
                    <span className="font-medium">{task.title}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({task.status})
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
