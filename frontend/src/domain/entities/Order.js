export class Order {
  constructor({ 
    id, 
    orderId, 
    game, 
    gameName, 
    packageId, 
    packageLabel, 
    price, 
    cost, 
    playerId, 
    serverId = null, 
    remark = '', 
    screenshotUrl = '', 
    status = 'pending',
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id;
    this.orderId = orderId;
    this.game = game;
    this.gameName = gameName;
    this.packageId = packageId;
    this.packageLabel = packageLabel;
    this.price = price;
    this.cost = cost;
    this.playerId = playerId;
    this.serverId = serverId;
    this.remark = remark;
    this.screenshotUrl = screenshotUrl;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  get profit() {
    return this.price - this.cost;
  }

  static fromSupabase(data) {
    return new Order({
      id: data.id,
      orderId: data.order_id,
      game: data.game,
      gameName: data.game_name,
      packageId: data.package_id,
      packageLabel: data.package_label,
      price: data.price,
      cost: data.cost,
      playerId: data.player_id,
      serverId: data.server_id,
      remark: data.remark,
      screenshotUrl: data.screenshot_url,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    });
  }
}
