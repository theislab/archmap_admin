import {
  Container,
  Typography,
  Box,
  Grid,
  Checkbox,
  Link,
  FormControlLabel,
  TextField,
  Button,
} from "@material-ui/core";
import exp from "constants";
import { axiosInstance } from "../utils/AxiosInstance";
import { useNavigate } from "react-router-dom";
import { RootState } from "../store";
import { useDispatch, useSelector } from "react-redux";
import { authState, login } from "../features/auth/authSlice";

export default function SignIn() {
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    console.log("Form submitted");
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get("email"),
      password: data.get("password"),
    });
    try {
      const response = await axiosInstance.post("/login", {
        email: data.get("email"),
        password: data.get("password"),
      });

      console.log("User logged in:", response.data);
      // Handle the response and store it in Redux
      const datatoAddtoRedux: authState = {
        role: response.data.user.role,
        name: response.data.user.fullName,
        email: response.data.user.email,
        jwttoken: response.data.accessToken,
        id: response.data.user.id,
        permission: response.data.user.permission,
      };
      console.log("datatoAddtoRedux", datatoAddtoRedux);
      dispatch(login(datatoAddtoRedux));
      navigate("/atlas");
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Error logging in. Wrong email or password.");
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          boxShadow: 3,
          borderRadius: 2,
          px: 4,
          py: 6,
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
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
            Login
          </Typography>
        </div>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <Button type="submit" fullWidth variant="contained">
            Sign In NOw
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href="/signup" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}
