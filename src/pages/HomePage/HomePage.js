import React, { useEffect, useState } from 'react';
import { PageContent } from '../../containers';
import { getCellar } from '../../services/cellerServices';
import PoisonPickerView from '../../containers/PoisonPickerView/PoisonPickerView';

const HomePage = () => {
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrinks = async () => {
      const drinksData = await getCellar();
      setDrinks(drinksData.drinks);
      setLoading(false);
      // console.log(drinksData);
    };

    fetchDrinks();
  }, []);

  return (
    <PageContent
      pageName=''
      pageKey='home'
    >
      <PoisonPickerView drinks={drinks} loading={loading} />
    </PageContent>
  );
}

export default HomePage;
