import { Truck, Car, IdCard, Bell, ChartBar, Gauge, User } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Truck className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">FleetTracker</h1>
            <p className="text-sm text-gray-500">RUC Management</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-primary text-white">
              <Gauge className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <Car className="w-5 h-5" />
              <span className="font-medium">Vehicles</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <IdCard className="w-5 h-5" />
              <span className="font-medium">RUC Licenses</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="font-medium">Alerts</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <ChartBar className="w-5 h-5" />
              <span className="font-medium">Reports</span>
            </a>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="text-gray-600 text-sm" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">John Manager</p>
            <p className="text-xs text-gray-500">Fleet Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
