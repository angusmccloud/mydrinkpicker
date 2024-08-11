import React from 'react';
import { List } from 'react-virtualized';
import DrinkListItem from '../DrinkListItem/DrinkListItem';
import { Typography } from '../../components';

const DrinkList = ({ drinks }) => {
  const rowRenderer = ({ key, index, style }) => {
    const drink = drinks[index];
    return (
      <div key={key} style={style}>
        <DrinkListItem drink={drink} />
      </div>
    );
  };

  return (
    <div>
      {drinks.length > 0 ? (
        <List
          width={800}
          height={600}
          rowCount={drinks.length}
          rowHeight={100}
          rowRenderer={rowRenderer}
        />
      ) : (
        <Typography>No drinks available</Typography>
      )}
    </div>
  );
};

export default DrinkList;
