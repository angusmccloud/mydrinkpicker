import React, { forwardRef } from 'react';
import { Tooltip as MuiTooltip } from '@mui/material';

const Tooltip = forwardRef(function Tooltip(props, ref) {
  return (
    <MuiTooltip {...props} />
  );
});

export default Tooltip;
