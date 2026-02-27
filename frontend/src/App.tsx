import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './shared/components/Layout';
import TopicList from './features/topic/components/TopicList';
import SessionList from './features/session/components/SessionList';
import UserProfile from './features/user/components/UserProfile';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<TopicList />} />
          <Route path="/topics" element={<TopicList />} />
          <Route path="/sessions" element={<SessionList />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
