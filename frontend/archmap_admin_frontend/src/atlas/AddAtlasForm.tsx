import { useState } from "react";
import { axiosInstance } from "../utils/AxiosInstance";

const AddAtlasForm = () => {
  const [name, setName] = useState("");
  const [previewPictureURL, setPreviewPictureURL] = useState("");
  const [modalities, setModalities] = useState<string[]>([]);
  const [numberOfCells, setNumberOfCells] = useState("");
  const [species, setSpecies] = useState("");
  const [file, setFile] = useState<string | Blob | null>(null);
  const [url, setUrl] = useState("");

  const handleFormSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    // Create a new FormData object
    const formData = new FormData();

    // Append form data
    formData.append("name", name);
    formData.append("previewPictureURL", previewPictureURL);
    modalities.forEach((modality) => {
      formData.append("modalities", modality);
    });
    formData.append("numberOfCells", numberOfCells);
    formData.append("species", species);
    if (file) {
      formData.append("file", file);
    }

    // Make the API request to create the atlas using Axios
    axiosInstance
      .post("/api/atlases", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        // Handle the response
        console.log("Atlas created:", response.data);

        // Reset form fields
        setName("");
        setPreviewPictureURL("");
        setModalities([]);
        setNumberOfCells("");
        setSpecies("");
        setFile(null);
      })
      .catch((error) => {
        console.error("Error creating atlas:", error);
      });
  };
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setFile(null);
  };

  return (
    <form
      style={{ display: "flex", flexDirection: "column" }}
      onSubmit={handleFormSubmit}
    >
      <label>
        Name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>

      <label>
        Preview Picture URL:
        <input
          type="text"
          value={previewPictureURL}
          onChange={(e) => setPreviewPictureURL(e.target.value)}
          required
        />
      </label>

      <label>
        Modalities:
        <input
          type="text"
          value={modalities}
          onChange={(e) => {
            setModalities(e.target.value.split(","));
          }}
          required
        />
      </label>

      <label>
        Number of Cells:
        <input
          type="text"
          value={numberOfCells}
          onChange={(e) => setNumberOfCells(e.target.value)}
          required
        />
      </label>

      <label>
        Species:
        <input
          type="text"
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          required
        />
      </label>

      <label>
        File:
        <input
          type="file"
          onChange={(e) => {
            if (!e.target.files || e.target.files.length === 0) {
              // you can display the error to the user
              console.error("Select a file");
              return;
            }

            setFile(e.target.files[0]);
            setUrl("");
          }}
          accept=".h5ad"
          required
        />
      </label>
      <label>
        or Enter URL:
        <input type="text" value={url} onChange={handleUrlChange} />
      </label>

      <button type="submit">Create Atlas</button>
    </form>
  );
};
export default AddAtlasForm;
