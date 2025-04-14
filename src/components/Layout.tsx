
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="container mx-auto py-6 px-4">
        <Outlet />
      </main>
      <footer className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>© {new Date().getFullYear()} Indian Stock Tracker | All data provided by Alpha Vantage</p>
      </footer>
    </div>
  );
};

export default Layout;
