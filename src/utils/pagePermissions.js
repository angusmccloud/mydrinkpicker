import { 
  Home, 
  List,
} from '@mui/icons-material';

const pagePermissions = [
  {
    showInHeader: true,
    name: 'Home',
    href: '/',
    icon: <Home fontSize='small' color={'primary'} />,
    key: 'home',
    limitedAccess: false,
  },
  {
    showInHeader: true,
    name: 'Manage Drinks',
    href: '/manage-drinks',
    icon: <List fontSize='small' color={'primary'} />,  
    key: 'manageDrinks',
    limitedAccess: false,
  },
  {
    showInHeader: false,
    name: '',
    href: '',
    key: 'notLoggedIn',
    limitedAccess: false,
  },
]

export default pagePermissions;