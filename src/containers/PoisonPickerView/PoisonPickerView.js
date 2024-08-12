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
  const [possibleDrinks, setPossibleDrinks] = useState([]);
  const [sliderOptions, setSliderOptions] = useState({
    strength: { min: 0, max: 100 },
    age: { min: 0, max: 100 },
    price: { min: 0, max: 100 },
  });

  const strengthValueLabelFormat = (value) => {
    const min = sliderOptions.strength.min;
    const max = sliderOptions.strength.max;
    const range = max - min;

    // Scale the 0-100 value to the actual range
    const scaledValue = (value / 100) * range + min;
    return scaledValue.toFixed(1);
  }

  const ageValueLabelFormat = (value) => {
    const min = sliderOptions.age.min;
    const max = sliderOptions.age.max;
    const range = max - min;

    // Scale the 0-100 value to the actual range
    const scaledValue = (value / 100) * range + min;
    return scaledValue.toFixed(0);
  }

  const priceValueLabelFormat = (value) => {
    const min = sliderOptions.price.min;
    const max = sliderOptions.price.max;
    const range = max - min;

    // Scale the 0-100 value to the actual range
    const scaledValue = (value / 100) * range + min;
    return scaledValue.toLocaleString();
  }

  const handlePick = () => {
    const randomIndex = Math.floor(Math.random() * filteredDrinks.length);
    const selectedDrink = filteredDrinks[randomIndex];
    alert(`You picked: ${selectedDrink.name}`);
  };

  useEffect(() => {
    // Remove Sample and Empty drinks
    const possibleDrinks = drinks.filter(drink => drink.bottleStatus === 'Open' || drink.bottleStatus === 'Closed');
    setPossibleDrinks(possibleDrinks);

    // Set slider options
    const strengthMin = Math.min(...possibleDrinks.map(drink => drink.strength || 0));
    const strengthMax = Math.max(...possibleDrinks.map(drink => drink.strength));
    const ageMin = Math.min(...possibleDrinks.map(drink => drink.statedAge || 0));
    const ageMax = Math.max(...possibleDrinks.map(drink => drink.statedAge || 0));
    const priceMin = Math.min(...possibleDrinks.map(drink => drink.price || 0));
    const priceMax = Math.max(...possibleDrinks.map(drink => drink.price || 0));
    // console.log(strengthMin, strengthMax, ageMin, ageMax, priceMin, priceMax);
    setSliderOptions({ strength: { min: strengthMin, max: strengthMax }, age: { min: ageMin, max: ageMax }, price: { min: priceMin, max: priceMax } });
  }, [drinks]);

  useEffect(() => {
    const filterDrinks = () => {
      let filtered = [...possibleDrinks];

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
  }, [bottleStatus, selectedTypes, strengthRange, ageRange, priceRange, possibleDrinks]);

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
        options={Array.from(new Set(possibleDrinks.map(drink => drink.type))).map(type => ({ value: type, label: type }))}
        multiple
      />
      <Typography gutterBottom>Strength Range</Typography>
      <Slider
        value={strengthRange}
        onChange={(e, newValue) => setStrengthRange(newValue)}
        valueLabelDisplay="auto"
        valueLabelFormat={strengthValueLabelFormat}
        step={100 / ( sliderOptions.strength.max - sliderOptions.strength.min )}
        min={sliderOptions.strength.min}
        max={sliderOptions.strength.max}
      />
      <Typography gutterBottom>Age Range</Typography>
      <Slider
        value={ageRange}
        onChange={(e, newValue) => setAgeRange(newValue)}
        valueLabelDisplay="auto"
        valueLabelFormat={ageValueLabelFormat}
        step={100 / ( sliderOptions.age.max - sliderOptions.age.min )}
        min={sliderOptions.age.min}
        max={sliderOptions.age.max}
      />
      <Typography gutterBottom>Price Range</Typography>
      <Slider
        value={priceRange}
        onChange={(e, newValue) => setPriceRange(newValue)}
        valueLabelDisplay="auto"
        valueLabelFormat={priceValueLabelFormat}
        step={100 / ( sliderOptions.price.max - sliderOptions.price.min )}
        min={sliderOptions.price.min}
        max={sliderOptions.price.max}
      />
      <Button onClick={handlePick} disabled={filteredDrinks.length === 0}>
        Pick One
      </Button>
    </div>
  );
};

export default PoisonPickerView;
