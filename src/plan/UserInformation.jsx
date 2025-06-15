import { useState } from "react";
import * as React from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import TextField from "@mui/material/TextField";
import "./CreatePlan.css";
import MultiCuisineSelector from "./MultiCuisineSelector.jsx";
import CuisineSelector from "./CuisineSelector.jsx";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Stack from "@mui/material/Stack";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";
import dayjs from "dayjs";
import Button from "@mui/material/Button";
import { useParams } from "react-router-dom";
import UserInformationForm from "./UserInformationForm.jsx";

const USER = gql`
  query userPreferences($userId: ID!) {
    foodPreferencesByUser(userId: $userId) {
      user {
        id
        email
        firstName
        lastName
      }
      foodPreference {
        id
        toleranceForQueuing
        additionalNotes
      }
      cuisinePreferences {
        cuisine {
          id
          name
        }
        ranking
      }
    }
  }
`;

const ENUMS = gql`
  query {
    mealBudgets {
      displayString
      value
    }
    appetiteSizes {
      displayString
      value
    }
    toleranceForQueuing {
      displayString
      value
    }
  }
`;

const CUISINES = gql`
  query {
    cuisines {
      id
      name
    }
  }
`;

function UserInformation({ userId }) {
  const userInfo = useQuery(USER, {
    variables: { userId: userId },
  });
  const enums = useQuery(ENUMS);
  const [isEdit, setIsEdit] = React.useState(false);
  const userAndFoodPreference =
    userInfo.data && userInfo.data.foodPreferencesByUser;
  if (isEdit) {
    return <UserInformationForm userId={userId} onSaveComplete={() => setIsEdit(false)} onCancel={() => setIsEdit(false)}/>;
  }
  return (
    <>
      <div className="card">
        <h3>User Information</h3>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <div>
              <b>Name: </b>
            </div>
            <div>
              {userAndFoodPreference &&
                userAndFoodPreference.user.firstName +
                  " " +
                  userAndFoodPreference.user.lastName}
            </div>
          </Stack>
          <Stack direction="row" spacing={2}>
            <div>
              <b>Email: </b>
            </div>
            <div>
              {userAndFoodPreference && userAndFoodPreference.user.email}
            </div>
          </Stack>
          <Stack direction="row" spacing={2}>
            <div>
              <b>Tolerance for queuing: </b>
            </div>
            <div>
              {userAndFoodPreference &&
                userAndFoodPreference &&
                enums.data &&
                enums.data.toleranceForQueuing?.find(
                  (data) =>
                    data.value ===
                    userAndFoodPreference.foodPreference.toleranceForQueuing.slice(
                      2
                    ) || data.value ===
                    userAndFoodPreference.foodPreference.toleranceForQueuing
                )?.displayString}
            </div>
          </Stack>
          <Stack direction="row" spacing={2}>
            <div>
              <b>Preferred Cuisines: </b>
            </div>
          </Stack>
          {userAndFoodPreference &&
            [...userAndFoodPreference.cuisinePreferences]
              ?.sort((a, b) => (a.ranking ?? 4) - (b.ranking ?? 4))
              ?.map((cuisinePreference) => (
                <Stack
                  direction="row"
                  spacing={2}
                  key={cuisinePreference.cuisine.name}
                >
                  <div>({cuisinePreference.ranking ?? "Others"})</div>
                  <div>{cuisinePreference.cuisine.name}</div>
                </Stack>
              ))}
          <Stack direction="row" spacing={2}>
            <div>
              <b>Additional Notes: </b>
            </div>
            <div>
              {userAndFoodPreference &&
                userAndFoodPreference.foodPreference.additionalNotes}
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

export default UserInformation;
