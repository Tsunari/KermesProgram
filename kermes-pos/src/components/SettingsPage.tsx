import React, { ChangeEvent } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Link } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import PaletteIcon from '@mui/icons-material/Palette';
import LanguageIcon from '@mui/icons-material/Language';
import BackupIcon from '@mui/icons-material/Backup';
import CodeIcon from '@mui/icons-material/Code';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import ModernSwitch from './ui/ModernSwitch';
import { productService } from '../services/productService';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../contexts/LanguageContext';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface SettingsPageProps {
  devMode: boolean;
  setDevMode: (value: boolean) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ devMode, setDevMode }) => {
  const {
    useDoubleClick,
    setUseDoubleClick,
    notifications,
    setNotifications,
    security,
    setSecurity,
    appearance,
    setAppearance,
    autoBackup,
    setAutoBackup,
    showDescription,
    setShowDescription,
    showScrollbars,
    setShowScrollbars,
  } = useSettings();

  const { language, setLanguage, t } = useLanguage();

  const handleDefineDefault = () => {
    if (window.confirm(t('settings.developer.defineDefaultDescription'))) {
      const jsonString = productService.exportProducts();
      alert(t('settings.developer.defineDefaultSuccess'));
    }
  };

  const renderSettingItem = (
    icon: React.ReactNode,
    primary: string,
    secondary: string,
    checked: boolean,
    onChange: (checked: boolean) => void,
    isActive: boolean = false,
    linkTo?: string
  ) => (
    <ListItem>
      <ListItemIcon>
        {icon}
      </ListItemIcon>
      <ListItemText 
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {primary}
            {isActive && (
              <Chip
                label={t('common.active')}
                size="small"
                color="success"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        }
        secondary={secondary}
      />
      {linkTo ? (
        <Button component={Link} to={linkTo} variant="outlined" size="small">
          {t('common.configure')}
        </Button>
      ) : (
        <ModernSwitch
          edge="end"
          checked={checked}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
        />
      )}
    </ListItem>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        {t('settings.title')}
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('settings.appearance.title')}
        </Typography>
        
        <List>
          {renderSettingItem(
            <CodeIcon />,
            t('settings.developer.devMode'),
            t('settings.developer.devModeDescription'),
            devMode,
            setDevMode,
            true
          )}
          
          <Divider />
          
          {renderSettingItem(
            <TouchAppIcon />,
            t('settings.doubleClick'),
            t('settings.doubleClickDescription'),
            useDoubleClick,
            setUseDoubleClick,
            true
          )}
          
          <Divider />
          
          {renderSettingItem(
            <VisibilityIcon />,
            t('settings.showDescription'),
            t('settings.showDescriptionDescription'),
            showDescription,
            setShowDescription,
            true
          )}
          
          <Divider />
          
          {renderSettingItem(
            <NotificationsIcon />,
            t('settings.notifications.enable'),
            t('settings.notifications.description'),
            notifications,
            setNotifications
          )}
          
          <Divider />
          
          {renderSettingItem(
            <SecurityIcon />,
            t('settings.security.enable'),
            t('settings.security.description'),
            security,
            setSecurity
          )}
          
          <Divider />
          
          {renderSettingItem(
            <PaletteIcon />,
            t('settings.appearance.title'),
            t('settings.appearance.darkModeDescription'),
            appearance,
            setAppearance,
            true,
            "/settings/appearance"
          )}
          
          <Divider />
          
          <ListItem>
            <ListItemIcon>
              <LanguageIcon />
            </ListItemIcon>
            <ListItemText 
              primary={t('settings.language.title')}
              secondary={t('settings.language.selectLanguage')}
            />
            <FormControl sx={{ minWidth: 120 }}>
              <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                size="small"
              >
                <MenuItem value="en">{t('settings.language.languages.en')}</MenuItem>
                <MenuItem value="de">{t('settings.language.languages.de')}</MenuItem>
                <MenuItem value="tr">{t('settings.language.languages.tr')}</MenuItem>
              </Select>
            </FormControl>
          </ListItem>
          
          <Divider />
          
          {renderSettingItem(
            <BackupIcon />,
            t('settings.backup.autoBackup'),
            t('settings.backup.description'),
            autoBackup,
            setAutoBackup
          )}
        </List>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('settings.about.title')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('settings.about.description')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('settings.about.version')} 1.0.0
        </Typography>
      </Paper>
    </Box>
  );
};

export default SettingsPage; 