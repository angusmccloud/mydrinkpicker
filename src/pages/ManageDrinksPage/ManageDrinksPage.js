import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { formatDate } from '../../utils/dateUtils';
import PageContent from '../../containers/PageContent/PageContent';
import { createOrReplaceCellar, getCellar } from '../../services/cellerServices';
import DrinkList from '../../containers/DrinkList/DrinkList';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material';
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';

const ManageDrinksPage = () => {
  const [cellarId, setCellarId] = useState('');
  const [drinks, setDrinks] = useState([]);
  const [displayedDrinks, setDisplayedDrinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerms, setSearchTerms] = useState('');

  const theme = useTheme();

  const handleFetchedDrinks = (drinksData) => {
    setDrinks(drinksData.drinks);
    setCellarId(drinksData.cellarId);
    applyDisplayFilter(searchTerms, drinksData.drinks);
  }

  const fetchDrinks = async () => {
    setLoading(true);
    const drinksData = await getCellar();
    handleFetchedDrinks(drinksData);
  };

  const applyDisplayFilter = (searchWords, drinksData) => {
    const filterDrinks = drinksData || drinks;
    if(searchWords.length === 0) {
      setDisplayedDrinks(filterDrinks);
      setLoading(false);
    } else {
      const searchWordsArray = searchWords.split(' ');
      const filteredDrinks = filterDrinks.filter((drink) => {
        const drinkString = JSON.stringify(drink).toLowerCase();
        return searchWordsArray.every((word) => drinkString.includes(word));
      });
      setDisplayedDrinks(filteredDrinks);
      setLoading(false);
    }
  }

  const handleSearchChange = (searchWords) => {
    setSearchTerms(searchWords);
    applyDisplayFilter(searchWords);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        // console.log('-- json --', json);

        const drinks = {};
        json.forEach((row) => {
          const drinkId = row['ID'];
          if (!drinks[drinkId]) {
            drinks[drinkId] = {
              drinkId: drinkId,
              brand: row['Brand'],
              name: row['Name'],
              bottlingSerie: row['Bottling serie'] || null,
              statedAge: row['Stated Age'] || null,
              strength: row['Strength'],
              type: row['List'],
              imageUrl: row['Photo'] || '',
              bottles: [],
            };
          }

          const bottle = {
            id: uuidv4(),
            status: row['Bottle status'],
            size: row['Size'],
            price: row['Price Paid'],
            dateAdded: formatDate(row['Added on']),
          };

          drinks[drinkId].bottles.push(bottle);
        });
        // console.log('-- drinks --', drinks);
        const drinksArray = Object.values(drinks).map(value => JSON.stringify(value));
        // console.log('-- drinksArray --', drinksArray);

        const drinksData = createOrReplaceCellar(drinksArray);
        handleFetchedDrinks(drinksData);

        setUploading(false);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const renderHeader = () => {
    return (
      <div style={{paddingBottom: 10, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: theme.palette.primary.main}}>
        <p>Replace Your Full Drink List from Excel:</p>
        <input type="file" accept=".xlsx" onChange={handleFileUpload} disabled={uploading} />
        <div style={{marginTop: 10}}>
          <TextField 
            id="searchDrinks"
            label="Search Your Drinks"
            value={searchTerms}
            onChange={(e) => handleSearchChange(e.target.value)}
            disabled={drinks.length === 0 || loading || uploading}
          />          
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchDrinks();
  }, []);

  return (
    <PageContent pageName="Manage Drinks" pageKey="manage-drinks">
      {renderHeader()}
      <DrinkList drinks={displayedDrinks} loading={loading} uploading={uploading} />
    </PageContent>
  );
};

export default ManageDrinksPage;
