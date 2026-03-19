export const generateProductSchema = (game) => {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": game.name,
    "image": game.icon,
    "description": game.description,
    "brand": {
      "@type": "Brand",
      "name": "DN Official"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "NPR",
      "lowPrice": game.packages[0].price,
      "highPrice": game.packages[game.packages.length - 1].price,
      "offerCount": game.packages.length
    }
  };
};
