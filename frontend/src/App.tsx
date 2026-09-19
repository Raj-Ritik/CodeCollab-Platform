import { useEffect } from "react";
import { socket } from "../useSocket";
import { Routes, Route } from "react-router-dom";
import CodeArea from "./components/CodeArea";
import Signin from "./components/signin";
import SignupPage from "./components/signup";
import Home from "./components/Home/Home";
import Landing from "./components/Landing";

function App() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected", socket.id);
    });

    socket.on("notification", (data) => {
      console.log(data);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Home />} />
      <Route
        path="/code/:classId/:projectId/:projectName/:userId"
        element={<CodeArea />}
      />
      <Route path="/login" element={<Signin />} />
      <Route path="/create" element={<SignupPage />} />
    </Routes>
  );
}

export default App;
