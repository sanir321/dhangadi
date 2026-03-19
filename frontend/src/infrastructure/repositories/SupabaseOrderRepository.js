import { supabase } from '../../lib/supabase';
import { IOrderRepository } from '../../domain/interfaces/IOrderRepository';
import { Order } from '../../domain/entities/Order';

export class SupabaseOrderRepository extends IOrderRepository {
  /**
   * Helper to handle Supabase errors consistently
   */
  _handleError(error, context) {
    console.error(`Supabase Error [${context}]:`, error.message, error.details);
    throw new Error(`Failed to ${context}: ${error.message}`);
  }

  async create(orderData) {
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        order_id: orderData.orderId,
        game: orderData.gameId,
        game_name: orderData.gameName,
        package_id: orderData.packageId,
        package_label: orderData.packageLabel,
        price: orderData.price,
        cost: orderData.cost,
        player_id: orderData.playerId,
        server_id: orderData.serverId,
        remark: orderData.remark,
        screenshot_url: orderData.screenshotUrl,
        status: orderData.status || 'pending'
      }])
      .select()
      .single();

    if (error) this._handleError(error, 'create order');
    if (!data) throw new Error('Failed to create order: No data returned');
    
    return Order.fromSupabase(data);
  }

  async getByOrderId(orderId) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();

    if (error) this._handleError(error, 'fetch order by ID');
    return data ? Order.fromSupabase(data) : null;
  }

  async getAll() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) this._handleError(error, 'fetch all orders');
    
    return (data || []).map(Order.fromSupabase);
  }
}
