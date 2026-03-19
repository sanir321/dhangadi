import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function useAdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'orders'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setOrders(prev => [payload.new, ...prev]);
          toast.success(`New order: ${payload.new.order_id}`, { icon: '🛒' });
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
  }, []);

  async function fetchOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }

  const [processingIds, setProcessingIds] = useState(new Set());

  async function updateOrderStatus(orderId, status, metadata = {}) {
    if (processingIds.has(orderId)) return;
    
    // Find matching order to check current status
    const order = orders.find(o => o.id === orderId);
    if (order && (order.status === 'completed' || order.status === 'failed')) {
      toast.error("Order is already finalized");
      return;
    }

    setProcessingIds(prev => new Set(prev).add(orderId));
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, ...metadata, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      
      if (error) throw error;
      toast.success(`Order marked as ${status}`);
    } catch (err) {
      console.error(err);
      toast.error("Status update failed");
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  }

  return { orders, loading, updateOrderStatus, processingIds };
}
