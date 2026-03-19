import React, { useState } from 'react';
import { ChevronDown, Shield, Clock, CreditCard, HelpCircle, MessageCircle, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="glass-morphism overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-all duration-300"
            >
                <span className="font-bold text-lg pr-8">{question}</span>
                <div className={`p-2 rounded-xl bg-white/5 transition-transform duration-500 ${isOpen ? 'rotate-180 bg-accent text-black' : ''}`}>
                    <ChevronDown size={20} />
                </div>
            </button>
            <div 
                className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
                <div className="overflow-hidden">
                    <div className="px-6 pb-8 text-white/50 leading-relaxed font-medium">
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
            question: "How do I find my Player ID?",
            answer: "• Free Fire: Go to Profile in the game settings\n• PUBG Mobile: Go to Settings > Basic > Character\n• Mobile Legends: Go to Profile > Player ID\n• Clash of Clans: Go to Settings > More > Player Profile\n• Roblox: Your username is your Player ID"
        },
        {
            question: "What payment methods are available?",
            answer: "We accept:\n• FonePay QR\n• Direct bank transfer (Nabil Bank)\n• Manual QR upload\n\nScan the QR code shown during checkout or transfer to the provided account number."
        },
        {
            question: "What if I entered the wrong Player ID?",
            answer: "If you've entered an incorrect Player ID, please contact our support team immediately via WhatsApp. We'll try to help, but we cannot guarantee changes once the order is processed."
        },
        {
            question: "Can I cancel my order?",
            answer: "Orders can only be cancelled before they are marked as 'Processing'. Once processing begins, cancellation is not possible. Contact support for assistance."
        },
        {
            question: "Is my payment information secure?",
            answer: "Yes! All payments are processed directly through secure banking channels. We never store your banking credentials. Your privacy and security are our top priorities."
        },
        {
            question: "How do I contact customer support?",
            answer: "You can reach us via WhatsApp or Email. We're available 24/7 to assist you."
        }
    ];

    const policies = [
        {
            icon: <Shield className="text-accent" size={28} />,
            title: "Secure",
            description: "Encrypted bank transfers"
        },
        {
            icon: <Clock className="text-accent" size={28} />,
            title: "Instant",
            description: "5-15 mins typical delivery"
        },
        {
            icon: <CreditCard className="text-accent" size={28} />,
            title: "Verified",
            description: "Manual verification team"
        },
        {
            icon: <HelpCircle className="text-accent" size={28} />,
            title: "Support",
            description: "24/7 dedicated assistance"
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="max-w-7xl mx-auto pt-28 pb-20 px-4">
                {/* Header */}
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">Support <span className="text-accent">&</span> Logic</h1>
                    <p className="text-white/50 text-xl font-medium leading-relaxed">Everything you need to know about our premium gaming services in Digital Nepal.</p>
                </div>

                {/* Policies Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                    {policies.map((policy, index) => (
                        <div key={index} className="glass-card flex flex-col items-center text-center p-8 group hover:-translate-y-2 transition-all duration-500">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-black transition-all duration-500 border border-white/5">
                                {policy.icon}
                            </div>
                            <h3 className="font-black text-lg mb-2 uppercase tracking-tight">{policy.title}</h3>
                            <p className="text-sm text-white/30 font-medium">{policy.description}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* FAQs Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-3xl font-bold tracking-tight">Common Questions</h2>
                            <div className="h-[2px] flex-1 mx-8 bg-white/5 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        </div>
                        {faqs.map((faq, index) => (
                            <FAQItem key={index} question={faq.question} answer={faq.answer} />
                        ))}
                    </div>

                    {/* Side Info Column */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* WhatsApp CTA */}
                        <div className="glass-card bg-accent/5 border-accent/20 relative overflow-hidden group">
                            <div className="absolute -right-12 -top-12 w-40 h-40 bg-accent/20 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                            <MessageCircle className="text-accent mb-6" size={48} />
                            <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Need immediate help?</h3>
                            <p className="text-white/50 mb-8 font-medium">Our agents are active on WhatsApp and ready to assist you with your orders manually.</p>
                            <a
                                href="#"
                                className="w-full bg-accent text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Chat on WhatsApp <ArrowRight size={20} />
                            </a>
                        </div>

                        {/* Legal Block */}
                        <div className="glass-card p-4 !bg-transparent opacity-60">
                            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-white/30">Terms & Policies</h4>
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl border border-white/5 hover:border-white/20 transition-colors">
                                    <h5 className="font-bold text-sm mb-2">Refund Policy</h5>
                                    <p className="text-xs text-white/40 leading-relaxed">Full refund guaranteed if order isn't delivered within 60 minutes of verification.</p>
                                </div>
                                <div className="p-4 rounded-2xl border border-white/5 hover:border-white/20 transition-colors">
                                    <h5 className="font-bold text-sm mb-2">Privacy Focus</h5>
                                    <p className="text-xs text-white/40 leading-relaxed">We strictly process screenshot verification and never store player passwords.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
