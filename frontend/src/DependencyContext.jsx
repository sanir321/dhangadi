import React, { createContext, useContext } from 'react';
import { SupabaseOrderRepository } from './infrastructure/repositories/SupabaseOrderRepository';
import { LocalGameRepository } from './infrastructure/repositories/LocalGameRepository';
import { GetGames } from './application/use-cases/GetGames';
import { PlaceOrder } from './application/use-cases/PlaceOrder';
import { TrackOrder } from './application/use-cases/TrackOrder';

const DependencyContext = createContext(null);

export const DependencyProvider = ({ children }) => {
  // Repositories
  const gameRepository = new LocalGameRepository();
  const orderRepository = new SupabaseOrderRepository();

  // Use Cases
  const dependencies = {
    getGames: new GetGames(gameRepository),
    placeOrder: new PlaceOrder(orderRepository),
    trackOrder: new TrackOrder(orderRepository),
  };

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
