import React, { useState, useEffect } from "react";
import { Calendar, Filter, X, Search, ChevronDown, ChevronUp, CheckCircle, Plus, Trash2 } from "lucide-react";

const OrderRealisation = () => {
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
    serialNo: "",
    originalQty: 0,
    remainingQty: 0,
    pendingId: null,
    projectName: "",
    partyName: "",
    qty: "",
    poPrice: "",
    poNumber: "",
    poValidation: "",
    poPdf: "",
    gredType: "",
    materialType: "",
    location: "",
    partyAddress: "",
    shippingAddress: "",
    gstNo: "",
    receiverPersonName: "",
    receiverContactNumber: "",
    consignees: [{ name: "", address: "" }] // Initialize with one empty consignee
  });

  // Format date as dd/MM/yyyy
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Parse dd/MM/yyyy to Date object
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

  // Generate PM serial number
  const generateSerialNumber = (index) => {
    return `PM-${String(index + 1).padStart(3, '0')}`;
  };

  // Generate OD order number
  const generateOrderNumber = (index) => {
    return `OD-${String(index + 1).padStart(3, '0')}`;
  };

  // Load data from localStorage on mount
  useEffect(() => {
    loadPendingOrders();
    loadHistoryOrders();
  }, []);

  const loadPendingOrders = () => {
    const orderEnquiries = localStorage.getItem("orderEnquiries");
    const savedPending = localStorage.getItem("orderRealisationPending");
    
    if (savedPending) {
      // Load from saved pending orders
      const parsedPending = JSON.parse(savedPending);
      const normalizedPending = parsedPending.map(item => ({
        ...item,
        date: normalizeDate(item.date)
      }));
      setPendingOrders(normalizedPending);
      setFilteredPending(normalizedPending);
    } else if (orderEnquiries) {
      // Initial load from order enquiries
      const parsedEnquiries = JSON.parse(orderEnquiries);
      const orderReceived = parsedEnquiries
        .filter(item => item.status === "Order Received")
        .map(item => ({
          ...item,
          date: normalizeDate(item.date),
          remainingQty: item.qty,
          originalQty: item.qty
        }));
      setPendingOrders(orderReceived);
      setFilteredPending(orderReceived);
      localStorage.setItem("orderRealisationPending", JSON.stringify(orderReceived));
    }
  };

  const loadHistoryOrders = () => {
    const savedHistory = localStorage.getItem("orderRealisationHistory");
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory);
      const normalizedHistory = parsedHistory.map(item => ({
        ...item,
        date: normalizeDate(item.date)
      }));
      setHistoryOrders(normalizedHistory);
      setFilteredHistory(normalizedHistory);
    }
  };

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [filters, pendingOrders, historyOrders]);

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
    const serialNo = generateSerialNumber(index);
    setFormData({
      serialNo: serialNo,
      originalQty: order.originalQty || order.qty,
      remainingQty: order.remainingQty || order.qty,
      pendingId: order.id,
      projectName: order.projectName,
      partyName: order.partyName,
      qty: order.remainingQty || order.qty,
      location: order.location,
      date: order.date,
      poPrice: "",
      poNumber: "",
      poValidation: "",
      poPdf: "",
      gredType: "",
      materialType: "",
      partyAddress: "",
      shippingAddress: "",
      gstNo: "",
      receiverPersonName: "",
      receiverContactNumber: "",
      consignees: [{ name: "", address: "" }]
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

  const handleConsigneeChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      consignees: prev.consignees.map((consignee, i) => 
        i === index ? { ...consignee, [field]: value } : consignee
      )
    }));
  };

  const addConsignee = () => {
    if (formData.consignees.length < 5) {
      setFormData(prev => ({
        ...prev,
        consignees: [...prev.consignees, { name: "", address: "" }]
      }));
    }
  };

  const removeConsignee = (index) => {
    if (formData.consignees.length > 1) {
      setFormData(prev => ({
        ...prev,
        consignees: prev.consignees.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Required fields validation
    const requiredFields = [
      'qty', 'poPrice', 'poNumber', 'poValidation', 'gredType', 'materialType', 
      'location', 'partyAddress', 'shippingAddress', 'gstNo',
      'receiverPersonName', 'receiverContactNumber'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate consignees
    const invalidConsignees = formData.consignees.filter(consignee => 
      !consignee.name || !consignee.address
    );
    if (invalidConsignees.length > 0) {
      alert("Please fill in all consignee fields");
      return;
    }

    const enteredQty = parseFloat(formData.qty);
    const remainingQty = parseFloat(formData.remainingQty);

    if (enteredQty <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }

    if (enteredQty > remainingQty) {
      alert(`Quantity cannot exceed remaining quantity (${remainingQty})`);
      return;
    }

    // Create history entry with all consignee data
    const historyEntry = {
      id: Date.now(),
      serialNo: formData.serialNo,
      date: formData.date,
      projectName: formData.projectName,
      partyName: formData.partyName,
      location: formData.location,
      qty: enteredQty,
      poPrice: formData.poPrice,
      poNumber: formData.poNumber,
      poValidation: formData.poValidation,
      poPdf: formData.poPdf,
      gredType: formData.gredType,
      materialType: formData.materialType,
      partyAddress: formData.partyAddress,
      shippingAddress: formData.shippingAddress,
      gstNo: formData.gstNo,
      receiverPersonName: formData.receiverPersonName,
      receiverContactNumber: formData.receiverContactNumber,
      completedDate: formatDate(new Date()),
      // Add all consignees as separate fields
      ...formData.consignees.reduce((acc, consignee, index) => {
        acc[`consigneeName${index + 1}`] = consignee.name;
        acc[`consigneeAddress${index + 1}`] = consignee.address;
        return acc;
      }, {})
    };

    // Update history orders
    const updatedHistory = [...historyOrders, historyEntry];
    setHistoryOrders(updatedHistory);
    localStorage.setItem("orderRealisationHistory", JSON.stringify(updatedHistory));

    // Update pending orders
    const updatedPending = pendingOrders.map(order => {
      if (order.id === formData.pendingId) {
        const newRemainingQty = remainingQty - enteredQty;
        return {
          ...order,
          remainingQty: newRemainingQty
        };
      }
      return order;
    }).filter(order => order.remainingQty > 0);

    setPendingOrders(updatedPending);
    localStorage.setItem("orderRealisationPending", JSON.stringify(updatedPending));

    // Reset form and close modal
    setFormData({
      serialNo: "",
      originalQty: 0,
      remainingQty: 0,
      pendingId: null,
      projectName: "",
      partyName: "",
      qty: "",
      poPrice: "",
      poNumber: "",
      poValidation: "",
      poPdf: "",
      gredType: "",
      materialType: "",
      location: "",
      partyAddress: "",
      shippingAddress: "",
      gstNo: "",
      receiverPersonName: "",
      receiverContactNumber: "",
      consignees: [{ name: "", address: "" }]
    });
    setShowModal(false);
  };

  const handleCancel = () => {
    setFormData({
      serialNo: "",
      originalQty: 0,
      remainingQty: 0,
      pendingId: null,
      projectName: "",
      partyName: "",
      qty: "",
      poPrice: "",
      poNumber: "",
      poValidation: "",
      poPdf: "",
      gredType: "",
      materialType: "",
      location: "",
      partyAddress: "",
      shippingAddress: "",
      gstNo: "",
      receiverPersonName: "",
      receiverContactNumber: "",
      consignees: [{ name: "", address: "" }]
    });
    setShowModal(false);
  };

  const currentData = activeTab === "pending" ? filteredPending : filteredHistory;

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
          <h1 className="text-xl font-bold text-gray-900">Order Realisation</h1>
          
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
          <div className="h-full bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:flex lg:flex-col lg:h-full lg:overflow-hidden">
              <div className="flex-1 overflow-y-auto overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      {activeTab === "pending" ? (
                        <>
                          <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[110px] whitespace-normal">
                            Action
                          </th>
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
                        </>
                      ) : (
                        <>
                          <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[100px] whitespace-normal">
                            Order No
                          </th>
                          <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[100px] whitespace-normal">
                            Serial No
                          </th>
                          <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[150px] whitespace-normal">
                            Project Name
                          </th>
                          <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[130px] whitespace-normal">
                            Party Name
                          </th>
                          <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[110px] whitespace-normal">
                            Date
                          </th>
                          <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[80px] whitespace-normal">
                            PO Qty
                          </th>
                          <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[100px] whitespace-normal">
                            Po Price
                          </th>
                          <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[120px] whitespace-normal">
                            Po Number
                          </th>
                          <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[120px] whitespace-normal">
                            Po Validation
                          </th>
                          <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[100px] whitespace-normal">
                            Po Pdf
                          </th>
                          <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[100px] whitespace-normal">
                            Gred Type
                          </th>
                          <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[120px] whitespace-normal">
                            Material Type
                          </th>
                          <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[120px] whitespace-normal">
                            Location
                          </th>
                          <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[150px] whitespace-normal">
                            Party Address
                          </th>
                          <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[150px] whitespace-normal">
                            Shipping Address
                          </th>
                          <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[120px] whitespace-normal">
                            GST No
                          </th>
                          <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[150px] whitespace-normal">
                            Receiver Person name
                          </th>
                          <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[120px] whitespace-normal">
                            Receiver Contact Number
                          </th>
                          {/* Consignee columns */}
                          {[1, 2, 3, 4, 5].map(num => (
                            <React.Fragment key={num}>
                              <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[150px] whitespace-normal">
                                Consignee Name{num}
                              </th>
                              <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase min-w-[150px] whitespace-normal">
                                Consignee Address{num}
                              </th>
                            </React.Fragment>
                          ))}
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length > 0 ? (
                      currentData.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                          {activeTab === "pending" ? (
                            <>
                              <td className="px-6 py-4 whitespace-normal">
                                <button
                                  onClick={() => handleActionClick(item, pendingOrders.findIndex(o => o.id === item.id))}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white rounded-md transition-all hover:opacity-90"
                                  style={{ backgroundColor: '#991b1b' }}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Process
                                </button>
                              </td>
                              <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-normal">
                                {generateSerialNumber(pendingOrders.findIndex(o => o.id === item.id))}
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
                                {item.remainingQty}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal">
                                {item.bidPrice || "N/A"}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-normal">
                                {generateOrderNumber(idx)}
                              </td>
                              <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-normal">
                                {item.serialNo}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-normal">
                                {item.projectName}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal">
                                {item.partyName}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal">
                                {normalizeDate(item.date)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal">
                                {item.qty}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal">
                                {item.poPrice}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal">
                                {item.poNumber}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal">
                                {item.poValidation}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal">
                                {item.poPdf ? (
                                  <a href="#" className="text-red-800 hover:underline">
                                    View
                                  </a>
                                ) : (
                                  "N/A"
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal">
                                {item.gredType}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal">
                                {item.materialType}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal">
                                {item.location}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal">
                                <div className="break-words max-w-xs">
                                  {item.partyAddress}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal">
                                <div className="break-words max-w-xs">
                                  {item.shippingAddress}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal">
                                {item.gstNo}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal">
                                {item.receiverPersonName}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal">
                                {item.receiverContactNumber}
                              </td>
                              {/* Consignee data */}
                              {[1, 2, 3, 4, 5].map(num => (
                                <React.Fragment key={num}>
                                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal">
                                    {item[`consigneeName${num}`] || "-"}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal">
                                    <div className="break-words max-w-xs">
                                      {item[`consigneeAddress${num}`] || "-"}
                                    </div>
                                  </td>
                                </React.Fragment>
                              ))}
                            </>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={activeTab === "pending" ? "8" : "27"} className="px-6 py-12 text-center text-gray-500">
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
            </div>

            {/* Mobile Card View - Simplified for mobile */}
            <div className="flex-1 overflow-y-auto lg:hidden">
              {currentData.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {currentData.map((item, idx) => (
                    <div key={item.id} className="p-4 bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col">
                          {activeTab === "history" && (
                            <span className="text-xs font-bold text-red-800 mb-1">
                              {generateOrderNumber(idx)}
                            </span>
                          )}
                          <span className="text-base font-bold text-gray-900">
                            {activeTab === "pending" 
                              ? generateSerialNumber(pendingOrders.findIndex(o => o.id === item.id))
                              : item.serialNo
                            }
                          </span>
                          <span className="text-xs text-gray-500 mt-0.5">{normalizeDate(item.date)}</span>
                        </div>
                        {activeTab === "pending" && (
                          <button
                            onClick={() => handleActionClick(item, pendingOrders.findIndex(o => o.id === item.id))}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white rounded-md transition-all hover:opacity-90"
                            style={{ backgroundColor: '#991b1b' }}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Process
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
                          {activeTab === "pending" && (
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</span>
                              <span className="text-sm text-gray-900 mt-0.5 break-words">{item.location}</span>
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quantity</span>
                            <span className="text-sm text-gray-900 mt-0.5 break-words">
                              {activeTab === "pending" ? item.remainingQty : item.qty}
                            </span>
                          </div>
                        </div>

                        {activeTab === "pending" && (
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bid Price</span>
                            <span className="text-sm text-gray-900 mt-0.5 break-words">
                              {item.bidPrice || "N/A"}
                            </span>
                          </div>
                        )}

                        {activeTab === "history" && (
                          <>
                            <div className="pt-2 mt-2 border-t border-gray-200 space-y-2.5">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col">
                                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Po Price</span>
                                  <span className="text-sm text-gray-900 mt-0.5 break-words">{item.poPrice}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Po Number</span>
                                  <span className="text-sm text-gray-900 mt-0.5 break-words">{item.poNumber}</span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col">
                                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Po Validation</span>
                                  <span className="text-sm text-gray-900 mt-0.5 break-words">{item.poValidation}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Gred Type</span>
                                  <span className="text-sm text-gray-900 mt-0.5 break-words">{item.gredType}</span>
                                </div>
                              </div>

                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Material Type</span>
                                <span className="text-sm text-gray-900 mt-0.5 break-words">{item.materialType}</span>
                              </div>

                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</span>
                                <span className="text-sm text-gray-900 mt-0.5 break-words">{item.location}</span>
                              </div>

                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Party Address</span>
                                <span className="text-sm text-gray-900 mt-0.5 break-words">{item.partyAddress}</span>
                              </div>

                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Shipping Address</span>
                                <span className="text-sm text-gray-900 mt-0.5 break-words">{item.shippingAddress}</span>
                              </div>

                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">GST No</span>
                                <span className="text-sm text-gray-900 mt-0.5 break-words">{item.gstNo}</span>
                              </div>

                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Receiver Person</span>
                                <span className="text-sm text-gray-900 mt-0.5 break-words">{item.receiverPersonName}</span>
                              </div>

                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Receiver Contact</span>
                                <span className="text-sm text-gray-900 mt-0.5 break-words">{item.receiverContactNumber}</span>
                              </div>

                              {/* Show first consignee in mobile view */}
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Consignee Name</span>
                                <span className="text-sm text-gray-900 mt-0.5 break-words">{item.consigneeName1 || "-"}</span>
                              </div>

                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Consignee Address</span>
                                <span className="text-sm text-gray-900 mt-0.5 break-words">{item.consigneeAddress1 || "-"}</span>
                              </div>
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">Process Order - {formData.serialNo}</h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pre-filled fields */}
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Project Name
                  </label>
                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    readOnly
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Party Name
                  </label>
                  <input
                    type="text"
                    name="partyName"
                    value={formData.partyName}
                    readOnly
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    PO Qty <span className="text-red-600">*</span>
                    <span className="text-xs text-gray-500 ml-2">(Remaining: {formData.remainingQty})</span>
                  </label>
                  <input
                    type="number"
                    name="qty"
                    value={formData.qty}
                    onChange={handleInputChange}
                    max={formData.remainingQty}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    placeholder="Enter quantity"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    placeholder="Enter date"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Po Price <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="poPrice"
                    value={formData.poPrice}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    placeholder="Enter PO price"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Po Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="poNumber"
                    value={formData.poNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    placeholder="Enter PO number"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Po Validation <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="poValidation"
                    value={formData.poValidation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    placeholder="Enter PO validation"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Po Pdf
                  </label>
                  <input
                    type="file"
                    name="poPdf"
                    onChange={(e) => setFormData(prev => ({ ...prev, poPdf: e.target.files[0]?.name || "" }))}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    accept="*/*"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Gred Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="gredType"
                    value={formData.gredType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    required
                  >
                    <option value="">Select Gred Type</option>
                    <option value="500">500</option>
                    <option value="550">550</option>
                    <option value="500 D">500 D</option>
                    <option value="550 D">550 D</option>
                    <option value="500 DCRS">500 DCRS</option>
                    <option value="550 DCRS">550 DCRS</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Material Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="materialType"
                    value={formData.materialType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    required
                  >
                    <option value="">Select Material Type</option>
                    <option value="Straight">Straight</option>
                    <option value="Band">Band</option>
                  </select>
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
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Party Address <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    name="partyAddress"
                    value={formData.partyAddress}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    placeholder="Enter party address"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Shipping Address <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    placeholder="Enter shipping address"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    GST No <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="gstNo"
                    value={formData.gstNo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    placeholder="Enter GST number"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Receiver Person Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="receiverPersonName"
                    value={formData.receiverPersonName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    placeholder="Enter receiver person name"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Receiver Contact Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="receiverContactNumber"
                    value={formData.receiverContactNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    placeholder="Enter receiver contact number"
                    required
                  />
                </div>
              </div>

              {/* Consignee Section */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Consignee Details</h4>
                  {formData.consignees.length < 5 && (
                    <button
                      type="button"
                      onClick={addConsignee}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-white rounded-md transition-all hover:opacity-90"
                      style={{ backgroundColor: '#991b1b' }}
                    >
                      <Plus size={16} />
                      Add Consignee
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {formData.consignees.map((consignee, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="text-sm font-medium text-gray-700">Consignee {index + 1}</h5>
                        {formData.consignees.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeConsignee(index)}
                            className="text-red-600 hover:text-red-800 transition-colors p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Consignee Name {index === 0 && <span className="text-red-600">*</span>}
                          </label>
                          <input
                            type="text"
                            value={consignee.name}
                            onChange={(e) => handleConsigneeChange(index, 'name', e.target.value)}
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                            placeholder="Enter consignee name"
                            required={index === 0}
                          />
                        </div>
                        <div className="md:col-span-1">
                          <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Consignee Address {index === 0 && <span className="text-red-600">*</span>}
                          </label>
                          <textarea
                            value={consignee.address}
                            onChange={(e) => handleConsigneeChange(index, 'address', e.target.value)}
                            rows="2"
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                            placeholder="Enter consignee address"
                            required={index === 0}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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

export default OrderRealisation;