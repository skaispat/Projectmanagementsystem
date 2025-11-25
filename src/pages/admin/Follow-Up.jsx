import React, { useState, useEffect } from "react";
import { Calendar, Filter, X, Search, ChevronDown, ChevronUp, Truck } from "lucide-react";

const FollowUp = () => {
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
    deliveryQty: "",
    vehicleNo: "",
    transporterDetails: "",
    status: "",
    dispatchQty: "",
    remarks: "",
  });

  // Format date as dd/MM/yyyy
  const formatDate = (date) => {
    if (!date) return "";
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return "";
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  // Parse dd/MM/yyyy to Date object
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    try {
      if (typeof dateStr === 'string' && dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        return new Date(year, month - 1, day);
      } else {
        return new Date(dateStr);
      }
    } catch (error) {
      console.error("Error parsing date:", error);
      return new Date();
    }
  };

  // Normalize date format for display with error handling
  const normalizeDate = (dateStr) => {
    if (!dateStr) return formatDate(new Date());
    try {
      if (typeof dateStr === 'string' && dateStr.includes('/')) {
        return dateStr;
      } else {
        return formatDate(new Date(dateStr));
      }
    } catch (error) {
      console.error("Error normalizing date:", error);
      return formatDate(new Date());
    }
  };

  // Generate OD order number
  const generateOrderNumber = (index) => {
    return `OD-${String(index + 1).padStart(3, '0')}`;
  };

  // Generate Follow Up number
  const generateFollowUpNumber = (index) => {
    return `FLW-${String(index + 1).padStart(3, '0')}`;
  };

  // Safe data loading with error handling
  const loadData = () => {
    try {
      // Load Follow Up History first
      const savedHistory = localStorage.getItem("followUpHistory");
      let followUpHistoryIds = [];
      
      if (savedHistory) {
        const parsedFollowUpHistory = JSON.parse(savedHistory);
        const normalizedFollowUpHistory = parsedFollowUpHistory.map(item => ({
          ...item,
          date: normalizeDate(item.date)
        }));
        setHistoryOrders(normalizedFollowUpHistory);
        setFilteredHistory(normalizedFollowUpHistory);
        
        // Get all IDs that are already in follow up history
        followUpHistoryIds = parsedFollowUpHistory.map(item => item.id);
      }

      // Load from Vehicle Placed History and filter out items already in follow up history
      const vehiclePlacedHistory = localStorage.getItem("vehiclePlacedHistory");
      if (vehiclePlacedHistory) {
        const parsedHistory = JSON.parse(vehiclePlacedHistory);
        
        // Filter out orders that are already in follow up history with "Get Out" status
        const filteredOrders = parsedHistory.filter(item => {
          const hasGetOutFollowUp = historyOrders.some(followUp => 
            followUp.id === item.id && followUp.status === "Get Out"
          );
          return !hasGetOutFollowUp;
        });
        
        const normalizedHistory = filteredOrders.map(item => ({
          ...item,
          date: normalizeDate(item.date),
          // Ensure all required fields have default values
          partyAddress: item.partyAddress || "",
          shippingAddress: item.shippingAddress || "",
          gstNo: item.gstNo || "",
          receiverPersonName: item.receiverPersonName || "",
          receiverContactNumber: item.receiverContactNumber || "",
          deliveryQty: item.deliveryQty || "",
          vehicleNo: item.vehicleNo || "",
          transporterDetails: item.transporterDetails || ""
        }));
        setPendingOrders(normalizedHistory);
        setFilteredPending(normalizedHistory);
      } else {
        // If no vehicle placed history, set empty arrays
        setPendingOrders([]);
        setFilteredPending([]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      // Set empty arrays on error
      setPendingOrders([]);
      setHistoryOrders([]);
      setFilteredPending([]);
      setFilteredHistory([]);
    }
  };

  // Load data from localStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [filters, pendingOrders, historyOrders]);

  const applyFilters = () => {
    const filterItems = (items) => {
      let filtered = [...items];

      if (filters.projectName) {
        filtered = filtered.filter((item) =>
          (item.projectName || "").toLowerCase().includes(filters.projectName.toLowerCase())
        );
      }

      if (filters.partyName) {
        filtered = filtered.filter((item) =>
          (item.partyName || "").toLowerCase().includes(filters.partyName.toLowerCase())
        );
      }

      if (filters.startDate && filters.endDate) {
        filtered = filtered.filter((item) => {
          try {
            const itemDate = parseDate(item.date);
            const startDate = new Date(filters.startDate);
            const endDate = new Date(filters.endDate);
            return itemDate >= startDate && itemDate <= endDate;
          } catch (error) {
            console.error("Error filtering by date:", error);
            return true;
          }
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

  const handleActionClick = (order, index) => {
    setFormData({
      id: order.id,
      orderNo: generateOrderNumber(index),
      serialNo: order.serialNo || "",
      partyAddress: order.partyAddress || "",
      shippingAddress: order.shippingAddress || "",
      gstNo: order.gstNo || "",
      receiverPersonName: order.receiverPersonName || "",
      receiverContactNumber: order.receiverContactNumber || "",
      deliveryQty: order.deliveryQty || "",
      vehicleNo: order.vehicleNo || "",
      transporterDetails: order.transporterDetails || "",
      status: "",
      dispatchQty: order.deliveryQty || "",
      remarks: "",
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

    // Validation
    if (!formData.status) {
      alert("Please select a status");
      return;
    }

    if (formData.status === "Get Out" && !formData.dispatchQty) {
      alert("Please enter dispatch quantity");
      return;
    }

    try {
      // Create history entry
      const historyEntry = {
        id: formData.id,
        followUpNo: generateFollowUpNumber(historyOrders.length),
        orderNo: formData.orderNo,
        serialNo: formData.serialNo,
        partyAddress: formData.partyAddress,
        shippingAddress: formData.shippingAddress,
        gstNo: formData.gstNo,
        receiverPersonName: formData.receiverPersonName,
        receiverContactNumber: formData.receiverContactNumber,
        deliveryQty: formData.deliveryQty,
        vehicleNo: formData.vehicleNo,
        transporterDetails: formData.transporterDetails,
        status: formData.status,
        dispatchQty: formData.dispatchQty || "",
        remarks: formData.remarks || "",
        completedDate: formatDate(new Date()),
      };

      // Update history orders
      const updatedHistory = [...historyOrders, historyEntry];
      setHistoryOrders(updatedHistory);
      localStorage.setItem("followUpHistory", JSON.stringify(updatedHistory));

      // Remove from pending orders only if status is "Get Out"
      if (formData.status === "Get Out") {
        const updatedPending = pendingOrders.filter(order => order.id !== formData.id);
        setPendingOrders(updatedPending);
      }

      // Reset form and close modal
      setFormData({
        id: null,
        orderNo: "",
        serialNo: "",
        partyAddress: "",
        shippingAddress: "",
        gstNo: "",
        receiverPersonName: "",
        receiverContactNumber: "",
        deliveryQty: "",
        vehicleNo: "",
        transporterDetails: "",
        status: "",
        dispatchQty: "",
        remarks: "",
      });
      setShowModal(false);
    } catch (error) {
      console.error("Error saving follow up:", error);
      alert("Error saving follow up. Please try again.");
    }
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
      deliveryQty: "",
      vehicleNo: "",
      transporterDetails: "",
      status: "",
      dispatchQty: "",
      remarks: "",
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
        <h1 className="text-xl font-bold text-gray-900">Follow Up</h1>
        
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
                  {activeTab === "pending" ? (
                    <>
                      <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                        Action
                      </th>
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
                        Receiver Person name
                      </th>
                      <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                        Receiver Contact Number
                      </th>
                      <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                        Delivery Qty
                      </th>
                      <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                        Vehicle No
                      </th>
                      <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                        Transporter Details
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                        Follow Up
                      </th>
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
                        Receiver Person name
                      </th>
                      <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                        Receiver Contact Number
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
                      <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                        Remarks
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.length > 0 ? (
                  currentData.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      {activeTab === "pending" ? (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleActionClick(item, idx)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white rounded-md transition-all hover:opacity-90"
                              style={{ backgroundColor: '#991b1b' }}
                            >
                              <Truck className="w-4 h-4" />
                              Process
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                            {generateOrderNumber(idx)}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                            {item.serialNo || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-xs whitespace-nowrap overflow-hidden text-ellipsis">
                              {item.partyAddress || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-xs whitespace-nowrap overflow-hidden text-ellipsis">
                              {item.shippingAddress || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {item.gstNo || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {item.receiverPersonName || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {item.receiverContactNumber || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {item.deliveryQty || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {item.vehicleNo || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-xs whitespace-nowrap overflow-hidden text-ellipsis">
                              {item.transporterDetails || "-"}
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                            {item.followUpNo || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                            {item.orderNo || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                            {item.serialNo || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-xs whitespace-nowrap overflow-hidden text-ellipsis">
                              {item.partyAddress || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-xs whitespace-nowrap overflow-hidden text-ellipsis">
                              {item.shippingAddress || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {item.gstNo || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {item.receiverPersonName || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {item.receiverContactNumber || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {item.deliveryQty || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {item.vehicleNo || "-"}
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
                            {item.dispatchQty || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-xs whitespace-nowrap overflow-hidden text-ellipsis">
                              {item.remarks || "-"}
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={activeTab === "pending" ? "11" : "13"} className="px-6 py-12 text-center text-gray-500">
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
                          {activeTab === "pending" ? generateOrderNumber(idx) : (item.followUpNo || "-")}
                        </span>
                        <span className="text-base font-bold text-gray-900">
                          {activeTab === "pending" ? item.serialNo || "-" : item.orderNo || "-"}
                        </span>
                      </div>
                      {activeTab === "pending" && (
                        <button
                          onClick={() => handleActionClick(item, idx)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white rounded-md transition-all hover:opacity-90"
                          style={{ backgroundColor: '#991b1b' }}
                        >
                          <Truck className="w-4 h-4" />
                          Process
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-2.5">
                      {activeTab === "pending" ? (
                        <>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Serial No</span>
                            <span className="text-sm text-gray-900 mt-0.5 break-words">{item.serialNo || "-"}</span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Party Address</span>
                            <span className="text-sm text-gray-900 mt-0.5 break-words">{item.partyAddress || "-"}</span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Shipping Address</span>
                            <span className="text-sm text-gray-900 mt-0.5 break-words">{item.shippingAddress || "-"}</span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">GST No</span>
                            <span className="text-sm text-gray-900 mt-0.5 break-words">{item.gstNo || "-"}</span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Receiver Person</span>
                            <span className="text-sm text-gray-900 mt-0.5 break-words">{item.receiverPersonName || "-"}</span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Receiver Contact</span>
                            <span className="text-sm text-gray-900 mt-0.5 break-words">{item.receiverContactNumber || "-"}</span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Delivery Qty</span>
                            <span className="text-sm text-gray-900 mt-0.5 break-words">{item.deliveryQty || "-"}</span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vehicle No</span>
                            <span className="text-sm text-gray-900 mt-0.5 break-words">{item.vehicleNo || "-"}</span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Transporter Details</span>
                            <span className="text-sm text-gray-900 mt-0.5 break-words">{item.transporterDetails || "-"}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Order No</span>
                            <span className="text-sm text-gray-900 mt-0.5 break-words">{item.orderNo || "-"}</span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Serial No</span>
                            <span className="text-sm text-gray-900 mt-0.5 break-words">{item.serialNo || "-"}</span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Party Address</span>
                            <span className="text-sm text-gray-900 mt-0.5 break-words">{item.partyAddress || "-"}</span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Shipping Address</span>
                            <span className="text-sm text-gray-900 mt-0.5 break-words">{item.shippingAddress || "-"}</span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">GST No</span>
                            <span className="text-sm text-gray-900 mt-0.5 break-words">{item.gstNo || "-"}</span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Receiver Person</span>
                            <span className="text-sm text-gray-900 mt-0.5 break-words">{item.receiverPersonName || "-"}</span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Receiver Contact</span>
                            <span className="text-sm text-gray-900 mt-0.5 break-words">{item.receiverContactNumber || "-"}</span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Remaining Qty</span>
                            <span className="text-sm text-gray-900 mt-0.5 break-words">{item.deliveryQty || "-"}</span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vehicle No</span>
                            <span className="text-sm text-gray-900 mt-0.5 break-words">{item.vehicleNo || "-"}</span>
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
                            <span className="text-sm text-gray-900 mt-0.5 break-words">{item.dispatchQty || "-"}</span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Remarks</span>
                            <span className="text-sm text-gray-900 mt-0.5 break-words">{item.remarks || "-"}</span>
                          </div>
                        </>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">Update Follow Up</h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Pre-filled fields */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Order No
                </label>
                <input
                  type="text"
                  value={formData.orderNo}
                  readOnly
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Serial No
                </label>
                <input
                  type="text"
                  value={formData.serialNo}
                  readOnly
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Party Address
                </label>
                <textarea
                  value={formData.partyAddress}
                  readOnly
                  rows="2"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Shipping Address
                </label>
                <textarea
                  value={formData.shippingAddress}
                  readOnly
                  rows="2"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  GST No
                </label>
                <input
                  type="text"
                  value={formData.gstNo}
                  readOnly
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Receiver Person name
                </label>
                <input
                  type="text"
                  value={formData.receiverPersonName}
                  readOnly
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Receiver Contact Number
                </label>
                <input
                  type="text"
                  value={formData.receiverContactNumber}
                  readOnly
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Dispatch Qty
                </label>
                <input
                  type="number"
                  name="dispatchQty"
                  value={formData.dispatchQty}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                  placeholder="Enter dispatch quantity"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Vehicle No
                </label>
                <input
                  type="text"
                  value={formData.vehicleNo}
                  readOnly
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Status Dropdown */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Status <span className="text-red-600">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                >
                  <option value="">Select Status</option>
                  <option value="Get In">Get In</option>
                  <option value="Get Out">Get Out</option>
                  <option value="Loading">Loading</option>
                  <option value="Unloading">Unloading</option>
                </select>
              </div>

              {/* Conditional: Dispatch Qty for "Get Out" */}
              {formData.status === "Get Out" && (
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Dispatch Qty <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    name="dispatchQty"
                    value={formData.dispatchQty}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    placeholder="Enter dispatch quantity"
                    required
                  />
                </div>
              )}

              {/* Remarks for other statuses */}
              {formData.status && formData.status !== "Get Out" && (
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Remarks
                  </label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    placeholder="Enter remarks"
                  />
                </div>
              )}

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

export default FollowUp;