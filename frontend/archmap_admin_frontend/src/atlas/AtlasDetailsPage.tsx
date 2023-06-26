// page to show a single atlas and its details and option to delete it
// Path: src/atlas/SingleAtlasPage.tsx

import React, { useState, useEffect } from "react";
import Atlas from "../interfaces/Atlas";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";

import axios from "axios";
import {
  Backdrop,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Modal,
  TextField,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { axiosInstance, axiosInstanceWithAuth } from "../utils/AxiosInstance";
import { useSelector } from "react-redux";
import { RootState } from "../store";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const useStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  margin: "1rem",
  padding: "1rem",
};

const AtlasDetailsPage = () => {
  const [atlasDetails, setAtlasDetails] = useState<Atlas | undefined>();
  const [atlasDetailsForm, setAtlasDetailsForm] = useState<Atlas>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    axiosInstance
      .get(`/api/atlases/${id}`)
      .then((response) => {
        console.log("Response: ", response.data);
        setAtlasDetails(response.data);
        setAtlasDetailsForm(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [id]);

  const handleDelete = () => {
    axiosInstanceWithAuth
      .delete(`/api/atlases/${id}`)
      .then(() => {
        setIsDeleteModalOpen(false);
        navigate("/");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleEdit = () => {
    // Implement the logic to handle the atlas details update
    // You can access the updated atlas details from the form inputs
    // and update the state or make an API request to update the data

    axiosInstanceWithAuth
      .put(`/api/atlases/${id}`, atlasDetailsForm)
      .then(() => {
        setIsEditModalOpen(false);
        navigate("/");
      })
      .catch((error) => {
        console.error(error);
      });

    // After the update is successful, close the modal
  };

  const setDeleteModalOpen = (arg0: boolean) => {
    setIsDeleteModalOpen(arg0);
  };
  if (user && user.permission == "") {
    navigate("/login");
  }

  return (
    <>
      <Button
        style={{ position: "absolute", top: "1rem", left: "1rem" }}
        component={Link}
        to="/"
        variant="contained"
        color="primary"
      >
        Go to Home
      </Button>
      {atlasDetails && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "5rem",

            boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.75)",
            backgroundColor: "lightgray",
          }}
        >
          <Box style={{ width: "50%", padding: "1rem" }}>
            <img
              src={atlasDetails.previewPictureURL}
              alt={atlasDetails.title}
              style={{ width: "40%", marginBottom: "1rem" }}
            />
            <Typography variant="h4" component="h1" gutterBottom>
              {atlasDetails.title}
            </Typography>
            <Typography variant="h6">{atlasDetails.description}</Typography>
            <Typography variant="body1">
              <strong>Id: </strong>
              {atlasDetails.id}
            </Typography>
            <Typography variant="body1">
              <strong>Name: </strong>
              {atlasDetails.name}
            </Typography>
            <Typography variant="body1">
              <strong>Modalities: </strong>
              {atlasDetails.modalities}
            </Typography>
            <Typography variant="body1">
              <strong>Number of Cells: </strong>
              {atlasDetails.numberOfCells}
            </Typography>
            <Typography variant="body1">
              <strong>Species: </strong>
              {atlasDetails.species}
            </Typography>
            <Typography variant="body1">
              <strong>Compatible Models: </strong>
              {atlasDetails.compatibleModels.join(", ")}
            </Typography>
            <Typography variant="body1">
              <strong>File Size: </strong>
              {atlasDetails.fileSize} MB
            </Typography>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setIsDeleteModalOpen(true)}
                style={{ marginTop: "1rem" }}
              >
                Delete
              </Button>
              <Button
                variant="contained"
                onClick={() => setIsEditModalOpen(true)}
                style={{ marginTop: "1rem", marginLeft: "1rem" }}
              >
                Edit
              </Button>
            </div>

            <Dialog
              open={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">
                {"Do you want to delete this atlas?"}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  Are you sure you want to delete this atlas?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setIsDeleteModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleDelete} autoFocus>
                  Yes, Delete it!
                </Button>
              </DialogActions>
            </Dialog>

            {/* Edit Modal */}

            <Dialog
              open={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              aria-labelledby="edit-dialog-title"
              aria-describedby="edit-dialog-description"
              maxWidth="md"
              fullWidth
            >
              <DialogTitle id="edit-dialog-title">Edit Atlas</DialogTitle>
              <DialogContent dividers>
                <form onSubmit={handleEdit}>
                  <TextField
                    label="Name"
                    value={atlasDetailsForm?.name || ""}
                    onChange={(e) =>
                      setAtlasDetailsForm((prevAtlasDetails: any) => ({
                        ...prevAtlasDetails,
                        name: e.target.value,
                      }))
                    }
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Preview Picture URL"
                    value={atlasDetailsForm?.previewPictureURL || ""}
                    onChange={(e) =>
                      setAtlasDetailsForm((prevAtlasDetails: any) => ({
                        ...prevAtlasDetails,
                        previewPictureURL: e.target.value,
                      }))
                    }
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Modalities"
                    value={atlasDetailsForm?.modalities || ""}
                    onChange={(e) =>
                      setAtlasDetailsForm((prevAtlasDetails: any) => ({
                        ...prevAtlasDetails,
                        modalities: e.target.value,
                      }))
                    }
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Number of Cells"
                    value={atlasDetailsForm?.numberOfCells || ""}
                    onChange={(e) =>
                      setAtlasDetailsForm((prevAtlasDetails: any) => ({
                        ...prevAtlasDetails,
                        numberOfCells: e.target.value,
                      }))
                    }
                    fullWidth
                    margin="normal"
                  />

                  <TextField
                    label="Species"
                    value={atlasDetailsForm?.species || ""}
                    onChange={(e) =>
                      setAtlasDetailsForm((prevAtlasDetails: any) => ({
                        ...prevAtlasDetails,
                        species: e.target.value,
                      }))
                    }
                    fullWidth
                    margin="normal"
                  />

                  <TextField
                    label="Compatible Models"
                    value={atlasDetailsForm?.compatibleModels || ""}
                    onChange={(e) =>
                      setAtlasDetailsForm((prevAtlasDetails: any) => ({
                        ...prevAtlasDetails,
                        compatibleModels: e.target.value,
                      }))
                    }
                    fullWidth
                    margin="normal"
                  />

                  {/* Add more fields for other atlas details */}
                </form>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  onClick={handleEdit}
                >
                  Save
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </div>
      )}
    </>
  );
};
export default AtlasDetailsPage;
