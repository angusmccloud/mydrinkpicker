import React from 'react';
import { ListItem, ListItemAvatar, ListItemText, Avatar } from '@mui/material';
import { Typography } from '../../components';
import { formatCurrency } from '../../utils';
import { Liquor } from '@mui/icons-material';

const DrinkListItem = ({ drink }) => {
  const { brand, name, bottlingSerie, type, statedAge, strength, imageUrl, bottleStatus, bottles, price } = drink;

  const title = `${brand} ${name}${bottlingSerie ? ` (${bottlingSerie})` : ''}`;

  return (
    <ListItem sx={{paddingLeft: 0}}>
      <ListItemAvatar sx={{marginRight: '10px'}}>
        {imageUrl ? (
          // <Avatar sx={{ height: 75, width: 75 }} variant={'rounded'} src={imageUrl} />
          <img src={imageUrl} alt={title} style={{ width: 75, height: 75, objectFit: 'contain' }} />
        ) : (
          <Avatar sx={{ height: 75, width: 75 }}>
            <Liquor fontSize={'large'} />
          </Avatar>
        )}
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={
          <div>
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
            {price > 0 && (
              <>
                {' - '}
                <Typography component="span" variant="body2" color="textPrimary">
                  {formatCurrency(price, 0)}
                </Typography>
              </>
            )}
            <Typography component="div" variant="body2" color="textPrimary">
              {bottleStatus} - {bottles.length} bottle{bottles.length > 1 ? 's' : ''}
            </Typography>
          </div>
        }
      />
    </ListItem>
  );
};

export default DrinkListItem;
