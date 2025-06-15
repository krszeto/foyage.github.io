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
import WagyuPreferencesForm from "./WagyuPreferencesForm.jsx";

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

function WagyuPreferences({ wagyuPreferenceId }) {
  const wagyuPreference = useQuery(QUERY, {
    variables: { id: wagyuPreferenceId },
  });
  const enums = useQuery(ENUMS);
  const [isEdit, setIsEdit] = React.useState(false);
  if (isEdit) {
    return (
      <WagyuPreferencesForm
        wagyuPreferenceId={wagyuPreferenceId}
        onSaveComplete={() => setIsEdit(false)}
        onCancel={() => setIsEdit(false)}
      />
    );
  }
  return (
    <>
      <div className="card">
        <h3>Wagyu Preferences</h3>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <div>
              <b>Preferred styles: </b>
            </div>
            <div>
              {wagyuPreference.data?.wagyuPreferenceById?.wagyuType
                ?.map(
                  (type) =>
                    enums.data?.wagyuTypes?.find((en) => en.value === type)
                      ?.displayString
                )
                .join(", ")}
            </div>
          </Stack>
          <Stack direction="row" spacing={2}>
            <div>
              <b>Preferred ambiance: </b>
            </div>
            <div>
              {wagyuPreference.data?.wagyuPreferenceById?.ambiance
                ?.map(
                  (type) =>
                    enums.data?.wagyuAmbiance?.find((en) => en.value === type)
                      ?.displayString
                )
                .join(", ")}
            </div>
          </Stack>
          <Stack direction="row" spacing={2}>
            <div>
              <b>Minds smoky environments? </b>
            </div>
            <div>
              {wagyuPreference.data?.shouldAvoidSmokyEnvironment ? "Yes" : "No"}
            </div>
          </Stack>
          <Stack direction="row" spacing={2}>
            <div>
              <b>Preferred cooking style: </b>
            </div>
            <div>
              {enums.data?.wagyuCookingTypes?.find((en) => en.value === wagyuPreference.data?.wagyuPreferenceById?.cookingChoice)
                      ?.displayString}
            </div>
          </Stack>
          <Stack direction="row" spacing={2}>
            <div>
              <b>Likes Horumon? </b>
            </div>
            <div>
            {wagyuPreference.data?.wagyuPreferenceById?.doesLikeHorumon ? "Yes" : "No"}
            </div>
          </Stack>
          <Stack
            direction="row"
            sx={{
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="contained"
              sx={{ width: "20%" }}
              onClick={() => setIsEdit(true)}
            >
              Edit
            </Button>
          </Stack>
        </Stack>
      </div>
    </>
  );
}

export default WagyuPreferences;
