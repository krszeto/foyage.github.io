import { useState } from "react";
import * as React from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import TextField from "@mui/material/TextField";
import MultiCuisineSelector from "./MultiCuisineSelector.jsx";
import CuisineSelector from "./CuisineSelector.jsx";
import Stack from "@mui/material/Stack";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Button from "@mui/material/Button";

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

const CUISINES = gql`
  query {
    cuisines {
      id
      name
    }
  }
`;

const TOLERANCE = gql`
  query {
    toleranceForQueuing {
      displayString
      value
    }
  }
`;

const CREATE = gql`
  mutation createUserAndPreference(
    $firstName: String!
    $lastName: String!
    $email: String!
    $toleranceForQueuingType: String!
    $preferredCuisines: [PreferredCuisineType]!
    $additionalNotes: String
  ) {
    createUserAndPreference(
      firstName: $firstName
      lastName: $lastName
      email: $email
      toleranceForQueuingType: $toleranceForQueuingType
      preferredCuisines: $preferredCuisines
      additionalNotes: $additionalNotes
    ) {
      userAndPreference {
        user {
          firstName
          id
        }
        foodPreference {
          id
          toleranceForQueuing
          additionalNotes
          preferredCuisines {
            id
            name
            cuisinepreferenceSet {
              cuisine {
                name
                id
              }
              ranking
            }
          }
        }
      }
    }
  }
`;

const UPDATE = gql`
  mutation updateUserAndPreference(
    $id: ID!
    $firstName: String!
    $lastName: String!
    $toleranceForQueuingType: String!
    $preferredCuisines: [PreferredCuisineType]!
    $additionalNotes: String
  ) {
    updateUserAndPreference(
      id: $id
      firstName: $firstName
      lastName: $lastName
      toleranceForQueuingType: $toleranceForQueuingType
      preferredCuisines: $preferredCuisines
      additionalNotes: $additionalNotes
    ) {
      userAndPreference {
        user {
          firstName
          id
        }
        foodPreference {
          id
          toleranceForQueuing
          additionalNotes
          preferredCuisines {
            id
            name
            cuisinepreferenceSet {
              cuisine {
                name
                id
              }
              ranking
            }
          }
        }
      }
    }
  }
`;

