import React, { useState, useEffect, useContext } from 'react';
// import { Auth, DataStore } from 'aws-amplify';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Box,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  useTheme,
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  Menu as MenuIcon,
  Delete,
} from '@mui/icons-material';
import { ConditionalWrapper, Divider, Typography } from '../../components';
import { AuthContext, UnauthedUser } from '../../contexts';
// import { pagePermissions } from '../../utils';

const Header = (props) => {
  const { pageName, pageKey } = props;
  const [userAnchorEl, setUserAnchorEl] = useState(null);
  const [userMenuSide, setUserMenuSide] = useState('left');
  const [navigationAnchorEl, setSavigationAnchorEl] = useState(null);
  const [pages, setPages] = useState([]);
  const { user, setUser } = useContext(AuthContext);
  const theme = useTheme();
  const userOpen = Boolean(userAnchorEl);
  const navigationOpen = Boolean(navigationAnchorEl);

  const handleClickUserMenu = (currentTarget, whichSide) => {
    setUserMenuSide(whichSide);
    setUserAnchorEl(currentTarget);
  };
  const handleCloseUserMenu = () => {
    setUserAnchorEl(null);
  };
  const handleClickNavigationMenu = (event) => {
    setSavigationAnchorEl(event.currentTarget);
  };
  const handleCloseNavigationMenu = () => {
    setSavigationAnchorEl(null);
  };

  // const handleLogout = () => {
  //   Auth.signOut();
  //   setUser(UnauthedUser);
  // };
  // const handleClearDatastore = () => {
  //   DataStore.clear();
  // }

  // useEffect(() => {
  //   if (user?.roles) {
  //     const filteredPages = pagePermissions.filter((page) => {
  //       if (!page.showInHeader) {
  //         return false;
  //       }

  //       if (page.limitedAccess) {
  //         return user.roles.some((role) => page.rolesAllowed.includes(role));
  //       }

  //       return true;
  //     });
  //     setPages(filteredPages);
  //   }
  // }, [user]);

  const renderPageTitle = () => {
    return (
      <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
        {pageName || 'My Poison Picker'}
      </Typography>
    );
  };

  const renderUserMenu = (whichSide = 'left') => {
    return (
      <>
        <IconButton
          onClick={(event) =>
            handleClickUserMenu(event.currentTarget, whichSide)
          }
          size='large'
          color='inherit'
          sx={{ ml: 2 }}
          aria-controls={userOpen ? 'account-menu' : undefined}
          aria-haspopup='true'
          aria-expanded={userOpen ? 'true' : undefined}
        >
          <AccountCircle />
        </IconButton>
      </>
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position='static'>
        <Toolbar>
          {/* Mobile View */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'flex', md: 'none' },
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {user.isAuthed && (
              <Box
                sx={{
                  flexGrow: 1,
                  display: { xs: 'flex', md: 'none' },
                  alignItems: 'center',
                }}
              >
                <IconButton
                  onClick={handleClickNavigationMenu}
                  size='large'
                  edge='start'
                  color='inherit'
                  aria-label='menu'
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={navigationAnchorEl}
                  id='navigation-menu'
                  open={navigationOpen}
                  onClose={handleCloseNavigationMenu}
                  onClick={handleCloseNavigationMenu}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                      mt: 1.5,
                      '& .MuiAvatar-root': {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                      },
                      '&:before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        left: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                >
                  {pages.map((page) => {
                    return (
                      <ConditionalWrapper
                        condition={page.key !== pageKey}
                        key={page.key}
                        wrapper={(children) => (
                          <Link
                            to={page.href}
                            key={page.key}
                            color={theme.palette.primary.main}
                            style={{ textDecoration: 'none' }}
                          >
                            {children}
                          </Link>
                        )}
                      >
                        <MenuItem disabled={page.key === pageKey}>
                          <ListItemIcon>{page.icon}</ListItemIcon>
                          <Typography>{page.name}</Typography>
                        </MenuItem>
                      </ConditionalWrapper>
                    );
                  })}
                </Menu>
              </Box>
            )}
            {renderPageTitle()}
            {user.isAuthed && renderUserMenu('right')}
          </Box>
          {/* Desktop View */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {user.isAuthed && (
              <>
                {renderUserMenu('left')}
                <Box sx={{ flexGrow: 1, display: 'flex' }}>
                  <>
                    {pages.map((page, index) => (
                      <ConditionalWrapper
                        condition={page.key !== pageKey}
                        key={page.key}
                        wrapper={(children) => (
                          <Link
                            to={page.href}
                            key={page.key}
                            style={{
                              textDecoration: 'none',
                              marginRight: '10px',
                              marginLeft: index === 0 ? '0px' : '10px',
                            }}
                          >
                            {children}
                          </Link>
                        )}
                      >
                        <Typography color={theme.palette.primary.contrastText}>
                          {page.name}
                        </Typography>
                      </ConditionalWrapper>
                    ))}
                  </>
                </Box>
              </>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              {renderPageTitle()}
            </Box>
          </Box>
          {/* User Menu */}
          {user.isAuthed && (
            <Menu
              anchorEl={userAnchorEl}
              id='account-menu'
              open={userOpen}
              onClose={handleCloseUserMenu}
              onClick={handleCloseUserMenu}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    left: userMenuSide === 'left' ? 14 : 'auto',
                    right: userMenuSide === 'right' ? 14 : 'auto',
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: userMenuSide, vertical: 'top' }}
              anchorOrigin={{ horizontal: userMenuSide, vertical: 'bottom' }}
            >
              <MenuItem disabled>{user.email}</MenuItem>
              <Divider />
              {user.roles.includes('admin') && (
                <div>
                  {/* <MenuItem onClick={handleClearDatastore}> */}
                  <MenuItem onClick={() => console.log('Clear Datastore')}>
                    <ListItemIcon>
                      <Delete fontSize='small' color={'primary'} />
                    </ListItemIcon>
                    Clear Data Store (Debugging)
                  </MenuItem>
                  <Divider />
                </div>
              )}
              {/* <MenuItem onClick={handleLogout}> */}
              <MenuItem onClick={() => console.log('Logout')}>
                <ListItemIcon>
                  <Logout fontSize='small' color={'primary'} />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;
