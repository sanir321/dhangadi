export class Game {
  constructor({ id, name, currency, idField, icon, description, packages, serverRequired = false, themeColor, supportsQuantity = false, pricing = null }) {
    this.id = id;
    this.name = name;
    this.currency = currency;
    this.idField = idField;
    this.icon = icon;
    this.description = description;
    this.packages = packages.map(pkg => new Package(pkg));
    this.serverRequired = serverRequired;
    this.themeColor = themeColor;
    this.supportsQuantity = supportsQuantity;
    this.pricing = pricing;
  }
}

export class Package {
  constructor({ id, label, price, cost }) {
    this.id = id;
    this.label = label;
    this.price = price;
    this.cost = cost;
  }

  get profit() {
    return this.price - this.cost;
  }
}
