import React, { useState, useMemo } from 'react';
import { useAdminOrders } from '../../hooks/useAdminOrders';
import { 
  BarChart3, TrendingUp, ShoppingBag, LogOut, Check, X, 
  Clock, Loader2, ExternalLink, Gamepad2, Settings, 
  Menu, Sparkles, QrCode, Search, Filter, Download, 
  Volume2, VolumeX, RefreshCw, Copy, ZoomIn, ZoomOut, 
  RotateCw, Eye, Trash2, ArrowUpDown
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { GamePriceManager } from './components/GamePriceManager';
import { StoreSettingsManager } from './components/StoreSettingsManager';
import toast from 'react-hot-toast';

const PRESET_REASONS = [
  "Payment screenshot invalid or unreadable",
  "Incorrect Player ID or Server not found",
  "Amount transferred does not match package price",
  "Duplicate screenshot / transaction ID already used",
  "Payment remarks missing required Player ID",
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const { 
    orders, 
    loading, 
    updateOrderStatus, 
    deleteOrder, 
    refetchOrders, 
    processingIds,
    soundEnabled,
    setSoundEnabled
  } = useAdminOrders();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gameFilter, setGameFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Inspector & Reject Modals
  const [inspectingOrder, setInspectingOrder] = useState(null);
  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [reason, setReason] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Statistics
  const stats = useMemo(() => {
    const completed = orders.filter(o => o.status === 'completed');
    const revenue = completed.reduce((acc, o) => acc + (Number(o.price) || 0), 0);
    const profit = completed.reduce((acc, o) => acc + (Number(o.profit) || (o.price - o.cost) || 0), 0);
    const loss = orders.filter(o => o.status === 'failed').reduce((acc, o) => acc + (Number(o.price) || 0), 0);
    const aov = completed.length > 0 ? Math.round(revenue / completed.length) : 0;
    const profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;

    return {
      revenue,
      profit,
      loss,
      count: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      completed: completed.length,
      failed: orders.filter(o => o.status === 'failed').length,
      aov,
      profitMargin
    };
  }, [orders]);

  // Unique game list for filtering
  const availableGames = useMemo(() => {
    const set = new Set(orders.map(o => o.game_name || o.game).filter(Boolean));
    return Array.from(set);
  }, [orders]);

  // Filtered & Sorted Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        order.order_id?.toLowerCase().includes(q) ||
        order.player_id?.toLowerCase().includes(q) ||
        order.game_name?.toLowerCase().includes(q) ||
        order.package_label?.toLowerCase().includes(q);

      // Status
      const matchStatus = statusFilter === 'all' || order.status === statusFilter;

      // Game
      const matchGame = gameFilter === 'all' || (order.game_name || order.game) === gameFilter;

      return matchQuery && matchStatus && matchGame;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'highest_price') return b.price - a.price;
      if (sortBy === 'lowest_price') return a.price - b.price;
      return 0;
    });
  }, [orders, searchQuery, statusFilter, gameFilter, sortBy]);

  // Analytics Chart Data
  const chartData = useMemo(() => {
    const dailyData = {};
    orders.filter(o => o.status === 'completed').forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyData[date] = (dailyData[date] || 0) + order.price;
    });
    return Object.entries(dailyData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => new Date(a.name) - new Date(b.name))
      .slice(-7);
  }, [orders]);

  const gameShareData = useMemo(() => {
    const map = {};
    orders.filter(o => o.status === 'completed').forEach(order => {
      const g = order.game_name || order.game || 'Other';
      map[g] = (map[g] || 0) + order.price;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [orders]);

  const statusData = useMemo(() => [
    { name: 'Completed', value: stats.completed, color: '#10B981' },
    { name: 'Pending', value: stats.pending, color: '#F59E0B' },
    { name: 'Processing', value: stats.processing, color: '#3B82F6' },
    { name: 'Failed', value: stats.failed, color: '#EF4444' }
  ], [stats]);

  // Export to CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      toast.error('No orders to export');
      return;
    }
    const headers = ['Order ID', 'Game', 'Package', 'Player ID', 'Server ID', 'Price (NPR)', 'Cost (NPR)', 'Profit (NPR)', 'Status', 'Date', 'Proof URL'];
    const rows = orders.map(o => [
      `"${o.order_id}"`,
      `"${o.game_name || o.game}"`,
      `"${o.package_label}"`,
      `"${o.player_id}"`,
      `"${o.server_id || ''}"`,
      o.price,
      o.cost || 0,
      (o.price - (o.cost || 0)),
      `"${o.status}"`,
      `"${new Date(o.created_at).toLocaleString()}"`,
      `"${o.screenshot_url}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dhangadi_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Orders exported as CSV!');
  };

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="animate-spin text-slate-400" size={44} />
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="text-base font-black tracking-tight uppercase text-slate-900">
          DHANGADI <span className="text-accent">ADMIN</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`w-full md:w-72 bg-white border-r border-slate-200 p-6 flex flex-col ${mobileMenuOpen ? 'block' : 'hidden md:flex'} sticky top-0 md:h-screen z-30 shadow-sm`}>
        <div className="hidden md:block text-xl font-black tracking-tight mb-8 text-slate-900">
          DHANGADI <span className="text-accent">ADMIN</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => { setActiveTab('orders'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl font-bold text-sm transition-all ${
              activeTab === 'orders' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag size={18} /> Orders Queue
            </div>
            {stats.pending > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'orders' ? 'bg-white text-accent' : 'bg-amber-100 text-amber-800'}`}>
                {stats.pending}
              </span>
            )}
          </button>

          <button 
            onClick={() => { setActiveTab('pricing'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl font-bold text-sm transition-all ${
              activeTab === 'pricing' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Gamepad2 size={18} /> Game & Pricing
          </button>

          <button 
            onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl font-bold text-sm transition-all ${
              activeTab === 'settings' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Settings size={18} /> QR & Store Settings
          </button>

          <button 
            onClick={() => { setActiveTab('analytics'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl font-bold text-sm transition-all ${
              activeTab === 'analytics' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <TrendingUp size={18} /> Financial Analytics
          </button>
        </nav>

        {/* Sound toggle & Logout */}
        <div className="pt-6 border-t border-slate-100 mt-auto space-y-2">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              toast.success(soundEnabled ? 'Chime sound disabled' : 'Chime sound enabled');
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
          >
            <span className="flex items-center gap-2">
              {soundEnabled ? <Volume2 size={16} className="text-accent" /> : <VolumeX size={16} className="text-slate-400" />}
              Audio Alerts
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase ${soundEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
              {soundEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3.5 text-red-600 hover:bg-red-50 rounded-2xl font-bold text-sm transition-colors"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        
        {/* Header bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase text-slate-900">
              {activeTab === 'orders' && 'Live Orders Queue'}
              {activeTab === 'pricing' && 'Game & Pricing Catalog'}
              {activeTab === 'settings' && 'Store Customization & QR'}
              {activeTab === 'analytics' && 'Financial Performance'}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
              {activeTab === 'orders' && `Showing ${filteredOrders.length} of ${orders.length} orders in real-time`}
              {activeTab === 'pricing' && 'Manage top-up denominations, prices, and costs live'}
              {activeTab === 'settings' && 'Upload payment QR code, manage exit offer card & announcements'}
              {activeTab === 'analytics' && 'Detailed breakdown of turnover, profit margins, and volume'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => refetchOrders()}
              className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-colors"
              title="Refresh database records"
            >
              <RefreshCw size={16} />
            </button>
            {activeTab === 'orders' && (
              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
              >
                <Download size={15} /> Export CSV
              </button>
            )}
            <div className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </div>
          </div>
        </header>

        {/* Global KPI Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard title="Total Revenue" value={`NPR ${stats.revenue.toLocaleString()}`} icon={<ShoppingBag size={20} />} subtitle="Confirmed orders" />
          <StatCard title="Total Profit" value={`NPR ${stats.profit.toLocaleString()}`} icon={<TrendingUp size={20} />} subtitle={`Margin: ${stats.profitMargin}%`} color="text-emerald-600" />
          <StatCard title="Active Queue" value={stats.pending} icon={<Clock size={20} />} color="text-amber-600" subtitle="Pending verification" />
          <StatCard title="Avg Order Value" value={`NPR ${stats.aov}`} icon={<Sparkles size={20} />} subtitle={`Total: ${stats.count} orders`} color="text-blue-600" />
        </div>

        {/* TAB 1: ORDERS QUEUE */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            
            {/* Search & Filter Toolbar */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="text"
                  placeholder="Search by Order ID, Player ID, Game..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 font-bold focus:bg-white focus:border-accent outline-none"
                />
              </div>

              {/* Status Filters Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                {[
                  { id: 'all', label: 'All', count: stats.count },
                  { id: 'pending', label: 'Pending', count: stats.pending },
                  { id: 'processing', label: 'Processing', count: stats.processing },
                  { id: 'completed', label: 'Done', count: stats.completed },
                  { id: 'failed', label: 'Failed', count: stats.failed },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      statusFilter === tab.id
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Game Filter & Sort */}
              <div className="flex items-center gap-2">
                <select
                  value={gameFilter}
                  onChange={(e) => setGameFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-accent"
                >
                  <option value="all">All Games</option>
                  {availableGames.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-accent"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest_price">Highest Amount</option>
                  <option value="lowest_price">Lowest Amount</option>
                </select>
              </div>

            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[750px]">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-200">
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Game / Package</th>
                      <th className="px-6 py-4">Player Details</th>
                      <th className="px-6 py-4 text-right">Price</th>
                      <th className="px-6 py-4 text-center">Payment Proof</th>
                      <th className="px-6 py-4 text-right">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Status */}
                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>

                        {/* Order ID */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-800 text-xs">{order.order_id}</span>
                            <button
                              onClick={() => copyText(order.order_id, 'Order ID')}
                              className="text-slate-300 hover:text-accent p-0.5 transition-colors"
                              title="Copy Order ID"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(order.created_at).toLocaleDateString()}
                          </span>
                        </td>

                        {/* Game & Package */}
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{order.game_name}</p>
                          <p className="text-slate-500 text-xs">{order.package_label}</p>
                          {order.remark && <p className="text-[11px] text-slate-400 italic truncate max-w-[180px]">"{order.remark}"</p>}
                        </td>

                        {/* Player ID */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-slate-900 font-bold text-xs bg-slate-100 px-2 py-1 rounded-lg">
                              {order.player_id}
                            </span>
                            <button
                              onClick={() => copyText(order.player_id, 'Player ID')}
                              className="text-slate-400 hover:text-accent p-1 transition-colors"
                              title="Copy Player ID"
                            >
                              <Copy size={13} />
                            </button>
                          </div>
                          {order.server_id && <p className="text-slate-400 text-[10px] mt-0.5 font-medium">Server: {order.server_id}</p>}
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4 text-right">
                          <span className="font-black text-emerald-600 text-sm">NPR {order.price}</span>
                          {order.profit && (
                            <span className="block text-[10px] text-slate-400">Profit: +NPR {order.profit}</span>
                          )}
                        </td>

                        {/* Proof thumbnail button */}
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => {
                              setInspectingOrder(order);
                              setZoomLevel(1);
                              setRotation(0);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-accent hover:bg-blue-100 border border-blue-200 text-xs font-bold transition-all shadow-sm"
                            title="Inspect payment proof screenshot"
                          >
                            <Eye size={14} /> View Proof
                          </button>
                        </td>

                        {/* Action Buttons */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1.5 pr-1">
                            {/* Complete */}
                            <button 
                              disabled={processingIds.has(order.id)}
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                              title="Mark Completed"
                              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                                order.status === 'completed' 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200'
                              }`}
                            >
                              {processingIds.has(order.id) ? <Loader2 size={15} className="animate-spin" /> : <Check size={17} />}
                            </button>

                            {/* Processing */}
                            <button 
                              disabled={processingIds.has(order.id)}
                              onClick={() => updateOrderStatus(order.id, 'processing')}
                              title="Mark In Progress"
                              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                                order.status === 'processing' 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200'
                              }`}
                            >
                              <Clock size={16} />
                            </button>

                            {/* Reject */}
                            <button 
                              disabled={processingIds.has(order.id)}
                              onClick={() => setRejectingOrder(order)}
                              title="Reject Order"
                              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                                order.status === 'failed' 
                                  ? 'bg-red-600 text-white' 
                                  : 'bg-red-50 text-red-700 hover:bg-red-600 hover:text-white border border-red-200'
                              }`}
                            >
                              <X size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredOrders.length === 0 && (
                <div className="py-20 text-center text-slate-400 font-medium italic">
                  {searchQuery || statusFilter !== 'all' || gameFilter !== 'all' 
                    ? 'No matching orders found for this search filter' 
                    : 'No orders recorded in database yet'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: GAME & PRICING CATALOG */}
        {activeTab === 'pricing' && <GamePriceManager />}

        {/* TAB 3: QR & STORE SETTINGS */}
        {activeTab === 'settings' && <StoreSettingsManager />}

        {/* TAB 4: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Earnings Chart */}
              <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-slate-900">Revenue Trajectory</h3>
                    <p className="text-sm text-slate-500">Daily completed order earnings</p>
                  </div>
                  <div className="px-3.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
                    Last 7 Days
                  </div>
                </div>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#64748B', fontSize: 12}}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#64748B', fontSize: 12}}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#FFFFFF', 
                          border: '1px solid #E2E8F0',
                          borderRadius: '16px',
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                        }}
                        itemStyle={{ color: '#0F172A', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#2563EB" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
                 <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-1">Queue Status</h3>
                 <p className="text-sm text-slate-500 mb-6">Distribution across all orders</p>
                 <div className="h-[220px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#FFFFFF', 
                            border: '1px solid #E2E8F0',
                            borderRadius: '12px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                       <p className="text-2xl font-black text-slate-900">{stats.count}</p>
                       <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Total</p>
                    </div>
                 </div>
                 <div className="space-y-2 mt-6">
                    {statusData.map(s => (
                      <div key={s.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                          {s.name}
                        </div>
                        <span className="font-bold text-slate-900">{s.value}</span>
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* Top Selling Games Bar Chart */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-6">Top Revenue by Game</h3>
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gameShareData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{fill: '#64748B', fontSize: 12}} />
                    <YAxis tick={{fill: '#64748B', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF', 
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px'
                      }}
                    />
                    <Bar dataKey="value" fill="#2563EB" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* 🔍 PAYMENT PROOF INSPECTOR MODAL */}
        {inspectingOrder && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-3xl rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase flex items-center gap-2">
                    <Eye className="text-accent" size={18} /> Payment Proof Inspector
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">Order ID: {inspectingOrder.order_id}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoomLevel(prev => Math.min(prev + 0.3, 3))}
                    className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700"
                    title="Zoom In"
                  >
                    <ZoomIn size={16} />
                  </button>
                  <button
                    onClick={() => setZoomLevel(prev => Math.max(prev - 0.3, 0.7))}
                    className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700"
                    title="Zoom Out"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <button
                    onClick={() => setRotation(prev => (prev + 90) % 360)}
                    className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700"
                    title="Rotate"
                  >
                    <RotateCw size={16} />
                  </button>
                  <button
                    onClick={() => setInspectingOrder(null)}
                    className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 ml-2"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Inspector Body: Split into image viewport + info panel */}
              <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
                
                {/* Image Viewport */}
                <div className="md:col-span-7 bg-slate-900 p-6 flex items-center justify-center overflow-auto min-h-[350px]">
                  <img
                    src={inspectingOrder.screenshot_url}
                    alt="Payment Slip Proof"
                    style={{
                      transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s ease',
                      maxHeight: '400px'
                    }}
                    className="object-contain rounded-lg shadow-2xl"
                  />
                </div>

                {/* Info Panel & Direct Action Bar */}
                <div className="md:col-span-5 p-6 flex flex-col justify-between space-y-6 overflow-y-auto bg-white">
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Game & Package</span>
                        <p className="font-bold text-slate-900 text-sm">{inspectingOrder.game_name} • {inspectingOrder.package_label}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Player ID</span>
                          <span className="font-mono font-black text-slate-900 text-base">{inspectingOrder.player_id}</span>
                        </div>
                        <button
                          onClick={() => copyText(inspectingOrder.player_id, 'Player ID')}
                          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-accent text-xs font-bold text-slate-700 flex items-center gap-1 shadow-sm"
                        >
                          <Copy size={13} /> Copy ID
                        </button>
                      </div>

                      {inspectingOrder.server_id && (
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Server ID</span>
                          <p className="font-bold text-slate-900 text-xs">{inspectingOrder.server_id}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        <span className="text-xs text-slate-500 font-bold">Transfer Amount Due</span>
                        <span className="text-lg font-black text-emerald-600">NPR {inspectingOrder.price}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions inside inspector */}
                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={async () => {
                        await updateOrderStatus(inspectingOrder.id, 'completed');
                        setInspectingOrder(null);
                      }}
                      className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                    >
                      <Check size={16} /> Approve & Mark Delivered
                    </button>

                    <button
                      onClick={() => {
                        const target = inspectingOrder;
                        setInspectingOrder(null);
                        setRejectingOrder(target);
                      }}
                      className="w-full py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <X size={16} /> Reject Order
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ❌ REJECTION MODAL WITH PRESETS */}
        {rejectingOrder && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md p-8 rounded-[2rem] border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="text-xl font-bold mb-1 text-slate-900">Reject Order</h3>
              <p className="text-slate-500 text-xs mb-4">Pick a preset or write a custom cancellation reason for the customer.</p>
              
              {/* Quick Preset Buttons */}
              <div className="space-y-1.5 mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Quick Presets:</span>
                {PRESET_REASONS.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReason(r)}
                    className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
                  >
                    • {r}
                  </button>
                ))}
              </div>

              <textarea 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for cancellation..."
                className="w-full h-24 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-red-400 transition-colors mb-6 resize-none"
              />

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setRejectingOrder(null);
                    setReason('');
                  }}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    await updateOrderStatus(rejectingOrder.id, 'failed', { rejection_reason: reason || 'Payment unverified' });
                    setRejectingOrder(null);
                    setReason('');
                  }}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md shadow-red-600/20"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon, color = "text-accent", subtitle }) => (
  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
    <div className="flex justify-between items-start mb-3">
       <div className={`${color} bg-slate-50 p-2.5 rounded-2xl border border-slate-100`}>{icon}</div>
    </div>
    <div>
      <p className="text-xl sm:text-2xl font-black mb-0.5 tracking-tight text-slate-900">{value}</p>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-500">{title}</p>
      </div>
      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{subtitle}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const config = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    failed: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-black border ${config[status] || config.pending}`}>
      {status}
    </span>
  );
};

export default Dashboard;
