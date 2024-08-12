import React from 'react';
// import { FixedSizeList as List } from "react-window";
import { VariableSizeList as List } from "react-window";
import AutoSizer from 'react-virtualized-auto-sizer';
import DrinkListItem from '../DrinkListItem/DrinkListItem';
import { Typography } from '../../components';

const DrinkList = ({ drinks, renderHeader }) => {
  const rowRenderer = ({ key, index, style }) => {
    // if(index === 0) {
    //   return (
    //     <>
    //       {renderHeader()}
    //     </>
    //   );
    // } else {
      const drink = drinks[index];
      return (
        <div drink={key} style={style}>
          <DrinkListItem drink={drink} />
        </div>
      );
    // }
  };

  const getItemSize = index => {
    // Update this if we need a different height for a Header or something
    return 90;
  };

  if (drinks.length === 0) {
    return (
      <>
        {/* {renderHeader()} */}
        <Typography>No drinks available</Typography>
      </>
    );
  }

  return (
    <>
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
    </>
  );
};

export default DrinkList;
