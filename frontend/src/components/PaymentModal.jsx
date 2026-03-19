import React, { useState } from 'react';
import { X, Copy, Check, QrCode } from 'lucide-react';
import { bankDetails } from '../data/games';

const PaymentModal = ({ isOpen, onClose, onConfirm, game, pkg }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md glass rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center">
                            <QrCode className="text-green-400" size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold">Payment Details</h3>
                            <p className="text-xs text-white/40">Scan to pay</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Order Summary */}
                    <div className="bg-white/5 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs text-white/40 uppercase tracking-widest">Package</p>
                                <p className="font-bold">{pkg?.label}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-white/40 uppercase tracking-widest">Amount</p>
                                <p className="text-2xl font-black text-green-400">NPR {pkg?.price}</p>
                            </div>
                        </div>
                    </div>

                    {/* QR Code Placeholder */}
                    <div className="bg-white rounded-2xl p-4">
                        <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                            <div className="text-center text-black">
                                <QrCode size={120} className="mx-auto mb-2 text-gray-800" />
                                <p className="text-xs font-bold text-gray-600">SCAN TO PAY</p>
                                <p className="text-[10px] text-gray-400">Via FonePay / Bank App</p>
                            </div>
                        </div>
                    </div>

                    {/* Bank Details */}
                    <div className="space-y-3">
                        <p className="text-xs text-white/40 uppercase tracking-widest">Or transfer to</p>

                        <div className="bg-white/5 rounded-xl p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-white/60">Bank</span>
                                <span className="font-bold">{bankDetails.bankName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-white/60">Account</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold">{bankDetails.accountNumber}</span>
                                    <button
                                        onClick={() => copyToClipboard(bankDetails.accountNumber)}
                                        className="p-1 rounded hover:bg-white/10"
                                    >
                                        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-white/60">Name</span>
                                <span className="font-bold">{bankDetails.accountHolder}</span>
                            </div>
                        </div>
                    </div>

                    {/* Important Note */}
                    <div className="p-4 rounded-xl bg-yellow-400/5 border border-yellow-400/20">
                        <p className="text-xs text-yellow-400/80">
                            <strong>Important:</strong> Transfer exactly NPR {pkg?.price}. Any extra or less will not be processed.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5">
                    <button
                        onClick={onConfirm}
                        className="w-full bg-white text-black font-black py-4 rounded-xl active:scale-95 transition-transform"
                    >
                        I Have Paid - Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
