import React, { createContext, useContext, useMemo } from 'react';
import { SupabaseOrderRepository } from './infrastructure/repositories/SupabaseOrderRepository';
import { SupabaseGameRepository } from './infrastructure/repositories/SupabaseGameRepository';
import { SupabaseSettingsRepository } from './infrastructure/repositories/SupabaseSettingsRepository';
import { GetGames } from './application/use-cases/GetGames';
import { ManageGames } from './application/use-cases/ManageGames';
import { PlaceOrder } from './application/use-cases/PlaceOrder';
import { TrackOrder } from './application/use-cases/TrackOrder';

const DependencyContext = createContext(null);

export const DependencyProvider = ({ children }) => {
  const dependencies = useMemo(() => {
    // Repositories
    const gameRepository = new SupabaseGameRepository();
    const orderRepository = new SupabaseOrderRepository();
    const settingsRepository = new SupabaseSettingsRepository();

    // Use Cases
    return {
      gameRepository,
      orderRepository,
      settingsRepository,
      getGames: new GetGames(gameRepository),
      manageGames: new ManageGames(gameRepository),
      placeOrder: new PlaceOrder(orderRepository),
      trackOrder: new TrackOrder(orderRepository),
    };
  }, []);

  return (
    <DependencyContext.Provider value={dependencies}>
      {children}
    </DependencyContext.Provider>
  );
};

export const useDependencies = () => {
  const context = useContext(DependencyContext);
  if (!context) {
    throw new Error('useDependencies must be used within a DependencyProvider');
  }
  return context;
};
