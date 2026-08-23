import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDependencies } from '../../../DependencyContext';
import { 
  Gamepad2, Plus, Trash2, Save, Eye, EyeOff, 
  ArrowUp, ArrowDown, DollarSign, Check, Loader2, 
  Layers, Edit3, ShieldAlert, Sparkles, RefreshCw 
} from 'lucide-react';
import toast from 'react-hot-toast';

export const GamePriceManager = () => {
  const { getGames, manageGames } = useDependencies();
  const queryClient = useQueryClient();

  const { data: allGames = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-games'],
    queryFn: () => getGames.execute(true), // Include inactive
  });

  const [selectedGameId, setSelectedGameId] = useState(null);
  const [editingGame, setEditingGame] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [bulkAdjustment, setBulkAdjustment] = useState('');
  const [showAddGameModal, setShowAddGameModal] = useState(false);
  const [newGameData, setNewGameData] = useState({
    id: '',
    name: '',
    currency: '',
    idField: 'Player ID',
    serverRequired: false,
    description: '',
    themeColor: '#2563EB',
  });

  // Select first game initially
  useEffect(() => {
    if (allGames.length > 0 && !selectedGameId) {
      setSelectedGameId(allGames[0].id);
      setEditingGame(JSON.parse(JSON.stringify(allGames[0])));
    }
  }, [allGames, selectedGameId]);

  // When game selection changes
  const handleSelectGame = (game) => {
    setSelectedGameId(game.id);
    setEditingGame(JSON.parse(JSON.stringify(game)));
  };

  // Update package fields
  const handlePackageChange = (index, field, value) => {
    if (!editingGame) return;
    const newPackages = [...editingGame.packages];
    newPackages[index] = {
      ...newPackages[index],
      [field]: field === 'price' || field === 'cost' ? Number(value) || 0 : value,
    };
    setEditingGame({ ...editingGame, packages: newPackages });
  };

  // Add a new package row
  const handleAddPackage = () => {
    if (!editingGame) return;
    const count = editingGame.packages.length + 1;
    const newPkg = {
      id: `${editingGame.id}-pkg-${Date.now()}`,
      label: `New Tier ${count}`,
      price: 100,
      cost: 80,
    };
    setEditingGame({
      ...editingGame,
      packages: [...editingGame.packages, newPkg],
    });
  };

  // Delete package row
  const handleDeletePackage = (index) => {
    if (!editingGame) return;
    if (editingGame.packages.length <= 1) {
      toast.error('A game must have at least 1 package.');
      return;
    }
    const newPackages = editingGame.packages.filter((_, i) => i !== index);
    setEditingGame({ ...editingGame, packages: newPackages });
  };

  // Move package up/down
  const handleMovePackage = (index, direction) => {
    if (!editingGame) return;
    const newPackages = [...editingGame.packages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newPackages.length) return;

    const temp = newPackages[index];
    newPackages[index] = newPackages[targetIndex];
    newPackages[targetIndex] = temp;

    setEditingGame({ ...editingGame, packages: newPackages });
  };

  // Apply quick bulk adjustment
  const handleApplyBulkAdjustment = (type) => {
    if (!editingGame || !bulkAdjustment) return;
    const val = parseFloat(bulkAdjustment);
    if (isNaN(val)) return;

    const newPackages = editingGame.packages.map(pkg => {
      let newPrice = pkg.price;
      if (type === 'percent') {
        newPrice = Math.round(pkg.price * (1 + val / 100));
      } else if (type === 'fixed') {
        newPrice = Math.max(0, pkg.price + val);
      }
      return { ...pkg, price: newPrice };
    });

    setEditingGame({ ...editingGame, packages: newPackages });
    toast.success(`Adjusted prices for all packages in ${editingGame.name}`);
    setBulkAdjustment('');
  };

  // Save changes to Supabase
  const handleSaveGame = async () => {
    if (!editingGame) return;
    setIsSaving(true);
    try {
      await manageGames.saveGame(editingGame);
      await queryClient.invalidateQueries({ queryKey: ['games'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-games'] });
      await queryClient.invalidateQueries({ queryKey: ['game', editingGame.id] });
      toast.success(`Successfully saved prices & settings for ${editingGame.name}!`);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  // Create new game
  const handleCreateGame = async (e) => {
    e.preventDefault();
    if (!newGameData.id || !newGameData.name || !newGameData.currency) {
      toast.error('Please fill in game ID, name, and currency.');
      return;
    }

    const formattedId = newGameData.id.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    const initialGame = {
      id: formattedId,
      name: newGameData.name,
      currency: newGameData.currency,
      idField: newGameData.idField || 'Player ID',
      serverRequired: newGameData.serverRequired,
      description: newGameData.description || `Instant ${newGameData.currency} top-up.`,
      themeColor: newGameData.themeColor || '#2563EB',
      isActive: true,
      sortOrder: allGames.length + 1,
      packages: [
        { id: `${formattedId}-p1`, label: `100 ${newGameData.currency}`, price: 100, cost: 80 },
        { id: `${formattedId}-p2`, label: `500 ${newGameData.currency}`, price: 480, cost: 390 },
      ],
    };

    setIsSaving(true);
    try {
      await manageGames.saveGame(initialGame);
      await queryClient.invalidateQueries({ queryKey: ['games'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-games'] });
      toast.success(`Game "${initialGame.name}" created!`);
      setShowAddGameModal(false);
      setSelectedGameId(initialGame.id);
      setEditingGame(initialGame);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to create game.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
            <Gamepad2 className="text-accent" size={24} />
            Game & Pricing Manager
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Edit live packages, selling prices, buying costs, and game requirements
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Reload games"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setShowAddGameModal(true)}
            className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <Plus size={16} /> Add Game
          </button>
          {editingGame && (
            <button
              onClick={handleSaveGame}
              disabled={isSaving}
              className="px-6 py-3 rounded-2xl bg-accent hover:bg-accent-hover text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md shadow-accent/20 disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save All Changes
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Game selector sidebar + Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Game Selector Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <p className="text-xs uppercase font-black tracking-widest text-slate-400 px-2">Catalog ({allGames.length} Titles)</p>
          <div className="bg-white p-3 rounded-3xl border border-slate-200 space-y-2 max-h-[700px] overflow-y-auto shadow-sm">
            {allGames.map((game) => {
              const isSelected = selectedGameId === game.id;
              return (
                <button
                  key={game.id}
                  onClick={() => handleSelectGame(game)}
                  className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all ${
                    isSelected
                      ? 'bg-accent text-white shadow-md shadow-accent/20 font-bold'
                      : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    {game.icon ? (
                      <img src={game.icon} alt={game.name} className="w-9 h-9 rounded-xl object-cover bg-slate-100 p-0.5 shrink-0 border border-slate-200/50" />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                        <Gamepad2 size={18} />
                      </div>
                    )}
                    <div className="truncate">
                      <p className="font-bold text-sm truncate">{game.name}</p>
                      <p className={`text-[10px] uppercase tracking-wider ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                        {game.packages?.length || 0} packages • {game.currency}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {game.isActive === false ? (
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${isSelected ? 'bg-black/20 text-white' : 'bg-red-100 text-red-700'}`}>
                        Hidden
                      </span>
                    ) : (
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                        Live
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Game Editor */}
        <div className="lg:col-span-8 space-y-6">
          {editingGame ? (
            <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
              
              {/* Header Info */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  {editingGame.icon ? (
                    <img src={editingGame.icon} alt={editingGame.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-200 bg-slate-50 p-1 shadow-sm" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-accent flex items-center justify-center">
                      <Gamepad2 size={26} />
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{editingGame.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">Game ID: {editingGame.id}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setEditingGame({ ...editingGame, isActive: !editingGame.isActive })}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                      editingGame.isActive !== false
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {editingGame.isActive !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                    {editingGame.isActive !== false ? 'Active on Store' : 'Hidden from Store'}
                  </button>
                </div>
              </div>

              {/* Game Metadata Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">
                    Game Display Name
                  </label>
                  <input
                    type="text"
                    value={editingGame.name}
                    onChange={(e) => setEditingGame({ ...editingGame, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm font-bold text-slate-900 focus:border-accent focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">
                    Currency Label (e.g. Diamonds)
                  </label>
                  <input
                    type="text"
                    value={editingGame.currency}
                    onChange={(e) => setEditingGame({ ...editingGame, currency: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm font-bold text-slate-900 focus:border-accent focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">
                    ID Field Label
                  </label>
                  <input
                    type="text"
                    value={editingGame.idField || 'Player ID'}
                    onChange={(e) => setEditingGame({ ...editingGame, idField: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm font-bold text-slate-900 focus:border-accent focus:bg-white outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editingGame.description || ''}
                    onChange={(e) => setEditingGame({ ...editingGame, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-800 focus:border-accent focus:bg-white outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <label className="relative flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingGame.serverRequired}
                      onChange={(e) => setEditingGame({ ...editingGame, serverRequired: e.target.checked })}
                      className="w-5 h-5 rounded-lg accent-accent"
                    />
                    <span className="text-xs font-bold text-slate-700">Require Server ID (e.g. MLBB)</span>
                  </label>
                </div>
              </div>

              {/* Bulk Quick Price Adjuster */}
              <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                    <Sparkles size={14} /> Quick Price Adjustment Tool
                  </span>
                  <p className="text-xs text-slate-600 mt-0.5">Bulk adjust all package prices in this game</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="number"
                    value={bulkAdjustment}
                    onChange={(e) => setBulkAdjustment(e.target.value)}
                    placeholder="e.g. 5 or -10"
                    className="w-28 bg-white border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-900 focus:border-accent outline-none shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyBulkAdjustment('percent')}
                    className="px-3 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-accent text-xs font-bold text-slate-700 transition-colors shadow-sm"
                  >
                    +% / -%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyBulkAdjustment('fixed')}
                    className="px-3 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-accent text-xs font-bold text-slate-700 transition-colors shadow-sm"
                  >
                    +NPR
                  </button>
                </div>
              </div>

              {/* Packages Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                    <Layers size={18} className="text-accent" />
                    Top-Up Packages & Pricing ({editingGame.packages?.length || 0})
                  </h4>

                  <button
                    type="button"
                    onClick={handleAddPackage}
                    className="px-3.5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Plus size={15} /> Add Package
                  </button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-200">
                        <th className="py-3 px-4">#</th>
                        <th className="py-3 px-4 min-w-[200px]">Package Label</th>
                        <th className="py-3 px-4 min-w-[130px]">Selling Price (NPR)</th>
                        <th className="py-3 px-4 min-w-[130px]">Buying Cost (NPR)</th>
                        <th className="py-3 px-4 text-center">Profit</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {editingGame.packages?.map((pkg, index) => {
                        const profit = (Number(pkg.price) || 0) - (Number(pkg.cost) || 0);
                        const marginPercent = pkg.price > 0 ? ((profit / pkg.price) * 100).toFixed(0) : 0;

                        return (
                          <tr key={pkg.id || index} className="hover:bg-slate-50/70 transition-colors">
                            {/* Order & Reorder */}
                            <td className="py-3 px-4 font-mono text-xs text-slate-400">
                              <div className="flex items-center gap-1">
                                <span>{index + 1}</span>
                                <div className="flex flex-col">
                                  <button
                                    type="button"
                                    onClick={() => handleMovePackage(index, 'up')}
                                    disabled={index === 0}
                                    className="text-slate-400 hover:text-slate-700 disabled:opacity-10 p-0.5"
                                  >
                                    <ArrowUp size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMovePackage(index, 'down')}
                                    disabled={index === editingGame.packages.length - 1}
                                    className="text-slate-400 hover:text-slate-700 disabled:opacity-10 p-0.5"
                                  >
                                    <ArrowDown size={12} />
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* Label */}
                            <td className="py-3 px-4">
                              <input
                                type="text"
                                value={pkg.label}
                                onChange={(e) => handlePackageChange(index, 'label', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:border-accent focus:bg-white outline-none"
                              />
                            </td>

                            {/* Selling Price */}
                            <td className="py-3 px-4">
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">NPR</span>
                                <input
                                  type="number"
                                  value={pkg.price}
                                  onChange={(e) => handlePackageChange(index, 'price', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-3 py-2 text-sm font-black text-emerald-600 focus:border-accent focus:bg-white outline-none"
                                />
                              </div>
                            </td>

                            {/* Cost */}
                            <td className="py-3 px-4">
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">NPR</span>
                                <input
                                  type="number"
                                  value={pkg.cost}
                                  onChange={(e) => handlePackageChange(index, 'cost', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-3 py-2 text-sm text-slate-700 focus:border-accent focus:bg-white outline-none"
                                />
                              </div>
                            </td>

                            {/* Profit */}
                            <td className="py-3 px-4 text-center">
                              <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${profit >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                +NPR {profit} ({marginPercent}%)
                              </span>
                            </td>

                            {/* Delete */}
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeletePackage(index)}
                                className="p-2 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete package"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Save Bar */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Changes save directly to Supabase and update the live website immediately.
                </p>

                <button
                  type="button"
                  onClick={handleSaveGame}
                  disabled={isSaving}
                  className="px-7 py-3.5 rounded-2xl bg-accent hover:bg-accent-hover text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md shadow-accent/20 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save {editingGame.name} Changes
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 text-center text-slate-400 italic shadow-sm">
              Select a game from the sidebar to customize its prices
            </div>
          )}
        </div>

      </div>

      {/* Add New Game Modal */}
      {showAddGameModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg p-8 rounded-[2rem] border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black mb-1 text-slate-900 uppercase">Add New Game</h3>
            <p className="text-slate-400 text-xs mb-6 font-medium">Create a new game top-up title for your store</p>

            <form onSubmit={handleCreateGame} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Game Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Valorant / Genshin Impact"
                  value={newGameData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoId = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
                    setNewGameData({ ...newGameData, name, id: newGameData.id || autoId });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm font-bold text-slate-900 focus:border-accent focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Slug / ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. valorant"
                    value={newGameData.id}
                    onChange={(e) => setNewGameData({ ...newGameData, id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm font-mono text-slate-900 focus:border-accent focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Currency *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VP / Crystals"
                    value={newGameData.currency}
                    onChange={(e) => setNewGameData({ ...newGameData, currency: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm font-bold text-slate-900 focus:border-accent focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">ID Field Label</label>
                <input
                  type="text"
                  placeholder="e.g. Riot ID (Name#TAG) or UID"
                  value={newGameData.idField}
                  onChange={(e) => setNewGameData({ ...newGameData, idField: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-900 focus:border-accent focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Instant VP top-up delivered to your Riot ID."
                  value={newGameData.description}
                  onChange={(e) => setNewGameData({ ...newGameData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-900 focus:border-accent focus:bg-white outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddGameModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-accent hover:bg-accent-hover text-white transition-all shadow-md shadow-accent/20"
                >
                  {isSaving ? 'Creating...' : 'Create Game'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
