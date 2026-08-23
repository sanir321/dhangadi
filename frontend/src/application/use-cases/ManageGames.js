export class ManageGames {
  constructor(gameRepository) {
    this.gameRepository = gameRepository;
  }

  async saveGame(gameData) {
    return await this.gameRepository.saveGame(gameData);
  }

  async deleteGame(id) {
    return await this.gameRepository.deleteGame(id);
  }
}
