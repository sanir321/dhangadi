import ffIcon from '../assets/freefire.jpeg';
import pubgIcon from '../assets/pubg.jpeg';
import mlIcon from '../assets/mobailelegends.jpeg';
import cocIcon from '../assets/clashofclans.jpeg';
import efootballIcon from '../assets/efootball.jpeg';
import tiktokIcon from '../assets/tiktokcoin.jpeg';
import robloxIcon from '../assets/robolx.jpeg';
import unipinIcon from '../assets/unipin.jpeg';
import qrImage from '../assets/citizens_qr.png';

// Banners
import ffBanner from '../assets/banners/ff_banner.png';
import pubgBanner from '../assets/banners/pubg_banner.png';
import mlBanner from '../assets/banners/ml_banner.png';
import cocBanner from '../assets/banners/coc_banner.png';

// Currency Icons
import ffDiamond from '../assets/currency/ff_diamond.png';
import pubgUC from '../assets/currency/pubg_uc.png';
import mlDiamond from '../assets/currency/ml_diamond.png';
import cocGem from '../assets/currency/coc_gem.png';
import efootballCoin from '../assets/currency/efootball_coin.png';
import tiktokCoin from '../assets/currency/tiktok_coin.png';
import robuxIcon from '../assets/currency/robux.png';

