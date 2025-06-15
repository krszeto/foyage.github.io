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
import UserInformation from "./UserInformation.jsx";
import TripInformation from "./TripInformation.jsx";
import WagyuPreferencesForm from "./WagyuPreferencesForm.jsx";
import WagyuPreferences from "./WagyuPreferences.jsx";

const TRIP = gql`
  query tripData($tripId: ID!) {
    tripById(id: $tripId) {
      user {
        id
        foodpreference {
          id
          preferredCuisines {
            name
            id
          }
          wagyupreference {
            id
          }
        }
      }
      cuisinesToPrioritize {
        id
        name
      }
    }
  }
`;

const CITIES = gql`
  query {
    cities {
      id
      name
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

const SAVE = gql`
  mutation createTrip(
    $userId: ID!
    $firstDay: Date!
    $lastDay: Date!
    $tripSegments: [TripSegmentInputType]!
    $numberOfPeople: Int!
    $appetiteSize: String!
    $mealBudget: String!
    $cuisinesToPrioritize: [ID]!
    $additionalNotes: String
  ) {
    createTrip(
      userId: $userId
      firstDay: $firstDay
      lastDay: $lastDay
      tripSegments: $tripSegments
      numberOfPeople: $numberOfPeople
      appetiteSize: $appetiteSize
      mealBudget: $mealBudget
      cuisinesToPrioritize: $cuisinesToPrioritize
      additionalNotes: $additionalNotes
    ) {
      trip {
        id
        firstDay
        lastDay
        numberOfPeople
        mealBudget
        appetiteSize
        cuisinesToPrioritize {
          id
          name
        }
        cities {
          id
          name
        }
      }
    }
  }
`;

const wagyuTypes = [
  "Yakiniku",
  "Sukiyaki",
  "Shabu Shabu",
  "Steakhouse",
  "Teppanyaki",
  "Beef Course",
];

const wagyuAmbiance = ["Casual", "Traditional", "Modern", "Refined"];

const wagyuCookingPreference = [
  "Prefer self cooked",
  "Prefer cooked by staff",
  "No preference",
];

function CreatePlan() {
  let { trip_id } = useParams();
  const tripInfo = useQuery(TRIP, {
    variables: { tripId: trip_id },
  });
  const userId = tripInfo.data?.tripById?.user?.id;
  const foodPreferenceId = tripInfo.data?.tripById?.user?.foodpreference?.id;
  const existingWagyuPreferenceId =
    tripInfo.data?.tripById?.user?.foodpreference?.wagyupreference?.id;
  const showWagyuPreferences =
    tripInfo.data?.tripById?.user?.foodpreference?.preferredCuisines?.some(
      (cuisine) => cuisine.name === "Wagyu"
    ) ||
    tripInfo.data?.tripById?.cuisinesToPrioritize?.some(
      (cuisine) => cuisine.name === "Wagyu"
    );
  const cuisineData = useQuery(CUISINES);
  const enums = useQuery(ENUMS);
  const citiesData = useQuery(CITIES);
  const [save, { saveData, saveLoading, saveError }] = useMutation(SAVE, {
    onCompleted: (data) => {
      console.log(data);
    },
  });
  const [preferredWagyuAmbiances, setPreferredWagyuAmbiances] = React.useState(
    []
  );
  const [preferredWagyuTypes, setPreferredWagyuTypes] = React.useState([]);
  const [shouldAvoidSmoky, setShouldAvoidSmokey] = React.useState(null);
  const [cookingPreference, setCookingPreference] = React.useState(null);
  const [horumonPreference, setHorumonPreference] = React.useState(null);

  const cuisines = cuisineData.data?.cuisines ?? [];
  const userInfo = null;
  const tripData = null;
  return (
    <>
      <h2>Now tell us about your trip...</h2>
      {userId && <UserInformation userId={userId} />}
      {trip_id && <TripInformation tripId={trip_id} />}
      {foodPreferenceId &&
        showWagyuPreferences &&
        (existingWagyuPreferenceId != null ? (
          <WagyuPreferences wagyuPreferenceId={existingWagyuPreferenceId} />
        ) : (
          <WagyuPreferencesForm foodPreferenceId={foodPreferenceId} />
        ))}
    </>
  );
}

export default CreatePlan;
