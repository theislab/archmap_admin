import axios from "axios";
import { Card, CardContent, CardMedia, Typography } from "@material-ui/core";
import { useEffect, useState } from "react";
import Atlas from "../interfaces/Atlas";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../utils/AxiosInstance";

function AtlasList() {
  const [atlases, setAtlases] = useState<Atlas[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance
      .get<Atlas[]>("/api/atlases")
      .then((response) => {
        setAtlases(response.data);
      })
      .catch((error: any) => {
        console.log(error);
      });
  }, []);

  return (
    <div>
      {atlases.map((atlas) => (
        <div onClick={() => navigate(`/atlas/${atlas.id}`)} key={atlas.id}>
          <Card key={atlas.id}>
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
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
export default AtlasList;
