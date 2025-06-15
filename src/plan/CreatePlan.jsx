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
import { useNavigate } from "react-router-dom";

const INFO = gql`
  query foodPreferencesByUser($userId: ID!) {
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

const SAVE_USER = gql`
  mutation createUser(
    $firstName: String!
    $lastName: String!
    $email: String!
  ) {
    createUser(firstName: $firstName, lastName: $lastName, email: $email) {
      user {
        id
        firstName
        lastName
        email
      }
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
  const navigate = useNavigate();
  let { id } = useParams();
  const cuisineData = useQuery(CUISINES);
  const userInfo = useQuery(INFO, {
    variables: { userId: id },
  });
  const enums = useQuery(ENUMS);
  const citiesData = useQuery(CITIES);
  const [save, { saveData, saveLoading, saveError }] = useMutation(SAVE, {
    onCompleted: (data) => {},
  });
  const [firstName, setFirstName] = React.useState(null);
  const [lastName, setLastName] = React.useState(null);
  const [email, setEmail] = React.useState(null);
  const [preferredCuisines, setPreferredCuisine] = React.useState([]);
  const [numberOneCuisine, setNumberOneCuisine] = React.useState(null);
  const [numberTwoCuisine, setNumberTwoCuisine] = React.useState(null);
  const [numberThreeCuisine, setNumberThreeCuisine] = React.useState(null);
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

  const totalAvailableDays =
    arrivalDate === null || departureDate === null
      ? 0
      : departureDate.diff(arrivalDate, "day") + 1;
  const cuisines = cuisineData.data?.cuisines ?? [];
  const userAndFoodPreference =
    userInfo.data && userInfo.data.foodPreferencesByUser;
  return (
    <>
      <h2>Now tell us about your trip...</h2>
      <UserInformation userId={id} />
      <TripInformationForm
        userId={id}
        onSaveComplete={(tripId) => navigate("/trip/" + tripId)}
        saveButtonTextOverride={"Next"}
      />
      {/* <div className="card">
        <h3>Trip Information</h3>
        <Stack spacing={2}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack direction="row" spacing={2}>
              <DatePicker
                label="First day in Japan"
                value={arrivalDate}
                onChange={setArrivalDate}
                minDate={dayjs()}
              />
              <DatePicker
                label="Last day in Japan"
                value={departureDate}
                onChange={setDepartureDate}
                minDate={arrivalDate}
                slotProps={
                  arrivalDate &&
                  departureDate && {
                    textField: {
                      helperText:
                        totalAvailableDays +
                        " days " +
                        (totalAvailableDays - 1) +
                        " nights",
                    },
                  }
                }
              />
            </Stack>
          </LocalizationProvider>
          <Autocomplete
            multiple
            options={citiesData?.data?.cities.map((city) => city.name) ?? []}
            values={citiesToVisit}
            onChange={(_event, newValue) => {
              setCitiesToVisit(newValue);
              console.log(newValue);
            }}
            freeSolo
            filterSelectedOptions
            renderValue={(value, getItemProps) =>
              value.map((option, index) => {
                const { key, ...itemProps } = getItemProps({ index });
                return <Chip label={option} key={key} {...itemProps} />;
              })
            }
            renderInput={(params) => (
              <TextField {...params} label="Cities to visit" />
            )}
          />
          {citiesToVisit
            .filter((city) => city !== "Open to suggestions")
            .map((city) => (
              <FormControl sx={{ width: "40%" }} key={city}>
                <InputLabel id={"days-in-" + city + "-label"}>
                  Days in {city}
                </InputLabel>
                <Select
                  labelId={"days-in-" + city + "-label"}
                  id={"days-in-" + city}
                  value={numOfDaysInCities[city]}
                  label={"Days in " + city}
                  onChange={(event) => {
                    const newNumOfDaysInCities = { ...numOfDaysInCities };
                    newNumOfDaysInCities[city] = event.target.value;
                    setNumOfDaysInCities(newNumOfDaysInCities);
                  }}
                >
                  <MenuItem key="undecided" value="Undecided">
                    Undecided
                  </MenuItem>
                  {Array.from({ length: totalAvailableDays }, (_, i) => (
                    <MenuItem key={i} value={i + 1}>
                      {i + 1}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
          <Stack direction="row" spacing={2}>
            <FormControl sx={{ width: "50%" }}>
              <InputLabel id="num-of-people-label">Number of people</InputLabel>
              <Select
                labelId="num-of-people-label"
                id="num-of-people"
                value={numOfPeople}
                label="Number of people"
                onChange={(event) => {
                  setNumOfPeople(event.target.value);
                }}
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <MenuItem key={i} value={i + 1}>
                    {i + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ width: "50%" }}>
              <InputLabel id="appetite-size-label">
                Party's appetite size
              </InputLabel>
              <Select
                labelId="appetite-size-label"
                id="appetite-size"
                value={appetiteSize}
                label="Party's appetite size"
                onChange={(event) => {
                  setAppetiteSize(event.target.value);
                }}
              >
                {enums?.data?.appetiteSizes?.map((appetite) => (
                  <MenuItem key={appetite.value} value={appetite.value}>
                    {appetite.displayString}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <FormControl>
            <InputLabel id="budget-per-meal-label">Meal budget</InputLabel>
            <Select
              labelId="budget-per-meal-label"
              id="budget-per-meal"
              value={budgetPerMeal}
              label="Meal budget"
              onChange={(event) => {
                setBudgetPerMeal(event.target.value);
              }}
            >
              {enums?.data?.mealBudgets.map((budget) => (
                <MenuItem key={budget.value} value={budget.value}>
                  {budget.displayString}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <MultiCuisineSelector
            values={cuisines}
            selectedValues={tripPreferredCuisines}
            onSelectedValuesChanged={setTripPreferredCuisines}
            label="Cuisines you want to prioritize for this trip"
          />
          <TextField
            fullWidth
            label="Trip specific dietary restrictions or other important notes"
            id="trip-specific-dietary-restrictions"
            multiline
            minRows={2}
            value={otherNotes ?? ""}
            onChange={(event) => {
              setOtherNotes(event.target.value);
            }}
          />
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
            loading={saveLoading}
            disabled={saveLoading}
            onClick={() => {
              save({
                variables: {
                  userId: id,
                  firstDay: arrivalDate.toISOString().split('T')[0],
                  lastDay: departureDate.toISOString().split('T')[0],
                  tripSegments: citiesToVisit.map((city) => ({
                    cityId: citiesData.data?.cities.find((c) => c.name === city)
                      ?.id,
                    daysInCity: numOfDaysInCities[city] || 0,
                  })),
                  numberOfPeople: parseInt(numOfPeople),
                  appetiteSize: appetiteSize,
                  mealBudget: budgetPerMeal,
                  cuisinesToPrioritize: tripPreferredCuisines,
                  additionalNotes: otherNotes,
                },
              });
            }}
          >
            Next
          </Button>
        </Stack>
      </div>
      {preferredCuisines.includes("Wagyu") && (
        <div className="card">
          <h3>Wagyu Preferences</h3>
          <Stack spacing={2} style={{ textAlign: "start" }}>
            <MultiCuisineSelector
              values={wagyuTypes}
              selectedValues={preferredWagyuTypes}
              onSelectedValuesChanged={setPreferredWagyuTypes}
              label="How do you like your wagyu?"
            />
            <MultiCuisineSelector
              values={wagyuAmbiance}
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
                  shouldAvoidSmoky === null ? null : shouldAvoidSmoky ? 1 : 0
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
                {wagyuCookingPreference.map((pref) => (
                  <MenuItem key={pref} value={pref}>
                    {pref}
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
                value={horumonPreference}
                label="Do you like Horumon?"
                onChange={(event) => {
                  setHorumonPreference(event.target.value);
                }}
              >
                <MenuItem key="yes" value={1}>
                  Yes
                </MenuItem>
                <MenuItem key="no" value={0}>
                  No
                </MenuItem>
                <MenuItem key="no preference" value={2}>
                  No preference
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </div>
      )} */}
    </>
  );
}

export default CreatePlan;
