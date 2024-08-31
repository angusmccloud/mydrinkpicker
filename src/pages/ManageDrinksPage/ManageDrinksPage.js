import React, { useState, useEffect, useContext } from 'react';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { formatDate } from '../../utils/dateUtils';
import PageContent from '../../containers/PageContent/PageContent';
import getDrinks from '../../services/getDrinks';
import DrinkList from '../../containers/DrinkList/DrinkList';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material';
import { generateClient } from 'aws-amplify/data';
import { AuthContext } from '../../contexts';
import { type Schema } from '@/amplify/data/resource';

const ManageDrinksPage = () => {
  const [drinks, setDrinks] = useState([]);
  const [displayedDrinks, setDisplayedDrinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerms, setSearchTerms] = useState('');
  const { user } = useContext(AuthContext);

  const theme = useTheme();

  const fetchDrinks = async () => {
    const drinksData = await getDrinks();
    setDrinks(drinksData);
    applyDisplayFilter(searchTerms);
  };

  const applyDisplayFilter = (searchWords) => {
    if(searchWords.length === 0) {
      setDisplayedDrinks(drinks);
    } else {
      const searchWordsArray = searchWords.split(' ');
      const filteredDrinks = drinks.filter((drink) => {
        const drinkString = JSON.stringify(drink).toLowerCase();
        return searchWordsArray.every((word) => drinkString.includes(word));
      });
      setDisplayedDrinks(filteredDrinks);
    }
  }

  const handleSearchChange = (searchWords) => {
    setSearchTerms(searchWords);
    applyDisplayFilter(searchWords);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        const drinks = {};
        json.forEach((row) => {
          const drinkId = row['ID'];
          if (!drinks[drinkId]) {
            drinks[drinkId] = {
              drinkId: drinkId,
              brand: row['Brand'],
              name: row['Name'],
              bottlingSerie: row['Bottling serie'] || '',
              statedAge: row['Stated Age'] || '',
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

        const client = generateClient<Schema>();
        const cellar = {
          userId: user.congnitoId,
          drinks: Object.values(drinks),
          triedDrinkIds: [],
        };

        const { data: existingCellar } = await client.models.Cellar.list({
          filter: {
            userId: {
              eq: user.congnitoId,
            },
          },
        });

        if (existingCellar.length > 0) {
          const { data: updatedCellar, errors } = await client.models.Cellar.update({
            id: existingCellar[0].id,
            ...cellar,
          });
        } else {
          const { data: newCellar, errors } = await client.models.Cellar.create(cellar);
        }

        setLoading(false);
        fetchDrinks();
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const renderHeader = () => {
    return (
      <div style={{paddingBottom: 10, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: theme.palette.primary.main}}>
        <p>Replace Your Full Drink List from Excel:</p>
        <input type="file" accept=".xlsx" onChange={handleFileUpload} />
        <div style={{marginTop: 10}}>
          <TextField 
            id="searchDrinks"
            label="Search Your Drinks"
            value={searchTerms}
            onChange={(e) => handleSearchChange(e.target.value)}
            disabled={drinks.length === 0}
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
      <DrinkList drinks={displayedDrinks} renderHeader={renderHeader} />
    </PageContent>
  );
};

export default ManageDrinksPage;
