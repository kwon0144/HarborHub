"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { Menu as MenuIcon, Close as CloseIcon } from "@mui/icons-material";

export default function Navbar({ isAdminView, setIsAdminView }) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    const storedAdminView = localStorage.getItem('isAdminView') === 'true';
    if (storedAdminView !== isAdminView) {
      setIsAdminView(storedAdminView);
    }
  }, []);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleView = () => {
    setIsAdminView((prev) => {
      const next = !prev;
      
      localStorage.setItem('isAdminView', next.toString());
      
      const target = next ? "/services-statistics" : "/";
      setTimeout(() => {
        router.push(target);
        window.dispatchEvent(new CustomEvent('adminViewChanged'));
      }, 0);
      
      return next;
    });
  };


  const userNavItems = [
    { name: "Home", path: "/" },
    { name: "Online Resources", path: "/online-resources" },
    { name: "Engaging Activities", path: "/engaging-activities" },
    { name: "Booking Therapy", path: "/booking" },
    { name: "About Us", path: "/about" }
  ];

  const adminNavItems = [
    { name: "Services Statistics", path: "/services-statistics" },
    { name: "Engaging Activities", path: "/engaging-activities" },
    { name: "Booking Therapy", path: "/booking" }
  ];

  const effectiveAdminView = isHydrated ? isAdminView : false;
  const navItems = effectiveAdminView ? adminNavItems : userNavItems;

  const drawer = (
    <Box sx={{ width: 360, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" component="div">
          Menu
        </Typography>
        <IconButton onClick={handleDrawerToggle} color="inherit">
          <CloseIcon />
        </IconButton>
      </Box>
     
      <List>
        {navItems.map((item) => (
          <ListItem 
            key={item.path} 
            component={Link} 
            href={item.path}
            onClick={handleDrawerToggle}
            sx={{ 
              color: 'white', 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              borderRadius: 1,
              mb: 0.5
            }}
          >
            <ListItemText 
              primary={item.name} 
              primaryTypographyProps={{ 
                fontWeight: 700,
                fontSize: '1rem'
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="static" 
        sx={{ 
          bgcolor: 'var(--navbar-bg)',
          boxShadow: 'none'
        }}
      >
        <Toolbar sx={{ maxWidth: 1200, mx: 'auto', width: '100%', py: 3 }}>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Image 
                src="/logo/logo_white.png" 
                alt="Whitespace Logo" 
                width={125} 
                height={40} 
              />
            </Link>
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  href={item.path}
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    px: 2.5,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: '#8D7E95',
                      color: '#FACAA9'
                    }
                  }}
                >
                  {item.name}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={toggleView}
              sx={{
                borderColor: 'white',
                color: 'white',
                px: 2.5,
                py: 1,
                fontWeight: 700,
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              {effectiveAdminView ? 'User View' : 'Admin View'}
            </Button>
            
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
                sx={{ ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block' },
          '& .MuiDrawer-paper': { 
            bgcolor: 'var(--navbar-bg)',
            color: 'white',
            width: 360
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}


