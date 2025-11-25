import React, { useState, useEffect } from "react";
import { Calendar, Filter, X, Search, ChevronDown, ChevronUp, Package } from "lucide-react";

const Receiving = () => {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingOrders, setPendingOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [filteredPending, setFilteredPending] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    projectName: "",
    partyName: "",
    startDate: "",
    endDate: "",
  });

  const [formData, setFormData] = useState({
    id: null,
    orderNo: "",
    serialNo: "",
    partyAddress: "",
    shippingAddress: "",
    gstNo: "",
    receiverPersonName: "",
    receiverContactNumber: "",
    remainingQty: "",
    vehicleNo: "",
    status: "",
    dispatchQty: "",
    lrWithGrn: "",
    qtyReceived: "",
    condition: "",
  });

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDate = (dateStr) => {
    if (dateStr && dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return new Date(year, month - 1, day);
    }
    return new Date(dateStr);
  };

  const normalizeDate = (dateStr) => {
    if (!dateStr) return formatDate(new Date());
    if (dateStr.includes('/')) {
      return dateStr;
    }
    return formatDate(new Date(dateStr));
  };

  const generateOrderNumber = (index) => {
    return `RO-${String(index + 1).padStart(3, '0')}`;
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem("receivingHistory");
    let receivingHistoryIds = [];
    
    if (savedHistory) {
      const parsedReceivingHistory = JSON.parse(savedHistory);
      const normalizedReceivingHistory = parsedReceivingHistory.map(item => ({
        ...item,
        date: normalizeDate(item.date)
      }));
      setHistoryOrders(normalizedReceivingHistory);
      setFilteredHistory(normalizedReceivingHistory);
      receivingHistoryIds = parsedReceivingHistory.map(item => item.id);
    }

    const followUpHistory = localStorage.getItem("followUpHistory");
    if (followUpHistory) {
      const parsedHistory = JSON.parse(followUpHistory);
      // Filter only "Get Out" status orders for pending section
      const getOutOrders = parsedHistory.filter(item => 
        item.status === "Get Out" && !receivingHistoryIds.includes(item.id)
      );
      const normalizedHistory = getOutOrders.map(item => ({
        ...item,
        date: normalizeDate(item.date)
      }));
      setPendingOrders(normalizedHistory);
      setFilteredPending(normalizedHistory);
    }
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, pendingOrders, historyOrders]);

  const applyFilters = () => {
    const filterItems = (items) => {
      let filtered = [...items];

      if (filters.projectName) {
        filtered = filtered.filter((item) =>
          item.projectName?.toLowerCase().includes(filters.projectName.toLowerCase())
        );
      }

      if (filters.partyName) {
        filtered = filtered.filter((item) =>
          item.partyName?.toLowerCase().includes(filters.partyName.toLowerCase())
        );
      }

      if (filters.startDate && filters.endDate) {
        filtered = filtered.filter((item) => {
          const itemDate = parseDate(item.date);
          const startDate = new Date(filters.startDate);
          const endDate = new Date(filters.endDate);
          return itemDate >= startDate && itemDate <= endDate;
        });
      }

      return filtered;
    };

    setFilteredPending(filterItems(pendingOrders));
    setFilteredHistory(filterItems(historyOrders));
  };

  const handleClearFilters = () => {
    setFilters({
      projectName: "",
      partyName: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleActionClick = (order) => {
    setFormData({
      id: order.id,
      orderNo: generateOrderNumber(pendingOrders.findIndex(p => p.id === order.id)),
      serialNo: order.serialNo || "",
      partyAddress: order.partyAddress || "",
      shippingAddress: order.shippingAddress || "",
      gstNo: order.gstNo || "",
      receiverPersonName: order.receiverPersonName || "",
      receiverContactNumber: order.receiverContactNumber || "",
      remainingQty: order.remainingQty || order.qty || "",
      vehicleNo: order.vehicleNo || "",
      status: order.status || "",
      dispatchQty: order.dispatchQty || "",
      lrWithGrn: "",
      qtyReceived: "",
      condition: "",
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.lrWithGrn) {
      alert("Please enter LR with GRN");
      return;
    }

    if (!formData.qtyReceived) {
      alert("Please enter Qty Received");
      return;
    }

    if (!formData.condition) {
      alert("Please enter Condition");
      return;
    }

    const historyEntry = {
      ...formData,
      receivedDate: formatDate(new Date()),
      projectName: pendingOrders.find(order => order.id === formData.id)?.projectName || "",
      partyName: pendingOrders.find(order => order.id === formData.id)?.partyName || "",
      qty: pendingOrders.find(order => order.id === formData.id)?.qty || "",
      poPrice: pendingOrders.find(order => order.id === formData.id)?.poPrice || "",
      materialType: pendingOrders.find(order => order.id === formData.id)?.materialType || "",
      transporterDetails: pendingOrders.find(order => order.id === formData.id)?.transporterDetails || "",
      vehicleQty: pendingOrders.find(order => order.id === formData.id)?.vehicleQty || "",
      date: pendingOrders.find(order => order.id === formData.id)?.date || "",
    };

    const updatedHistory = [...historyOrders, historyEntry];
    setHistoryOrders(updatedHistory);
    localStorage.setItem("receivingHistory", JSON.stringify(updatedHistory));

    const updatedPending = pendingOrders.filter(order => order.id !== formData.id);
    setPendingOrders(updatedPending);

    setFormData({
      id: null,
      orderNo: "",
      serialNo: "",
      partyAddress: "",
      shippingAddress: "",
      gstNo: "",
      receiverPersonName: "",
      receiverContactNumber: "",
      remainingQty: "",
      vehicleNo: "",
      status: "",
      dispatchQty: "",
      lrWithGrn: "",
      qtyReceived: "",
      condition: "",
    });
    setShowModal(false);
  };

  const handleCancel = () => {
    setFormData({
      id: null,
      orderNo: "",
      serialNo: "",
      partyAddress: "",
      shippingAddress: "",
      gstNo: "",
      receiverPersonName: "",
      receiverContactNumber: "",
      remainingQty: "",
      vehicleNo: "",
      status: "",
      dispatchQty: "",
      lrWithGrn: "",
      qtyReceived: "",
      condition: "",
    });
    setShowModal(false);
  };

  const currentData = activeTab === "pending" ? filteredPending : filteredHistory;

  return (
    <div className="h-[88vh] bg-gray-50 flex flex-col">
      {/* Desktop Filters Section - Fixed */}
      <div className="hidden lg:block flex-shrink-0 p-6 bg-gray-50">
        <div className="max-w-full mx-auto">
          <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-4">
              <div className="flex gap-2 items-center">
                <Filter className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
              </div>
              <button
                onClick={handleClearFilters}
                className="px-3 py-1 text-xs text-gray-700 bg-gray-200 rounded-md transition-colors hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Project Name
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={filters.projectName}
                    onChange={(e) => setFilters({ ...filters, projectName: e.target.value })}
                    placeholder="Search project..."
                    className="py-2 pr-3 pl-10 w-full text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-red-800 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Party Name
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={filters.partyName}
                    onChange={(e) => setFilters({ ...filters, partyName: e.target.value })}
                    placeholder="Search party..."
                    className="py-2 pr-3 pl-10 w-full text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-red-800 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="py-2 pr-3 pl-10 w-full text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-red-800 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  End Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="py-2 pr-3 pl-10 w-full text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-red-800 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header with Filters Toggle */}
      <div className="lg:hidden flex-shrink-0 p-4 bg-gray-50 space-y-3">
        <h1 className="text-xl font-bold text-gray-900">Receiving</h1>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filters</span>
            {(filters.projectName || filters.partyName || filters.startDate || filters.endDate) && (
              <span className="px-2 py-0.5 text-xs font-semibold text-white bg-red-800 rounded-full">
                Active
              </span>
            )}
          </div>
          {showFilters ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Project Name
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={filters.projectName}
                  onChange={(e) => setFilters({ ...filters, projectName: e.target.value })}
                  placeholder="Search project..."
                  className="py-2 pr-3 pl-10 w-full text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-red-800 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Party Name
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={filters.partyName}
                  onChange={(e) => setFilters({ ...filters, partyName: e.target.value })}
                  placeholder="Search party..."
                  className="py-2 pr-3 pl-10 w-full text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-red-800 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="py-2 px-3 w-full text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-red-800 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="py-2 px-3 w-full text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-red-800 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={handleClearFilters}
              className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md transition-colors hover:bg-gray-300"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 px-4 lg:px-6 bg-gray-50">
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "pending"
                ? "border-red-800 text-red-800"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Pending ({filteredPending.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "history"
                ? "border-red-800 text-red-800"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            History ({filteredHistory.length})
          </button>
        </div>
      </div>

      {/* Table Section - Scrollable */}
      <div className="flex-1 overflow-hidden px-4 lg:px-6 pb-4 lg:pb-6 pt-4">
        <div className="h-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          {/* Desktop Table */}
          <div className="hidden lg:block flex-1 overflow-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  {activeTab === "pending" && (
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                      Action
                    </th>
                  )}
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                    Order No
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                    Serial No
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                    Party Address
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                    Shipping Address
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                    GST No
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                    Receiver Person
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                    Receiver Contact
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                    Remaining Qty
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                    Vehicle No
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                    Dispatch Qty
                  </th>
                  {activeTab === "history" && (
                    <>
                      <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                        LR with GRN
                      </th>
                      <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                        Qty Received
                      </th>
                      <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                        Condition
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.length > 0 ? (
                  currentData.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      {activeTab === "pending" && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleActionClick(item)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white rounded-md transition-all hover:opacity-90"
                            style={{ backgroundColor: '#991b1b' }}
                          >
                            <Package className="w-4 h-4" />
                            Process
                          </button>
                        </td>
                      )}
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {generateOrderNumber(idx)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {item.serialNo}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs whitespace-nowrap overflow-hidden text-ellipsis">
                          {item.partyAddress}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs whitespace-nowrap overflow-hidden text-ellipsis">
                          {item.shippingAddress}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {item.gstNo}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {item.receiverPersonName || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {item.receiverContactNumber || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {item.remainingQty || item.qty}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {item.vehicleNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.status === "Get In" ? "bg-blue-100 text-blue-800" :
                          item.status === "Loading" ? "bg-yellow-100 text-yellow-800" :
                          item.status === "Get Out" ? "bg-green-100 text-green-800" :
                          item.status === "Unloading" ? "bg-purple-100 text-purple-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {item.dispatchQty}
                      </td>
                      {activeTab === "history" && (
                        <>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {item.lrWithGrn}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {item.qtyReceived}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {item.condition}
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={activeTab === "pending" ? "12" : "15"} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col gap-2 items-center">
                        <Filter className="w-8 h-8 text-gray-400" />
                        <span>No {activeTab} records found</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="flex-1 overflow-y-auto lg:hidden">
            {currentData.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {currentData.map((item, idx) => (
                  <div key={item.id} className="p-4 bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-red-800 mb-1">
                          {generateOrderNumber(idx)}
                        </span>
                        <span className="text-base font-bold text-gray-900">
                          {item.serialNo}
                        </span>
                      </div>
                      {activeTab === "pending" && (
                        <button
                          onClick={() => handleActionClick(item)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white rounded-md transition-all hover:opacity-90"
                          style={{ backgroundColor: '#991b1b' }}
                        >
                          <Package className="w-4 h-4" />
                          Process
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-2.5">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Party Address</span>
                        <span className="text-sm text-gray-900 mt-0.5 break-words">{item.partyAddress}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Shipping Address</span>
                        <span className="text-sm text-gray-900 mt-0.5 break-words">{item.shippingAddress}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">GST No</span>
                          <span className="text-sm text-gray-900 mt-0.5 break-words">{item.gstNo}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Receiver Person</span>
                          <span className="text-sm text-gray-900 mt-0.5 break-words">{item.receiverPersonName || "N/A"}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Receiver Contact</span>
                          <span className="text-sm text-gray-900 mt-0.5 break-words">{item.receiverContactNumber || "N/A"}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Remaining Qty</span>
                          <span className="text-sm text-gray-900 mt-0.5 break-words">{item.remainingQty || item.qty}</span>
                        </div>
                      </div>

                      <div className="pt-2 mt-2 border-t border-gray-200 space-y-2.5">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vehicle No</span>
                          <span className="text-sm text-gray-900 mt-0.5 break-words">{item.vehicleNo}</span>
                        </div>
                        
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</span>
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full mt-0.5 w-fit ${
                            item.status === "Get In" ? "bg-blue-100 text-blue-800" :
                            item.status === "Loading" ? "bg-yellow-100 text-yellow-800" :
                            item.status === "Get Out" ? "bg-green-100 text-green-800" :
                            item.status === "Unloading" ? "bg-purple-100 text-purple-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {item.status}
                          </span>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Dispatch Qty</span>
                          <span className="text-sm text-gray-900 mt-0.5 break-words">{item.dispatchQty}</span>
                        </div>

                        {activeTab === "history" && (
                          <>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">LR with GRN</span>
                              <span className="text-sm text-gray-900 mt-0.5 break-words">{item.lrWithGrn}</span>
                            </div>
                            
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Qty Received</span>
                              <span className="text-sm text-gray-900 mt-0.5 break-words">{item.qtyReceived}</span>
                            </div>

                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Condition</span>
                              <span className="text-sm text-gray-900 mt-0.5 break-words">{item.condition}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full p-12 text-center text-gray-500">
                <div className="flex flex-col gap-3 items-center">
                  <Filter className="w-12 h-12 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-700">No {activeTab} records found</p>
                    <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">Process Material Receiving</h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Order No (Pre-filled, read-only) */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Order No
                </label>
                <input
                  type="text"
                  name="orderNo"
                  value={formData.orderNo}
                  readOnly
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Serial No (Pre-filled, read-only) */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Serial No
                </label>
                <input
                  type="text"
                  name="serialNo"
                  value={formData.serialNo}
                  readOnly
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Party Address (Pre-filled, read-only) */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Party Address
                </label>
                <textarea
                  name="partyAddress"
                  value={formData.partyAddress}
                  readOnly
                  rows="2"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Shipping Address (Pre-filled, read-only) */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Shipping Address
                </label>
                <textarea
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  readOnly
                  rows="2"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* GST No (Pre-filled, read-only) */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  GST No
                </label>
                <input
                  type="text"
                  name="gstNo"
                  value={formData.gstNo}
                  readOnly
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Receiver Person Name (Pre-filled, read-only) */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Receiver Person Name
                </label>
                <input
                  type="text"
                  name="receiverPersonName"
                  value={formData.receiverPersonName}
                  readOnly
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Receiver Contact Number (Pre-filled, read-only) */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Receiver Contact Number
                </label>
                <input
                  type="text"
                  name="receiverContactNumber"
                  value={formData.receiverContactNumber}
                  readOnly
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Remaining Qty (Pre-filled, read-only) */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Remaining Qty
                </label>
                <input
                  type="text"
                  name="remainingQty"
                  value={formData.remainingQty}
                  readOnly
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Vehicle No (Pre-filled, read-only) */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Vehicle No
                </label>
                <input
                  type="text"
                  name="vehicleNo"
                  value={formData.vehicleNo}
                  readOnly
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Status (Pre-filled, read-only) */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Status
                </label>
                <input
                  type="text"
                  name="status"
                  value={formData.status}
                  readOnly
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Dispatch Qty (Pre-filled, read-only) */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Dispatch Qty
                </label>
                <input
                  type="text"
                  name="dispatchQty"
                  value={formData.dispatchQty}
                  readOnly
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* LR with GRN (Input) */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  LR with GRN <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="lrWithGrn"
                  value={formData.lrWithGrn}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                  placeholder="Enter LR with GRN"
                />
              </div>

              {/* Qty Received (Input) */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Qty Received <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="qtyReceived"
                  value={formData.qtyReceived}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                  placeholder="Enter quantity received"
                />
              </div>

              {/* Condition (Input) */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Condition <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                  placeholder="Enter condition"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 text-sm font-medium text-white rounded-md transition-all hover:opacity-90"
                  style={{ backgroundColor: '#991b1b' }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Receiving;