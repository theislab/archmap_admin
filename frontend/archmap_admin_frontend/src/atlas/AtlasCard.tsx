import { Card, CardContent, CardMedia, Typography } from "@material-ui/core";
import Atlas from "../interfaces/Atlas";
import { useNavigate } from "react-router-dom";

function AtlasCard({ atlas }: { atlas: Atlas }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/atlas/${atlas.id}`);
  };
  return (
    <Card onClick={handleClick}>
      <CardMedia
        style={{ height: 0, paddingTop: "56.25%" }}
        image={atlas.image}
        title={atlas.title}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="h2">
          {atlas.title}
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
          {atlas.description}
        </Typography>
        <div style={{ marginTop: "8px" }}>
          {atlas.present_in_mongo ? (
            <span
              style={{
                backgroundColor: "green",
                color: "white",
                padding: "4px",
                marginRight: "4px",
              }}
            >
              Mongo
            </span>
          ) : (
            <span
              style={{
                backgroundColor: "red",
                color: "white",
                padding: "4px",
                marginRight: "4px",
              }}
            >
              Mongo
            </span>
          )}
          {atlas.present_in_gcp ? (
            <span
              style={{
                backgroundColor: "green",
                color: "white",
                padding: "4px",
              }}
            >
              GCP
            </span>
          ) : (
            <span
              style={{
                backgroundColor: "red",
                color: "white",
                padding: "4px",
              }}
            >
              GCP
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AtlasCard;
