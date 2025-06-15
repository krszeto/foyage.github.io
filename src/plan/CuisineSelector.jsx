import * as React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

export default function CuisineSelector({
  label,
  values,
  selectedValue,
  onSelectedValueChanged,
}) {
  const handleChange = (event) => {
    onSelectedValueChanged(event.target.value);
  };

  return (
      <FormControl fullWidth>
        <InputLabel id="cuisine-selector-label">{label}</InputLabel>
        <Select
          labelId="cuisine-selector-label"
          id="cuisine-selector"
          value={selectedValue}
          label={label}
          onChange={handleChange}
        >
          {values.map((cuisine) => (
            <MenuItem key={cuisine.id} value={cuisine.id}>
              {cuisine.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
  );
}
