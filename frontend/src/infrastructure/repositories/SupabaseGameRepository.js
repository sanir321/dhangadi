import { supabase } from '../../lib/supabase';
import { IGameRepository } from '../../domain/interfaces/IGameRepository';
import { Game } from '../../domain/entities/Game';
import { games as defaultGames } from '../../data/games';

// Helper map to associate default local asset icons with game IDs
const defaultAssetMap = defaultGames.reduce((acc, g) => {
  acc[g.id] = {
    icon: g.icon,
    currencyIcon: g.currencyIcon,
    banner: g.banner,
  };
  return acc;
}, {});

export class SupabaseGameRepository extends IGameRepository {
  /**
   * Helper to merge DB row with local icons if custom URL not provided
   */
  _mapDbRowToGame(row) {
    const assets = defaultAssetMap[row.id] || {};
    return new Game({
      id: row.id,
      name: row.name,
      currency: row.currency,
      idField: row.id_field || 'Player ID',
      serverRequired: row.server_required,
      icon: row.icon || assets.icon,
      currencyIcon: row.currency_icon || assets.currencyIcon,
      banner: row.banner || assets.banner,
      description: row.description,
      themeColor: row.theme_color,
      supportsQuantity: row.supports_quantity,
      pricing: row.pricing,
      packages: row.packages || [],
      isActive: row.is_active,
      sortOrder: row.sort_order,
    });
  }

  async getAll(includeInactive = false) {
    try {
      let query = supabase
        .from('game_catalog')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        if (error) console.warn('Supabase fetch games fallback to local:', error.message);
        // Fallback to local default games
        return defaultGames
          .filter(g => includeInactive || g.isActive !== false)
          .map(g => new Game(g));
      }

      return data.map(row => this._mapDbRowToGame(row));
    } catch (err) {
      console.warn('Game repository getAll error, falling back to local:', err);
      return defaultGames.map(g => new Game(g));
    }
  }

  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('game_catalog')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        if (error) console.warn('Supabase getById fallback to local:', error.message);
        const localGame = defaultGames.find(g => g.id === id);
        return localGame ? new Game(localGame) : null;
      }

      return this._mapDbRowToGame(data);
    } catch (err) {
      console.warn('Game repository getById error, falling back to local:', err);
      const localGame = defaultGames.find(g => g.id === id);
      return localGame ? new Game(localGame) : null;
    }
  }

  async saveGame(gameData) {
    const payload = {
      id: gameData.id,
      name: gameData.name,
      currency: gameData.currency,
      id_field: gameData.idField || 'Player ID',
      server_required: !!gameData.serverRequired,
      icon: typeof gameData.icon === 'string' && gameData.icon.startsWith('http') ? gameData.icon : null,
      currency_icon: typeof gameData.currencyIcon === 'string' && gameData.currencyIcon.startsWith('http') ? gameData.currencyIcon : null,
      description: gameData.description || '',
      theme_color: gameData.themeColor || '#4cc9f0',
      supports_quantity: !!gameData.supportsQuantity,
      pricing: gameData.pricing || null,
      packages: gameData.packages || [],
      is_active: gameData.isActive !== false,
      sort_order: gameData.sortOrder ?? 0,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('game_catalog')
      .upsert([payload])
      .select()
      .single();

    if (error) {
      console.error('Failed to save game in Supabase:', error);
      throw new Error(`Failed to save game: ${error.message}`);
    }

    return this._mapDbRowToGame(data);
  }

  async deleteGame(id) {
    const { error } = await supabase
      .from('game_catalog')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete game: ${error.message}`);
    }
    return true;
  }
}
