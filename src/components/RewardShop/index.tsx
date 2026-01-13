// RewardShop - Engagement-driving store with pets, costumes, and power-ups
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShopItem, ShopItemCategory, GameState, GameAction } from '../../types';

// ============================================
// Shop Data
// ============================================
const SHOP_ITEMS: ShopItem[] = [
  // Pets
  {
    id: 'pet-sparkle-dragon',
    name: 'Sparkle Dragon',
    description: 'A tiny dragon that celebrates your correct answers with fireworks!',
    category: 'pet',
    cost: 50,
    imageUrl: '/images/shop/sparkle-dragon.png',
    emoji: '🐉',
    rarity: 'rare',
  },
  {
    id: 'pet-rainbow-unicorn',
    name: 'Rainbow Unicorn',
    description: 'Leaves a trail of sparkles and gives bonus hints!',
    category: 'pet',
    cost: 100,
    imageUrl: '/images/shop/rainbow-unicorn.png',
    emoji: '🦄',
    rarity: 'epic',
  },
  {
    id: 'pet-wise-owl',
    name: 'Wise Owl',
    description: 'Hoots encouragement and helps with tricky sounds!',
    category: 'pet',
    cost: 30,
    imageUrl: '/images/shop/wise-owl.png',
    emoji: '🦉',
    rarity: 'common',
  },
  {
    id: 'pet-magic-cat',
    name: 'Magic Cat',
    description: 'Purrs when you get answers right and does tricks!',
    category: 'pet',
    cost: 40,
    imageUrl: '/images/shop/magic-cat.png',
    emoji: '🐱',
    rarity: 'common',
  },
  {
    id: 'pet-phoenix',
    name: 'Baby Phoenix',
    description: 'Rises from flames when you complete a level!',
    category: 'pet',
    cost: 200,
    imageUrl: '/images/shop/phoenix.png',
    emoji: '🔥',
    rarity: 'legendary',
  },
  
  // Costumes
  {
    id: 'costume-wizard',
    name: 'Wizard Robes',
    description: 'Dress your character as a powerful word wizard!',
    category: 'costume',
    cost: 60,
    imageUrl: '/images/shop/wizard-costume.png',
    emoji: '🧙',
    rarity: 'rare',
  },
  {
    id: 'costume-superhero',
    name: 'Super Reader Cape',
    description: 'Become a reading superhero with this magical cape!',
    category: 'costume',
    cost: 45,
    imageUrl: '/images/shop/superhero-costume.png',
    emoji: '🦸',
    rarity: 'common',
  },
  {
    id: 'costume-astronaut',
    name: 'Space Explorer Suit',
    description: 'Explore phonics in outer space!',
    category: 'costume',
    cost: 80,
    imageUrl: '/images/shop/astronaut-costume.png',
    emoji: '👨‍🚀',
    rarity: 'rare',
  },
  {
    id: 'costume-crown',
    name: 'Royal Crown',
    description: 'Rule the Phonics Kingdom with this golden crown!',
    category: 'costume',
    cost: 150,
    imageUrl: '/images/shop/crown.png',
    emoji: '👑',
    rarity: 'epic',
  },
  
  // Decor
  {
    id: 'decor-rainbow-trail',
    name: 'Rainbow Trail',
    description: 'Leave a colorful rainbow wherever you go!',
    category: 'decor',
    cost: 25,
    imageUrl: '/images/shop/rainbow-trail.png',
    emoji: '🌈',
    rarity: 'common',
  },
  {
    id: 'decor-star-burst',
    name: 'Star Burst Effect',
    description: 'Stars explode around you on correct answers!',
    category: 'decor',
    cost: 35,
    imageUrl: '/images/shop/star-burst.png',
    emoji: '✨',
    rarity: 'common',
  },
  {
    id: 'decor-confetti',
    name: 'Celebration Confetti',
    description: 'Confetti showers when you complete levels!',
    category: 'decor',
    cost: 40,
    imageUrl: '/images/shop/confetti.png',
    emoji: '🎊',
    rarity: 'rare',
  },
  
  // Power-ups
  {
    id: 'powerup-hint-pack',
    name: 'Hint Pack (5)',
    description: 'Get 5 extra hints for tricky questions!',
    category: 'powerup',
    cost: 15,
    imageUrl: '/images/shop/hint-pack.png',
    emoji: '💡',
    rarity: 'common',
  },
  {
    id: 'powerup-double-stars',
    name: 'Double Stars (1 day)',
    description: 'Earn double stars for 24 hours!',
    category: 'powerup',
    cost: 50,
    imageUrl: '/images/shop/double-stars.png',
    emoji: '⭐',
    rarity: 'rare',
  },
  {
    id: 'powerup-slow-motion',
    name: 'Slow-Mo Mode',
    description: 'Slow down fast games for 3 rounds!',
    category: 'powerup',
    cost: 20,
    imageUrl: '/images/shop/slow-motion.png',
    emoji: '🐢',
    rarity: 'common',
  },
];

