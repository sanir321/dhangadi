import React, { useState } from 'react';
import { Search, Package, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useDependencies } from '../DependencyContext';
import Navbar from '../components/Navbar';
import { contactDetails } from '../data/games';

const TrackOrderPage = () => {
    const [orderId, setOrderId] = useState('');
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState(null);
    const [error, setError] = useState('');
    const { trackOrder } = useDependencies();

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
                setError('Order not found. Please check your order ID and try again.');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred while fetching your order. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock className="text-yellow-400" size={24} />;
            case 'processing':
                return <Loader2 className="text-blue-400 animate-spin" size={24} />;
            case 'completed':
                return <CheckCircle2 className="text-accent" size={24} />;
            case 'failed':
                return <XCircle className="text-red-400" size={24} />;
            default:
                return <Package className="text-white/40" size={24} />;
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20';
            case 'processing':
                return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
            case 'completed':
                return 'bg-accent/10 text-accent border-accent/20';
            case 'failed':
                return 'bg-red-400/10 text-red-400 border-red-400/20';
            default:
                return 'bg-white/10 text-white/60 border-white/20';
        }
    };

    const getStatusStep = (status) => {
        const steps = ['pending', 'processing', 'completed'];
        return steps.indexOf(status);
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="max-w-4xl mx-auto pt-32 pb-16 px-6">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Track Order</h1>
                    <p className="text-white/50 text-base md:text-lg">Check the real-time status of your top-up</p>
                </div>

                {/* Search Box */}
                <div className="glass-card mb-12 p-6 md:p-8">
                    <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                            <input
                                type="text"
                                placeholder="Enter Order ID"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-accent/50 outline-none transition-all duration-300 text-sm md:text-base"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-accent text-black font-bold px-10 py-4 rounded-2xl hover:bg-accent/90 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:scale-100 flex items-center justify-center min-w-[160px] text-sm md:text-base"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Track Now'}
                        </button>
                    </form>
                    {error && (
                        <div className="mt-4 p-4 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}
                </div>

                {/* Order Result */}
                {order && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="glass-card relative overflow-hidden p-6 md:p-10">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl -mr-16 -mt-16" />
                            
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 pb-8 border-b border-white/5">
                                <div>
                                    <p className="text-[10px] md:text-xs text-white/30 uppercase tracking-widest font-bold mb-1">Transaction ID</p>
                                    <p className="text-xl md:text-2xl font-mono font-bold tracking-tight break-all">{order.orderId}</p>
                                </div>
                                <div className={`px-4 md:px-5 py-2 md:py-2.5 rounded-2xl border flex items-center gap-3 w-fit ${getStatusStyles(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    <span className="font-bold capitalize text-sm">{order.status}</span>
                                </div>
                            </div>

                            {/* Order Details Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4">
                                <div>
                                    <p className="text-[10px] md:text-xs text-white/30 uppercase tracking-widest font-bold mb-1">Game</p>
                                    <p className="font-bold text-base md:text-lg">{order.gameName}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] md:text-xs text-white/30 uppercase tracking-widest font-bold mb-1">Package</p>
                                    <p className="font-bold text-base md:text-lg">{order.packageLabel}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] md:text-xs text-white/30 uppercase tracking-widest font-bold mb-1">Amount</p>
                                    <p className="font-bold text-base md:text-lg text-accent">NPR {order.price}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] md:text-xs text-white/30 uppercase tracking-widest font-bold mb-1">Player ID</p>
                                    <p className="font-bold text-base md:text-lg break-all">{order.playerId}</p>
                                </div>
                                {order.serverId && (
                                    <div>
                                        <p className="text-[10px] md:text-xs text-white/30 uppercase tracking-widest font-bold mb-1">Server</p>
                                        <p className="font-bold text-base md:text-lg">{order.serverId}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-[10px] md:text-xs text-white/30 uppercase tracking-widest font-bold mb-1">Order Date</p>
                                    <p className="font-bold text-xs md:text-sm text-white/70">{new Date(order.createdAt).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Progress Visual */}
                            <div className="mt-12 pt-8 border-t border-white/5">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative gap-8 md:gap-0">
                                    {['Placed', 'Processing', 'Delivered'].map((step, index) => {
                                        const currentStep = getStatusStep(order.status);
                                        const isCompleted = index <= currentStep;
                                        const isLast = index === 2;

                                        return (
                                            <React.Fragment key={step}>
                                                <div className="flex flex-row md:flex-col items-center gap-4 md:gap-0 relative z-10 w-full md:w-auto">
                                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border shrink-0 ${
                                                        isCompleted 
                                                        ? 'bg-accent text-black border-accent' 
                                                        : 'bg-white/5 text-white/20 border-white/5'
                                                    }`}>
                                                        {isCompleted ? <CheckCircle2 size={20} md:size={24} /> : <span className="font-bold">{index + 1}</span>}
                                                    </div>
                                                    <div className="flex flex-col md:items-center">
                                                        <p className={`text-xs font-bold md:mt-3 uppercase tracking-tighter ${isCompleted ? 'text-accent' : 'text-white/20'}`}>
                                                            {step}
                                                        </p>
                                                        {/* Status subtitle for mobile */}
                                                        <p className="text-[10px] text-white/40 md:hidden">
                                                            {isCompleted ? 'Completed' : 'Pending'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {!isLast && (
                                                    <>
                                                        {/* Desktop Line */}
                                                        <div className="hidden md:block flex-1 px-2 mb-8">
                                                            <div className={`h-[2px] w-full rounded-full transition-all duration-1000 ${
                                                                index < currentStep ? 'bg-accent' : 'bg-white/5'
                                                            }`} />
                                                        </div>
                                                        {/* Mobile Line */}
                                                        <div className="md:hidden absolute left-5 top-12 w-[1px] h-12 bg-white/10 -z-0">
                                                            <div className={`w-full transition-all duration-1000 ${
                                                                index < currentStep ? 'h-full bg-accent' : 'h-0'
                                                            }`} />
                                                        </div>
                                                    </>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Status Message */}
                        <div className="glass-morphism p-6 flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-accent/10 text-accent">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold mb-1">Estimated Delivery</h4>
                                <p className="text-sm text-white/50">
                                    Most orders are processed within 5 minutes. If your order takes longer than 30 minutes, please contact us on 
                                    <a href={contactDetails.whatsappLink} target="_blank" rel="noopener noreferrer" className="text-accent underline ml-1 font-bold">WhatsApp</a>.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrderPage;
