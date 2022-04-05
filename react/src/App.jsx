import { Processes } from "./pages/Processes";
import { Send } from "./pages/Send";
import { Verify } from "./pages/Verify";
import { Login } from "./pages/Login";
import { Index } from "./pages/Index";
import { Analysed } from "./pages/Analysed";
import { Selected } from "./pages/Selected";
import { Imported } from "./pages/Imported";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const App = () => {
  const processes = ['新規登録', 'Spotify連携', 'アーティスト設定', '登録完了'];
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Processes process={processes[0]} />} />
        <Route path="/spotify" element={<Processes process={processes[1]} />} />
        <Route path="/setting" element={<Processes process={processes[2]} />} />
        <Route path="/finish" element={<Processes process={processes[3]} />} />
        <Route path="/send" element={<Send />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Index />} />
        <Route path="/analysed" element={<Analysed />} />
        <Route path="/selected" element={<Selected />} />
        <Route path="/imported" element={<Imported />} />
      </Routes>
    </BrowserRouter>
  );
};
export default App;