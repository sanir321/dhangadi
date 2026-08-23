import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDependencies } from '../DependencyContext';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabase';
import imageCompression from 'browser-image-compression';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { ShieldCheck, ChevronLeft, Upload, Loader2, QrCode, Package, CheckCircle2 } from 'lucide-react';
import { useStoreSettings } from '../context/StoreSettingsContext';

const formSchema = z.object({
  playerId: z.string().min(3, "Player ID is required"),
  serverId: z.string().optional(),
  remark: z.string().optional(),
  screenshot: z.any().refine((files) => files?.length === 1, "Payment screenshot is required"),
});

const CheckoutPage = () => {
  const { gameId, pkgId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getGames, placeOrder } = useDependencies();
  const { bankDetails } = useStoreSettings();
  const [loading, setLoading] = useState(false);

  // Parse quantity from URL
  const searchParams = new URLSearchParams(location.search);
  const quantity = parseInt(searchParams.get('q')) || 1;

  const { data: game } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => getGames.getById(gameId),
  });

  const targetPkg = game?.packages?.find(p => p.id === pkgId);

  // Calculate tired pricing
  const pricingData = useMemo(() => {
    if (!game || !targetPkg) return null;
    
    if (game.supportsQuantity && game.pricing) {
        const isTiered = quantity >= (game.pricing.tierThreshold || 5);
        const unitPrice = isTiered ? game.pricing.tieredPrice : game.pricing.basePrice;
        const unitCost = isTiered ? game.pricing.costPerUnit : targetPkg.cost;
        
        return {
            totalPrice: unitPrice * quantity,
            totalCost: unitCost * quantity,
            unitPrice,
            isTiered
        };
    }
    
    return {
        totalPrice: targetPkg.price,
        totalCost: targetPkg.cost,
        unitPrice: targetPkg.price,
        isTiered: false
    };
  }, [game, targetPkg, quantity]);

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(formSchema)
  });

  const screenshotFile = watch('screenshot');

  if (!game || !targetPkg) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-slate-700 font-bold">
        Invalid package selection
      </div>
    );
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
        packageLabel: game.supportsQuantity ? `${quantity}x ${game.name} Voucher` : targetPkg.label,
        price: pricingData.totalPrice,
        cost: pricingData.totalCost,
        quantity: game.supportsQuantity ? quantity : 1,
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
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-36 pb-20">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-500 hover:text-accent mb-8 group transition-colors font-bold text-xs uppercase tracking-wider"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to selection</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Form */}
          <div className="lg:col-span-8 space-y-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 uppercase">Complete Top-Up</h1>
              <p className="text-slate-500 text-sm font-medium mt-1">Fill in your game ID and upload your payment slip</p>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Account Details Card */}
              <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-6">
                <h3 className="text-lg font-black text-slate-900 uppercase flex items-center gap-2">
                  <Package className="text-accent" size={20} />
                  Game Account Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">
                      {game.idField} *
                    </label>
                    <input 
                      {...register('playerId')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 font-bold focus:border-accent focus:bg-white outline-none transition-all shadow-inner"
                      placeholder={`Enter your exact ${game.idField}`}
                    />
                    {errors.playerId && <p className="text-red-500 text-xs mt-2 font-bold">{errors.playerId.message}</p>}
                  </div>

                  {game.serverRequired && (
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">
                        Server ID *
                      </label>
                      <input 
                        {...register('serverId')}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 font-bold focus:border-accent focus:bg-white outline-none transition-all shadow-inner"
                        placeholder="e.g. 1234 (Asia)"
                      />
                      {errors.serverId && <p className="text-red-500 text-xs mt-2 font-bold">{errors.serverId.message}</p>}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Remark (Optional)</label>
                  <textarea 
                    {...register('remark')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:border-accent focus:bg-white outline-none transition-all h-20 resize-none shadow-inner text-sm"
                    placeholder="Any special notes or player name..."
                  />
                </div>
              </div>

              {/* Payment Section Card */}
              <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-8">
                <h3 className="text-lg font-black text-slate-900 uppercase flex items-center gap-2">
                  <QrCode className="text-accent" size={20} />
                  Payment Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="bg-slate-50 p-6 rounded-3xl w-fit mx-auto border-2 border-slate-200 shadow-sm flex flex-col items-center">
                    {bankDetails?.qrImage ? (
                      <img src={bankDetails.qrImage} alt="Payment QR" className="w-48 h-48 sm:w-52 sm:h-52 object-contain" />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                        <QrCode size={90} />
                      </div>
                    )}
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-2">Scan via FonePay / eSewa</span>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Account Holder</p>
                      <p className="font-bold text-base text-slate-900">{bankDetails?.accountHolder || 'Dhangadi Top Up Store'}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Bank / Gateway</p>
                      <p className="font-bold text-base text-slate-900">{bankDetails?.bankName || 'Citizens Bank'}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-slate-700">
                      <strong>Tip:</strong> Transfer exactly <strong>NPR {pricingData?.totalPrice}</strong> and put your Player ID in remarks.
                    </div>
                  </div>
                </div>

                {/* Screenshot Upload Dropzone */}
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 block">
                    Upload Payment Screenshot Proof *
                  </label>
                  <label className={`relative group cursor-pointer flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-3xl transition-all duration-300 ${
                    screenshotFile?.length ? 'border-accent bg-blue-50/50' : 'border-slate-300 bg-slate-50 hover:border-accent hover:bg-blue-50/30'
                  }`}>
                    <input 
                      type="file" 
                      {...register('screenshot')}
                      className="hidden"
                      accept="image/*"
                    />
                    <Upload className={`mb-3 transition-colors ${screenshotFile?.length ? 'text-accent' : 'text-slate-400 group-hover:text-accent'}`} size={36} />
                    <p className={`font-bold text-sm text-center ${screenshotFile?.length ? 'text-accent' : 'text-slate-700'}`}>
                      {screenshotFile?.length ? screenshotFile[0].name : "Click to select or drag and drop screenshot"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Accepted: JPG, PNG (Max 5MB)</p>
                  </label>
                  {errors.screenshot && <p className="text-red-500 text-xs mt-2 font-bold text-center">{errors.screenshot.message}</p>}
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-accent-hover text-white font-black py-5 rounded-2xl active:scale-95 transition-all text-lg shadow-xl shadow-accent/25 flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-wider"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Confirm & Submit Order"}
              </button>
            </form>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-[2rem] shadow-sm sticky top-28 space-y-6">
              <h3 className="text-lg font-black text-slate-900 uppercase">Order Summary</h3>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <img src={game.icon} alt={game.name} className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-slate-200 shadow-sm" />
                <div className="truncate">
                  <p className="font-bold text-slate-900 truncate">{game.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">{game.currency}</p>
                </div>
              </div>
              
              <div className="space-y-3 py-4 border-y border-slate-100 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Selected Item</span>
                  <span className="font-bold text-slate-900">
                    {game.supportsQuantity ? `${quantity}x ${game.name} Voucher` : targetPkg.label}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Subtotal</span>
                  <span className="font-bold text-slate-900">NPR {pricingData.totalPrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Delivery Fee</span>
                  <span className="text-emerald-600 font-black uppercase text-xs">FREE</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Due</span>
                  <span className="text-3xl font-black text-accent">NPR {pricingData.totalPrice}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                  Safe & encrypted checkout. Your order is processed instantly upon screenshot validation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
