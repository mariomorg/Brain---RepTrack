import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div>
      <header>
        <nav>
          <Link to="/topics">Topics</Link>
          <Link to="/sessions">Sessions</Link>
          <Link to="/profile">Profile</Link>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}

export default Layout;
