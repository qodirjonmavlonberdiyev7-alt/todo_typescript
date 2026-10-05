import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

type Todo = {
  id: number;
  text: string;
  done: boolean;
};

type Filter = 'all' | 'active' | 'done';

function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem('todos');
    return raw ? (JSON.parse(raw) as Todo[]) : [];
  } catch {
    return [];
  }
}

function App() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  // todos o'zgarganda localStorage ga saqlash
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Filtrlangan ro'yxat
  const visible = useMemo(() => {
    if (filter === 'active') return todos.filter((t) => !t.done);
    if (filter === 'done') return todos.filter((t) => t.done);
    return todos;
  }, [todos, filter]);

  const addTodo = (e: FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setTodos((prev) => [{ id: Date.now(), text: value, done: false }, ...prev]);
    setText('');
  };

  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  };

  const changeEditValue = (todo: Todo) => {
    setEditId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    const value = editText.trim();
    if (editId === null) return;
    if (value) {
      setTodos((prev) =>
        prev.map((t) => (t.id === editId ? { ...t, text: value } : t)),
      );
    }
    setEditId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditText('');
  };

  // Esc bosilganda tahrirlashni bekor qilish
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancelEdit();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="container max-w-md mx-auto mt-[50px] flex justify-center">
      <div className="box">
        <h1 className="text-3xl">ToDo App</h1>

        <form className="form mt-3 w-100 mb-3" onSubmit={addTodo}>
          <input
            autoFocus
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Qo'shiladigan vazifa..."
            className="max-w-75 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          <button
            className="bg-indigo-500 text-white px-4 py-2 rounded-xl ms-[20px] cursor-pointer"
            type="submit"
          >
            Qo'shish
          </button>
        </form>

        <div className="filter-box mb-3">
          {(['all', 'active', 'done'] as Filter[]).map((btn, idx) => (
            <button
              className={
                filter === btn
                  ? 'bg-indigo-500 text-white px-4 py-2 rounded-xl ms-[20px] cursor-pointer'
                  : 'text-gray-600 px-4 py-2 rounded-xl ms-[20px] cursor-pointer'
              }
              key={idx}
              onClick={() => setFilter(btn)}
            >
              {btn}
            </button>
          ))}
        </div>

        <ul className="list">
          {visible.length === 0 && (
            <li className="opacity-50">
              <p>Hech qanday vazifa yo'q</p>
            </li>
          )}

          {visible.map((item) => (
            <li key={item.id}>
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleTodo(item.id)}
                  className="cursor-pointer"
                />

                {editId === item.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                    }}
                    onBlur={saveEdit}
                    className="rounded-lg border border-gray-300 px-2 py-1 text-sm outline-none focus:border-indigo-500"
                  />
                ) : (
                  <span
                    className={
                      item.done
                        ? 'text-sm font-medium line-through text-gray-400'
                        : 'text-sm font-medium'
                    }
                  >
                    {item.text}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => changeEditValue(item)}
                  className="cursor-pointer text-gray-700 hover:text-indigo-500"
                  title="Tahrirlash"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteTodo(item.id)}
                  className="cursor-pointer text-gray-500 hover:text-red-500"
                  title="O'chirish"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;