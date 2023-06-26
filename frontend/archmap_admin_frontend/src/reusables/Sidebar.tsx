import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { ListItemButton } from "@mui/material";
import { useNavigate } from "react-router-dom";

const drawerWidth = "15%";

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    [`& .MuiDrawer-paper`]: {
      width: drawerWidth,
      boxSizing: "border-box",
    },
  },
  appBar: {},
}));

export interface SidebarProps {
  routes: RouteConfig[];
}

export interface RouteConfig {
  path: string;
  name: string;
  icon?: React.ReactNode;
}

export default function CustomSidebar(props: SidebarProps) {
  const classes = useStyles();
  const { routes } = props;
  const navigate = useNavigate();

  const handleItemClick = (path: string) => {
    navigate(path);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <Drawer variant="permanent" className={classes.drawer}>
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {routes.map((route, index) => (
              <ListItem
                key={route.path}
                button
                onClick={() => handleItemClick(route.path)}
              >
                <ListItemButton>
                  {route.icon && <ListItemIcon>{route.icon}</ListItemIcon>}
                  <ListItemText primary={route.name} />
                </ListItemButton>
                <Divider />
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      </Drawer>
    </Box>
  );
}
