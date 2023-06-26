import React, { useState, useEffect, ChangeEvent } from "react";
import {
  Typography,
  Grid,
  Button,
  Modal,
  Box,
  Dialog,
  DialogContent,
  makeStyles,
  TextField,
} from "@material-ui/core";
import AtlasCard from "./AtlasCard";
import Atlas from "../interfaces/Atlas";
import AddAtlasForm from "./AddAtlasForm";

import { teal, grey } from "@material-ui/core/colors";
import { axiosInstance, axiosInstanceWithAuth } from "../utils/AxiosInstance";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useNavigate } from "react-router-dom";
import { AxiosResponse } from "axios";
import { authState } from "../features/auth/authSlice";
import LoadingSpinner from "../reusables/CircularSpinner";
import { Add } from "@mui/icons-material";

const styles = {
  root: {
    flexGrow: 1,
  },
  primaryColor: {
    color: teal[500],
  },
  secondaryColor: {
    color: grey[700],
  },

  padding: {
    padding: 4,
  },
  mainHeader: {
    backgroundColor: grey[100],
    padding: 20,
    alignItems: "center",
  },
  mainContent: {
    padding: 40,
  },
  secondaryContainer: {
    padding: "20px 25px",
    backgroundColor: grey[200],
  },
  addAtlasButton: {
    backgroundColor: "blue", // Use the primary color from the theme
    color: "white", // Use the contrasting text color for visibility
    "&:hover": {
      backgroundColor: "darkblue", // When hovering, change to a slightly darker shade
    },
  },
  gridForCard: {
    margin: 10,
    cursor: "pointer",
  },
};

const useStyles = makeStyles(styles);
interface AtlasErrorDetails {
  atlasName?: string;
  previewPictureURL?: string;
  file?: string;
  species?: string;
  numberOfCells?: string;
  modalities?: string;
  compatibleModels?: string;
}

function AtlasPage() {
  const classes = useStyles();
  const [atlases, setAtlases] = useState<Atlas[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const user: authState = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const handleAddAtlas = () => {
    setIsAddModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
  };

  useEffect(() => {
    // Fetch data from API
    setIsLoading(true);
    if (!user || user.role === "") {
      navigate("/login");
      return;
    }
    const fetchAtlasesFromMongo = async () => {
      let response: AxiosResponse<any> | undefined;
      if (user.role === "admin") {
        response = await axiosInstanceWithAuth.get("/api/atlases");
      } else if (user.role === "normal") {
        console.log("Normal user");
        const userId = user.id;
        console.log("userId", userId);
        console.log("User is ", user);
        response = await axiosInstanceWithAuth.get(
          `/api/atlases/user/${userId}`
        );
      }
      if (response !== undefined) {
        const data = response.data;
        console.log("data from mongo", data);

        return data;
      } else {
        return null;
      }
    };

    const fetchAndSetAtlases = async () => {
      const atlasesData = await fetchAtlasesFromMongo();
      if (atlasesData === null) {
        return;
      }
      const transformedData = atlasesData.map((atlas: any) => ({
        id: atlas.id,
        image: atlas.previewPictureURL,
        title: atlas.name,
        description: atlas.species,
        present_in_mongo: atlas.existsInMongo,
        present_in_gcp: atlas.existsInGCP,
      }));
      console.log("transformedData", transformedData);
      setAtlases(transformedData);
      setIsLoading(false);
    };

    fetchAndSetAtlases();
  }, [user]);

  // make it a protected Route. Only admin and normal can access this page
  if (!user || user.role === "") {
    navigate("/login");
  }

  return (
    <>
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
          Atlas Page
        </Typography>
      </div>
      {isLoading ? (
        <>
          <LoadingSpinner />
        </>
      ) : (
        <div>
          {/* Show no atlases if atlases is empty  */}
          {atlases.length === 0 && (
            <Typography variant="h6" component="h1" align="center" gutterBottom>
              No atlases found For this user
            </Typography>
          )}
          {user.permission == "upload" ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddAtlas}
              style={{ position: "relative", top: 0, right: 0 }}
            >
              Add Atlas
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddAtlas}
              style={{
                position: "relative",
                top: 0,
                right: 0,
                cursor: "not-allowed",
              }}
              disabled
            >
              Add Atlas
            </Button>
          )}

          <Grid container spacing={2} justify="center">
            {atlases.map((atlas) => (
              <Grid className={classes.gridForCard} item key={atlas.id}>
                <AtlasCard atlas={atlas} />
              </Grid>
            ))}
          </Grid>
          {/* Add Atlas Modal */}
          <Dialog
            className={classes.root}
            open={isAddModalOpen}
            fullWidth
            maxWidth="md"
            onClose={handleModalClose}
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <AddAtlasForm
                  setIsAddModalOpen={setIsAddModalOpen}
                  setIsLoading={setIsLoading}
                  user={user}
                />
              </>
            )}
          </Dialog>
        </div>
      )}
    </>
  );
}

export default AtlasPage;
