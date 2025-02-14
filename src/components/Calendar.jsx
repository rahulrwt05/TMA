import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO, isSameDay } from 'date-fns';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, [currentDate]);

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

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const priorityColors = {
    Critical: 'bg-red-100 text-red-800',
    Urgent: 'bg-yellow-100 text-yellow-800',
    Important: 'bg-blue-100 text-blue-800',
    Someday: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <div className="flex items-center space-x-4">
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2"
          >
            <option value="month">Month</option>
            <option value="week">Week</option>
          </select>
          <div className="flex items-center space-x-2">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="p-4 text-center font-semibold bg-white dark:bg-gray-800"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
          {days.map((day) => {
            const dayTasks = tasks.filter((task) =>
              isSameDay(parseISO(task.dueDate), day)
            );

            return (
              <div
                key={day.toString()}
                className={`min-h-[120px] p-2 bg-white dark:bg-gray-800 ${
                  !isSameMonth(day, currentDate)
                    ? 'text-gray-400 dark:text-gray-600'
                    : ''
                } ${
                  isToday(day)
                    ? 'bg-blue-50 dark:bg-blue-900'
                    : ''
                }`}
              >
                <div className="font-semibold mb-1">{format(day, 'd')}</div>
                <div className="space-y-1">
                  {dayTasks.map((task) => (
                    <div
                      key={task._id}
                      className={`text-xs p-1 rounded ${priorityColors[task.priority]}`}
                      title={task.description || task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}