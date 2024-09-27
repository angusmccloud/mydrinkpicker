import React from 'react';
import { VariableSizeList as List } from "react-window";
import AutoSizer from 'react-virtualized-auto-sizer';
import DrinkListItem from '../DrinkListItem/DrinkListItem';
import { Typography, CircularProgress } from '../../components';

const DrinkList = ({ drinks, loading, uploading }) => {
  const rowRenderer = ({ index, style }) => {
    const drink = drinks[index];
    return (
      <DrinkListItem drink={drink} key={drink.drinkId} />
    );
  };

  const getItemSize = index => {
    // Update this if we need a different height for a Header or something
    return 90;
  };

  if (loading) {
    return (
      <div style={{paddingTop: 20, textAlign: 'center'}}>
        <CircularProgress />
        <Typography>Loading drinks...</Typography>
      </div>
    );
  }

  if (uploading) {
    return (
      <div style={{paddingTop: 20, textAlign: 'center'}}>
        <CircularProgress />
        <Typography>Uploading drinks...</Typography>
      </div>
    );
  }

  if (drinks.length === 0) {
    return (
      <div style={{paddingTop: 20, textAlign: 'center'}}>
        <Typography>No drinks available, upload your drink list to get started</Typography>
      </div>
    );
  }

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          className="List"
          height={height}
          width={width}
          itemCount={drinks.length}
          itemSize={getItemSize}
          // itemSize={85}
        >
          {rowRenderer}
        </List>
      )}
    </AutoSizer>
  );
};

export default DrinkList;
