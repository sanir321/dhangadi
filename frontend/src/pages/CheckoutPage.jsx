import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDependencies } from '../DependencyContext';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabase';
import imageCompression from 'browser-image-compression';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { ShieldCheck, ChevronLeft, Upload, Loader2, QrCode, Package } from 'lucide-react';
import { bankDetails } from '../data/games';

const formSchema = z.object({
  playerId: z.string().min(4, "Player ID is required"),
  serverId: z.string().optional(),
  remark: z.string().optional(),
  screenshot: z.any().refine((files) => files?.length === 1, "Payment screenshot is required"),
});

const CheckoutPage = () => {
  const { gameId, pkgId } = useParams();
  const navigate = useNavigate();
  const { getGames, placeOrder } = useDependencies();
  const [loading, setLoading] = useState(false);

  const { data: game } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => getGames.getById(gameId),
  });

  const targetPkg = game?.packages.find(p => p.id === pkgId);

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(formSchema)
  });

  const screenshotFile = watch('screenshot');

  if (!game || !targetPkg) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-white">Invalid selection</div>;
  }

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const file = values.screenshot[0];
      const compressed = await imageCompression(file, { maxSizeMB: 0.8, maxWidthOrHeight: 1200 });
      
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const { error: uploadErr } = await supabase.storage
        .from('screenshots')
        .upload(fileName, compressed);
      
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from('screenshots')
        .getPublicUrl(fileName);

      const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

      const result = await placeOrder.execute({
        orderId,
        gameId: game.id,
        gameName: game.name,
        packageId: targetPkg.id,
        packageLabel: targetPkg.label,
        price: targetPkg.price,
        cost: targetPkg.cost,
        playerId: values.playerId,
        serverId: values.serverId || null,
        remark: values.remark || '',
        screenshotUrl: publicUrl,
        status: 'pending',
      });

      // Trigger Telegram notification
      try {
        await supabase.functions.invoke('notify-order', {
          body: { orderId: result.id }
        });
      } catch (notifyErr) {
        console.warn("Notification failed, but order was placed:", notifyErr);
      }

      toast.success("Order placed successfully!");
      navigate('/success', { state: { orderId } });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-20">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-white/50 hover:text-white mb-8 group transition-colors"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            <h1 className="text-4xl font-bold tracking-tight">Checkout</h1>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Account Details */}
              <div className="glass-card">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Package className="text-accent" size={20} />
                  Game Account Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-bold text-white/40 uppercase tracking-widest mb-2 block">
                      {game.idField} *
                    </label>
                    <input 
                      {...register('playerId')}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-accent/50 outline-none transition-all"
                      placeholder={`Enter your ${game.idField}`}
                    />
                    {errors.playerId && <p className="text-red-400 text-xs mt-2 font-medium">{errors.playerId.message}</p>}
                  </div>

                  {game.serverRequired && (
                    <div>
                      <label className="text-sm font-bold text-white/40 uppercase tracking-widest mb-2 block">
                        Server ID *
                      </label>
                      <input 
                        {...register('serverId')}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-accent/50 outline-none transition-all"
                        placeholder="e.g. Asia / 12345"
                      />
                      {errors.serverId && <p className="text-red-400 text-xs mt-2 font-medium">{errors.serverId.message}</p>}
                    </div>
                  )}
                </div>
                <div className="mt-6">
                  <label className="text-sm font-bold text-white/40 uppercase tracking-widest mb-2 block">Remark (Optional)</label>
                  <textarea 
                    {...register('remark')}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-accent/50 outline-none transition-all h-24 resize-none"
                    placeholder="Any special instructions for our team..."
                  />
                </div>
              </div>

              {/* Payment Section */}
              <div className="glass-card">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <QrCode className="text-accent" size={20} />
                  Payment Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="bg-white p-6 rounded-[2.5rem] w-fit mx-auto shadow-2xl shadow-accent/20 border-4 border-accent/20">
                    <img src={bankDetails.qrImage} alt="Payment QR" className="w-56 h-56 object-contain" />
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-xs text-white/30 font-bold uppercase tracking-widest mb-1">Account Holder</p>
                      <p className="font-bold text-lg">{bankDetails.accountHolder}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-xs text-white/30 font-bold uppercase tracking-widest mb-1">Bank Name</p>
                      <p className="font-bold">{bankDetails.bankName}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12">
                  <label className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4 block">Upload Payment Screenshot *</label>
                  <label className={`relative group cursor-pointer flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-3xl transition-all duration-300 ${
                    screenshotFile?.length ? 'border-accent bg-accent/5' : 'border-white/10 hover:border-accent/30 hover:bg-white/5'
                  }`}>
                    <input 
                      type="file" 
                      {...register('screenshot')}
                      className="hidden"
                      accept="image/*"
                    />
                    <Upload className={`mb-4 transition-colors ${screenshotFile?.length ? 'text-accent' : 'text-white/20'}`} size={40} />
                    <p className={`font-bold text-center ${screenshotFile?.length ? 'text-accent' : 'text-white/40'}`}>
                      {screenshotFile?.length ? screenshotFile[0].name : "Click to select or drag and drop screenshot"}
                    </p>
                    <p className="text-xs text-white/20 mt-2">Max size: 5MB (JPG, PNG)</p>
                  </label>
                  {errors.screenshot && <p className="text-red-400 text-xs mt-3 font-medium text-center">{errors.screenshot.message}</p>}
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-black font-black py-6 rounded-3xl active:scale-95 transition-all text-xl shadow-2xl shadow-accent/20 hover:shadow-accent/40 flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Confirm & Place Order"}
              </button>
            </form>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card sticky top-24">
              <h3 className="text-xl font-bold mb-8">Order Summary</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5">
                  <img src={game.icon} alt={game.name} className="w-12 h-12 object-contain" />
                  <div>
                    <p className="font-bold">{game.name}</p>
                    <p className="text-xs text-white/40 uppercase tracking-widest">{game.currency}</p>
                  </div>
                </div>
                
                <div className="space-y-3 py-6 border-y border-white/5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/40">Item</span>
                    <span className="font-bold">{targetPkg.label}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/40">Subtotal</span>
                    <span className="font-bold">NPR {targetPkg.price}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/40">Fee</span>
                    <span className="text-accent font-bold">FREE</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-end">
                    <span className="text-white/40 text-sm font-bold uppercase tracking-widest">Grand Total</span>
                    <span className="text-3xl font-black text-accent">NPR {targetPkg.price}</span>
                  </div>
                </div>

                <div className="mt-8 p-4 rounded-2xl bg-accent/5 border border-accent/10 flex items-start gap-3">
                  <ShieldCheck className="text-accent shrink-0" size={18} />
                  <p className="text-[11px] text-white/50 leading-relaxed">
                    Your payment is secured with 256-bit encryption. Orders are typically processed within 5-15 minutes after verification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
