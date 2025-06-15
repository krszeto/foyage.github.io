import { useState } from "react";
import * as React from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import "./CreatePlan.css";
import MultiCuisineSelector from "./MultiCuisineSelector.jsx";
import Stack from "@mui/material/Stack";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Button from "@mui/material/Button";

const QUERY = gql`
  query wagyuPreferenceById($id: ID!) {
    wagyuPreferenceById(id: $id) {
      id
      foodPreference {
        id
      }
      wagyuType
      ambiance
      shouldAvoidSmokyEnvironment
      cookingChoice
      doesLikeHorumon
    }
  }
`;

const ENUMS = gql`
  query {
    wagyuTypes {
      displayString
      value
    }
    wagyuAmbiance {
      displayString
      value
    }
    wagyuCookingTypes {
      displayString
      value
    }
  }
`;

const CREATE = gql`
  mutation createWagyuPreference(
    $foodPreferenceId: ID!
    $wagyuTypes: [String]!
    $ambiance: [String]!
    $shouldAvoidSmokyEnvironment: Boolean!
    $cookingTypes: String!
    $doesLikeHorumon: Boolean
  ) {
    createWagyuPreference(
      foodPreferenceId: $foodPreferenceId
      wagyuTypes: $wagyuTypes
      ambiance: $ambiance
      shouldAvoidSmokyEnvironment: $shouldAvoidSmokyEnvironment
      cookingTypes: $cookingTypes
      doesLikeHorumon: $doesLikeHorumon
    ) {
      wagyuPreference {
        id
        wagyuType
        ambiance
        shouldAvoidSmokyEnvironment
        cookingChoice
        doesLikeHorumon
      }
    }
  }
`;

const UPDATE = gql`
  mutation updateWagyuPreference(
    $id: ID!
    $wagyuTypes: [String]!
    $ambiance: [String]!
    $shouldAvoidSmokyEnvironment: Boolean!
    $cookingTypes: String!
    $doesLikeHorumon: Boolean
  ) {
    updateWagyuPreference(
      id: $id
      wagyuTypes: $wagyuTypes
      ambiance: $ambiance
      shouldAvoidSmokyEnvironment: $shouldAvoidSmokyEnvironment
      cookingTypes: $cookingTypes
      doesLikeHorumon: $doesLikeHorumon
    ) {
      wagyuPreference {
        id
        wagyuType
        ambiance
        shouldAvoidSmokyEnvironment
        cookingChoice
        doesLikeHorumon
      }
    }
  }
`;

