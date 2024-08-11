import React from 'react';
import { Slider as MuiSlider } from '@mui/material';

const Slider = (props) => {
  const { min, max, ...restOfProps } = props;

  const marks = [
    { value: 0, label: min.toLocaleString() },
    { value: 100, label: max.toLocaleString() }
  ];

  return <MuiSlider marks={marks} {...restOfProps} />;
};

export default Slider;
