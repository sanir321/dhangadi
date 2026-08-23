import React, { useState } from 'react';
import { useStoreSettings } from '../../../context/StoreSettingsContext';
import { 
  QrCode, Upload, Save, Sparkles, MessageCircle, 
  Facebook, Mail, Flame, Gift, Eye, Loader2, CheckCircle2,
  AlertCircle, Smartphone, HelpCircle
} from 'lucide-react';
import imageCompression from 'browser-image-compression';
import toast from 'react-hot-toast';
import ExitOfferModal from '../../../components/ExitOfferModal';

export const StoreSettingsManager = () => {
  const { bankDetails, contactDetails, announcement, exitOffer, updateSetting, uploadQR } = useStoreSettings();

  // Local state forms
  const [bankForm, setBankForm] = useState({ ...bankDetails });
  const [contactForm, setContactForm] = useState({ ...contactDetails });
  const [announcementForm, setAnnouncementForm] = useState({ ...announcement });
  const [exitOfferForm, setExitOfferForm] = useState({ ...exitOffer });

  const [uploadingQR, setUploadingQR] = useState(false);
  const [savingSection, setSavingSection] = useState(null);
  const [showExitPreview, setShowExitPreview] = useState(false);

  // Sync state if context updates
  React.useEffect(() => {
    setBankForm({ ...bankDetails });
  }, [bankDetails]);

  React.useEffect(() => {
    setContactForm({ ...contactDetails });
  }, [contactDetails]);

  React.useEffect(() => {
    setAnnouncementForm({ ...announcement });
  }, [announcement]);

  React.useEffect(() => {
    setExitOfferForm({ ...exitOffer });
  }, [exitOffer]);

  // Handle QR Image File Upload
  const handleQRUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingQR(true);
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.8, maxWidthOrHeight: 1000 });
      const publicUrl = await uploadQR(compressed);
      setBankForm(prev => ({ ...prev, qrImage: publicUrl }));
      toast.success('QR Code image uploaded! Click Save to apply.');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to upload QR Code.');
    } finally {
      setUploadingQR(false);
    }
  };

  // Save specific settings section
  const handleSave = async (sectionId, payload) => {
    setSavingSection(sectionId);
    try {
      await updateSetting(sectionId, payload);
      toast.success('Settings updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to update settings.');
    } finally {
      setSavingSection(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* 1. PAYMENT QR CODE & BANK INFORMATION */}
      <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-accent flex items-center justify-center border border-blue-100">
              <QrCode size={22} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Payment QR Code & Bank Details</h3>
              <p className="text-xs text-slate-400 font-medium">Customize the payment QR code and bank info shown to customers</p>
            </div>
          </div>

          <button
            onClick={() => handleSave('bank_details', bankForm)}
            disabled={savingSection === 'bank_details'}
            className="px-6 py-3 rounded-2xl bg-accent hover:bg-accent-hover text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md shadow-accent/20 disabled:opacity-50"
          >
            {savingSection === 'bank_details' ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Payment Info
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* QR Preview & Upload Box */}
          <div className="lg:col-span-5 space-y-4">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block">
              Payment QR Code Image
            </label>

            <div className="bg-slate-50 p-5 rounded-3xl w-fit mx-auto lg:mx-0 shadow-inner border-2 border-slate-200 flex flex-col items-center">
              {bankForm.qrImage ? (
                <img
                  src={bankForm.qrImage}
                  alt="Current QR Code"
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl"
                />
              ) : (
                <div className="w-48 h-48 flex flex-col items-center justify-center text-slate-400">
                  <QrCode size={70} className="mb-2" />
                  <span className="text-xs font-bold">No QR Uploaded</span>
                </div>
              )}
            </div>

            <label className="relative cursor-pointer flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 text-center shadow-sm">
              <input
                type="file"
                accept="image/*"
                onChange={handleQRUpload}
                disabled={uploadingQR}
                className="hidden"
              />
              {uploadingQR ? (
                <>
                  <Loader2 size={16} className="animate-spin text-accent" />
                  <span>Uploading QR...</span>
                </>
              ) : (
                <>
                  <Upload size={16} className="text-accent" />
                  <span>Upload / Replace QR Image</span>
                </>
              )}
            </label>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">
                Or Paste Image URL Directly:
              </label>
              <input
                type="text"
                value={bankForm.qrImage || ''}
                onChange={(e) => setBankForm({ ...bankForm, qrImage: e.target.value })}
                placeholder="https://..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:border-accent focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* Bank & Account Inputs */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1 block">
                Bank / Payment Gateway Name *
              </label>
              <input
                type="text"
                value={bankForm.bankName || ''}
                onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                placeholder="e.g. Citizens Bank / eSewa / FonePay"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm font-bold text-slate-900 focus:border-accent focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1 block">
                Account Holder Name *
              </label>
              <input
                type="text"
                value={bankForm.accountHolder || ''}
                onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                placeholder="e.g. Dhangadi Top Up Store"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm font-bold text-slate-900 focus:border-accent focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1 block">
                Payment Guidance / Remarks Instructions
              </label>
              <textarea
                value={bankForm.instructions || ''}
                onChange={(e) => setBankForm({ ...bankForm, instructions: e.target.value })}
                placeholder="e.g. Please put your Player ID in remarks and upload screenshot."
                className="w-full h-24 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-800 focus:border-accent focus:bg-white outline-none resize-none"
              />
            </div>
          </div>

        </div>
      </div>

      {/* 2. PROMOTIONAL OFFER POP-UP CARD */}
      <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Gift size={22} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Promotional Offer Pop-up Card</h3>
              <p className="text-xs text-slate-400 font-medium">Shown to visitors when entering the site or attempting to leave</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowExitPreview(true)}
              className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              <Eye size={15} className="text-accent" /> Preview Modal
            </button>
            <button
              onClick={() => handleSave('exit_offer', exitOfferForm)}
              disabled={savingSection === 'exit_offer'}
              className="px-6 py-3 rounded-2xl bg-accent hover:bg-accent-hover text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md shadow-accent/20 disabled:opacity-50"
            >
              {savingSection === 'exit_offer' ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Offer Card
            </button>
          </div>
        </div>

        {/* Active Switch & Trigger Behavior */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <p className="font-bold text-sm text-slate-900">Enable Offer Pop-up</p>
              <p className="text-xs text-slate-500">Master on/off switch</p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={!!exitOfferForm.active}
                onChange={(e) => setExitOfferForm({ ...exitOfferForm, active: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-13 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-slate-900">Trigger Behavior</p>
              <p className="text-xs text-slate-500">When should the card show</p>
            </div>
            <select
              value={exitOfferForm.triggerMode || 'both'}
              onChange={(e) => setExitOfferForm({ ...exitOfferForm, triggerMode: e.target.value })}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-accent shadow-sm"
            >
              <option value="both">Both (On Entry & Exit)</option>
              <option value="entry">On Site Entry Only</option>
              <option value="exit">On Exit Intent Only</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1 block">
              Minimum Purchase Amount (NPR)
            </label>
            <input
              type="text"
              value={exitOfferForm.minSpend || '2000'}
              onChange={(e) => setExitOfferForm({ ...exitOfferForm, minSpend: e.target.value })}
              placeholder="2000"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm font-black text-slate-900 focus:border-accent focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1 block">
              Free Reward Label
            </label>
            <input
              type="text"
              value={exitOfferForm.reward || '1 Free Weekly Pass'}
              onChange={(e) => setExitOfferForm({ ...exitOfferForm, reward: e.target.value })}
              placeholder="1 Free Weekly Pass"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm font-bold text-emerald-700 focus:border-accent focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1 block">
              Offer Badge Text
            </label>
            <input
              type="text"
              value={exitOfferForm.badge || '🎁 SPECIAL MEGA BONUS'}
              onChange={(e) => setExitOfferForm({ ...exitOfferForm, badge: e.target.value })}
              placeholder="🎁 SPECIAL MEGA BONUS"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm font-bold text-slate-900 focus:border-accent focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1 block">
              Headline Title
            </label>
            <input
              type="text"
              value={exitOfferForm.title || 'Buy Over NPR 2,000 = Get 1 FREE Weekly!'}
              onChange={(e) => setExitOfferForm({ ...exitOfferForm, title: e.target.value })}
              placeholder="Buy Over NPR 2,000 = Get 1 FREE Weekly!"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm font-bold text-slate-900 focus:border-accent focus:bg-white outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1 block">
              Offer Description Text
            </label>
            <textarea
              value={exitOfferForm.description || ''}
              onChange={(e) => setExitOfferForm({ ...exitOfferForm, description: e.target.value })}
              placeholder="Top up for NPR 2,000 or more on any game today and receive 1 Free Weekly Pass completely free!"
              className="w-full h-20 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-800 focus:border-accent focus:bg-white outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1 block">
              Action Button Text
            </label>
            <input
              type="text"
              value={exitOfferForm.buttonText || 'Claim Free Weekly on WhatsApp'}
              onChange={(e) => setExitOfferForm({ ...exitOfferForm, buttonText: e.target.value })}
              placeholder="Claim Free Weekly on WhatsApp"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm font-bold text-slate-900 focus:border-accent focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1 block">
              Pre-filled WhatsApp Message
            </label>
            <input
              type="text"
              value={exitOfferForm.whatsappMessage || ''}
              onChange={(e) => setExitOfferForm({ ...exitOfferForm, whatsappMessage: e.target.value })}
              placeholder="Hi! I want to order over NPR 2000 and claim 1 Free Weekly Pass!"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-900 focus:border-accent focus:bg-white outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. STORE ANNOUNCEMENT BAR */}
      <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Sparkles size={22} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Top Announcement Banner</h3>
              <p className="text-xs text-slate-400 font-medium">Shows at the very top of all store pages</p>
            </div>
          </div>

          <button
            onClick={() => handleSave('announcement', announcementForm)}
            disabled={savingSection === 'announcement'}
            className="px-6 py-3 rounded-2xl bg-accent hover:bg-accent-hover text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md shadow-accent/20 disabled:opacity-50"
          >
            {savingSection === 'announcement' ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Banner
          </button>
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <p className="font-bold text-sm text-slate-900">Banner Active Status</p>
            <p className="text-xs text-slate-500">Toggle whether the top blue announcement bar is displayed</p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!!announcementForm.active}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, active: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-13 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-accent"></div>
          </label>
        </div>

        <div>
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1 block">
            Announcement Message Text
          </label>
          <textarea
            value={announcementForm.text || ''}
            onChange={(e) => setAnnouncementForm({ ...announcementForm, text: e.target.value })}
            placeholder="e.g. 🎉 Welcome to Dhangadi Store! Instant Top-Up Delivery is active 24/7."
            className="w-full h-20 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-900 focus:border-accent focus:bg-white outline-none resize-none"
          />
        </div>
      </div>

      {/* 4. CONTACT & SOCIAL MEDIA */}
      <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-accent flex items-center justify-center border border-blue-100">
              <MessageCircle size={22} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Contact & Support Channels</h3>
              <p className="text-xs text-slate-400 font-medium">Manage your WhatsApp support number, Facebook page, and email links</p>
            </div>
          </div>

          <button
            onClick={() => handleSave('contact_details', contactForm)}
            disabled={savingSection === 'contact_details'}
            className="px-6 py-3 rounded-2xl bg-accent hover:bg-accent-hover text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md shadow-accent/20 disabled:opacity-50"
          >
            {savingSection === 'contact_details' ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Contact Details
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1 block">
              WhatsApp Support Number
            </label>
            <input
              type="text"
              value={contactForm.whatsapp || ''}
              onChange={(e) => {
                const val = e.target.value;
                const cleanDigits = val.replace(/[^0-9]/g, '');
                setContactForm({ 
                  ...contactForm, 
                  whatsapp: val,
                  whatsappLink: `https://wa.me/${cleanDigits}`
                });
              }}
              placeholder="+91 93156 96727"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm font-bold text-slate-900 focus:border-accent focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1 block">
              WhatsApp Direct Link
            </label>
            <input
              type="text"
              value={contactForm.whatsappLink || ''}
              onChange={(e) => setContactForm({ ...contactForm, whatsappLink: e.target.value })}
              placeholder="https://wa.me/919315696727"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-900 focus:border-accent focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1 block">
              Facebook Page Link
            </label>
            <input
              type="text"
              value={contactForm.facebookLink || ''}
              onChange={(e) => setContactForm({ ...contactForm, facebookLink: e.target.value })}
              placeholder="https://www.facebook.com/..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-900 focus:border-accent focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1 block">
              Support Email
            </label>
            <input
              type="email"
              value={contactForm.email || ''}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              placeholder="support@dhangaditopup.com.np"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-900 focus:border-accent focus:bg-white outline-none"
            />
          </div>
        </div>
      </div>

      {/* Force Preview Modal */}
      {showExitPreview && (
        <ExitOfferModal
          forceOpen={true}
          onCloseForce={() => setShowExitPreview(false)}
        />
      )}

    </div>
  );
};
