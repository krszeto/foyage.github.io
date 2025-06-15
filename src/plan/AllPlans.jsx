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
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Link from '@mui/material/Link';
import { useNavigate } from "react-router-dom";

const ALL_TRIPS = gql`
  query {
    trips {
      id
      user {
        firstName
        lastName
        email
      }
      firstDay
      lastDay
    }
  }
`;

function AllPlans() {
    const navigate = useNavigate();
  const tripInfo = useQuery(ALL_TRIPS);
  if (tripInfo.loading) return <p>Loading...</p>;
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Trip ID</TableCell>
            <TableCell align="right">Client name</TableCell>
            <TableCell align="right">Client email</TableCell>
            <TableCell align="right">First day of trip</TableCell>
            <TableCell align="right">Last day of trip</TableCell>
            <TableCell align="right">Link</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tripInfo.data?.trips.map((trip) => (
            <TableRow key={trip.id}>
              <TableCell component="th" scope="row">
                {trip.id}
              </TableCell>
              <TableCell component="th" scope="row">
                {trip.user.firstName + " " + trip.user.lastName}
              </TableCell>
              <TableCell align="right">{trip.user.email}</TableCell>
              <TableCell align="right">{trip.firstDay}</TableCell>
              <TableCell align="right">{trip.lastDay}</TableCell>
              <TableCell align="right">
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => {
                    navigate("/trip/" + trip.id);
                  }}
                >
                  See more
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default AllPlans;
