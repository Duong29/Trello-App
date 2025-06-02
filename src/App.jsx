import Button from '@mui/material/Button'
import { AccessAlarm, ThreeDRotation} from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import { pink } from '@mui/material/colors';
function App() {

  return (
    <>
      <div>duongdeptrai</div>
      <Button variant="text">Text</Button>
      <Button variant="contained">Contained</Button>
      <Button variant="outlined">Outlined</Button>
      <br />
      <AccessAlarm/>
      <ThreeDRotation/>
      <br />
      <HomeIcon color="primary" />
      <HomeIcon color="secondary" />
      <HomeIcon color="success" />
      <HomeIcon color="action" />
      <HomeIcon color="disabled" />
      <HomeIcon sx={{ color: pink[300] }} />
    </>
  )
}

export default App
