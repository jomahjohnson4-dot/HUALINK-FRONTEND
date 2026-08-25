import React, { useState, useEffect } from 'react';
import { Package, Search, RefreshCw, Truck, FileText } from 'lucide-react';

export const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dispatches, setDispatches] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Helper to map status string strictly to integer step
  const getStepFromStatus = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 4;
      case 'IN TRANSIT':
        return 3;
      case 'DISPATCHED':
        return 2;
      case 'PENDING':
      default:
        return 1;
    }
  };

  const loadAndSanitizeOrders = () => {
    const savedOrders = JSON.parse(localStorage.getItem('hualink_orders')) || [];
    
    // Force reset all legacy mock/cached orders to PENDING (Step 1) if desired,
    // or calculate step strictly per selected order without leaking.
    const sanitizedOrders = savedOrders.map((ord) => {
      // Force all orders to start as PENDING (Step 1)
      const currentStatus = ord.status || 'PENDING';
      const currentStep = getStepFromStatus(currentStatus);

      return {
        ...ord,
        status: currentStatus,
        step: currentStep,
      };
    });

    setDispatches(sanitizedOrders);
    return sanitizedOrders;
  };

  useEffect(() => {
    const orders = loadAndSanitizeOrders();
    if (orders.length > 0) {
      setSelectedOrder(orders[0]);
    }
  }, []);

  const handleRefresh = () => {
    const orders = loadAndSanitizeOrders();
    if (orders.length > 0) {
      // Preserve current selection if it exists, otherwise default to first
      setSelectedOrder((prev) => {
        if (!prev) return orders[0];
        const updatedPrev = orders.find((o) => o.id === prev.id);
        return updatedPrev || orders[0];
      });
    }
  };

  const filteredDispatches = dispatches.filter(
    (item) =>
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'IN TRANSIT':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'DISPATCHED':
        return 'bg-indigo-50 text-indigo-600 border-indigo-200';
      default:
        return 'bg-amber-50 text-amber-600 border-amber-200';
    }
  };

  // Determine active step for currently selected order isolate from state leaks
  const activeStep = selectedOrder ? getStepFromStatus(selectedOrder.status) : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans text-slate-900 bg-slate-50/50 min-h-screen">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center font-bold">
              <Package size={18} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Order Tracking & Distribution
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track active regional dispatch orders and verify real-time receipts.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search Order #, Item, or Payment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-red-500 shadow-sm"
            />
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-red-600 shadow-sm transition-colors cursor-pointer"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {filteredDispatches.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <Package size={48} className="mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Place an order from the checkout screen to start tracking fulfillment status.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Side: Orders List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex justify-between items-center px-1 mb-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Recent Dispatches ({filteredDispatches.length})
              </span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredDispatches.map((item) => {
                const isSelected = selectedOrder?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedOrder(item)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
                      isSelected
                        ? 'bg-white border-red-500 ring-2 ring-red-500/10'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm font-black text-slate-900">{item.id}</h3>
                      <span
                        className={`px-2 py-0.5 border rounded text-[9px] font-bold ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                      <span>📍</span> {item.location}
                    </p>

                    <div className="flex justify-between items-end text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                      <span>{item.date}</span>
                      <span className="text-xs font-black text-red-600">{item.amount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Timeline view computed per selected order */}
          {selectedOrder && (
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-6 gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Order {selectedOrder.id}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    Payment Method:{' '}
                    <span className="text-slate-700 font-bold">
                      {selectedOrder.paymentMethod}
                    </span>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    ORDER DATE
                  </span>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">
                    {selectedOrder.fullDate || selectedOrder.date}
                  </p>
                </div>
              </div>

              {/* Step Timeline */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                  <Truck size={16} className="text-red-500" />
                  <span>DISPATCH & FULFILL PROGRESS</span>
                </div>

                <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {/* Step 1 */}
                  <div className="relative flex items-start justify-between gap-4">
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        activeStep >= 1
                          ? 'bg-red-600 text-white ring-4 ring-red-50'
                          : 'bg-slate-200 border-2 border-white'
                      }`}
                    >
                      {activeStep >= 1 ? '✓' : ''}
                    </div>
                    <div>
                      <h4
                        className={`text-xs font-bold ${
                          activeStep >= 1 ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        Order Confirmed & Placed
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {selectedOrder.fullDate || selectedOrder.date}
                      </p>
                    </div>
                    {activeStep === 1 && (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-[10px] font-bold">
                        ACTIVE PROCESSING
                      </span>
                    )}
                  </div>

                  {/* Step 2 */}
                  <div className="relative flex items-start justify-between gap-4">
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        activeStep >= 2
                          ? 'bg-red-600 text-white ring-4 ring-red-50'
                          : 'bg-slate-200 border-2 border-white'
                      }`}
                    >
                      {activeStep >= 2 ? '✓' : ''}
                    </div>
                    <div>
                      <h4
                        className={`text-xs font-bold ${
                          activeStep >= 2 ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        Dispatched from Central Hub
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {activeStep >= 2
                          ? 'Package processed & handed to carrier'
                          : 'Pending Verification'}
                      </p>
                    </div>
                    {activeStep === 2 && (
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-[10px] font-bold">
                        DISPATCHED
                      </span>
                    )}
                  </div>

                  {/* Step 3 */}
                  <div className="relative flex items-start justify-between gap-4">
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        activeStep >= 3
                          ? 'bg-red-600 text-white ring-4 ring-red-50'
                          : 'bg-slate-200 border-2 border-white'
                      }`}
                    >
                      {activeStep >= 3 ? '✓' : ''}
                    </div>
                    <div>
                      <h4
                        className={`text-xs font-bold ${
                          activeStep >= 3 ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        In Transit to Regional Depot
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {activeStep >= 3
                          ? 'En route to destination point'
                          : 'Pending Transit'}
                      </p>
                    </div>
                    {activeStep === 3 && (
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[10px] font-bold">
                        IN TRANSIT
                      </span>
                    )}
                  </div>

                  {/* Step 4 */}
                  <div className="relative flex items-start justify-between gap-4">
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        activeStep >= 4
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                          : 'bg-slate-200 border-2 border-white'
                      }`}
                    >
                      {activeStep >= 4 ? '✓' : ''}
                    </div>
                    <div>
                      <h4
                        className={`text-xs font-bold ${
                          activeStep >= 4 ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        Delivered & Customer Verification
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {activeStep >= 4
                          ? 'Order delivered and verified successfully'
                          : 'Pending Delivery'}
                      </p>
                    </div>
                    {activeStep === 4 && (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-bold">
                        DELIVERED
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Receipt */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  <FileText size={16} className="text-red-500" />
                  <span>ITEMIZED DISPATCH RECEIPT</span>
                </div>

                <div className="space-y-2 bg-slate-50/70 rounded-2xl p-4 border border-slate-100">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-xs"
                      >
                        <span className="text-slate-700 font-medium">
                          <span className="font-bold text-slate-900">
                            {item.quantity || item.qty}x
                          </span>{' '}
                          {item.name}
                        </span>
                        <span className="font-bold text-slate-900">
                          {item.price || `${item.unitPrice?.toLocaleString()} TZS`}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500">Receipt details available</div>
                  )}
                  <div className="flex justify-between items-center text-xs font-black text-red-600 border-t border-slate-200 pt-3 mt-2">
                    <span>Total Paid Amount</span>
                    <span>{selectedOrder.amount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;