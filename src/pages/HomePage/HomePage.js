import React, { useContext, useEffect, useState } from 'react';
import { PageContent } from '../../containers';
import { AuthContext } from '../../contexts';
import getDrinks from '../../services/getDrinks';
import PoisonPickerView from '../../containers/PoisonPickerView/PoisonPickerView';

const HomePage = () => {
  const { user } = useContext(AuthContext);
  const [drinks, setDrinks] = useState([]);

  useEffect(() => {
    const fetchDrinks = async () => {
      const drinksData = await getDrinks();
      setDrinks(drinksData);
      console.log(drinksData);
    };

    fetchDrinks();
  }, []);

  return (
    <PageContent
      pageName=''
      pageKey='home'
    >
      <PoisonPickerView drinks={drinks} />
    </PageContent>
  );
}

export default HomePage;
