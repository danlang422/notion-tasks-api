// pages/index.js
import { useState } from 'react';

export default function Home() {
  const [task, setTask] = useState({ name: '', doDate: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      const data = await res.json();
      alert('Task created!');
      setTask({ name: '', doDate: '' });
    } catch (error) {
      alert('Error creating task');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Create Task</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={task.name}
            onChange={e => setTask({...task, name: e.target.value})}
            placeholder="Task name"
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div>
          <input
            type="date"
            value={task.doDate}
            onChange={e => setTask({...task, doDate: e.target.value})}
            className="border p-2 rounded w-full"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Create Task
        </button>
      </form>
    </div>
  );
}