function UserInformationForm({ userId, onSaveComplete, onCancel, saveButtonTextOverride }) {
  const cuisineData = useQuery(CUISINES);
  const toleranceForQueuing = useQuery(TOLERANCE);
  const [saveCreate, { saveCreateData, saveCreateLoading, saveCreateError }] =
    useMutation(CREATE, {
      onCompleted: (data) => {
        console.log(data);
        onSaveComplete(data.createUserAndPreference.userAndPreference.user.id);
      },
    });
  const [saveUpdate, { saveUpdateData, saveUpdateLoading, saveUpdateError }] =
    useMutation(UPDATE, {
      onCompleted: (data) => {
        console.log(data);
        onSaveComplete(data.updateUserAndPreference.userAndPreference.user.id);
      },
      refetchQueries: [
        {
          query: USER,
          variables: { userId: userId },
          awaitRefetchQueries: true,
        },
      ],
    });
  const userInfo = useQuery(USER, {
    variables: { userId: userId },
  });
  const userAndFoodPreference =
    userInfo.data && userInfo.data.foodPreferencesByUser;
  const [firstName, setFirstName] = React.useState(
    userAndFoodPreference?.user?.firstName
  );
  const [lastName, setLastName] = React.useState(
    userAndFoodPreference?.user?.lastName
  );
  const [email, setEmail] = React.useState(userAndFoodPreference?.user?.email);
  const [preferredCuisines, setPreferredCuisine] = React.useState(
    (userAndFoodPreference && [...userAndFoodPreference?.cuisinePreferences]?.map(
      (cuisine) => cuisine.cuisine.id
    )) ?? []
  );
  const [numberOneCuisine, setNumberOneCuisine] = React.useState(
    userAndFoodPreference?.cuisinePreferences?.find(
      (cuisine) => cuisine.ranking === 1
    )?.cuisine?.id
  );
  const [numberTwoCuisine, setNumberTwoCuisine] = React.useState(
    userAndFoodPreference?.cuisinePreferences?.find(
      (cuisine) => cuisine.ranking === 2
    )?.cuisine?.id
  );
  const [numberThreeCuisine, setNumberThreeCuisine] = React.useState(
    userAndFoodPreference?.cuisinePreferences?.find(
      (cuisine) => cuisine.ranking === 3
    )?.cuisine?.id
  );
  const matchingTolerance = userAndFoodPreference && toleranceForQueuing.data?.toleranceForQueuing?.find(
    (data) =>
      data.value ===
      userAndFoodPreference.foodPreference.toleranceForQueuing.slice(
        2
      ) || data.value ===
      userAndFoodPreference.foodPreference.toleranceForQueuing
  )?.value;
  const [queuingTolerance, setQueuingTolerance] = React.useState(
    matchingTolerance
  );
  const cuisines = cuisineData.data?.cuisines ?? [];
  const [otherNotes, setOtherNotes] = useState(
    userAndFoodPreference?.foodPreference?.additionalNotes
  );
  return (
    <>
      <div className="card">
        <h3>Basic Information</h3>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <TextField
              required
              id="first-name"
              label="First Name"
              sx={{ width: "50%" }}
              value={firstName ?? ""}
              onChange={(event) => {
                setFirstName(event.target.value);
              }}
            />
            <TextField
              required
              id="last-name"
              label="Last Name"
              sx={{ width: "50%" }}
              value={lastName ?? ""}
              onChange={(event) => {
                setLastName(event.target.value);
              }}
            />
          </Stack>
          <TextField
            required
            id="email"
            label="Email"
            value={email ?? ""}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
            disabled={!!userId} // Disable if userId is present
          />
        </Stack>
      </div>
      <div className="card">
        <h3>Overall Food Preferences</h3>
        <Stack spacing={2} style={{ textAlign: "start" }}>
          <MultiCuisineSelector
            values={cuisines}
            selectedValues={preferredCuisines}
            onSelectedValuesChanged={setPreferredCuisine}
            label="Cuisines you like"
          />
          {preferredCuisines.length > 0 && (
            <CuisineSelector
              values={cuisines.filter((value) =>
                preferredCuisines.includes(value.id)
              )}
              selectedValue={numberOneCuisine}
              onSelectedValueChanged={setNumberOneCuisine}
              label="Number 1 favorite cuisine"
            />
          )}
          {preferredCuisines.length > 1 && (
            <CuisineSelector
              values={cuisines.filter(
                (value) =>
                  preferredCuisines.includes(value.id) &&
                  value.id !== numberOneCuisine &&
                  value.id !== numberThreeCuisine
              )}
              selectedValue={numberTwoCuisine}
              onSelectedValueChanged={setNumberTwoCuisine}
              label="Number 2 favorite cuisine"
            />
          )}
          {preferredCuisines.length > 2 && (
            <CuisineSelector
              values={cuisines.filter(
                (value) =>
                  preferredCuisines.includes(value.id) &&
                  value.id !== numberOneCuisine &&
                  value.id !== numberTwoCuisine
              )}
              selectedValue={numberThreeCuisine}
              onSelectedValueChanged={setNumberThreeCuisine}
              label="Number 3 favorite cuisine"
            />
          )}
          <FormControl>
            <InputLabel id="tolerance-for-queuing-label">
              Tolerance for queuing
            </InputLabel>
            <Select
              labelId="tolerance-for-queuing-label"
              id="tolerance-for-queuing"
              value={queuingTolerance}
              label="Tolerance for queuing"
              onChange={(event) => {
                setQueuingTolerance(event.target.value);
              }}
            >
              {toleranceForQueuing.data?.toleranceForQueuing?.map(
                (tolerance) => (
                  <MenuItem key={tolerance.value} value={tolerance.value}>
                    {tolerance.displayString}
                  </MenuItem>
                )
              ) ?? []}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Dietary restrictions or other important notes"
            id="dietary-restrictions"
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
            onClick={() => onCancel()}>Cancel</Button>}
          <Button
            variant="contained"
            sx={{ width: "25%", marginTop: "20px" }}
            loading={saveCreateLoading || saveUpdateLoading}
            disabled={saveCreateLoading || saveUpdateLoading}
            onClick={() => {
              if (userId == null) {
                saveCreate({
                  variables: {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    toleranceForQueuingType: queuingTolerance,
                    preferredCuisines: preferredCuisines.map((cuisineId) => ({
                      cuisineID: cuisineId,
                      ranking:
                        cuisineId === numberOneCuisine
                          ? 1
                          : cuisineId === numberTwoCuisine
                          ? 2
                          : cuisineId === numberThreeCuisine
                          ? 3
                          : null,
                    })),
                    additionalNotes: otherNotes,
                  },
                });
              } else {
                saveUpdate({
                  variables: {
                    id: userId,
                    firstName: firstName,
                    lastName: lastName,
                    toleranceForQueuingType: queuingTolerance,
                    preferredCuisines: preferredCuisines.map((cuisineId) => ({
                      cuisineID: cuisineId,
                      ranking:
                        cuisineId === numberOneCuisine
                          ? 1
                          : cuisineId === numberTwoCuisine
                          ? 2
                          : cuisineId === numberThreeCuisine
                          ? 3
                          : null,
                    })),
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

export default UserInformationForm;
