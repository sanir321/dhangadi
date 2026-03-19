import React from 'react';
import { useAdminOrders } from '../../hooks/useAdminOrders';
import { BarChart3, TrendingUp, ShoppingBag, LogOut, Check, X, Clock, Loader2, ExternalLink, PieChart as PieChartIcon } from 'lucide-react';
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
  Cell
} from 'recharts';

const Dashboard = () => {
  const [activeTab, setActiveTab] = React.useState('orders');
  const [rejectingOrder, setRejectingOrder] = React.useState(null);
  const [reason, setReason] = React.useState('');
  const navigate = useNavigate();
  const { orders, loading, updateOrderStatus, processingIds } = useAdminOrders();

  const stats = React.useMemo(() => ({
    revenue: orders.filter(o => o.status === 'completed').reduce((acc, o) => acc + o.price, 0),
    profit: orders.filter(o => o.status === 'completed').reduce((acc, o) => acc + o.profit, 0),
    loss: orders.filter(o => o.status === 'failed').reduce((acc, o) => acc + o.price, 0),
    count: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    failed: orders.filter(o => o.status === 'failed').length
  }), [orders]);

  const chartData = React.useMemo(() => {
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

  const statusData = React.useMemo(() => [
    { name: 'Completed', value: orders.filter(o => o.status === 'completed').length, color: '#4ade80' },
    { name: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: '#facc15' },
    { name: 'Failed', value: orders.filter(o => o.status === 'failed').length, color: '#f87171' }
  ], [orders]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="animate-spin text-white/20" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 p-6 flex flex-col glass hidden md:flex">
        <div className="text-xl font-black tracking-tighter mb-10">ADMIN PORTAL</div>
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${activeTab === 'orders' ? 'bg-white/10 text-white shadow-xl' : 'text-white/50 hover:bg-white/5'}`}
          >
            <ShoppingBag size={20} /> Orders
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${activeTab === 'analytics' ? 'bg-white/10 text-white shadow-xl' : 'text-white/50 hover:bg-white/5'}`}
          >
            <TrendingUp size={20} /> Analytics
          </button>
        </nav>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors mt-auto"
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders Overview</h1>
            <p className="text-white/50 text-sm">Manage incoming top-up requests</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                Live
             </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard title="Total Revenue" value={`NPR ${stats.revenue.toLocaleString()}`} icon={<ShoppingBag size={24} />} subtitle="Confirmed orders only" />
          <StatCard title="Total Profit" value={`NPR ${stats.profit.toLocaleString()}`} icon={<TrendingUp size={24} />} subtitle="Net earnings" color="text-green-400" />
          <StatCard title="Potential Loss" value={`NPR ${stats.loss.toLocaleString()}`} icon={<X size={24} />} color="text-red-400" subtitle="Rejected/Cancelled" />
          <StatCard title="Active Queue" value={stats.pending} icon={<Clock size={24} />} color="text-yellow-400" subtitle="Pending processing" />
        </div>

        {activeTab === 'orders' ? (
          /* Orders Table */
          <div className="glass rounded-3xl border border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-xs uppercase tracking-widest font-bold text-white/30">
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Game / Package</th>
                  <th className="px-6 py-4">Player Details</th>
                  <th className="px-6 py-4 text-right">Price</th>
                  <th className="px-6 py-4 text-center">Proof</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors text-sm">
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-white/70">{order.order_id}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold">{order.game_name}</p>
                      <p className="text-white/40 text-xs">{order.package_label}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-mono text-white/90">{order.player_id}</p>
                      {order.server_id && <p className="text-white/40 text-xs">{order.server_id}</p>}
                    </td>
                    <td className="px-6 py-4 text-right font-black">NPR {order.price}</td>
                    <td className="px-6 py-4 text-center">
                      <a 
                        href={order.screenshot_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-white/30 hover:text-white inline-block p-2 rounded-lg hover:bg-white/5"
                      >
                        <ExternalLink size={18} />
                      </a>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 pr-4">
                        <button 
                          disabled={order.status === 'completed' || order.status === 'failed' || processingIds.has(order.id) || (rejectingOrder && rejectingOrder.id === order.id)}
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          title="Complete Order"
                          className="w-10 h-10 rounded-xl bg-green-400/10 text-green-400 flex items-center justify-center hover:bg-green-400/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90"
                        >
                          {processingIds.has(order.id) ? <Loader2 size={16} className="animate-spin" /> : <Check size={20} />}
                        </button>
                        <button 
                          disabled={order.status === 'completed' || order.status === 'failed' || processingIds.has(order.id) || (rejectingOrder && rejectingOrder.id === order.id)}
                          onClick={() => setRejectingOrder(order)}
                          title="Reject Order"
                          className="w-10 h-10 rounded-xl bg-red-400/10 text-red-400 flex items-center justify-center hover:bg-red-400/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="py-20 text-center text-white/20 font-medium italic">
                No orders found yet
              </div>
            )}
          </div>
        ) : (
          /* Analytics Section */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Earnings Chart */}
              <div className="lg:col-span-2 glass p-8 rounded-[2rem] border border-white/5">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">Earnings Portfolio</h3>
                    <p className="text-sm text-white/40">Daily revenue trends</p>
                  </div>
                  <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-bold text-white/60">
                    Last 7 Days
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 12}}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 12}}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#171717', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '16px',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                        }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#4ade80" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status Distribution */}
              <div className="glass p-8 rounded-[2rem] border border-white/5 flex flex-col justify-center">
                 <h3 className="text-xl font-bold tracking-tight mb-2">Order Performance</h3>
                 <p className="text-sm text-white/40 mb-8">Status distribution overall</p>
                 <div className="h-[250px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#171717', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                       <p className="text-3xl font-black">{stats.count}</p>
                       <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Total</p>
                    </div>
                 </div>
                 <div className="space-y-3 mt-8">
                    {statusData.map(s => (
                      <div key={s.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-white/60">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                          {s.name}
                        </div>
                        <span className="font-bold">{s.value}</span>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
            
            {/* Detailed Portfolio Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="glass p-8 rounded-[2rem] border border-white/5">
                  <h3 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-3">
                    <Check className="text-green-400" size={20} /> Successful Conversion
                  </h3>
                  <div className="grid grid-cols-2 gap-8">
                     <div>
                        <p className="text-3xl font-black mb-1">
                           {stats.count > 0 ? ((stats.revenue / stats.count).toFixed(0)) : 0}
                        </p>
                        <p className="text-xs text-white/40">Avg. Order Value (NPR)</p>
                     </div>
                     <div>
                        <p className="text-3xl font-black mb-1">
                           {stats.count > 0 ? ((stats.revenue / (stats.revenue + stats.loss || 1)) * 100).toFixed(1) : 0}%
                        </p>
                        <p className="text-xs text-white/40">Revenue Capture Rate</p>
                     </div>
                  </div>
               </div>

               <div className="glass p-8 rounded-[2rem] border border-white/5">
                  <h3 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-3">
                    <X className="text-red-400" size={20} /> Loss Analysis
                  </h3>
                  <div className="grid grid-cols-2 gap-8">
                     <div>
                        <p className="text-3xl font-black mb-1 text-red-400/80">
                           NPR {stats.loss.toLocaleString()}
                        </p>
                        <p className="text-xs text-white/40">Total Capital At Risk</p>
                     </div>
                     <div>
                        <p className="text-3xl font-black mb-1">
                           {stats.count > 0 ? ((stats.failed / stats.count) * 100).toFixed(1) : 0}%
                        </p>
                        <p className="text-xs text-white/40">Cancellation Velocity</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Recent Rejections Table */}
            <div className="glass p-8 rounded-[2rem] border border-white/5 overflow-hidden">
               <h3 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-3">
                 <ShoppingBag className="text-white/20" size={20} /> Portfolio Incident Log
               </h3>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="text-xs uppercase tracking-widest text-white/20 font-bold border-b border-white/5">
                       <th className="pb-4">Order</th>
                       <th className="pb-4">Game</th>
                       <th className="pb-4">Reason for Cancellation</th>
                       <th className="pb-4 text-right">Impact</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                     {orders.filter(o => o.status === 'failed').slice(0, 5).map(order => (
                       <tr key={order.id} className="text-sm">
                         <td className="py-4 font-mono text-white/60">{order.order_id}</td>
                         <td className="py-4">{order.game_name}</td>
                         <td className="py-4 text-red-400/60 italic">{order.rejection_reason || 'No reason provided'}</td>
                         <td className="py-4 text-right font-bold text-red-400/40">-NPR {order.price}</td>
                       </tr>
                     ))}
                     {orders.filter(o => o.status === 'failed').length === 0 && (
                       <tr>
                         <td colSpan="4" className="py-8 text-center text-white/10 italic">No cancellation history recorded</td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {rejectingOrder && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass w-full max-w-md p-8 rounded-3xl border border-white/10 animate-in zoom-in-95 duration-200">
              <h3 className="text-xl font-bold mb-4">Reject Order</h3>
              <p className="text-white/50 text-sm mb-6">Enter a reason for cancelling this order. This will be visible in the business portfolio.</p>
              
              <textarea 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Payment proof invalid, Player ID incorrect..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-red-400/50 transition-colors mb-6 resize-none"
              />

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setRejectingOrder(null);
                    setReason('');
                  }}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    await updateOrderStatus(rejectingOrder.id, 'failed', { rejection_reason: reason });
                    setRejectingOrder(null);
                    setReason('');
                  }}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-red-400 text-black hover:bg-red-300 transition-colors"
                >
                  Reject Order
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon, color = "text-white", subtitle }) => (
  <div className="glass p-6 rounded-3xl border border-white/5 flex flex-col justify-between">
    <div className="flex justify-between items-start mb-6">
       <div className={`${color} bg-white/5 p-3 rounded-2xl`}>{icon}</div>
       <div className="text-[10px] uppercase font-black tracking-widest text-white/20">Live Data</div>
    </div>
    <div>
      <p className="text-2xl font-black mb-1 tracking-tighter">{value}</p>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-white/40">{title}</p>
        <p className="text-[9px] text-white/20 italic">{subtitle}</p>
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const config = {
    pending: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    processing: "bg-blue-400/10 text-blue-400 border-blue-400/20",
    completed: "bg-green-400/10 text-green-400 border-green-400/20",
    failed: "bg-red-400/10 text-red-400 border-red-400/20",
  };
  return (
    <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-black border ${config[status]}`}>
      {status}
    </span>
  );
};

export default Dashboard;
