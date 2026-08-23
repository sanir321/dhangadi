import React, { useState } from 'react';
import { X, Copy, Check, QrCode, ShieldCheck } from 'lucide-react';
import { useStoreSettings } from '../context/StoreSettingsContext';

const PaymentModal = ({ isOpen, onClose, onConfirm, game, pkg }) => {
    const { bankDetails } = useStoreSettings();
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const copyToClipboard = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-accent flex items-center justify-center border border-blue-100">
                            <QrCode size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Payment Details</h3>
                            <p className="text-xs text-slate-500">Scan QR or Transfer</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                    {/* Order Summary Box */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex justify-between items-center">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Package</p>
                            <p className="font-bold text-slate-900 text-sm">{pkg?.label}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Amount Due</p>
                            <p className="text-xl font-black text-accent">NPR {pkg?.price}</p>
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center">
                        {bankDetails?.qrImage ? (
                            <img 
                                src={bankDetails.qrImage} 
                                alt="Payment QR" 
                                className="w-52 h-52 object-contain rounded-xl"
                            />
                        ) : (
                            <div className="w-48 h-48 flex flex-col items-center justify-center text-slate-400">
                                <QrCode size={100} className="mb-2" />
                                <p className="text-xs font-bold text-slate-600">SCAN TO PAY</p>
                            </div>
                        )}
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-2">
                            eSewa / Khalti / FonePay / Mobile Banking
                        </span>
                    </div>

                    {/* Bank Details */}
                    <div className="space-y-2">
                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Bank / Method</span>
                                <span className="font-bold text-slate-900">{bankDetails?.bankName || 'Citizens Bank'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Account Name</span>
                                <span className="font-bold text-slate-900">{bankDetails?.accountHolder || 'Dhangadi Top Up Store'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Note */}
                    <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-slate-700 font-medium">
                        <strong>Reminder:</strong> Transfer exactly NPR {pkg?.price} and enter your Player ID in the payment remarks.
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                    <button
                        onClick={onConfirm}
                        className="w-full bg-accent hover:bg-accent-hover text-white font-black py-4 rounded-xl active:scale-95 transition-all text-sm uppercase tracking-wider shadow-lg shadow-accent/20"
                    >
                        I Have Transferred - Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
