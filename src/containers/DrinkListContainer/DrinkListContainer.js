import React, { useState, useEffect } from 'react';
import Typography from '../../components/Typography/Typography';
import getDrinks from '../../services/getDrinks';
import PoisonPickerModal from '../PoisonPickerModal/PoisonPickerModal';
import Button from '../../components/Button/Button';

const DrinkListContainer = () => {
  const [drinks, setDrinks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchDrinks = async () => {
      const drinksData = await getDrinks();
      setDrinks(drinksData);
    };

    fetchDrinks();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <Typography variant="h4">Drink List</Typography>
      <Button onClick={handleOpenModal}>Pick a Poison</Button>
      {drinks.map((drink, index) => (
        <div key={index}>
          <Typography variant="h6">{drink.name}</Typography>
          <Typography variant="body1">Type: {drink.type}</Typography>
          <Typography variant="body1">Cost: ${drink.cost}</Typography>
          {drink.notes && <Typography variant="body1">Notes: {drink.notes}</Typography>}
        </div>
      ))}
      <PoisonPickerModal open={isModalOpen} handleClose={handleCloseModal} drinks={drinks} />
    </div>
  );
};

export default DrinkListContainer;
