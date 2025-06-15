import * as React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(cuisine, preferredCuisine, theme) {
  return {
    fontWeight: preferredCuisine.includes(cuisine)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

export default function MultiCuisineSelector({
  values,
  selectedValues,
  onSelectedValuesChanged,
  label,
}) {
  const theme = useTheme();
  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    onSelectedValuesChanged(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };
  return (
    <div>
      <FormControl sx={{ width: "100%" }}>
        <InputLabel id="multi-cuisine-selector-label">{label}</InputLabel>
        <Select
          labelId="multi-cuisine-selector-label"
          id="multi-cuisine-selector"
          multiple
          value={selectedValues}
          onChange={handleChange}
          input={<OutlinedInput id="select-multiple-cuisine" label={label} />}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map((value) => {
                const matching = values.find((c) => c.id === value);
                return <Chip key={value} label={matching.name} />;
              })}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {values.map((cuisine) => (
            <MenuItem
              key={cuisine.id}
              value={cuisine.id}
              style={getStyles(cuisine, selectedValues, theme)}
            >
              {cuisine.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
