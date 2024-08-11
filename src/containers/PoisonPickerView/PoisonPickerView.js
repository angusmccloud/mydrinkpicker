import React, { useState, useEffect } from 'react';
import SelectInput from '../../components/SelectInput/SelectInput';
import Button from '../../components/Button/Button';
import Slider from '../../components/Slider/Slider';
import Typography from '../../components/Typography/Typography';

const PoisonPickerView = ({ drinks }) => {
  const [bottleStatus, setBottleStatus] = useState('No Preference');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [strengthRange, setStrengthRange] = useState([0, 100]);
  const [ageRange, setAgeRange] = useState([0, 100]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [filteredDrinks, setFilteredDrinks] = useState([]);

  useEffect(() => {
    const filterDrinks = () => {
      let filtered = drinks;

      if (bottleStatus !== 'No Preference') {
        filtered = filtered.filter(drink => drink.bottleStatus === bottleStatus);
      }

      if (selectedTypes.length > 0) {
        filtered = filtered.filter(drink => selectedTypes.includes(drink.type));
      }

      filtered = filtered.filter(drink => drink.strength >= strengthRange[0] && drink.strength <= strengthRange[1]);
      filtered = filtered.filter(drink => (drink.statedAge === null || (drink.statedAge >= ageRange[0] && drink.statedAge <= ageRange[1])));
      filtered = filtered.filter(drink => (drink.price === null || (drink.price >= priceRange[0] && drink.price <= priceRange[1])));

      setFilteredDrinks(filtered);
    };

    filterDrinks();
  }, [bottleStatus, selectedTypes, strengthRange, ageRange, priceRange, drinks]);

  const handlePick = () => {
    const randomIndex = Math.floor(Math.random() * filteredDrinks.length);
    const selectedDrink = filteredDrinks[randomIndex];
    alert(`You picked: ${selectedDrink.name}`);
  };

  return (
    <div>
      <Typography variant="h6">Pick a Poison</Typography>
      <SelectInput
        label="Bottle Status"
        value={bottleStatus}
        setValue={setBottleStatus}
        options={[
          { value: 'No Preference', label: 'No Preference' },
          { value: 'Open', label: 'Open' },
          { value: 'Closed', label: 'Closed' }
        ]}
      />
      <SelectInput
        label="Types"
        value={selectedTypes}
        setValue={setSelectedTypes}
        options={Array.from(new Set(drinks.map(drink => drink.type))).map(type => ({ value: type, label: type }))}
        multiple
      />
      <Typography gutterBottom>Strength Range</Typography>
      <Slider
        value={strengthRange}
        onChange={(e, newValue) => setStrengthRange(newValue)}
        valueLabelDisplay="auto"
        min={Math.min(...drinks.map(drink => drink.strength || 0))}
        max={Math.max(...drinks.map(drink => drink.strength))}
      />
      <Typography gutterBottom>Age Range</Typography>
      <Slider
        value={ageRange}
        onChange={(e, newValue) => setAgeRange(newValue)}
        valueLabelDisplay="auto"
        min={Math.min(...drinks.map(drink => drink.statedAge || 0))}
        max={Math.max(...drinks.map(drink => drink.statedAge || 0))}
      />
      <Typography gutterBottom>Price Range</Typography>
      <Slider
        value={priceRange}
        onChange={(e, newValue) => setPriceRange(newValue)}
        valueLabelDisplay="auto"
        min={Math.min(...drinks.map(drink => drink.price || 0))}
        max={Math.max(...drinks.map(drink => drink.price || 0))}
      />
      <Button onClick={handlePick} disabled={filteredDrinks.length === 0}>
        Pick One
      </Button>
    </div>
  );
};

export default PoisonPickerView;
