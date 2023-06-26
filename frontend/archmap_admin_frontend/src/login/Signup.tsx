import React, { useState } from "react";
import { Typography, makeStyles } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { axiosInstance } from "../utils/AxiosInstance";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../reusables/CircularSpinner";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(2),

    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "300px",
    },
    "& .MuiButtonBase-root": {
      margin: theme.spacing(2),
    },
  },
}));

const SignUpForm = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  // create state variables for each input
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    console.log(firstName, lastName, email, password);
    try {
      // Make the API request to create the user using Axios

      const response = await axiosInstance.post("/register", {
        fullName: firstName + " " + lastName,
        email: email,
        password: password,
      });
      // Handle the response
      console.log("User created:", response.data);

      setLoading(false);
      navigate("/login");
    } catch (error) {
      console.error("Error creating user:", error);
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingSpinner />}
      <div
        style={{
          textAlign: "center",
          background: "#f2f2f2",
          padding: "10px",
          marginBottom: "20px",
          border: "1px solid #ccc",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          marginLeft: 80,
        }}
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/3/3d/Helmholtz_Munich_Logo.jpg" // Replace with your actual logo or icon
          alt="Admin Logo"
          style={{ height: "30px", marginRight: "10px" }}
        />
        <Typography variant="h4" style={{ display: "inline-block" }}>
          Sign Up
        </Typography>
      </div>
      <form className={classes.root} onSubmit={handleSubmit}>
        <TextField
          label="First Name"
          variant="filled"
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <TextField
          label="Last Name"
          variant="filled"
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <TextField
          label="Email"
          variant="filled"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          variant="filled"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div>
          <Button type="submit" variant="contained" color="primary">
            Signup
          </Button>
        </div>
      </form>
    </>
  );
};

export default SignUpForm;
