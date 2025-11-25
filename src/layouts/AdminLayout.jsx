import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X,
  FileText,
  CheckCircle,
  Truck,
  Car,
  PhoneCall,
  Package
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (sidebarOpen) setSidebarOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30 h-14 shadow-sm">
        <div className="px-3 sm:px-4 lg:px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={toggleSidebar}
              className="lg:hidden hover:text-gray-700 focus:outline-none focus:ring-2 rounded-md p-1.5 transition-colors"
              style={{ color: '#991b1b', focusRingColor: '#991b1b' }}
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-bold" style={{ color: '#991b1b' }}>PMS</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={logout}
              className="inline-flex items-center gap-1.5 hover:text-gray-700 focus:outline-none focus:ring-2 rounded-md px-2 py-1.5 transition-colors"
              style={{ color: '#991b1b', focusRingColor: '#991b1b' }}
            >
              <LogOut size={16} />
              <span className="hidden sm:inline-block text-sm">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-14">
        {/* Sidebar */}
        <aside 
          className={`w-52 sm:w-56 bg-white border-r border-gray-200 fixed top-14 bottom-0 left-0 z-20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-lg lg:shadow-none ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full overflow-y-auto pb-16">
            <nav className="p-3 space-y-1">
              <Link
                to="/admin/dashboard"
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                  isActive('/admin/dashboard')
                    ? 'text-white border-r-4'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                style={isActive('/admin/dashboard') ? { backgroundColor: '#991b1b', borderRightColor: '#991b1b' } : {}}
                onClick={closeSidebar}
              >
                <LayoutDashboard size={18} className="shrink-0" />
                <span className="truncate">Dashboard</span>
              </Link>
              
              <Link
                to="/admin/order-enquiry"
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                  isActive('/admin/order-enquiry')
                    ? 'text-white border-r-4'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                style={isActive('/admin/order-enquiry') ? { backgroundColor: '#991b1b', borderRightColor: '#991b1b' } : {}}
                onClick={closeSidebar}
              >
                <FileText size={18} className="shrink-0" />
                <span className="truncate">Order Enquiry</span>
              </Link>

              <Link
                to="/admin/order-realisation"
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                  isActive('/admin/order-realisation')
                    ? 'text-white border-r-4'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                style={isActive('/admin/order-realisation') ? { backgroundColor: '#991b1b', borderRightColor: '#991b1b' } : {}}
                onClick={closeSidebar}
              >
                <CheckCircle size={18} className="shrink-0" />
                <span className="truncate">Order Realisation</span>
              </Link>

              <Link
                to="/admin/delivery-order"
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                  isActive('/admin/delivery-order')
                    ? 'text-white border-r-4'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                style={isActive('/admin/delivery-order') ? { backgroundColor: '#991b1b', borderRightColor: '#991b1b' } : {}}
                onClick={closeSidebar}
              >
                <Truck size={18} className="shrink-0" />
                <span className="truncate">Delivery Order</span>
              </Link>

              <Link
                to="/admin/vehicle-placed"
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                  isActive('/admin/vehicle-placed')
                    ? 'text-white border-r-4'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                style={isActive('/admin/vehicle-placed') ? { backgroundColor: '#991b1b', borderRightColor: '#991b1b' } : {}}
                onClick={closeSidebar}
              >
                <Car size={18} className="shrink-0" />
                <span className="truncate">Vehicle Placed</span>
              </Link>

              <Link
                to="/admin/follow-up"
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                  isActive('/admin/follow-up')
                    ? 'text-white border-r-4'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                style={isActive('/admin/follow-up') ? { backgroundColor: '#991b1b', borderRightColor: '#991b1b' } : {}}
                onClick={closeSidebar}
              >
                <PhoneCall size={18} className="shrink-0" />
                <span className="truncate">Follow-Up</span>
              </Link>

              <Link
                to="/admin/receiving"
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                  isActive('/admin/receiving')
                    ? 'text-white border-r-4'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                style={isActive('/admin/receiving') ? { backgroundColor: '#991b1b', borderRightColor: '#991b1b' } : {}}
                onClick={closeSidebar}
              >
                <Package size={18} className="shrink-0" />
                <span className="truncate">Receiving</span>
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 ml-0 lg:ml-56 w-[calc(100%-14rem)] ">
          <div className="">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Fixed Footer */}
      <Footer />

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 lg:hidden backdrop-blur-sm"
          onClick={closeSidebar}
        ></div>
      )}
      
    </div>
  );
};

export default AdminLayout;