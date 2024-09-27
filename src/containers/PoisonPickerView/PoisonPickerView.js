import React, { useState, useEffect } from 'react';
import SelectInput from '../../components/SelectInput/SelectInput';
import Button from '../../components/Button/Button';
import Slider from '../../components/Slider/Slider';
import Typography from '../../components/Typography/Typography';
import CircularProgress from '../../components/CircularProgress/CircularProgress';

const PoisonPickerView = ({ drinks, loading }) => {
  const [bottleStatus, setBottleStatus] = useState('No Preference');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [strengthRange, setStrengthRange] = useState([0, 100]);
  const [ageRange, setAgeRange] = useState([0, 100]);
  const [priceRange, setPriceRange] = useState([0, 100]);
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

  // Set slider options based on *complete* drink list (Open or Closed)
  useEffect(() => {
    // Remove Sample and Empty drinks
    const possibleDrinks = drinks.filter(drink => drink.bottleStatus === 'Open' || drink.bottleStatus === 'Closed');
    setPossibleDrinks(possibleDrinks);

    // Set slider options
    const strengthMin = Math.floor(Math.min(...possibleDrinks.map(drink => drink.strength || 0)));
    const strengthMax = Math.ceil(Math.max(...possibleDrinks.map(drink => drink.strength)));
    const ageMin = Math.floor(Math.min(...possibleDrinks.map(drink => drink.statedAge || 0)));
    const ageMax = Math.ceil(Math.max(...possibleDrinks.map(drink => drink.statedAge || 0)));
    const priceMin = Math.floor(Math.min(...possibleDrinks.map(drink => drink.price || 0)));
    const priceMax = Math.ceil(Math.max(...possibleDrinks.map(drink => drink.price || 0)));
    // console.log(strengthMin, strengthMax, ageMin, ageMax, priceMin, priceMax);
    setSliderOptions({ strength: { min: strengthMin, max: strengthMax }, age: { min: ageMin, max: ageMax }, price: { min: priceMin, max: priceMax } });
  }, [drinks]);

  // Filter drinks based on Selected Criteria
  useEffect(() => {
    const filterDrinks = () => {
      console.log('-- sliderOptions --', sliderOptions);
      let filtered = [...possibleDrinks];
      console.log('-- Filtered at Initialization --', filtered.length);

      if (bottleStatus !== 'No Preference') {
        filtered = filtered.filter(drink => drink.bottleStatus === bottleStatus);
      }
      console.log('-- Filtered at Bottle Status --', filtered.length);

      if (selectedTypes.length > 0) {
        filtered = filtered.filter(drink => selectedTypes.includes(drink.type));
      }
      console.log('-- Filtered at Type --', filtered.length);

      
      // Scale the 0-100 value based on the actual values stored in sliderOptions
      const scaledStrengthRange = strengthRange.map(value => (value / 100) * (sliderOptions.strength.max - sliderOptions.strength.min) + sliderOptions.strength.min);
      const scaledAgeRange = ageRange.map(value => (value / 100) * (sliderOptions.age.max - sliderOptions.age.min) + sliderOptions.age.min);
      const scaledPriceRange = priceRange.map(value => (value / 100) * (sliderOptions.price.max - sliderOptions.price.min) + sliderOptions.price.min);

      console.log(scaledStrengthRange);
      filtered = filtered.filter(drink => (drink.strength === null || (drink.strength >= scaledStrengthRange[0] && drink.strength <= scaledStrengthRange[1])));
      console.log('-- Filtered at Strength --', filtered.length);
      console.log(scaledAgeRange);
      filtered = filtered.filter(drink => (drink.statedAge === null || (drink.statedAge >= scaledAgeRange[0] && drink.statedAge <= scaledAgeRange[1])));
      console.log('-- Filtered at Stated Age --', filtered.length);
      console.log(scaledPriceRange);
      filtered = filtered.filter(drink => (drink.price === null || (drink.price >= scaledPriceRange[0] && drink.price <= scaledPriceRange[1])));
      console.log('-- Filtered at Price --', filtered.length);

      // List of items in possibleDrinks that are NOT in filtered
      const removed = possibleDrinks.filter(drink => !filtered.includes(drink));
      console.log('-- Removed --', removed);

      setFilteredDrinks(filtered);
    };

    filterDrinks();
  }, [bottleStatus, selectedTypes, strengthRange, ageRange, priceRange, possibleDrinks, sliderOptions]);

  return (
    <div>
      <Typography variant="h6">Pick a Poison</Typography>
      {loading ? (
        <div style={{paddingTop: 20, textAlign: 'center'}}>
          <CircularProgress />
          <Typography>Loading drinks...</Typography>
        </div>
      ) : (
        <>
          {drinks.length === 0 ? (
            <div style={{paddingTop: 20, textAlign: 'center'}}>
              <Typography>No drinks available, upload your drink list to get started</Typography>
            </div>
          ) : (
            <>
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
              <Typography>
                Total Number of Drinks (Open or Closed): {possibleDrinks.length}
              </Typography>
              <Typography>
                Number of Drinks Matching Filters: {filteredDrinks.length}
              </Typography>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PoisonPickerView;