function WagyuPreferencesForm({
  foodPreferenceId,
  wagyuPreferenceId,
  onSaveComplete,
  onCancel,
}) {
  const enums = useQuery(ENUMS);
  const wagyuPreference = useQuery(QUERY, {
    variables: { id: wagyuPreferenceId },
  });
  const [saveCreate, { saveCreateData, saveCreateLoading, saveCreateError }] =
    useMutation(CREATE, {
      onCompleted: (data) => {
        console.log(data);
      },
    });
  const [saveUpdate, { saveUpdateData, saveUpdateLoading, saveUpdateError }] =
    useMutation(UPDATE, {
      onCompleted: (data) => {
        console.log(data);
        onSaveComplete(data.updateWagyuPreference.wagyuPreference.id);
      },
      refetchQueries: [
        {
          query: QUERY,
          variables: { id: wagyuPreferenceId },
          awaitRefetchQueries: true,
        },
      ],
    });

  const preferenceData = wagyuPreference.data?.wagyuPreferenceById;
  const [preferredWagyuAmbiances, setPreferredWagyuAmbiances] = React.useState(
    preferenceData?.ambiance ?? []
  );

  const [preferredWagyuTypes, setPreferredWagyuTypes] = React.useState(
    preferenceData?.wagyuType ?? []
  );
  const [shouldAvoidSmoky, setShouldAvoidSmokey] = React.useState(
    preferenceData?.shouldAvoidSmokyEnvironment
  );
  const [cookingPreference, setCookingPreference] = React.useState(
    preferenceData?.cookingChoice
  );
  const [horumonPreference, setHorumonPreference] = React.useState(
    preferenceData?.doesLikeHorumon
  );
  return (
    <>
      <div className="card">
        <h3>Wagyu Preferences</h3>
        <Stack spacing={2} style={{ textAlign: "start" }}>
          <MultiCuisineSelector
            values={
              enums.data?.wagyuTypes.map((type) => {
                return { name: type.displayString, id: type.value };
              }) ?? []
            }
            selectedValues={preferredWagyuTypes}
            onSelectedValuesChanged={setPreferredWagyuTypes}
            label="How do you like your wagyu?"
          />
          <MultiCuisineSelector
            values={
              enums.data?.wagyuAmbiance.map((type) => {
                return { name: type.displayString, id: type.value };
              }) ?? []
            }
            selectedValues={preferredWagyuAmbiances}
            onSelectedValuesChanged={setPreferredWagyuAmbiances}
            label="Preferred ambiance"
          />
          <FormControl>
            <InputLabel id="avoid-smoky-label">
              Do you mind smoky environments?
            </InputLabel>
            <Select
              labelId="budget-per-meal-label"
              id="budget-per-meal"
              value={
                shouldAvoidSmoky == null ? null : shouldAvoidSmoky ? 1 : 0
              }
              label="Do you mind smoky environments?"
              onChange={(event) => {
                setShouldAvoidSmokey(event.target.value === 1 ? true : false);
              }}
            >
              <MenuItem key="yes" value={1}>
                Yes
              </MenuItem>
              <MenuItem key="no" value={0}>
                No
              </MenuItem>
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel id="cooking-preference-label">
              Do you prefer self cooked or cooked by staff?
            </InputLabel>
            <Select
              labelId="cooking-preference-label"
              id="cooking-preference"
              value={cookingPreference}
              label="Do you prefer self cooked or cooked by staff?"
              onChange={(event) => {
                setCookingPreference(event.target.value);
              }}
            >
              {enums.data?.wagyuCookingTypes?.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.displayString}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel id="horumon-preference-label">
              Do you like Horumon?
            </InputLabel>
            <Select
              labelId="horumon-preference-label"
              id="horumon-preference"
              value={horumonPreference == null ? null : horumonPreference ? 1 : 0}
              label="Do you like Horumon?"
              onChange={(event) => {
                setHorumonPreference(event.target.value === 1 ? true : false);
              }}
            >
              <MenuItem key="yes" value={1}>
                Yes
              </MenuItem>
              <MenuItem key="no" value={0}>
                No
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </div>
      <Stack
        direction="row"
        sx={{
          justifyContent: "flex-end",
        }}
        spacing={2}
      >
        {onCancel && (
          <Button
            variant="outlined"
            sx={{ width: "25%", marginTop: "20px" }}
            onClick={() => onCancel()}
          >
            Cancel
          </Button>
        )}
        <Button
          variant="contained"
          sx={{ width: "25%", marginTop: "20px" }}
          loading={saveCreateLoading || saveUpdateLoading}
          disabled={saveCreateLoading || saveUpdateLoading}
          onClick={() => {
            if (wagyuPreferenceId == null) {
              saveCreate({
                variables: {
                  foodPreferenceId: foodPreferenceId,
                  wagyuTypes: preferredWagyuTypes,
                  ambiance: preferredWagyuAmbiances,
                  shouldAvoidSmokyEnvironment: shouldAvoidSmoky,
                  cookingTypes: cookingPreference,
                  doesLikeHorumon: horumonPreference,
                },
              });
            } else {
              console.log(horumonPreference);
              saveUpdate({
                variables: {
                  id: wagyuPreferenceId,
                  foodPreferenceId: foodPreferenceId,
                  wagyuTypes: preferredWagyuTypes,
                  ambiance: preferredWagyuAmbiances,
                  shouldAvoidSmokyEnvironment: shouldAvoidSmoky,
                  cookingTypes: cookingPreference,
                  doesLikeHorumon: horumonPreference,
                },
              });
            }
          }}
        >
          Save
        </Button>
      </Stack>
    </>
  );
}

export default WagyuPreferencesForm;
