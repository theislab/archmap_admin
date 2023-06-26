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
  const [atlasName, setAtlasName] = useState("");
  const [previewPictureURL, setPreviewPictureURL] = useState("");
  const [modalities, setModalities] = useState<string[]>([]);
  const [compatibleModels, setCompatibleModels] = useState<string[]>([]);
  const [numberOfCells, setNumberOfCells] = useState("");
  const [species, setSpecies] = useState("");
  const [file, setFile] = useState<string | Blob | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<AtlasErrorDetails>();
  const [fileError, setFileError] = useState("");
  const [url, setUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const user: authState = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const handleAddAtlas = () => {
    setAtlasName("");
    setPreviewPictureURL("");
    setModalities([]);
    setNumberOfCells("");
    setSpecies("");
    setFile(null);
    setFileName("");
    setValidationErrors({});
    setCompatibleModels([]);
    setIsAddModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
  };
  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setFile(null);
    setFileName("");
    setFileError("");
  };

  const handleFormSubmit = (e: React.SyntheticEvent) => {
    setIsLoading(true);
    e.preventDefault();
    if (fileError.trim() !== "") {
      setIsLoading(false);
      return;
    }
    // Create a new FormData object
    const formData = new FormData();

    // Append form data
    formData.append("name", atlasName);
    formData.append("previewPictureURL", previewPictureURL);
    modalities.forEach((modality) => {
      formData.append("modalities", modality);
    });
    formData.append("numberOfCells", numberOfCells);
    formData.append("species", species);
    compatibleModels.forEach((compatibleModel) => {
      formData.append("compatibleModels", compatibleModel);
    });
    if (file) {
      formData.append("file", file);
    }
    formData.append("userId", user.id);
    formData.append("atlasUrl", url);

    // Make the API request to create the atlas using Axios
    axiosInstanceWithAuth
      .post("/api/atlases", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        // Handle the response
        console.log("Atlas created:", response.data);

        // Reset form fields
        setAtlasName("");
        setPreviewPictureURL("");
        setModalities([]);
        setCompatibleModels([]);
        setNumberOfCells("");
        setSpecies("");
        setFile(null);
        setIsLoading(false);
        setIsAddModalOpen(false);
        setUrl("");
        setFileName("");
        setFileError("");
        alert("Atlas created successfully");
      })
      .catch((error) => {
        console.error("Error creating atlas:", error);
        setIsLoading(false);
        alert("Error creating atlas");
      });
  };

  useEffect(() => {
    // Fetch data from API
    setIsLoading(true);
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
              <form
                onSubmit={(e) => {
                  handleFormSubmit(e);
                }}
              >
                <DialogContent className={classes.padding}>
                  <Grid container>
                    <Grid item xs={12}>
                      <Grid
                        container
                        direction="row"
                        className={classes.mainHeader}
                      >
                        <Grid item xs={12}>
                          <Typography
                            className={classes.primaryColor}
                            variant="h5"
                          >
                            Add A New Atlas here
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid
                      container
                      direction="row"
                      className={classes.mainContent}
                      spacing={1}
                    >
                      <Grid item xs={8}>
                        <TextField
                          fullWidth
                          margin="dense"
                          variant="outlined"
                          label="Atlas Name"
                          id="name"
                          value={atlasName}
                          onChange={(e) => {
                            setAtlasName(e.target.value);
                          }}
                          required
                        />
                      </Grid>
                      <Grid item xs={8}>
                        <TextField
                          fullWidth
                          margin="dense"
                          variant="outlined"
                          label="Preview Picture URL"
                          id="previewPictureURL"
                          value={previewPictureURL}
                          onChange={(e) => {
                            setPreviewPictureURL(e.target.value);
                          }}
                          required
                        />
                      </Grid>
                      <Grid item xs={8}>
                        <TextField
                          fullWidth
                          margin="dense"
                          variant="outlined"
                          label="Modalities (Proivde comma separated values)"
                          id="modalities"
                          value={modalities}
                          onChange={(e) => {
                            setModalities(e.target.value.split(","));
                          }}
                          required
                        />
                      </Grid>
                      <Grid item xs={8}>
                        <TextField
                          fullWidth
                          margin="dense"
                          variant="outlined"
                          label="Compatible Models(Proivde comma separated values)"
                          id="compatibleModels"
                          value={compatibleModels}
                          onChange={(e) => {
                            setCompatibleModels(e.target.value.split(","));
                          }}
                          required
                        />
                      </Grid>
                      <Grid item xs={8}>
                        <TextField
                          fullWidth
                          margin="dense"
                          variant="outlined"
                          label="Number of Cells"
                          id="numberOfCells"
                          value={numberOfCells}
                          onChange={(e) => {
                            setNumberOfCells(e.target.value);
                          }}
                          required
                        />
                      </Grid>
                      <Grid item xs={8}>
                        <TextField
                          fullWidth
                          margin="dense"
                          variant="outlined"
                          label="Species"
                          id="species"
                          value={species}
                          onChange={(e) => {
                            setSpecies(e.target.value);
                          }}
                          required
                        />
                      </Grid>
                      <Grid item xs={8}>
                        {file && (
                          <TextField
                            fullWidth
                            margin="dense"
                            variant="outlined"
                            label="Uploaded file"
                            value={fileName}
                            InputProps={{
                              readOnly: true,
                            }}
                          />
                        )}

                        {!file && (
                          <TextField
                            fullWidth
                            margin="dense"
                            variant="outlined"
                            label="Atlas URL to download"
                            id="url"
                            value={url}
                            onChange={handleUrlChange}
                            required={!file}
                          />
                        )}
                      </Grid>
                      <Grid item xs={8}>
                        <Button variant="contained" component="label">
                          <input
                            type="file"
                            onChange={(e) => {
                              if (
                                !e.target.files ||
                                e.target.files.length === 0
                              ) {
                                // you can display the error to the user
                                console.error("Select a file");
                                setFileError("Select a file");
                                return;
                              }

                              setFile(e.target.files[0]);
                              const { name } = e.target.files[0];
                              setFileName(name);
                              setFileError("");
                              setUrl("");
                            }}
                            accept=".h5ad"
                            required={url.trim() === ""}
                          />
                          Select Atlas
                        </Button>

                        {/* {fileError.trim() === "" && (
                    <Typography color="error">{fileError.trim()}</Typography>
                  )}
                  <Typography variant="body1" component="p">
                    {fileName && <p>Uploaded file is : {fileName} </p>}
                  </Typography> */}
                      </Grid>

                      <Grid item xs={12}>
                        <Grid container direction="row" spacing={1}>
                          <Grid item xs={4}>
                            <Button onClick={() => setIsAddModalOpen(false)}>
                              Cancel
                            </Button>
                          </Grid>
                          <Grid item xs={4}>
                            {user.permission === "upload" ? (
                              <Button
                                type="submit"
                                className={classes.addAtlasButton} // Apply the custom style
                              >
                                Add Atlas
                              </Button>
                            ) : (
                              <Button
                                type="submit"
                                disabled
                                className={classes.addAtlasButton} // Apply the custom style
                              >
                                Add Atlas
                              </Button>
                            )}
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </DialogContent>
              </form>
            )}
          </Dialog>
        </div>
      )}
    </>
  );
}

export default AtlasPage;
