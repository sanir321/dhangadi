import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Home, Search, Copy, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const SuccessPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const orderId = state?.orderId || 'ORD-UNKNOWN';
    const [copied, setCopied] = React.useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(orderId);
        setCopied(true);
        toast.success("Order ID copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 pt-32 pb-16 flex flex-col items-center justify-center text-center">
                <div className="relative mb-10">
                    <div className="w-24 h-24 bg-accent/20 rounded-3xl flex items-center justify-center animate-bounce-slow relative z-10 border border-accent/20">
                        <CheckCircle2 className="text-accent" size={48} />
                    </div>
                    <div className="absolute inset-0 bg-accent/30 blur-3xl opacity-50 animate-pulse" />
                </div>

                <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Order Placed!</h1>
                <p className="text-white/50 text-lg mb-12 max-w-md mx-auto leading-relaxed">
                    Your payment screenshot has been uploaded. Our team is verifying it now. Most orders are processed in <span className="text-accent font-bold">5-10 minutes</span>.
                </p>

                {/* Order ID Card */}
                <div className="glass-morphism p-6 mb-12 w-full max-w-sm flex flex-col items-center gap-2 group">
                    <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">Your Order ID</span>
                    <div className="flex items-center gap-3">
                        <p className="text-2xl font-mono font-bold tracking-wider">{orderId}</p>
                        <button 
                            onClick={copyToClipboard}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-accent"
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                    <button
                        onClick={() => navigate('/')}
                        className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-4 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                        <Home size={18} />
                        Back to Home
                    </button>
                    <button
                        onClick={() => navigate('/track')}
                        className="flex-1 bg-accent text-black font-bold py-4 rounded-2xl hover:bg-accent/90 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Search size={18} />
                        Track Order
                    </button>
                </div>

                <p className="mt-12 text-sm text-white/20">
                    Your order status will update automatically on the track page.
                </p>
            </div>
        </div>
    );
};

export default SuccessPage;
