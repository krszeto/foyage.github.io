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
import TripInformationForm from "./TripInformationForm.jsx";

const INFO = gql`
  query tripData($tripId: ID!) {
    tripById(id: $tripId) {
      user {
        id
      }
      firstDay
      lastDay
      cities {
        id
        name
      }
      numberOfPeople
      appetiteSize
      mealBudget
      cuisinesToPrioritize {
        id
        name
      }
      additionalNotes
    }
    tripSegmentsByTripId(tripId: $tripId) {
      city {
        name
      }
      daysInCity
    }
  }
`;

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
          name
        }
        ranking
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

function TripInformation({ tripId }) {
  const cuisineData = useQuery(CUISINES);
  const tripInfo = useQuery(INFO, {
    variables: { tripId: tripId },
  });
  const userId = tripInfo.data?.tripById?.user?.id;
  const userInfo = useQuery(USER, {
    variables: { userId: userId },
  });
  const enums = useQuery(ENUMS);
  const citiesData = useQuery(CITIES);
  const [save, { saveData, saveLoading, saveError }] = useMutation(SAVE, {
    onCompleted: (data) => {
      console.log(data);
    },
  });
  const [arrivalDate, setArrivalDate] = React.useState(null);
  const [departureDate, setDepartureDate] = React.useState(null);
  const [numOfPeople, setNumOfPeople] = React.useState("");
  const [budgetPerMeal, setBudgetPerMeal] = React.useState("");
  const [appetiteSize, setAppetiteSize] = React.useState("");
  const [tripPreferredCuisines, setTripPreferredCuisines] = React.useState([]);
  const [queuingTolerance, setQueuingTolerance] = React.useState("");
  const [preferredWagyuAmbiances, setPreferredWagyuAmbiances] = React.useState(
    []
  );
  const [preferredWagyuTypes, setPreferredWagyuTypes] = React.useState([]);
  const [shouldAvoidSmoky, setShouldAvoidSmokey] = React.useState(null);
  const [cookingPreference, setCookingPreference] = React.useState(null);
  const [horumonPreference, setHorumonPreference] = React.useState(null);
  const [citiesToVisit, setCitiesToVisit] = React.useState([]);
  const [numOfDaysInCities, setNumOfDaysInCities] = React.useState({});
  const [otherNotes, setOtherNotes] = useState(null);

  const [isEdit, setIsEdit] = useState(false);

  const cuisines = cuisineData.data?.cuisines ?? [];
  const tripData = tripInfo.data?.tripById;
  const tripSegments = tripInfo.data?.tripSegmentsByTripId;
  const totalAvailableDays =
    tripData == null
      ? 0
      : dayjs(tripData.lastDay).diff(dayjs(tripData.firstDay), "day") + 1;
  if (isEdit) {
    return <TripInformationForm tripId={tripId} onSaveComplete={() => setIsEdit(false)} onCancel={() => setIsEdit(false)}/>;
  }
  return (
    <>
      <div className="card">
        <h3>Trip Information</h3>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <div>
              <b>Dates in Japan: </b>
            </div>
          </Stack>
          <Stack direction="row" spacing={2}>
            <div>(Arrival)</div>
            <div>{tripData && tripData.firstDay}</div>
          </Stack>
          <Stack direction="row" spacing={2}>
            <div>(Departure)</div>
            <div>{tripData && tripData.lastDay}</div>
            <div>
              {"(" +
                totalAvailableDays +
                " days + " +
                (totalAvailableDays - 1) +
                " nights)"}
            </div>
          </Stack>
          <Stack direction="row" spacing={2}>
            <div>
              <b>Cities to visit: </b>
            </div>
          </Stack>
          {tripSegments?.map((segment) => (
            <Stack direction="row" spacing={2}>
              <div>{segment.city.name}</div>
              <div>{"(" + segment.daysInCity + " days)"}</div>
            </Stack>
          ))}
          <Stack direction="row" spacing={2}>
            <div>
              <b>Number of people: </b>
            </div>
            <div>{tripData && tripData.numberOfPeople}</div>
          </Stack>
          <Stack direction="row" spacing={2}>
            <div>
              <b>Party's appetite: </b>
            </div>
            <div>
              {tripData &&
                enums?.data?.appetiteSizes?.find(
                  (appetite) => appetite.value === tripData.appetiteSize
                )?.displayString}
            </div>
          </Stack>
          <Stack direction="row" spacing={2}>
            <div>
              <b>Meal budget: </b>
            </div>
            <div>
              {tripData &&
                enums?.data?.mealBudgets?.find(
                  (budget) => budget.value === tripData.mealBudget.slice(2) || budget.value === tripData.mealBudget
                )?.displayString}
            </div>
          </Stack>
          <Stack direction="row" spacing={2}>
            <div>
              <b>Cuisines to priotize: </b>
            </div>
          </Stack>
          {tripData?.cuisinesToPrioritize?.map((cuisine) => (
            <Stack direction="row" spacing={2}>
              <div>{cuisine.name}</div>
            </Stack>
          ))}
          <Stack direction="row" spacing={2}>
            <div>
              <b>Trip specific additional notes: </b>
            </div>
            <div>{tripData && tripData.additionalNotes}</div>
          </Stack>
        </Stack>
        <Stack
          direction="row"
          sx={{
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="contained"
            sx={{ width: "25%", marginTop: "20px" }}
            onClick={() => {
              setIsEdit(true);
            }}
          >
            Edit
          </Button>
        </Stack>
      </div>
    </>
  );
}

export default TripInformation;
