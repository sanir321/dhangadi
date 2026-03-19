export class TrackOrder {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(orderId) {
    if (!orderId) throw new Error('Order ID is required');
    return await this.orderRepository.getByOrderId(orderId);
  }
}
