import React from 'react';
import { Slider as MuiSlider } from '@mui/material';

const Slider = (props) => {
  const { min, max, ...restOfProps } = props;

  const marks = [
    { value: min, label: min.toLocaleString() },
    { value: max, label: max.toLocaleString() }
  ];

  return <MuiSlider marks={marks} {...restOfProps} />;
};

export default Slider;
