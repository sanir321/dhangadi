import { supabase } from '../../lib/supabase';
import { bankDetails as defaultBank, contactDetails as defaultContact, announcement as defaultAnnouncement } from '../../data/games';

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

export class SupabaseSettingsRepository {
  async getAllSettings() {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error || !data || data.length === 0) {
        if (error) console.warn('Supabase settings fallback:', error.message);
        return {
          bank_details: defaultBank,
          contact_details: defaultContact,
          announcement: defaultAnnouncement,
          exit_offer: defaultExitOffer,
        };
      }

      const settingsMap = {
        bank_details: defaultBank,
        contact_details: defaultContact,
        announcement: defaultAnnouncement,
        exit_offer: defaultExitOffer,
      };

      data.forEach(item => {
        if (item.id === 'bank_details') {
          // If qrImage is empty in DB, fallback to default local QR
          settingsMap.bank_details = {
            ...defaultBank,
            ...item.value,
            qrImage: item.value?.qrImage || defaultBank.qrImage,
          };
        } else {
          settingsMap[item.id] = item.value;
        }
      });

      return settingsMap;
    } catch (err) {
      console.warn('Failed to load settings from Supabase, using defaults:', err);
      return {
        bank_details: defaultBank,
        contact_details: defaultContact,
        announcement: defaultAnnouncement,
        exit_offer: defaultExitOffer,
      };
    }
  }

  async updateSetting(id, value) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .upsert([{
          id,
          value,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error(`Failed to update setting ${id}:`, error);
        throw new Error(error.message);
      }

      return data?.value || value;
    } catch (err) {
      console.error('Update setting error:', err);
      throw err;
    }
  }

  async uploadQRImage(file) {
    try {
      const fileName = `qr-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const { error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('screenshots')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      console.error('Failed to upload QR image:', err);
      throw err;
    }
  }
}
