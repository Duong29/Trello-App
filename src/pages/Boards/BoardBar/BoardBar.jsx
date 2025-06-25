import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import DashboardIcon from '@mui/icons-material/Dashboard'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import BoltIcon from '@mui/icons-material/Bolt'
import FilterListIcon from '@mui/icons-material/FilterList'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import { Tooltip } from '@mui/material'
import Button from '@mui/material/Button'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
function BoardBar() {
  const menu_styles = {
    color: 'white',
    bgcolor: 'transparent',
    paddingX: '5px',
    border: 'none',
    borderRadius: '4px',
    '.MuiSvgIcon-root' : {
      color: 'white'
    },
    '&:hover' : {
      bgcolor: 'primary.50'
    }
  }
  return (
    <Box sx={{
      height: (theme) => theme.trello.boardBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      overflowX: 'auto',
      backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
      px: 2,
      '&::-webkit-scrollbar-thumb ' : {
        backgroundColor: '#ced0da'
      },
      '&::-webkit-scrollbar-thumb:hover ' : {
        backgroundColor: '#bfc2cf'
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip sx={menu_styles}
          icon={<DashboardIcon />}
          label="NhatDuongDev"
          clickable />
        <Chip sx={menu_styles}
          icon={<VpnLockIcon />}
          label="Public/Private Workspace"
          clickable />
        <Chip sx={menu_styles}
          icon={<AddToDriveIcon />}
          label="Add To Google Drive"
          clickable />
        <Chip sx={menu_styles}
          icon={<BoltIcon />}
          label="Automation"
          clickable />
        <Chip sx={menu_styles}
          icon={<FilterListIcon />}
          label="Filters"
          clickable />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<PersonAddIcon/>}
          sx={{ color:'white', borderColor: 'white', '&:hover': { borderColor: 'white' } }}
        >
          Invite
        </Button>
        <AvatarGroup sx={{
          '& .MuiAvatar-root': {
            width: '34px',
            height: '34px',
            fontSize: '16px',
            border: 'none',
            '&:first-of-type' : { bgcolor: '#a4b0be' }
          }
        }} max={5}>
          <Tooltip title="nhatduongdev">
            <Avatar alt="nhatduongdev" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEpwypr1Ef96ASQu088dPHs29hkjdtk4QIzQ&s" />
          </Tooltip>
          <Tooltip title="nhatduongdev">
            <Avatar alt="nhatduongdev" src="https://static1.srcdn.com/wordpress/wp-content/uploads/2025/05/sung-jinwoo-in-front-of-the-monarchs-of-solo-leveling.jpg" />
          </Tooltip>
          <Tooltip title="nhatduongdev">
            <Avatar alt="nhatduongdev" src="https://i.ytimg.com/vi/KxeHOxO3A3I/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAaaZ7xEeSk-hgrk0OpVNVbnduD3Q" />
          </Tooltip>
          <Tooltip title="nhatduongdev">
            <Avatar alt="nhatduongdev" src="https://i.ytimg.com/vi/KxeHOxO3A3I/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAaaZ7xEeSk-hgrk0OpVNVbnduD3Q" />
          </Tooltip>
          <Tooltip title="nhatduongdev">
            <Avatar alt="nhatduongdev" src="https://i.ytimg.com/vi/KxeHOxO3A3I/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAaaZ7xEeSk-hgrk0OpVNVbnduD3Q" />
          </Tooltip>
          <Tooltip title="nhatduongdev">
            <Avatar alt="nhatduongdev" src="https://i.ytimg.com/vi/KxeHOxO3A3I/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAaaZ7xEeSk-hgrk0OpVNVbnduD3Q" />
          </Tooltip>
        </AvatarGroup>
      </Box>
    </Box>
  )
}

export default BoardBar