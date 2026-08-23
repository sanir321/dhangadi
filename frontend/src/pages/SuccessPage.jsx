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
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />
            <div className="max-w-3xl mx-auto px-6 pt-36 pb-20 flex flex-col items-center justify-center text-center">
                <div className="relative mb-6">
                    <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center animate-bounce-slow relative z-10 border border-emerald-200 shadow-lg shadow-emerald-500/10">
                        <CheckCircle2 className="text-emerald-600" size={44} />
                    </div>
                </div>

                <span className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-2 block">Order Placed Successfully</span>
                <h1 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight text-slate-900 uppercase">
                    Thank You for Your Order!
                </h1>
                <p className="text-slate-600 text-sm sm:text-base mb-8 max-w-md mx-auto leading-relaxed">
                    Your payment screenshot has been uploaded. Our store team is verifying it now. Most orders are processed in <span className="text-accent font-bold">5-15 minutes</span>.
                </p>

                {/* Order ID Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-8 w-full max-w-sm flex flex-col items-center gap-2 shadow-sm">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Your Order Tracking ID</span>
                    <div className="flex items-center gap-3">
                        <p className="text-xl font-mono font-black text-slate-900 tracking-wider">{orderId}</p>
                        <button 
                            onClick={copyToClipboard}
                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-accent"
                            title="Copy Order ID"
                        >
                            {copied ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                    <button
                        onClick={() => navigate('/')}
                        className="flex-1 bg-white border border-slate-200 text-slate-800 font-bold py-4 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
                    >
                        <Home size={18} />
                        Back to Home
                    </button>
                    <button
                        onClick={() => navigate('/track')}
                        className="flex-1 bg-accent hover:bg-accent-hover text-white font-bold py-4 rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-accent/20"
                    >
                        <Search size={18} />
                        Track Order Status
                    </button>
                </div>

                <p className="mt-8 text-xs text-slate-400 font-medium">
                    Your order status will update in real-time on the tracking page.
                </p>
            </div>
        </div>
    );
};

export default SuccessPage;
