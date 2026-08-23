import React, { useState } from 'react';
import { ChevronDown, Shield, Clock, CreditCard, HelpCircle, MessageCircle, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useStoreSettings } from '../context/StoreSettingsContext';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-slate-50 transition-colors"
            >
                <span className="font-bold text-slate-900 text-sm md:text-base pr-4">{question}</span>
                <div className={`p-2 rounded-xl bg-slate-100 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-accent text-white' : 'text-slate-500'}`}>
                    <ChevronDown size={18} />
                </div>
            </button>
            <div 
                className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
                <div className="overflow-hidden">
                    <div className="px-5 md:px-6 pb-6 text-slate-600 leading-relaxed font-medium text-xs md:text-sm border-t border-slate-100 pt-4 bg-slate-50/50">
                        {answer.split('\n').map((line, i) => (
                            <p key={i} className="mb-2">{line}</p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const FAQPage = () => {
    const { contactDetails } = useStoreSettings();
    const faqs = [
        {
            question: "How does the top-up process work?",
            answer: "1. Select your game from our store.\n2. Choose your preferred package.\n3. Complete the payment via bank transfer/QR.\n4. Upload your payment screenshot.\n5. Enter your Player ID.\n6. Our team will verify and process your order within 5-15 minutes."
        },
        {
            question: "How long does it take for delivery?",
            answer: "Most orders are delivered within 5-15 minutes after payment verification. During peak hours, it may take up to 30 minutes. If you don't receive your top-up within 1 hour, please contact support."
        },
        {
            question: "What payment methods are supported?",
            answer: "We support all major Nepalese payment gateways including eSewa, Khalti, IME Pay, FonePay QR, and direct mobile banking transfers to Citizens Bank."
        },
        {
            question: "Is it safe to top up through Dhangadi Store?",
            answer: "Yes, 100% safe! We only require your public Player ID or Character ID. We never ask for your account passwords or login credentials."
        },
        {
            question: "What if I entered the wrong Player ID?",
            answer: "If you entered an incorrect Player ID, please contact our support immediately on WhatsApp with your Order ID before the top-up is processed."
        },
        {
            question: "What is the refund policy?",
            answer: "If we are unable to fulfill your order due to stock issues or technical errors, you will receive a 100% refund within 24 hours."
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 pt-36 pb-20">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <span className="text-xs font-black uppercase tracking-widest text-accent mb-2 block">Help Center</span>
                    <h1 className="text-3xl sm:text-5xl font-black uppercase text-slate-900 tracking-tight mb-4">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-slate-500 text-sm sm:text-base font-medium">
                        Everything you need to know about purchasing gaming currency, payment proofs, and delivery timeframes.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* FAQ List */}
                    <div className="lg:col-span-8 space-y-4">
                        {faqs.map((faq, index) => (
                            <FAQItem key={index} question={faq.question} answer={faq.answer} />
                        ))}
                    </div>

                    {/* Side Support Column */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-blue-50/70 border border-blue-200 p-6 sm:p-8 rounded-[2rem] shadow-sm">
                            <MessageCircle className="text-accent mb-4" size={36} />
                            <h3 className="text-xl font-black uppercase text-slate-900 mb-2">Need direct help?</h3>
                            <p className="text-xs text-slate-600 mb-6 font-medium leading-relaxed">
                                Our agents are online on WhatsApp to verify orders, fix ID issues, and answer any questions.
                            </p>
                            <a
                                href={contactDetails?.whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm uppercase tracking-wider transition-all shadow-md shadow-accent/20"
                            >
                                Chat on WhatsApp <ArrowRight size={16} />
                            </a>
                        </div>

                        <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm space-y-4">
                            <h4 className="font-black text-xs uppercase tracking-widest text-slate-400">Guarantees</h4>
                            <div className="space-y-3">
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                    <h5 className="font-bold text-xs text-slate-900 mb-1">Money-Back Guarantee</h5>
                                    <p className="text-[11px] text-slate-500">Full refund if top-up fails or cannot be delivered.</p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                    <h5 className="font-bold text-xs text-slate-900 mb-1">Password Free</h5>
                                    <p className="text-[11px] text-slate-500">Direct ID transfers only. No account access needed.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FAQPage;
