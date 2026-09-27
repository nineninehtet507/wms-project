import React, { useState, useMemo, useEffect } from 'react';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { 
  LayoutDashboard, Package, ShoppingCart, FileText, Plus, AlertTriangle, 
  TrendingUp, PackagePlus, CheckCircle2, X, History, PlusCircle, 
  ReceiptText, Search, Layers, MinusCircle, Box, RefreshCw
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const API_BASE = "http://localhost/wms-project/backend"; 

export default function App() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventory, setInventory] = useState([]);
  const [cart, setCart] = useState([]);
  const [logs, setLogs] = useState([]);
  const [salesTransactions, setSalesTransactions] = useState([]);
  const [lastActionMessage, setLastActionMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [restockItem, setRestockItem] = useState(null);
  const [restockQty, setRestockQty] = useState(1);

  const [newProduct, setNewProduct] = useState({
    name: '', category: 'General', stock: 0, par: 5, max: 50, price: 0, cost: 0, supplier: ''
  });

  // Reports States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('ALL');
  const [reportData, setReportData] = useState([]);

  // API မှ Filter ဒေတာ ဆွဲယူရန် Function
  const fetchFilteredReports = () => {
    fetch(`${API_BASE}/get_reports.php?start_date=${startDate}&end_date=${endDate}&type=${reportType}`)
      .then(res => res.json())
      .then(data => {
        if(!data.error) setReportData(data);
      });
  };

  // EXCEL EXPORT FUNCTION
  const exportToExcel = () => {
    if (reportData.length === 0) return alert("No data to export!");
    
    const worksheet = XLSX.utils.json_to_sheet(reportData.map(item => ({
      "ID": item.id,
      "Date & Time": item.date_time,
      "Type": item.log_type,
      "Statement Details": item.message
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Warehouse Statements");
    XLSX.writeFile(workbook, `WMS_Report_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // PDF EXPORT FUNCTION
  const exportToPDF = () => {
    if (reportData.length === 0) return alert("No data to export!");

    const doc = new jsPDF();
    doc.text("Warehouse Management System - Statements Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    const tableRows = reportData.map(item => [item.date_time, item.log_type, item.message]);
    
    doc.autoTable({
      head: [['Date & Time', 'Type', 'Statement Details']],
      body: tableRows,
      startY: 28,
      styles: { fontSize: 9, fontStyle: 'normal' },
      headStyles: { fillColor: [99, 102, 241] } // Indigo Color Theme
    });

    doc.save(`WMS_Report_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  // API မှ Data များကို ဆွဲယူခြင်း Function
  const fetchAllData = () => {
    fetch(`${API_BASE}/get_products.php`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setInventory(data.inventory || []);
          setLogs(data.logs || []);
          setSalesTransactions(data.sales || []);
        }
      }).catch(err => console.error("Fetch error:", err));
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const lowStockItems = useMemo(() => inventory.filter(item => Number(item.stock) <= Number(item.par_level)), [inventory]);
  const totalValue = useMemo(() => inventory.reduce((acc, curr) => acc + (Number(curr.stock) * Number(curr.price)), 0), [inventory]);
  
  const chartData = useMemo(() => {
    return salesTransactions.map(trans => {
      const date = new Date(trans.date);
      return {
        month: date.toLocaleString('default', { month: 'short' }) + " " + date.getDate(),
        amount: Number(trans.amount)
      };
    });
  }, [salesTransactions]);

  const handleAddNewProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || newProduct.price <= 0) {
      setLastActionMessage("⚠️ Please enter a valid name and price");
      return;
    }

    fetch(`${API_BASE}/add_product.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    })
    .then(res => res.json())
    .then(data => {
      if(data.success) {
        setLastActionMessage(`Successfully added ${newProduct.name}`);
        setShowAddStockModal(false);
        setNewProduct({ name: '', category: 'General', stock: 0, par: 5, max: 50, price: 0, cost: 0, supplier: '' });
        fetchAllData();
      }
    });
  };

  const handleManualRestock = () => {
    if (!restockItem || restockQty <= 0) return;

    fetch(`${API_BASE}/restock.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: restockItem.id, quantity: restockQty })
    })
    .then(res => res.json())
    .then(data => {
      if(data.success) {
        setLastActionMessage(`Added ${restockQty} units to ${restockItem.name}`);
        setRestockItem(null);
        setRestockQty(1);
        fetchAllData();
      }
    });
  };

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    const invItem = inventory.find(i => i.id === item.id);
    if (existing) {
      if (existing.qty + 1 > Number(invItem.stock)) return setLastActionMessage("⚠️ Insufficient stock");
      setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      if (Number(invItem.stock) < 1) return setLastActionMessage("⚠️ Item out of stock");
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const processCheckout = () => {
    if (cart.length === 0) return;
    
    fetch(`${API_BASE}/checkout.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart: cart })
    })
    .then(res => res.json())
    .then(data => {
      if(data.success) {
        setCart([]);
        setLastActionMessage(`Transaction complete: $${data.total.toLocaleString()}`);
        setActiveTab('dashboard');
        fetchAllData();
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row font-sans text-slate-900">
      
      {/* Modal: ADD NEW PRODUCT */}
      {showAddStockModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-8 lg:p-12 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Create New Stock</h3>
                <p className="text-slate-500 font-medium">Add a new item to the warehouse database.</p>
              </div>
              <button onClick={() => setShowAddStockModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddNewProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Product Name</label>
                <input required className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl p-4 font-bold outline-none transition-all" 
                  placeholder="e.g. Ergonomic Keyboard" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Category</label>
                <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl p-4 font-bold outline-none transition-all" 
                  placeholder="e.g. Peripherals" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Supplier</label>
                <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl p-4 font-bold outline-none transition-all" 
                  placeholder="Vendor Name" value={newProduct.supplier} onChange={e => setNewProduct({...newProduct, supplier: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Initial Stock</label>
                <input type="number" className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl p-4 font-bold outline-none transition-all" 
                  value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Par Level (Min)</label>
                <input type="number" className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl p-4 font-bold outline-none transition-all" 
                  value={newProduct.par} onChange={e => setNewProduct({...newProduct, par: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Retail Price ($)</label>
                <input type="number" step="0.01" className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl p-4 font-bold outline-none transition-all" 
                  value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Cost Price ($)</label>
                <input type="number" step="0.01" className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl p-4 font-bold outline-none transition-all" 
                  value={newProduct.cost} onChange={e => setNewProduct({...newProduct, cost: e.target.value})} />
              </div>

              <button type="submit" className="md:col-span-2 bg-indigo-600 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 mt-4">
                Register New Stock
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: REPLENISH EXISTING STOCK */}
      {restockItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Replenish Stock</h3>
                <p className="text-slate-500 font-medium">Adding to {restockItem.name}</p>
              </div>
              <button onClick={() => setRestockItem(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <button onClick={() => setRestockQty(Math.max(1, restockQty - 1))} className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-indigo-600 hover:text-white transition-all"><MinusCircle size={20} /></button>
                <input type="number" value={restockQty} onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value) || 0))} className="flex-1 h-12 bg-slate-50 border-none rounded-2xl text-center font-black text-xl outline-none" />
                <button onClick={() => setRestockQty(restockQty + 1)} className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-indigo-600 hover:text-white transition-all"><PlusCircle size={20} /></button>
              </div>
              <button onClick={handleManualRestock} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 shadow-xl transition-all">Confirm Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {lastActionMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={18} className="text-indigo-400" />
          <span className="font-semibold text-sm">{lastActionMessage}</span>
          <button onClick={() => setLastActionMessage("")} className="hover:text-slate-400"><X size={14}/></button>
        </div>
      )}

      {/* Sidebar */}
      <nav className="w-full lg:w-72 bg-white border-r border-slate-200 p-8 flex flex-col gap-1 shrink-0">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-indigo-600 p-2 rounded-xl"><Box size={24} className="text-white" /></div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase underline decoration-indigo-600 decoration-4 underline-offset-4">WMS <span className="text-indigo-600">Pro</span></h1>
        </div>
        
        <div className="space-y-1">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Operations</p>
          <NavItem icon={<LayoutDashboard />} label="Overview" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<Layers />} label="Inventory" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
          <NavItem icon={<ShoppingCart />} label="Checkout" active={activeTab === 'sales'} onClick={() => setActiveTab('sales')} count={cart.length} />
          <NavItem icon={<FileText />} label="Low Stock" active={activeTab === 'po'} onClick={() => setActiveTab('po')} count={lowStockItems.length} highlight={lowStockItems.length > 0} />
          <NavItem icon={<History />} label="Activity" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
          <NavItem icon={<FileText />} label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        {activeTab === 'reports' && (
          <div className="max-w-6xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900">Advanced Reports</h2>
                <p className="text-slate-500 font-medium">Filter, inspect, and export your warehouse statements.</p>
              </div>
              
              {/* Export Buttons */}
              <div className="flex gap-4 w-full md:w-auto">
                <button onClick={() => exportToExcel()} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest px-6 py-4 rounded-2xl transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2">
                  Export Excel
                </button>
                <button onClick={() => exportToPDF()} className="flex-1 md:flex-none bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest px-6 py-4 rounded-2xl transition-all shadow-lg shadow-rose-100 flex items-center justify-center gap-2">
                  Export PDF
                </button>
              </div>
            </header>

            {/* Filter Panels */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Start Date</label>
                <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-sm outline-none" 
                  value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">End Date</label>
                <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-sm outline-none" 
                  value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Statement Type</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-sm outline-none"
                  value={reportType} onChange={e => setReportType(e.target.value)}>
                  <option value="ALL">All Statements (ဝယ်/ရောင်း အားလုံး)</option>
                  <option value="SALE">Sales Report (အရောင်းစာရင်း)</option>
                  <option value="RESTOCK">Restock Report (အဝယ်/စတော့သွင်းစာရင်း)</option>
                </select>
              </div>
              <button onClick={fetchFilteredReports} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-md">
                Apply Filter
              </button>
            </div>

            {/* Report Data Table */}
            <div className="bg-white rounded-4xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-widest">Date & Time</th>
                      <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-widest">Transaction Type</th>
                      <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-widest">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.length > 0 ? reportData.map(row => (
                      <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5 font-bold text-slate-600">{row.date_time}</td>
                        <td className="px-8 py-5">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black ${row.log_type === 'SALE' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {row.log_type}
                          </span>
                        </td>
                        <td className="px-8 py-5 font-medium text-slate-800">{row.message}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="3" className="px-8 py-12 text-center text-slate-400 font-medium">No statements match the selected parameters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'dashboard' && (
          <div className="max-w-6xl mx-auto space-y-10">
            <header>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">Warehouse Pulse</h2>
              <p className="text-slate-500 font-medium">Real-time logistics and asset monitoring.</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Total SKUs" value={inventory.length} icon={<Package />} color="indigo" />
              <StatCard label="Alerts" value={lowStockItems.length} icon={<AlertTriangle />} color="red" />
              <StatCard label="Stock Value" value={`$${totalValue.toLocaleString()}`} icon={<TrendingUp />} color="emerald" />
              <StatCard label="Live Orders" value={salesTransactions.length} icon={<ShoppingCart />} color="amber" />
            </div>

            <div className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-lg mb-8">Revenue Growth</h3>
              <div className="h-64">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs><linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                      <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                      <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorAmt)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-slate-400 pt-20">No Sales Data Available yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="max-w-6xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-3xl font-black tracking-tight">Asset Master</h2>
                <p className="text-slate-500 font-medium">Total registered inventory units.</p>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="Search SKU..." className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl w-full md:w-64 text-sm font-medium focus:ring-4 focus:ring-indigo-50 transition-all outline-none shadow-sm"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <button onClick={() => setShowAddStockModal(true)} className="bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                  <Plus size={18} /> New Stock
                </button>
              </div>
            </header>

            <div className="bg-white rounded-4xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-widest">Product & Vendor</th>
                      <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-widest text-center">In Stock</th>
                      <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-widest text-right">MSRP</th>
                      <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-widest text-center">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventory.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <p className="font-bold text-slate-800 text-base">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{item.category} • {item.supplier || 'No Vendor'}</p>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-black ${Number(item.stock) <= Number(item.par_level) ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {item.stock} Units
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right font-black text-slate-700">${Number(item.price).toFixed(2)}</td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-center gap-3">
                            <button onClick={() => setRestockItem(item)} className="p-3 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all text-slate-400 shadow-sm">
                              <PackagePlus size={20} />
                            </button>
                            <button onClick={() => addToCart(item)} className="p-3 bg-slate-50 hover:bg-emerald-600 hover:text-white rounded-xl transition-all text-slate-400 shadow-sm">
                              <ShoppingCart size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'po' && (
          <div className="max-w-6xl mx-auto space-y-8">
            <header>
              <h2 className="text-3xl font-black tracking-tight text-rose-600">Critical Stock Levels</h2>
              <p className="text-slate-500 font-medium">Items that have fallen below your defined safety threshold.</p>
            </header>

            {lowStockItems.length === 0 ? (
              <div className="bg-emerald-50 border-2 border-emerald-100 p-12 rounded-[3rem] text-center">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <CheckCircle2 className="text-emerald-500" size={32} />
                </div>
                <h3 className="text-xl font-black text-emerald-900">All Stock Optimized</h3>
                <p className="text-emerald-700/60 font-medium mt-1">No items currently require replenishment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lowStockItems.map(item => (
                  <div key={item.id} className="bg-white p-6 rounded-4xl border-2 border-rose-100 shadow-sm hover:shadow-xl transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-rose-50 p-3 rounded-2xl text-rose-600"><AlertTriangle size={24} /></div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-slate-400">Current / Par</p>
                        <p className="text-xl font-black text-rose-600">{item.stock} / {item.par_level}</p>
                      </div>
                    </div>
                    <h3 className="font-black text-slate-900 mb-1">{item.name}</h3>
                    <p className="text-xs text-slate-400 mb-6 uppercase tracking-widest font-bold">{item.supplier}</p>
                    <button onClick={() => { setRestockItem(item); setRestockQty(Number(item.par_level) * 2); }} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-600 transition-all">
                      <RefreshCw size={16} /> Quick Restock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-3xl font-black tracking-tight">Direct Sales</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {inventory.map(item => (
                  <button key={item.id} onClick={() => addToCart(item)} className="p-6 bg-white rounded-3xl border border-slate-200 text-left flex justify-between items-center hover:border-indigo-500 hover:shadow-xl transition-all group">
                    <div>
                      <p className="font-black text-slate-800 mb-1">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase">Qty: {item.stock} • <span className="text-indigo-600">${item.price}</span></p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Plus size={18} /></div>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-2xl h-fit">
              <h3 className="font-black text-xl mb-8 flex items-center gap-3 text-indigo-600 uppercase"><ReceiptText size={24}/> Cart</h3>
              <div className="space-y-4 mb-8">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span className="font-bold text-sm">{item.name} ({item.qty})</span>
                    <span className="font-black text-slate-700">${(item.qty * Number(item.price)).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-8">
                <div className="flex justify-between mb-6">
                  <span className="text-slate-400 font-black text-xs uppercase">Total</span>
                  <span className="text-3xl font-black text-indigo-600">${cart.reduce((a,c)=>a+(c.qty*Number(c.price)),0).toLocaleString()}</span>
                </div>
                <button onClick={processCheckout} disabled={cart.length === 0} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 disabled:bg-slate-100 shadow-lg">Checkout</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl font-black tracking-tight">Audit Log</h2>
            <div className="bg-white rounded-4xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100">
                {logs.map(log => (
                  <div key={log.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-5">
                      <div className={`w-3 h-3 rounded-full ${log.type === 'SALE' ? 'bg-indigo-500' : log.type === 'INVENTORY' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{log.message}</p>
                        <p className="text-[10px] font-black text-slate-300 uppercase">{log.type}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-400">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, count = 0, highlight = false }) {
  return (
    <button onClick={onClick} className={`group flex items-center justify-between w-full px-4 py-4 rounded-2xl transition-all ${active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}>
      <div className="flex items-center gap-3">
        {React.cloneElement(icon, { size: 18 })}
        <span className={`text-xs uppercase tracking-widest ${active ? 'font-black' : 'font-bold'}`}>{label}</span>
      </div>
      {count > 0 && <span className={`px-2 py-0.5 text-[9px] font-black rounded-lg ${active ? 'bg-white/20 text-white' : highlight ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{count}</span>}
    </button>
  );
}

function StatCard({ label, value, icon, color }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    red: "bg-rose-50 text-rose-600 border-rose-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100"
  };
  return (
    <div className="bg-white p-7 rounded-4xl border border-slate-200 shadow-sm flex flex-col gap-5 transition-all group hover:border-indigo-200">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]} border group-hover:scale-110 transition-transform`}>{icon}</div>
      <div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
        <h4 className="text-2xl font-black text-slate-900">{value}</h4>
      </div>
    </div>
  );
}