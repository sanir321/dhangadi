import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useDependencies } from '../DependencyContext';
import { supabase } from '../lib/supabase';
import { bankDetails as defaultBank, contactDetails as defaultContact, announcement as defaultAnnouncement } from '../data/games';

const defaultExitOffer = {
  active: true,
  badge: '⚡ SPECIAL BONUS OFFER',
  title: "Wait! Don't Leave Empty Handed!",
  description: 'Get an instant discount & priority VIP delivery on your top-up order right now!',
  promoCode: 'DHANGADI5',
  discountPercent: '5% OFF',
  buttonText: 'Claim Bonus on WhatsApp',
  whatsappMessage: 'Hi Dhangadi Top Up, I want to claim the 5% discount offer with code DHANGADI5!',
};

const StoreSettingsContext = createContext(null);

export const StoreSettingsProvider = ({ children }) => {
  const { settingsRepository } = useDependencies();
  const [bankDetails, setBankDetails] = useState(defaultBank);
  const [contactDetails, setContactDetails] = useState(defaultContact);
  const [announcement, setAnnouncement] = useState(defaultAnnouncement);
  const [exitOffer, setExitOffer] = useState(defaultExitOffer);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const all = await settingsRepository.getAllSettings();
      if (all.bank_details) setBankDetails(all.bank_details);
      if (all.contact_details) setContactDetails(all.contact_details);
      if (all.announcement) setAnnouncement(all.announcement);
      if (all.exit_offer) setExitOffer(all.exit_offer);
    } catch (err) {
      console.warn('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  }, [settingsRepository]);

  useEffect(() => {
    fetchSettings();

    // Subscribe to Supabase Realtime changes on site_settings
    const channel = supabase
      .channel('site_settings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings' },
        (payload) => {
          if (payload.new && payload.new.id) {
            const { id, value } = payload.new;
            if (id === 'bank_details') {
              setBankDetails(prev => ({ ...prev, ...value, qrImage: value?.qrImage || prev.qrImage }));
            } else if (id === 'contact_details') {
              setContactDetails(value);
            } else if (id === 'announcement') {
              setAnnouncement(value);
            } else if (id === 'exit_offer') {
              setExitOffer(value);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSettings]);

  const updateSetting = async (id, value) => {
    const res = await settingsRepository.updateSetting(id, value);
    if (id === 'bank_details') setBankDetails(res);
    if (id === 'contact_details') setContactDetails(res);
    if (id === 'announcement') setAnnouncement(res);
    if (id === 'exit_offer') setExitOffer(res);
    return res;
  };

  const uploadQR = async (file) => {
    return await settingsRepository.uploadQRImage(file);
  };

  return (
    <StoreSettingsContext.Provider
      value={{
        bankDetails,
        contactDetails,
        announcement,
        exitOffer,
        loading,
        updateSetting,
        uploadQR,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </StoreSettingsContext.Provider>
  );
};

export const useStoreSettings = () => {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    throw new Error('useStoreSettings must be used within a StoreSettingsProvider');
  }
  return context;
};