const CATEGORY_INFO: Record<ShopItemCategory, { label: string; emoji: string; color: string }> = {
  pet: { label: 'Pets', emoji: '🐾', color: 'from-pink-500 to-rose-500' },
  costume: { label: 'Costumes', emoji: '👗', color: 'from-purple-500 to-indigo-500' },
  decor: { label: 'Decor', emoji: '✨', color: 'from-amber-500 to-orange-500' },
  powerup: { label: 'Power-ups', emoji: '⚡', color: 'from-cyan-500 to-blue-500' },
};

const RARITY_COLORS: Record<string, string> = {
  common: 'bg-gray-100 text-gray-700 border-gray-300',
  rare: 'bg-blue-100 text-blue-700 border-blue-300',
  epic: 'bg-purple-100 text-purple-700 border-purple-300',
  legendary: 'bg-amber-100 text-amber-700 border-amber-300',
};

interface RewardShopProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const RewardShop: React.FC<RewardShopProps> = ({ state, dispatch }) => {
  const [selectedCategory, setSelectedCategory] = useState<ShopItemCategory | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [purchaseAnimation, setPurchaseAnimation] = useState(false);
  
  // Use stars as currency (tickets = stars)
  const tickets = state.totalStars;
  const purchasedItems = state.purchasedItems || [];
  
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return SHOP_ITEMS;
    return SHOP_ITEMS.filter(item => item.category === selectedCategory);
  }, [selectedCategory]);
  
  const isOwned = (itemId: string) => purchasedItems.some(p => p.itemId === itemId);
  
  const handlePurchase = (item: ShopItem) => {
    if (tickets < item.cost || isOwned(item.id)) return;
    
    setPurchaseAnimation(true);
    
    // Dispatch purchase action
    dispatch({
      type: 'PURCHASE_ITEM',
      item: {
        itemId: item.id,
        purchasedAt: new Date(),
        isEquipped: false,
      },
      cost: item.cost,
    } as any); // Type will be added to GameAction
    
    setTimeout(() => {
      setPurchaseAnimation(false);
      setSelectedItem(null);
    }, 1500);
  };
  
  const handleClose = () => {
    dispatch({ type: 'NAVIGATE', view: 'magic-map' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: -50,
              rotate: 0,
              opacity: 0.3,
            }}
            animate={{ 
              y: window.innerHeight + 50,
              rotate: 360,
            }}
            transition={{ 
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'linear',
            }}
          >
            {['⭐', '✨', '💎', '🎁', '🌟'][i % 5]}
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-purple-800/90 to-indigo-800/90 backdrop-blur-md border-b border-white/10 safe-area-inset-top">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close shop"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🏪</span> Reward Shop
            </h1>
            
            {/* Currency Display */}
            <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1.5 rounded-full border border-yellow-500/30">
              <span className="text-yellow-400">⭐</span>
              <span className="text-white font-bold">{tickets}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="sticky top-[72px] z-40 bg-purple-900/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-white text-purple-900 shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <span>🛍️</span>
              <span>All</span>
            </button>
            
            {(Object.keys(CATEGORY_INFO) as ShopItemCategory[]).map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-white text-purple-900 shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <span>{CATEGORY_INFO[category].emoji}</span>
                <span>{CATEGORY_INFO[category].label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shop Grid */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-32">
        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map((item, index) => {
            const owned = isOwned(item.id);
            const canAfford = tickets >= item.cost;
            
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedItem(item)}
                disabled={owned}
                className={`relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 border transition-all text-left ${
                  owned
                    ? 'border-green-500/50 opacity-60'
                    : canAfford
                    ? 'border-white/20 hover:border-white/40 hover:bg-white/20'
                    : 'border-white/10 opacity-50'
                }`}
              >
                {/* Rarity Badge */}
                <span className={`absolute top-2 right-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${RARITY_COLORS[item.rarity]}`}>
                  {item.rarity}
                </span>
                
                {/* Owned Badge */}
                {owned && (
                  <span className="absolute top-2 left-2 text-xs font-bold text-green-400 flex items-center gap-1">
                    ✓ Owned
                  </span>
                )}
                
                {/* Item Emoji/Image */}
                <div className="text-5xl text-center mb-3 mt-4">
                  {item.emoji}
                </div>
                
                {/* Item Info */}
                <h3 className="text-white font-bold text-sm leading-tight mb-1">
                  {item.name}
                </h3>
                
                <p className="text-white/60 text-xs line-clamp-2 mb-3">
                  {item.description}
                </p>
                
                {/* Price */}
                {!owned && (
                  <div className={`flex items-center gap-1 text-sm font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                    <span>⭐</span>
                    <span>{item.cost}</span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/60">No items in this category</p>
          </div>
        )}
      </main>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg bg-gradient-to-b from-slate-800 to-slate-900 rounded-t-3xl p-6 safe-area-inset-bottom"
            >
              {/* Item Preview */}
              <div className="text-center mb-6">
                <motion.div
                  animate={purchaseAnimation ? { scale: [1, 1.5, 1], rotate: [0, 360] } : {}}
                  transition={{ duration: 0.5 }}
                  className="text-7xl mb-4"
                >
                  {selectedItem.emoji}
                </motion.div>
                
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedItem.name}
                </h2>
                
                <span className={`inline-block text-xs font-bold uppercase px-3 py-1 rounded-full border ${RARITY_COLORS[selectedItem.rarity]}`}>
                  {selectedItem.rarity}
                </span>
                
                <p className="text-white/70 mt-4">
                  {selectedItem.description}
                </p>
              </div>
              
              {/* Purchase Button */}
              {!isOwned(selectedItem.id) ? (
                <button
                  onClick={() => handlePurchase(selectedItem)}
                  disabled={tickets < selectedItem.cost || purchaseAnimation}
                  className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                    tickets >= selectedItem.cost && !purchaseAnimation
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-lg hover:shadow-yellow-500/30'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {purchaseAnimation ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        ✨
                      </motion.span>
                      <span>Purchased!</span>
                    </>
                  ) : (
                    <>
                      <span>⭐</span>
                      <span>Buy for {selectedItem.cost} Stars</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="w-full py-4 rounded-2xl font-bold text-lg text-center bg-green-500/20 text-green-400 border border-green-500/30">
                  ✓ You own this item!
                </div>
              )}
              
              {/* Not Enough Stars Message */}
              {!isOwned(selectedItem.id) && tickets < selectedItem.cost && (
                <p className="text-center text-red-400 text-sm mt-3">
                  You need {selectedItem.cost - tickets} more stars!
                </p>
              )}
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="w-full mt-4 py-3 text-white/60 hover:text-white transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Purchase Celebration */}
      <AnimatePresence>
        {purchaseAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  scale: 0,
                  opacity: 1,
                }}
                animate={{ 
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 400,
                  scale: Math.random() * 2 + 1,
                  opacity: 0,
                }}
                transition={{ duration: 1 }}
                className="absolute text-3xl"
              >
                {['⭐', '✨', '🎉', '🎊', '💫'][i % 5]}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RewardShop;
