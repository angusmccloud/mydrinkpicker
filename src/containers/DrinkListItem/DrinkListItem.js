import React from 'react';
import { ListItem, ListItemAvatar, ListItemText, Avatar } from '@mui/material';
import { Typography } from '../../components';
import { Image, LocalDrink } from '@mui/icons-material';

const DrinkListItem = ({ drink }) => {
  const { brand, name, bottlingSerie, type, statedAge, strength, imageUrl, bottleStatus, bottles, price } = drink;

  const title = `${brand} ${name}${bottlingSerie ? ` (${bottlingSerie})` : ''}`;

  return (
    <ListItem>
      <ListItemAvatar>
        {imageUrl ? (
          <Avatar src={imageUrl} />
        ) : (
          <Avatar>
            <LocalDrink />
          </Avatar>
        )}
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={
          <>
            <Typography component="span" variant="body2" color="textPrimary">
              {type}
            </Typography>
            {statedAge && (
              <>
                {' - '}
                <Typography component="span" variant="body2" color="textPrimary">
                  {statedAge} years
                </Typography>
              </>
            )}
            {strength && (
              <>
                {' - '}
                <Typography component="span" variant="body2" color="textPrimary">
                  {strength}%
                </Typography>
              </>
            )}
            {price && (
              <>
                {' - '}
                <Typography component="span" variant="body2" color="textPrimary">
                  ${price.toFixed(2)}
                </Typography>
              </>
            )}
            <Typography component="span" variant="body2" color="textPrimary">
              {bottleStatus} - {bottles.length} bottles
            </Typography>
          </>
        }
      />
    </ListItem>
  );
};

export default DrinkListItem;
