import React from 'react';
import { Paper } from '@mui/material';
import { Typography } from '../../components';

const Footer = () => {
  return (
    <Paper
      sx={{
        marginTop: 'calc(10% + 60px)',
        position: 'fixed',
        paddingTop: '10px',
        paddingBottom: '10px',
        bottom: 0,
        width: '100%',
        textAlign: 'center',
      }}
      component='footer'
      square
      variant='outlined'
    >
      <Typography>
        ©{new Date().getFullYear()} | David Lozzi, Connor Tyrrell, & Josh Drumm
      </Typography>
    </Paper>
  );
};

export default Footer;
