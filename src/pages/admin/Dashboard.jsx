import React, { useState, useEffect } from "react";
import { 
  Package, 
  TrendingUp, 
  Truck, 
  ClipboardCheck, 
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  ArrowRight,
  RefreshCw
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    orderEnquiry: { pending: 0, history: 0 },
    orderRealisation: { pending: 0, history: 0 },
    deliveryOrder: { pending: 0, history: 0 },
    vehiclePlaced: { pending: 0, history: 0 },
    followUp: { pending: 0, history: 0 },
    receiving: { pending: 0, history: 0 }
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // Auto-refresh every 5 seconds
    const interval = setInterval(loadDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = () => {
    setLoading(true);
    
    try {
      // Load Order Enquiry data
      const orderEnquiries = JSON.parse(localStorage.getItem("orderEnquiries") || "[]");
      const enquiryHistory = JSON.parse(localStorage.getItem("enquiryHistory") || "[]");
      const orderReceived = orderEnquiries.filter(item => item.status === "Order Received");

      // Load Order Realisation data
      const orderRealisationPending = JSON.parse(localStorage.getItem("orderRealisationPending") || "[]");
      const orderRealisationHistory = JSON.parse(localStorage.getItem("orderRealisationHistory") || "[]");

      // Load Delivery Order data
      const deliveryOrderHistory = JSON.parse(localStorage.getItem("deliveryOrderHistory") || "[]");
      const deliveryOrderHistoryIds = deliveryOrderHistory.map(item => item.id);
      const deliveryOrderPending = orderRealisationHistory.filter(
        item => !deliveryOrderHistoryIds.includes(item.id)
      );

      // Load Vehicle Placed data
      const vehiclePlacedHistory = JSON.parse(localStorage.getItem("vehiclePlacedHistory") || "[]");
      const vehiclePlacedHistoryIds = vehiclePlacedHistory.map(item => item.id);
      const vehiclePlacedPending = deliveryOrderHistory.filter(
        item => !vehiclePlacedHistoryIds.includes(item.id)
      );

      // Load Follow Up data
      const followUpHistory = JSON.parse(localStorage.getItem("followUpHistory") || "[]");
      const followUpHistoryIds = followUpHistory.map(item => item.id);
      const followUpPending = vehiclePlacedHistory.filter(
        item => !followUpHistoryIds.includes(item.id)
      );

      // Load Receiving data
      const receivingHistory = JSON.parse(localStorage.getItem("receivingHistory") || "[]");
      const receivingHistoryIds = receivingHistory.map(item => item.id);
      const receivingPending = followUpHistory.filter(
        item => !receivingHistoryIds.includes(item.id)
      );

      setStats({
        orderEnquiry: {
          pending: orderEnquiries.length,
          history: enquiryHistory.length
        },
        orderRealisation: {
          pending: orderRealisationPending.length,
          history: orderRealisationHistory.length
        },
        deliveryOrder: {
          pending: deliveryOrderPending.length,
          history: deliveryOrderHistory.length
        },
        vehiclePlaced: {
          pending: vehiclePlacedPending.length,
          history: vehiclePlacedHistory.length
        },
        followUp: {
          pending: followUpPending.length,
          history: followUpHistory.length
        },
        receiving: {
          pending: receivingPending.length,
          history: receivingHistory.length
        }
      });

      // Generate recent activity
      const allActivities = [
        ...receivingHistory.slice(-10).map(item => ({
          type: "Receiving",
          project: item.projectName,
          party: item.partyName,
          date: item.receivedDate || item.date,
          status: "Completed",
          icon: "receiving"
        })),
        ...followUpHistory.slice(-10).map(item => ({
          type: "Follow Up",
          project: item.projectName,
          party: item.partyName,
          date: item.date,
          status: item.status,
          icon: "followup"
        })),
        ...vehiclePlacedHistory.slice(-10).map(item => ({
          type: "Vehicle Placed",
          project: item.projectName,
          party: item.partyName,
          date: item.date,
          status: "Placed",
          icon: "vehicle"
        }))
      ].sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateB - dateA;
      }).slice(0, 8);

      setRecentActivity(allActivities);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return new Date(year, month - 1, day);
    }
    return new Date(dateStr);
  };

  const totalPending = Object.values(stats).reduce((sum, stat) => sum + stat.pending, 0);
  const totalCompleted = Object.values(stats).reduce((sum, stat) => sum + stat.history, 0);

  const stages = [
    {
      id: "orderEnquiry",
      title: "Order Enquiry",
      icon: FileText,
      color: "bg-red-500",
      lightColor: "bg-red-50",
      textColor: "text-red-600",
      borderColor: "border-red-200"
    },
    {
      id: "orderRealisation",
      title: "Order Realisation",
      icon: ClipboardCheck,
      color: "bg-red-600",
      lightColor: "bg-red-50",
      textColor: "text-red-700",
      borderColor: "border-red-200"
    },
    {
      id: "deliveryOrder",
      title: "Delivery Order",
      icon: Package,
      color: "bg-red-700",
      lightColor: "bg-red-50",
      textColor: "text-red-800",
      borderColor: "border-red-200"
    },
    {
      id: "vehiclePlaced",
      title: "Vehicle Placed",
      icon: Truck,
      color: "bg-red-800",
      lightColor: "bg-red-50",
      textColor: "text-red-900",
      borderColor: "border-red-200"
    },
    {
      id: "followUp",
      title: "Follow Up",
      icon: TrendingUp,
      color: "bg-red-900",
      lightColor: "bg-red-50",
      textColor: "text-red-950",
      borderColor: "border-red-200"
    },
    {
      id: "receiving",
      title: "Receiving",
      icon: CheckCircle,
      color: "bg-red-950",
      lightColor: "bg-red-50",
      textColor: "text-red-950",
      borderColor: "border-red-200"
    }
  ];

  const getCompletionRate = (stageStats) => {
    const total = stageStats.pending + stageStats.history;
    return total > 0 ? Math.round((stageStats.history / total) * 100) : 0;
  };

  const getStatusColor = (status) => {
    const statusColors = {
      "Completed": "bg-green-100 text-green-800",
      "Placed": "bg-blue-100 text-blue-800",
      "Get In": "bg-blue-100 text-blue-800",
      "Loading": "bg-yellow-100 text-yellow-800",
      "Get Out": "bg-green-100 text-green-800",
      "Unloading": "bg-purple-100 text-purple-800",
      "Order Received": "bg-green-100 text-green-800"
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-red-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6 mb-9">
      <div className="max-w-7xl mx-auto space-y-[20px]">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pending</p>
                <p className="text-4xl font-bold text-red-600 mt-2">{totalPending}</p>
                <p className="text-xs text-gray-500 mt-2">Awaiting action</p>
              </div>
              <div className="p-4 bg-red-100 rounded-full">
                <Clock className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Completed</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{totalCompleted}</p>
                <p className="text-xs text-gray-500 mt-2">Successfully processed</p>
              </div>
              <div className="p-4 bg-green-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{totalPending + totalCompleted}</p>
                <p className="text-xs text-gray-500 mt-2">Overall processed</p>
              </div>
              <div className="p-4 bg-blue-100 rounded-full">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Process Flow */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Processing Pipeline</h2>
          
          {/* Desktop View */}
          <div className="hidden lg:flex items-center justify-between gap-2">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const stageStats = stats[stage.id];
              
              return (
                <React.Fragment key={stage.id}>
                  <div className="flex-1">
                    <div className={`${stage.lightColor} ${stage.borderColor} border rounded-lg p-4 hover:shadow-md transition-shadow`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`${stage.color} p-2 rounded-lg flex-shrink-0`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-xs">{stage.title}</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Pending:</span>
                          <span className={`text-sm font-bold ${stage.textColor}`}>{stageStats.pending}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Completed:</span>
                          <span className="text-sm font-semibold text-gray-700">{stageStats.history}</span>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`${stage.color} h-1.5 rounded-full transition-all duration-300`}
                              style={{ width: `${getCompletionRate(stageStats)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{getCompletionRate(stageStats)}% complete</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {index < stages.length - 1 && (
                    <div className="px-2 flex-shrink-0">
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Mobile View */}
          <div className="lg:hidden space-y-3">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const stageStats = stats[stage.id];
              
              return (
                <div key={stage.id}>
                  <div className={`${stage.lightColor} ${stage.borderColor} border rounded-lg p-4`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`${stage.color} p-2 rounded-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm">{stage.title}</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-white rounded-md p-2 border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Pending</p>
                        <p className={`text-lg font-bold ${stage.textColor}`}>{stageStats.pending}</p>
                      </div>
                      <div className="bg-white rounded-md p-2 border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Completed</p>
                        <p className="text-lg font-semibold text-gray-700">{stageStats.history}</p>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${stage.color} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${getCompletionRate(stageStats)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{getCompletionRate(stageStats)}% complete</p>
                  </div>
                  
                  {index < stages.length - 1 && (
                    <div className="flex justify-center py-2">
                      <ArrowRight className="w-4 h-4 text-gray-400 transform rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stage Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const stageStats = stats[stage.id];
            const completionRate = getCompletionRate(stageStats);
            
            return (
              <div key={stage.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`${stage.color} p-2.5 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{stage.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Stage {stages.indexOf(stage) + 1} of {stages.length}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Pending Orders</span>
                    <span className={`text-lg font-bold ${stage.textColor}`}>{stageStats.pending}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="text-lg font-semibold text-green-700">{stageStats.history}</span>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600">Completion Rate</span>
                      <span className="text-xs font-semibold text-gray-700">{completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`${stage.color} h-2.5 rounded-full transition-all duration-300`}
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="p-2 bg-white rounded-lg border border-gray-200 flex-shrink-0">
                      {activity.icon === "receiving" && <Package className="w-4 h-4 text-red-600" />}
                      {activity.icon === "followup" && <TrendingUp className="w-4 h-4 text-red-600" />}
                      {activity.icon === "vehicle" && <Truck className="w-4 h-4 text-red-600" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">{activity.project}</p>
                        <span className="text-xs text-gray-500 flex-shrink-0">•</span>
                        <p className="text-xs text-gray-600 truncate">{activity.type}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Party: {activity.party}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{activity.date}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 text-xs font-medium rounded-full flex-shrink-0 ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">No recent activity to display</p>
              <p className="text-xs text-gray-400 mt-2">Start creating orders to see activity here</p>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200 p-6 text-center">
          <p className="text-sm text-gray-600 mb-6">Pipeline Efficiency</p>
          <p className="text-3xl font-bold text-red-600">
            {totalPending + totalCompleted > 0 
              ? Math.round((totalCompleted / (totalPending + totalCompleted)) * 100)
              : 0
            }%
          </p>
          <p className="text-xs text-gray-500 mt-2">Overall completion rate across all stages</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;