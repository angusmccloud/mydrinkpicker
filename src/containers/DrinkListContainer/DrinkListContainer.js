import React, { useState, useEffect } from 'react';
import Typography from '../../components/Typography/Typography';
import getDrinks from '../../services/getDrinks';

const DrinkListContainer = () => {
  const [drinks, setDrinks] = useState([]);

  useEffect(() => {
    const fetchDrinks = async () => {
      const drinksData = await getDrinks();
      setDrinks(drinksData);
    };

    fetchDrinks();
  }, []);

  return (
    <div>
      <Typography variant="h4">Drink List</Typography>
      {drinks.map((drink, index) => (
        <div key={index}>
          <Typography variant="h6">{drink.name}</Typography>
          <Typography variant="body1">Type: {drink.type}</Typography>
          <Typography variant="body1">Cost: ${drink.cost}</Typography>
          {drink.notes && <Typography variant="body1">Notes: {drink.notes}</Typography>}
        </div>
      ))}
    </div>
  );
};

export default DrinkListContainer;
