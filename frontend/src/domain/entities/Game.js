export class Game {
  constructor({
    id,
    name,
    currency,
    idField = 'Player ID',
    icon,
    currencyIcon = null,
    banner = null,
    description = '',
    packages = [],
    serverRequired = false,
    themeColor = '#4cc9f0',
    supportsQuantity = false,
    pricing = null,
    isActive = true,
    sortOrder = 0,
  }) {
    this.id = id;
    this.name = name;
    this.currency = currency;
    this.idField = idField;
    this.icon = icon;
    this.currencyIcon = currencyIcon;
    this.banner = banner;
    this.description = description;
    this.packages = (packages || []).map(pkg => new Package(pkg));
    this.serverRequired = !!serverRequired;
    this.themeColor = themeColor || '#4cc9f0';
    this.supportsQuantity = !!supportsQuantity;
    this.pricing = pricing;
    this.isActive = isActive !== false;
    this.sortOrder = sortOrder || 0;
  }
}

export class Package {
  constructor({ id, label, price, cost = 0 }) {
    this.id = id;
    this.label = label;
    this.price = Number(price) || 0;
    this.cost = Number(cost) || 0;
  }

  get profit() {
    return this.price - this.cost;
  }
}
