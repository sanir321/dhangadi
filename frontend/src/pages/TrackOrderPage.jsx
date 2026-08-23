import React, { useState } from 'react';
import { Search, Package, Clock, CheckCircle2, XCircle, Loader2, AlertCircle, MessageCircle, ArrowRight } from 'lucide-react';
import { useDependencies } from '../DependencyContext';
import Navbar from '../components/Navbar';
import { useStoreSettings } from '../context/StoreSettingsContext';

const TrackOrderPage = () => {
    const [orderId, setOrderId] = useState('');
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState(null);
    const [error, setError] = useState('');
    const { trackOrder } = useDependencies();
    const { contactDetails } = useStoreSettings();

    const handleTrack = async (e) => {
        e.preventDefault();
        const trimmedId = orderId.trim();
        if (!trimmedId) {
            setError('Please enter an order ID');
            return;
        }

        setLoading(true);
        setError('');
        setOrder(null);

        try {
            const result = await trackOrder.execute(trimmedId);
            if (result) {
                setOrder(result);
            } else {
                setError('No order found with this tracking ID. Please check the ID and try again.');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to fetch order details. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black uppercase">
                        <CheckCircle2 size={14} /> Completed & Delivered
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-black uppercase">
                        <XCircle size={14} /> Cancelled / Rejected
                    </span>
                );
            case 'processing':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black uppercase">
                        <Clock size={14} className="animate-spin" /> Processing
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black uppercase">
                        <Clock size={14} /> Pending Verification
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-36 pb-20">
                <div className="text-center max-w-xl mx-auto mb-10">
                    <h1 className="text-3xl sm:text-4xl font-black uppercase text-slate-900 tracking-tight mb-3">
                        Track Your Top-Up Order
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">
                        Enter your unique Order Tracking ID below to view instant status and verification progress.
                    </p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleTrack} className="bg-white border border-slate-200 p-2 sm:p-3 rounded-2xl sm:rounded-3xl shadow-sm flex flex-col sm:flex-row gap-2 mb-10">
                    <div className="flex-1 flex items-center gap-3 px-4 py-2">
                        <Search className="text-slate-400" size={20} />
                        <input
                            type="text"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            placeholder="Enter Order ID (e.g., ORD171...)"
                            className="w-full bg-transparent text-slate-900 font-bold placeholder:text-slate-400 outline-none text-sm sm:text-base font-mono"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-accent hover:bg-accent-hover text-white font-bold py-3.5 px-8 rounded-xl sm:rounded-2xl transition-all shadow-md shadow-accent/20 flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Search Order'}
                    </button>
                </form>

                {/* Error Message */}
                {error && (
                    <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-3 mb-8 animate-in fade-in">
                        <AlertCircle size={20} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Order Result Card */}
                {order && (
                    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-8 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Order Details</span>
                                <h3 className="text-xl sm:text-2xl font-mono font-black text-slate-900">{order.order_id || order.orderId}</h3>
                            </div>
                            <div>
                                {getStatusBadge(order.status)}
                            </div>
                        </div>

                        {/* Summary Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                            <div>
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-1">Game</span>
                                <span className="font-bold text-slate-900 text-sm">{order.game_name || order.gameName}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-1">Package</span>
                                <span className="font-bold text-slate-900 text-sm">{order.package_label || order.packageLabel}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-1">Player ID</span>
                                <span className="font-bold text-slate-900 text-sm font-mono">{order.player_id || order.playerId}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-1">Amount</span>
                                <span className="font-black text-accent text-sm">NPR {order.price}</span>
                            </div>
                        </div>

                        {/* Order Timeline / Next steps */}
                        <div className="space-y-4 pt-2">
                            <h4 className="text-xs uppercase font-black tracking-widest text-slate-400">Order Progress</h4>
                            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                                <Clock className="text-accent shrink-0 mt-0.5" size={18} />
                                <p className="text-xs text-slate-700 leading-relaxed">
                                    {order.status === 'completed' 
                                        ? 'Your top-up has been completed! Please open your game to check your updated balance.'
                                        : order.status === 'failed'
                                        ? `Order cancelled. Reason: ${order.rejection_reason || 'Screenshot invalid or Player ID unverified'}. Contact support if this is a mistake.`
                                        : 'Payment proof is received and currently being processed by our store agents.'}
                                </p>
                            </div>
                        </div>

                        {/* Need Help WhatsApp CTA */}
                        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span className="text-xs text-slate-500 font-medium">Have questions regarding this order?</span>
                            <a
                                href={contactDetails?.whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
                            >
                                <MessageCircle size={16} /> Contact Support on WhatsApp
                            </a>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TrackOrderPage;
