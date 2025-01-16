import React from 'react';
import { Autocomplete as MuiAutocomplete } from '@mui/material';
import Checkbox from '../Checkbox/Checkbox';
import TextField from '../TextField/TextField';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const AutoComplete = ({ options, label, multiple = false, ...restOfProps }) => {
  return (
    <MuiAutocomplete
      key={`autocomplete-${label}`}
      multiple={multiple}
      options={options}
      disableCloseOnSelect={multiple}
      getOptionLabel={(option) => option}
      renderOption={(props, option, { selected }) => {
        const { key, ...optionProps } = props;
        return (
          <li key={key} {...optionProps}>
            {multiple && (
              <Checkbox
                icon={icon}
                checkedIcon={checkedIcon}
                style={{ marginRight: 8 }}
                checked={selected}
              />
            )}
            {option}
          </li>
        )}}
      renderInput={(params) => <TextField {...params} label={label} />}
      {...restOfProps}
    />
  );
};

export default AutoComplete;
