import { games } from '../../data/games';
import { IGameRepository } from '../../domain/interfaces/IGameRepository';
import { Game } from '../../domain/entities/Game';

export class LocalGameRepository extends IGameRepository {
  async getAll() {
    return games.map(g => new Game(g));
  }

  async getById(id) {
    const game = games.find(g => g.id === id);
    if (!game) return null;
    return new Game(game);
  }
}
