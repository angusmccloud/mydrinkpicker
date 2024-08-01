import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { formatDate } from '../../utils/dateUtils';
import PageContent from '../../containers/PageContent/PageContent';

const ManageDrinksPage = () => {
  const [drinkList, setDrinkList] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
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
              bottlingSerie: row['Bottling Serie'] || '',
              statedAge: row['Stated Age'] || '',
              strength: row['Strength'],
              type: row['List'],
              imageUrl: row['Photo'] || '',
              bottles: [],
            };
          }

          const bottle = {
            id: uuidv4(),
            status: row['Bottle Status'],
            size: row['Size'],
            price: row['Price Paid'],
            dateAdded: formatDate(row['Added on']),
          };

          drinks[drinkId].bottles.push(bottle);
        });

        setDrinkList(Object.values(drinks));
        localStorage.setItem('drinkList', JSON.stringify(Object.values(drinks)));
        setLoading(false);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <PageContent pageName="Manage Drinks" pageKey="manage-drinks">
      <h1>Manage Drinks</h1>
      <input type="file" accept=".xlsx" onChange={handleFileUpload} />
      {loading && <p>Loading...</p>}
      <div>
        <h2>Drink List</h2>
        {drinkList.length === 0 ? (
          <p>No drinks available</p>
        ) : (
          <ul>
            {drinkList.map((drink) => (
              <li key={drink.drinkId}>
                {drink.brand} - {drink.name}
                <ul>
                  {drink.bottles.map((bottle) => (
                    <li key={bottle.id}>
                      {bottle.status} - {bottle.size}ml - ${bottle.price} - Added on {bottle.dateAdded}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageContent>
  );
};

export default ManageDrinksPage;