export const games = [
  {
    id: 'free-fire',
    name: 'Free Fire',
    currency: 'Diamonds',
    currencyIcon: ffDiamond,
    idField: 'Player ID',
    icon: ffIcon,
    description: 'Instant Free Fire diamonds delivered directly to your Player ID.',
    themeColor: '#4cc9f0',
    packages: [
      { id: 'ff-115', label: '115 Diamonds', price: 95, cost: 76 },
      { id: 'ff-240', label: '240 Diamonds', price: 195, cost: 156 },
      { id: 'ff-355', label: '355 Diamonds', price: 290, cost: 232 },
      { id: 'ff-480', label: '480 Diamonds', price: 380, cost: 304 },
      { id: 'ff-610', label: '610 Diamonds', price: 480, cost: 384 },
      { id: 'ff-850', label: '850 Diamonds', price: 690, cost: 552 },
      { id: 'ff-1090', label: '1090 Diamonds', price: 880, cost: 704 },
      { id: 'ff-1240', label: '1240 Diamonds', price: 980, cost: 784 },
      { id: 'ff-2530', label: '2530 Diamonds', price: 1850, cost: 1480 },
      { id: 'ff-5060', label: '5060 Diamonds', price: 3750, cost: 3000 },
      { id: 'ff-6300', label: '6300 Diamonds', price: 4750, cost: 3800 },
      { id: 'ff-10120', label: '10120 Diamonds', price: 7700, cost: 6160 },
      { id: 'ff-15680', label: '15680 Diamonds', price: 11250, cost: 9000 },
      { id: 'ff-20240', label: '20240 Diamonds', price: 22500, cost: 18000 },
      { id: 'ff-weekly', label: 'Weekly Membership', price: 195, cost: 156 },
      { id: 'ff-monthly', label: 'Monthly Membership', price: 960, cost: 768 },
      { id: 'ff-levelup', label: 'Level up Pass', price: 570, cost: 456 },
    ]
  },
  {
    id: 'pubg-mobile',
    name: 'PUBG Mobile',
    currency: 'UC',
    currencyIcon: pubgUC,
    idField: 'Character ID',
    icon: pubgIcon,
    description: 'Official PUBG Mobile UC top-up for global and global-kr versions.',
    themeColor: '#ffb703',
    packages: [
      { id: 'pubg-60', label: '60 UC', price: 130, cost: 104 },
      { id: 'pubg-180', label: '180 UC', price: 390, cost: 312 },
      { id: 'pubg-325', label: '325 UC', price: 650, cost: 520 },
      { id: 'pubg-385', label: '385 UC', price: 780, cost: 624 },
      { id: 'pubg-660', label: '660 UC', price: 1300, cost: 1040 },
      { id: 'pubg-985', label: '985 UC', price: 1800, cost: 1440 },
      { id: 'pubg-1320', label: '1320 UC', price: 2600, cost: 2080 },
      { id: 'pubg-1800', label: '1800 UC', price: 3250, cost: 2600 },
      { id: 'pubg-3850', label: '3850 UC', price: 6500, cost: 5200 },
      { id: 'pubg-8100', label: '8100 UC', price: 12900, cost: 10320 },
    ]
  },
  {
    id: 'mobile-legends',
    name: 'Mobile Legends',
    currency: 'Diamonds',
    currencyIcon: mlDiamond,
    idField: 'Player ID',
    serverRequired: true,
    icon: mlIcon,
    description: 'Fast and secure MLBB diamonds top-up with zero waiting time.',
    themeColor: '#7209b7',
    packages: [
      { id: 'ml-86', label: '86 Diamonds', price: 175, cost: 140 },
      { id: 'ml-172', label: '172 Diamonds', price: 345, cost: 276 },
      { id: 'ml-257', label: '257 Diamonds', price: 500, cost: 400 },
      { id: 'ml-514', label: '514 Diamonds', price: 1000, cost: 800 },
      { id: 'ml-570', label: '570 Diamonds', price: 1175, cost: 940 },
      { id: 'ml-706', label: '706 Diamonds', price: 1350, cost: 1080 },
      { id: 'ml-1050', label: '1050 Diamonds', price: 2040, cost: 1632 },
      { id: 'ml-1412', label: '1412 Diamonds', price: 2700, cost: 2160 },
      { id: 'ml-3688', label: '3688 Diamonds', price: 6750, cost: 5400 },
      { id: 'ml-9288', label: '9288 Diamonds', price: 16699, cost: 13359 },
      { id: 'ml-weekly', label: 'Weekly Diamond Pass', price: 230, cost: 184 },
      { id: 'ml-twilight', label: 'Twilight Pass', price: 1170, cost: 936 },
    ]
  },
  {
    id: 'clash-of-clans',
    name: 'Clash of Clans',
    currency: 'Gems',
    currencyIcon: cocGem,
    idField: 'Player Tag',
    icon: cocIcon,
    description: 'Clash of Clans gems delivered to your village within minutes.',
    themeColor: '#fb8500',
    packages: [
      { id: 'coc-80', label: '80 Gems', price: 200, cost: 160 },
      { id: 'coc-500', label: '500 Gems', price: 1200, cost: 960 },
      { id: 'coc-1200', label: '1200 Gems', price: 2800, cost: 2240 },
      { id: 'coc-2500', label: '2500 Gems', price: 5800, cost: 4640 },
      { id: 'coc-6500', label: '6500 Gems', price: 15000, cost: 12000 },
      { id: 'coc-14000', label: '14000 Gems', price: 32000, cost: 25600 },
    ]
  },
  {
    id: 'efootball',
    name: 'eFootball',
    currency: 'Coins',
    currencyIcon: efootballCoin,
    idField: 'Konami ID',
    icon: efootballIcon,
    description: 'Get eFootball coins for the ultimate Dream Team experience.',
    themeColor: '#3a0ca3',
    packages: [
      { id: 'ef-130', label: '130 Coins', price: 160, cost: 128 },
      { id: 'ef-260', label: '260 Coins', price: 330, cost: 264 },
      { id: 'ef-390', label: '390 Coins', price: 520, cost: 416 },
      { id: 'ef-550', label: '550 Coins', price: 670, cost: 536 },
      { id: 'ef-1040', label: '1040 Coins', price: 1200, cost: 960 },
      { id: 'ef-1590', label: '1590 Coins', price: 1890, cost: 1512 },
      { id: 'ef-2140', label: '2140 Coins', price: 2450, cost: 1960 },
      { id: 'ef-3250', label: '3250 Coins', price: 3700, cost: 2960 },
      { id: 'ef-5700', label: '5700 Coins', price: 6200, cost: 4960 },
      { id: 'ef-12800', label: '12800 Coins', price: 12600, cost: 10080 },
    ]
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    currency: 'Coins',
    currencyIcon: tiktokCoin,
    idField: 'TikTok Username',
    icon: tiktokIcon,
    description: 'Secure TikTok coins top-up for supporting your favorite creators.',
    themeColor: '#ff0050',
    packages: [
      { id: 'tt-70', label: '70 Coins', price: 125, cost: 100 },
      { id: 'tt-140', label: '140 Coins', price: 230, cost: 184 },
      { id: 'tt-210', label: '210 Coins', price: 360, cost: 288 },
      { id: 'tt-350', label: '350 Coins', price: 600, cost: 480 },
      { id: 'tt-420', label: '420 Coins', price: 725, cost: 580 },
      { id: 'tt-560', label: '560 Coins', price: 955, cost: 764 },
      { id: 'tt-700', label: '700 Coins', price: 1190, cost: 952 },
      { id: 'tt-840', label: '840 Coins', price: 1420, cost: 1136 },
      { id: 'tt-1050', label: '1050 Coins', price: 1750, cost: 1400 },
      { id: 'tt-1400', label: '1400 Coins', price: 2350, cost: 1880 },
      { id: 'tt-2100', label: '2100 Coins', price: 3540, cost: 2832 },
      { id: 'tt-2800', label: '2800 Coins', price: 4700, cost: 3760 },
    ]
  },
  {
    id: 'roblox',
    name: 'Roblox',
    currency: 'Robux',
    currencyIcon: robuxIcon,
    idField: 'Roblox Username',
    icon: robloxIcon,
    description: 'Official Roblox Robux for accessories, games, and more.',
    themeColor: '#f72585',
    packages: [
      { id: 'rb-400', label: '400 Robux', price: 680, cost: 544 },
      { id: 'rb-800', label: '800 Robux', price: 1200, cost: 960 },
      { id: 'rb-1600', label: '1600 Robux', price: 2400, cost: 1920 },
      { id: 'rb-2400', label: '2400 Robux', price: 3600, cost: 2880 },
      { id: 'rb-4500', label: '4500 Robux', price: 5600, cost: 4480 },
      { id: 'rb-9000', label: '9000 Robux', price: 11200, cost: 8960 },
      { id: 'rb-13500', label: '13500 Robux', price: 16800, cost: 13440 },
      { id: 'rb-18000', label: '18000 Robux', price: 22400, cost: 17920 },
    ]
  },
  {
    id: 'unipin',
    name: 'UniPin',
    currency: 'Voucher',
    currencyIcon: null,
    idField: 'UniPin ID / Email',
    icon: unipinIcon,
    description: 'UniPin vouchers for wide variety of online games and services.',
    themeColor: '#3a86ff',
    supportsQuantity: true,
    pricing: {
      basePrice: 2190,
      tieredPrice: 2140,
      tierThreshold: 5,
      costPerUnit: 1712 // 80% of tiered price as a guestimate or similar to before
    },
    packages: [
      { id: 'uni-base', label: '1 UniPin Voucher', price: 2190, cost: 1752 },
    ]
  }
];

// Bank details for payment

export const bankDetails = {
  bankName: 'Citizens Bank',
  accountHolder: 'Dhangadi Top Up Store',
  qrImage: qrImage
};

export const contactDetails = {
  whatsapp: '+91 93156 96727',
  whatsappLink: 'https://wa.me/919315696727',
  facebookLink: 'https://www.facebook.com/profile.php?id=61557869606001',
  email: 'support@dhangaditopup.com.np'
};

// Announcement or Nano Banner data
export const announcement = {
  active: true,
  text: '🎉 Welcome to Dhangadi Top Up Store! Instant Delivery Enabled for all Mobile Top-ups. Safe & Secure transactions.',
};

// Marquee images for the homepage
export const marqueeImages = [
  ffBanner,
  pubgBanner,
  mlBanner,
  cocBanner,
  ffIcon,
  pubgIcon,
  mlIcon,
  cocIcon,
  efootballIcon,
  tiktokIcon,
  robloxIcon,
  unipinIcon,
];
