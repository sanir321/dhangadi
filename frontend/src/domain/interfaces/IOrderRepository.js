/**
 * @interface IOrderRepository
 */
export class IOrderRepository {
  async create(orderData) { throw new Error('Method not implemented'); }
  async getByOrderId(orderId) { throw new Error('Method not implemented'); }
  async getAll() { throw new Error('Method not implemented'); }
}
