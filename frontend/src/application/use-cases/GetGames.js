export class GetGames {
  constructor(gameRepository) {
    this.gameRepository = gameRepository;
  }

  async execute() {
    return await this.gameRepository.getAll();
  }

  async getById(id) {
    return await this.gameRepository.getById(id);
  }
}
