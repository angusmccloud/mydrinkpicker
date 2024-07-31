import React, { useState, useEffect } from 'react';
import { Box, Typography, Slider, Button } from '@mui/material';
import BaseModal from '../../components/BaseModal/BaseModal';
import SelectInput from '../../components/SelectInput/SelectInput';

const PoisonPickerModal = ({ open, handleClose, drinks }) => {
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [hadBefore, setHadBefore] = useState('both');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [filteredDrinks, setFilteredDrinks] = useState(drinks);
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

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
  }, [selectedStyles, hadBefore, priceRange, drinks]);

  const handleSpin = () => {
    setIsSpinning(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * filteredDrinks.length);
      setSelectedDrink(filteredDrinks[randomIndex]);
      setIsSpinning(false);
    }, 2000);
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
      <Button onClick={handleSpin} disabled={isSpinning || filteredDrinks.length === 0}>
        {isSpinning ? 'Spinning...' : 'Pick One'}
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
