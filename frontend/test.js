import React from "react";
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount((count) => count + 1)}>
        count {count}
      </button>
    </div>
  );
}

function App() {
  const [isVisible, setVisible] = useState(true);

  const styles = {
    main: {
      padding: "20px",
    },
    title: {
      color: "#5C6AC4",
    },
    toggle: {
      marginBottom: "5px",
    },
  };

  return (
    <div style={styles.main}>
      <h1 style={styles.title}>Hello, World!</h1>
      <button onClick={() => setVisible((pre) => !pre)} style={styles.toggle}>
        Toggle
      </button>
      {isVisible && <Counter />}
    </div>
  );
}

export default App;
