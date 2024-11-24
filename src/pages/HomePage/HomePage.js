import React, { useEffect, useState } from 'react';
import { PageContent } from '../../containers';
import { getCellar } from '../../services/cellerServices';
import PoisonPickerView from '../../containers/PoisonPickerView/PoisonPickerView';

const HomePage = () => {
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleChangeTried = (drinkId, tried) => {
    const updatedDrinks = drinks.map((drink) => {
      if (drink.drinkId === drinkId) {
        return {
          ...drink,
          hasTried: tried,
        };
      }
      return drink;
    });
    setDrinks(updatedDrinks);
  }

  const fetchDrinks = async () => {
    const drinksData = await getCellar();
    setDrinks(drinksData.drinks);
    setLoading(false);
  };

  useEffect(() => {
    fetchDrinks();
  }, []);

  return (
    <PageContent
      pageName='Pick a Poison'
      pageKey='home'
      fetchDrinks={fetchDrinks}
    >
      <PoisonPickerView drinks={drinks} loading={loading} handleChangeTried={handleChangeTried} />
    </PageContent>
  );
}

export default HomePage;
