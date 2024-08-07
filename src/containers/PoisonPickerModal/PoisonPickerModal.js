import React, { useState, useEffect } from 'react';
import { Box, Slider } from '@mui/material';
import BaseModal from '../../components/BaseModal/BaseModal';
import SelectInput from '../../components/SelectInput/SelectInput';
import Button from '../../components/Button/Button';
import Typography from '../../components/Typography/Typography';

const PoisonPickerModal = ({ open, handleClose, drinks }) => {
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [hadBefore, setHadBefore] = useState('both');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [filteredDrinks, setFilteredDrinks] = useState(drinks);
  const [selectedDrink, setSelectedDrink] = useState(null);


  useEffect(() => {
    const filterDrinks = () => {
      let filtered = drinks;

      if (selectedStyles.length > 0) {
        filtered = filtered.filter(drink => selectedStyles.includes(drink.type));
      }

      if (hadBefore !== 'both') {
        const hadBeforeBool = hadBefore === 'yes';
        filtered = filtered.filter(drink => drink.triedBefore === hadBeforeBool);
      }

      filtered = filtered.filter(drink => drink.cost >= priceRange[0] && drink.cost <= priceRange[1]);

      setFilteredDrinks(filtered);
    };

    filterDrinks();
    setSelectedDrink(null); // Reset selectedDrink when filters change
  }, [selectedStyles, hadBefore, priceRange, drinks]);

  const handlePick = () => {
    const randomIndex = Math.floor(Math.random() * filteredDrinks.length);
    setSelectedDrink(filteredDrinks[randomIndex]);
  };

  const handleModalClose = () => {
    setSelectedStyles([]);
    setHadBefore('both');
    setPriceRange([0, 1000]);
    setSelectedDrink(null);
    handleClose();
  };

  return (
    <BaseModal open={open} handleClose={handleModalClose}>
      <Typography variant="h6">Pick a Poison</Typography>
      <SelectInput
        label="Styles"
        value={selectedStyles}
        setValue={setSelectedStyles}
        options={Array.from(new Set(drinks.map(drink => drink.type))).map(type => ({ value: type, label: type }))}
        multiple
      />
      <SelectInput
        label="Had Before"
        value={hadBefore}
        setValue={setHadBefore}
        options={[
          { value: 'both', label: 'Both' },
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ]}
      />
      <Typography gutterBottom>Price Range</Typography>
      <Slider
        value={priceRange}
        onChange={(e, newValue) => setPriceRange(newValue)}
        valueLabelDisplay="auto"
        min={0}
        max={Math.max(...drinks.map(drink => drink.cost))}
      />
      <Typography variant="body1">Number of drinks: {filteredDrinks.length}</Typography>
      <Button onClick={handlePick} disabled={filteredDrinks.length === 0}>
        Pick One
      </Button>
      {selectedDrink && (
        <Box mt={2}>
          <Typography variant="h6">{selectedDrink.name}</Typography>
        </Box>
      )}
    </BaseModal>
  );
};

export default PoisonPickerModal;

// const drinks = [
//   {
//     drinkId: '9512',
//     brand: 'Glenfarclas',
//     name: '12-year-old',
//     bottlingSerie: 'New Label',
//     statedAge: 12,
//     strength: 43,
//     type: 'Scotch',
//     bottles: [
//       {
//         id: '4802fadf-c67d-4fea-9917-f143e226f4c9',
//         status: 'open',
//         size: 750,
//         price: 69,
//         dateAdded: new Date('2024-02-18'),
//       },
//       {
//         id: 'ab50bf83-6937-4da0-a0ed-6f31a0f27308',
//         status: 'empty',
//         size: 750,
//         price: 50,
//         dateAdded: new Date('2021-03-18'),
//       },
//       {
//         id: '30b5ef7e-2133-4a8b-bfb9-2603e4c27bbf',
//         status: 'empty',
//         size: 750,
//         price: 55,
//         dateAdded: new Date('2020-12-23'),
//       },
//     ]
//   }
// ]
