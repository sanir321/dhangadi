export class GetGames {
  constructor(gameRepository) {
    this.gameRepository = gameRepository;
  }

  async execute(includeInactive = false) {
    return await this.gameRepository.getAll(includeInactive);
  }

  async getById(id) {
    return await this.gameRepository.getById(id);
  }
}
