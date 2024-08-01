import React, { useContext, useEffect, useState } from 'react';
import { PageContent } from '../../containers';
import { AuthContext } from '../../contexts';
import getDrinks from '../../services/getDrinks';
import { SelectInput, Slider, Button, Typography } from '@mui/material';
import { Box } from '@mui/system';

const HomePage = () => {
  const { user } = useContext(AuthContext);
  const [drinks, setDrinks] = useState([]);
  const [bottleStatus, setBottleStatus] = useState('No Preference');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [strengthRange, setStrengthRange] = useState([0, 100]);
  const [ageRange, setAgeRange] = useState([0, 100]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [filteredDrinks, setFilteredDrinks] = useState([]);
  const [selectedDrink, setSelectedDrink] = useState(null);

  useEffect(() => {
    const fetchDrinks = async () => {
      const drinksData = await getDrinks();
      setDrinks(drinksData);
      console.log(drinksData);
    };

    fetchDrinks();
  }, []);

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
      filtered = filtered.filter(drink => (drink.age === null || (drink.age >= ageRange[0] && drink.age <= ageRange[1])));
      filtered = filtered.filter(drink => (drink.price === null || (drink.price >= priceRange[0] && drink.price <= priceRange[1])));

      setFilteredDrinks(filtered);
    };

    filterDrinks();
    setSelectedDrink(null); // Reset selectedDrink when filters change
  }, [bottleStatus, selectedTypes, strengthRange, ageRange, priceRange, drinks]);

  const handlePick = () => {
    const randomIndex = Math.floor(Math.random() * filteredDrinks.length);
    setSelectedDrink(filteredDrinks[randomIndex]);
  };

  const handleReset = () => {
    setBottleStatus('No Preference');
    setSelectedTypes([]);
    setStrengthRange([0, 100]);
    setAgeRange([0, 100]);
    setPriceRange([0, 1000]);
    setSelectedDrink(null);
  };

  return (
    <PageContent
      pageName=''
      pageKey='home'
    >
      <Box>
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
        <Typography gutterBottom>Strength</Typography>
        <Slider
          value={strengthRange}
          onChange={(e, newValue) => setStrengthRange(newValue)}
          valueLabelDisplay="auto"
          min={0}
          max={Math.max(...drinks.map(drink => drink.strength))}
        />
        <Typography gutterBottom>Age</Typography>
        <Slider
          value={ageRange}
          onChange={(e, newValue) => setAgeRange(newValue)}
          valueLabelDisplay="auto"
          min={0}
          max={Math.max(...drinks.map(drink => drink.age || 0))}
        />
        <Typography gutterBottom>Price</Typography>
        <Slider
          value={priceRange}
          onChange={(e, newValue) => setPriceRange(newValue)}
          valueLabelDisplay="auto"
          min={0}
          max={Math.max(...drinks.map(drink => drink.price || 0))}
        />
        <Button onClick={handlePick} disabled={filteredDrinks.length === 0}>
          Pick One
        </Button>
        <Button onClick={handleReset}>
          Reset
        </Button>
        {selectedDrink && (
          <Box mt={2}>
            <Typography variant="h6">{selectedDrink.name}</Typography>
            {selectedDrink.imageUrl && (
              <img src={selectedDrink.imageUrl} alt={selectedDrink.name} />
            )}
            <Typography variant="body1">Brand: {selectedDrink.brand}</Typography>
            <Typography variant="body1">Type: {selectedDrink.type}</Typography>
            <Typography variant="body1">Strength: {selectedDrink.strength}</Typography>
            <Typography variant="body1">Age: {selectedDrink.age}</Typography>
            <Typography variant="body1">Price: {selectedDrink.price}</Typography>
          </Box>
        )}
      </Box>
    </PageContent>
  );
}

export default HomePage;
