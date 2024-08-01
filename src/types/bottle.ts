export type Bottle = {
  id: string;
  status: 'open' | 'empty' | 'closed' | 'sample';
  size?: number;
  price?: number;
  dateAdded: Date;
};