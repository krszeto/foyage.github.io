import { useState } from "react";
import * as React from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import TextField from "@mui/material/TextField";
import "./CreatePlan.css";
import MultiCuisineSelector from "./MultiCuisineSelector.jsx";
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

const CREATE = gql`
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

const UPDATE = gql`
  mutation updateTrip(
    $id: ID!
    $firstDay: Date!
    $lastDay: Date!
    $tripSegments: [TripSegmentInputType]!
    $numberOfPeople: Int!
    $appetiteSize: String!
    $mealBudget: String!
    $cuisinesToPrioritize: [ID]!
    $additionalNotes: String
  ) {
    updateTrip(
      id: $id
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

function TripInformationForm({ userId, tripId, onSaveComplete, onCancel, saveButtonTextOverride}) {
  const tripInfo = useQuery(INFO, {
    variables: { tripId: tripId },
  });
  const tripData = tripInfo.data?.tripById;
  const cuisineData = useQuery(CUISINES);
  const enums = useQuery(ENUMS);
  const citiesData = useQuery(CITIES);
  const [saveCreate, { saveCreateData, saveCreateLoading, saveCreateError }] =
    useMutation(CREATE, {
      onCompleted: (data) => {
        console.log(data);
        onSaveComplete(data.createTrip.trip.id);
      },
    });
  const [saveUpdate, { saveUpdateData, saveUpdateLoading, saveUpdateError }] =
    useMutation(UPDATE, {
      onCompleted: (data) => {
        console.log(data);
        onSaveComplete(data.updateTrip.trip.id);
      },
      refetchQueries: [
        {
          query: INFO,
          variables: { tripId: tripId },
          awaitRefetchQueries: true,
        },
      ],
    });
  const matchingBudget = tripData && enums?.data?.mealBudgets?.find(
    (data) =>
      data.value === tripData.mealBudget.slice(2) ||
      data.value === tripData.mealBudget
  )?.value;
  const [arrivalDate, setArrivalDate] = React.useState(
    tripData?.firstDay ? dayjs(tripData.firstDay) : null
  );
  const [departureDate, setDepartureDate] = React.useState(
    tripData?.lastDay ? dayjs(tripData.lastDay) : null
  );
  const [numOfPeople, setNumOfPeople] = React.useState(
    tripData?.numberOfPeople ?? ""
  );
  const [budgetPerMeal, setBudgetPerMeal] = React.useState(
    matchingBudget ?? ""
  );
  const [appetiteSize, setAppetiteSize] = React.useState(
    tripData?.appetiteSize ?? ""
  );
  const [tripPreferredCuisines, setTripPreferredCuisines] = React.useState(
    (tripData && [...tripData?.cuisinesToPrioritize]?.map((cuisine) => cuisine.id)) ?? []
  );
  const [citiesToVisit, setCitiesToVisit] = React.useState(
    tripData?.cities?.map((city) => city.name) ?? []
  );
  const tripSegments = tripInfo.data?.tripSegmentsByTripId;
  const initialNumOfDaysInCities = {};
  tripSegments?.forEach((segment) => {
    initialNumOfDaysInCities[segment.city.name] = segment.daysInCity;
  });
  const [numOfDaysInCities, setNumOfDaysInCities] = React.useState(
    initialNumOfDaysInCities
  );
  const [otherNotes, setOtherNotes] = useState(tripData?.additionalNotes);
  const totalAvailableDays =
    arrivalDate === null || departureDate === null
      ? 0
      : departureDate.diff(arrivalDate, "day") + 1;
  const cuisines = cuisineData.data?.cuisines ?? [];

  return (
    <>
      <div className="card">
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
            defaultValue={citiesToVisit}
            values={citiesToVisit}
            onChange={(_event, newValue) => {
              setCitiesToVisit(newValue);
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
      </div>
      <Stack
        direction="row"
        sx={{
          justifyContent: "flex-end",
        }}
        spacing={2}
      >
        {onCancel && <Button
          variant="outlined"
          sx={{ width: "25%", marginTop: "20px" }}
          onClick={() => onCancel()}
        >
          Cancel
        </Button>}
        <Button
          variant="contained"
          sx={{ width: "25%", marginTop: "20px" }}
          loading={saveCreateLoading || saveUpdateLoading}
          disabled={saveCreateLoading || saveUpdateLoading}
          onClick={() => {
            if (tripId == null) {
              saveCreate({
                variables: {
                  userId: userId,
                  firstDay: arrivalDate.toISOString().split("T")[0],
                  lastDay: departureDate.toISOString().split("T")[0],
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
            } else {
              saveUpdate({
                variables: {
                  id: tripId,
                  firstDay: arrivalDate.toISOString().split("T")[0],
                  lastDay: departureDate.toISOString().split("T")[0],
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
            }
          }}
        >
            {saveButtonTextOverride || "Save"}
        </Button>
      </Stack>
    </>
  );
}

export default TripInformationForm;
