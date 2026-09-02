import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children, title = 'AquaMitra' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="page-body">{children}</main>
      </div>
    </div>
  );
}
