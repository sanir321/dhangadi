export class PlaceOrder {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(orderData) {
    if (!orderData.playerId) {
      throw new Error('Player ID is required to place an order');
    }
    
    return await this.orderRepository.create(orderData);
  }
}
