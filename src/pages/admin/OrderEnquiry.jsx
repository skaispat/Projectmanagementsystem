import React, { useState, useEffect } from "react";
import { Calendar, Filter, X, Plus, Search, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const OrderEnquiry = () => {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [enquiries, setEnquiries] = useState([]);
  const [historyEnquiries, setHistoryEnquiries] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    projectName: "",
    partyName: "",
    startDate: "",
    endDate: "",
  });

  const [formData, setFormData] = useState({
    projectName: "",
    partyName: "",
    location: "",
    qty: "",
    bidPrice: "",
    status: "",
    reason: "",
  });

  // Format date as dd/MM/yyyy
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Parse dd/MM/yyyy to Date object, also handles yyyy-MM-dd format
  const parseDate = (dateStr) => {
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return new Date(year, month - 1, day);
    } else {
      return new Date(dateStr);
    }
  };

  // Normalize date format for display
  const normalizeDate = (dateStr) => {
    if (dateStr.includes('/')) {
      return dateStr;
    } else {
      return formatDate(new Date(dateStr));
    }
  };

  // Generate PM serial number based on original index
  const generateSerialNumber = (id, enquiryList) => {
    const index = enquiryList.findIndex(item => item.id === id);
    return `PM-${String(index + 1).padStart(3, '0')}`;
  };

  // Load data from localStorage on mount and normalize dates
  useEffect(() => {
    // Load enquiry history first to get all serial numbers that should be hidden
    const savedHistory = localStorage.getItem("enquiryHistory");
    let historySerialNumbers = [];
    
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory);
      const normalizedHistory = parsedHistory.map(item => ({
        ...item,
        date: normalizeDate(item.date)
      }));
      setHistoryEnquiries(normalizedHistory);
      setFilteredHistory(normalizedHistory);
      
      // Get all serial numbers from history
      historySerialNumbers = parsedHistory.map(item => item.serialNo);
    }
    
    // Load pending enquiries
    const saved = localStorage.getItem("orderEnquiries");
    if (saved) {
      const parsedData = JSON.parse(saved);
      const normalizedData = parsedData.map(item => ({
        ...item,
        date: normalizeDate(item.date)
      }));
      setEnquiries(normalizedData);
      setFilteredEnquiries(normalizedData);
      localStorage.setItem("orderEnquiries", JSON.stringify(normalizedData));
    }
    
    // Check follow-up history and move matching enquiries to history
    const followUpHistory = localStorage.getItem("followUpHistory");
    if (followUpHistory && saved) {
      const parsedFollowUp = JSON.parse(followUpHistory);
      const parsedEnquiries = JSON.parse(saved);
      
      // Group follow-up items by serial number and sum quantities
      const serialQtyMap = {};
      parsedFollowUp.forEach(item => {
        if (!serialQtyMap[item.serialNo]) {
          serialQtyMap[item.serialNo] = 0;
        }
        const qty = parseFloat(item.dispatchQty) || 0;
        serialQtyMap[item.serialNo] += qty;
      });
      
      // Check which enquiries should move to history
      const movedToHistory = [];
      const remainingEnquiries = parsedEnquiries.filter(enquiry => {
        const serialNo = generateSerialNumber(enquiry.id, parsedEnquiries);
        const totalDispatchedQty = serialQtyMap[serialNo] || 0;
        const enquiryQty = parseFloat(enquiry.qty) || 0;
        
        // If dispatched qty >= enquiry qty, move to history
        if (totalDispatchedQty >= enquiryQty && !historySerialNumbers.includes(serialNo)) {
          movedToHistory.push({
            ...enquiry,
            serialNo: serialNo,
            completedDate: formatDate(new Date()),
            totalDispatchedQty: totalDispatchedQty
          });
          return false; // Remove from pending
        }
        return true; // Keep in pending
      });
      
      // Update history if there are new items
      if (movedToHistory.length > 0) {
        const updatedHistory = [...(savedHistory ? JSON.parse(savedHistory) : []), ...movedToHistory];
        setHistoryEnquiries(updatedHistory);
        setFilteredHistory(updatedHistory);
        localStorage.setItem("enquiryHistory", JSON.stringify(updatedHistory));
        
        // Update pending enquiries
        setEnquiries(remainingEnquiries);
        setFilteredEnquiries(remainingEnquiries);
        localStorage.setItem("orderEnquiries", JSON.stringify(remainingEnquiries));
      }
    }
  }, []);

  // Apply filters whenever filters or enquiries change
  useEffect(() => {
    applyFilters();
  }, [filters, enquiries, historyEnquiries]);

  const applyFilters = () => {
    const filterItems = (items) => {
      let filtered = [...items];

      if (filters.projectName) {
        filtered = filtered.filter((item) =>
          item.projectName.toLowerCase().includes(filters.projectName.toLowerCase())
        );
      }

      if (filters.partyName) {
        filtered = filtered.filter((item) =>
          item.partyName.toLowerCase().includes(filters.partyName.toLowerCase())
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

    setFilteredEnquiries(filterItems(enquiries));
    setFilteredHistory(filterItems(historyEnquiries));
  };

  const handleClearFilters = () => {
    setFilters({
      projectName: "",
      partyName: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "status" && value === "Order Received" ? { reason: "" } : {}),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.projectName || !formData.partyName || !formData.location || 
        !formData.qty || !formData.bidPrice || !formData.status) {
      alert("Please fill in all required fields");
      return;
    }

    if (formData.status === "Not" && !formData.reason) {
      alert("Please provide a reason");
      return;
    }

    const newEnquiry = {
      id: Date.now(),
      date: formatDate(new Date()),
      ...formData,
      reason: formData.status === "Order Received" ? "-" : formData.reason,
    };

    const updatedEnquiries = [...enquiries, newEnquiry];
    setEnquiries(updatedEnquiries);
    setFilteredEnquiries(updatedEnquiries); // Update filtered list immediately
    localStorage.setItem("orderEnquiries", JSON.stringify(updatedEnquiries));

    setFormData({
      projectName: "",
      partyName: "",
      location: "",
      qty: "",
      bidPrice: "",
      status: "",
      reason: "",
    });
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this enquiry?")) {
      const updatedEnquiries = enquiries.filter((item) => item.id !== id);
      setEnquiries(updatedEnquiries);
      localStorage.setItem("orderEnquiries", JSON.stringify(updatedEnquiries));
    }
  };

  const handleCancel = () => {
    setFormData({
      projectName: "",
      partyName: "",
      location: "",
      qty: "",
      bidPrice: "",
      status: "",
      reason: "",
    });
    setShowModal(false);
  };

  const currentData = activeTab === "pending" ? filteredEnquiries : filteredHistory;

  return (
    <div className="h-[88vh] bg-gray-50 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Filters Section - Fixed */}
        <div className="hidden lg:block flex-shrink-0 p-4 lg:p-6 bg-gray-50">
          <div className="max-w-full mx-auto">
            <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-4">
                <div className="flex gap-2 items-center">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleClearFilters}
                    className="px-3 py-1 text-xs text-gray-700 bg-gray-200 rounded-md transition-colors hover:bg-gray-300"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg shadow-md transition-all hover:opacity-90"
                    style={{ backgroundColor: '#991b1b' }}
                  >
                    <Plus size={18} />
                    New Enquiry
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Project Name Search */}
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
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Party Name Search */}
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
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Start Date */}
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
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* End Date */}
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
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Header with Filters Toggle */}
        <div className="lg:hidden flex-shrink-0 p-4 bg-gray-50 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Order Enquiry</h1>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg shadow-md transition-all hover:opacity-90"
              style={{ backgroundColor: '#991b1b' }}
            >
              <Plus size={18} />
              New
            </button>
          </div>
          
          {/* Mobile Filter Toggle Button */}
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

          {/* Mobile Collapsible Filters */}
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
                    autoComplete="off"
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
                    autoComplete="off"
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
                    autoComplete="off"
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
                    autoComplete="off"
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
              Pending ({filteredEnquiries.length})
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
          <div className="h-full bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:flex lg:flex-col lg:h-full lg:overflow-hidden">
              {/* Scrollable Table */}
              <div className="flex-1 overflow-y-auto overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      {activeTab === "pending" && (
                        <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[80px] whitespace-normal">
                          Action
                        </th>
                      )}
                      <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[100px] whitespace-normal">
                        Serial No
                      </th>
                      <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[110px] whitespace-normal">
                        Date
                      </th>
                      <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[150px] whitespace-normal">
                        Project Name
                      </th>
                      <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[130px] whitespace-normal">
                        Party Name
                      </th>
                      <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[120px] whitespace-normal">
                        Location
                      </th>
                      <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[80px] whitespace-normal">
                        Qty
                      </th>
                      <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[100px] whitespace-normal">
                        Bid Price
                      </th>
                      <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[130px] whitespace-normal">
                        Status
                      </th>
                      {activeTab === "pending" && (
                        <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[150px] whitespace-normal">
                          Reason
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length > 0 ? (
                      currentData.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                          {activeTab === "pending" && (
                            <td className="px-6 py-4 text-sm whitespace-normal">
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 -m-2 transition-colors hover:bg-red-50 rounded-md"
                                style={{ color: '#991b1b' }}
                                title="Delete record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-normal">
                            {activeTab === "pending" 
                              ? generateSerialNumber(item.id, enquiries)
                              : item.serialNo}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal">
                            {normalizeDate(item.date)}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-normal">
                            {item.projectName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal">
                            {item.partyName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 whitespace-normal">
                            {item.location}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal">
                            {item.qty}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal">
                            {item.bidPrice}
                          </td>
                          <td className="px-6 py-4 whitespace-normal">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                                item.status === "Order Received"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          {activeTab === "pending" && (
                            <td className="px-6 py-4 text-sm text-gray-700">
                              <div className="break-words max-w-xs">
                                {item.reason}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={activeTab === "pending" ? "10" : "9"} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col gap-2 items-center">
                            <Filter className="w-8 h-8 text-gray-400" />
                            <span>No {activeTab} enquiry records found</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="flex-1 overflow-y-auto lg:hidden">
              {currentData.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {currentData.map((item, idx) => (
                    <div key={item.id} className="p-4 bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-gray-900">
                            {activeTab === "pending" 
                              ? generateSerialNumber(item.id, enquiries)
                              : item.serialNo}
                          </span>
                          <span className="text-xs text-gray-500 mt-0.5">{normalizeDate(item.date)}</span>
                        </div>
                        {activeTab === "pending" && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 -m-2 transition-colors hover:bg-red-50 rounded-md"
                            style={{ color: '#991b1b' }}
                            title="Delete record"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-2.5">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Project</span>
                          <span className="text-sm font-semibold text-gray-900 mt-0.5 break-words">{item.projectName}</span>
                        </div>
                        
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Party</span>
                          <span className="text-sm text-gray-900 mt-0.5 break-words">{item.partyName}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</span>
                            <span className="text-sm text-gray-900 mt-0.5 break-words">{item.location}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quantity</span>
                            <span className="text-sm text-gray-900 mt-0.5 break-words">{item.qty}</span>
                          </div>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bid Price</span>
                          <span className="text-sm text-gray-900 mt-0.5 break-words">{item.bidPrice}</span>
                        </div>
                        
                        <div className="flex flex-col pt-1">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Status</span>
                          <span
                            className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-semibold self-start ${
                              item.status === "Order Received"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        
                        {activeTab === "pending" && item.reason !== "-" && (
                          <div className="flex flex-col pt-2 mt-2 border-t border-gray-200">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reason</span>
                            <span className="text-sm text-gray-900 mt-0.5 break-words">{item.reason}</span>
                          </div>
                        )}
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">New Enquiry</h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Project Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                  placeholder="Enter project name"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Party Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="partyName"
                  value={formData.partyName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                  placeholder="Enter party name"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Location <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                  placeholder="Enter location"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Qty <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="qty"
                  value={formData.qty}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                  placeholder="Enter quantity"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Bid Price <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="bidPrice"
                  value={formData.bidPrice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                  placeholder="Enter bid price"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Status <span className="text-red-600">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                  autoComplete="off"
                >
                  <option value="">Select status</option>
                  <option value="Order Received">Order Received</option>
                  <option value="Not">Not</option>
                </select>
              </div>

              {formData.status === "Not" && (
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Reason <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    placeholder="Enter reason"
                    autoComplete="off"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end p-4 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                onClick={handleCancel}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2.5 text-sm font-medium text-white rounded-md transition-all hover:opacity-90"
                style={{ backgroundColor: '#991b1b' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderEnquiry;