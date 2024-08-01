import { Bottle } from './bottle';

export type Drink = {
  drinkId: string;
  brand: string;
  name: string;
  bottlingSerie?: string;
  statedAge?: number;
  strength?: number;
  type: string;
  bottles: Bottle[];
};