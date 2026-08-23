import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function useAdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);

  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      // Audio chime using Web Audio API (zero external asset dependency)
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }, [soundEnabled]);

  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'orders'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setOrders(prev => [payload.new, ...prev]);
          playNotificationSound();
          toast.success(`🛒 New order: ${payload.new.order_id} (NPR ${payload.new.price})`, {
            duration: 6000,
            style: { border: '2px solid #2563EB' }
          });
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new : o));
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders, playNotificationSound]);

  async function updateOrderStatus(orderId, status, metadata = {}) {
    if (processingIds.has(orderId)) return;

    setProcessingIds(prev => new Set(prev).add(orderId));
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status, 
          ...metadata, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId);
      
      if (error) throw error;
      toast.success(`Order marked as ${status}`);
    } catch (err) {
      console.error(err);
      toast.error(`Status update failed: ${err.message}`);
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  }

  async function deleteOrder(orderId) {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      setOrders(prev => prev.filter(o => o.id !== orderId));
      toast.success('Order deleted from database');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete order');
    }
  }

  return { 
    orders, 
    loading, 
    updateOrderStatus, 
    deleteOrder, 
    refetchOrders: fetchOrders,
    processingIds,
    soundEnabled,
    setSoundEnabled
  };
}
