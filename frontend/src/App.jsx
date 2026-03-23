import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col gap-6 justify-center items-center max-w-5xl m-auto h-dvh">
      <h1 className="text-7xl font-semibold text-purple-500">Hello world!</h1>

      <button
        type="button"
        onClick={() => setCount((count) => count + 1)}
        className="border border-white/50 rounded-lg px-4 py-2 hover:bg-black/30 transition-colors duration-150"
      >
        count is {count}
      </button>
    </div>
  );
}

export default App;

