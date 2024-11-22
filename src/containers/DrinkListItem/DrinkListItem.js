import React, { useState } from 'react';
import { ListItem, ListItemAvatar, ListItemText, Avatar } from '@mui/material';
import { Typography } from '../../components';
import { formatCurrency } from '../../utils';
import { updateTriedIds } from '../../services/cellerServices';
import { Liquor, CheckCircle } from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';


const DrinkListItem = ({ drink, style, handleChangeTried, onlyDrinkableBottles = false }) => {
  const { drinkId, brand, name, bottlingSerie, type, statedAge, strength, imageUrl, bottleStatus, bottles, price, hasTried } = drink;
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const goToWhiskybase = () => {
    window.open(`https://www.whiskybase.com/whiskies/whisky/${drinkId}`, '_blank');
    handleClose();
  }

  const toggleTried = () => {
    handleClose();
    updateTriedIds(drinkId, hasTried ? 'remove' : 'add');
    handleChangeTried(drinkId, !hasTried);
  }
  
  const title = `${brand} ${name}${bottlingSerie ? ` (${bottlingSerie})` : ''}`;
  const numberOfBottles = !onlyDrinkableBottles ? bottles.length : bottles.filter(bottle => bottle.status === 'open' || bottle.status === 'closed').length;

  return (
    <ListItem sx={{paddingLeft: 0}} key={drinkId} style={style}>
      <ListItemAvatar sx={{marginRight: '10px'}} onClick={handleClick}>
        {imageUrl ? (
          // <Avatar sx={{ height: 75, width: 75 }} variant={'rounded'} src={imageUrl} />
          <img src={imageUrl} alt={title} style={{ width: 75, height: 75, objectFit: 'contain' }} />
        ) : (
          <Avatar sx={{ height: 75, width: 75 }}>
            <Liquor fontSize={'large'} />
          </Avatar>
        )}
        {hasTried && (
          <div style={{position: 'absolute', top: 5, left: 5}}>
            <CheckCircle fontSize={'small'} color={'primary'} />
          </div>
        )}
      </ListItemAvatar>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={goToWhiskybase}>View on Whisky Base</MenuItem>
        <MenuItem onClick={toggleTried}>{hasTried ? 'Remove from Tried List' : 'Mark as Tried'}</MenuItem>
      </Menu>
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
            {(price !== null && price > 0) && (
              <>
                {' - '}
                <Typography component="span" variant="body2" color="textPrimary">
                  {formatCurrency(price, 0)}
                </Typography>
              </>
            )}
            <br/>
            <Typography component="span" variant="body2" color="textPrimary">
              {bottleStatus} - {numberOfBottles} bottle{numberOfBottles > 1 ? 's' : ''}
            </Typography>
          </>
        }
      />
    </ListItem>
  );
};

export default DrinkListItem;
