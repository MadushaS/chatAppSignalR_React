import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Button,
  Card,
  Switch,
  Select,
  Loader,
  Field,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layouts/AppLayout';
import { userService } from '../services/userService';
import { useColorMode } from '../components/ui/color-mode';
import { toaster } from '../components/ui/toaster';
import Divider from '../components/ui/divider';
import { Portal } from '@chakra-ui/react';

const SettingsPage = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      all: true,
      messages: true,
      mentions: true,
      sounds: true
    },
    privacy: {
      showStatus: true,
      showLastSeen: true
    },
    theme: colorMode,
    language: 'en'
  });

  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        // Here you would fetch user settings from your backend
        // For now, we'll just use defaults or fetch from localStorage
        const savedSettings = localStorage.getItem(`settings_${user.id}`);
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        toaster.create({
          title: 'Error loading settings',
          description: 'Could not load your settings. Using defaults instead.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleSwitchChange = (section, setting) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [setting]: !prev[section][setting]
      }
    }));
  };

  const handleSelectChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'theme' && value !== colorMode) {
      toggleColorMode();
    }
  };

  const saveSettings = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);
      // Here you would save to your backend
      // For now, just save to localStorage
      localStorage.setItem(`settings_${user.id}`, JSON.stringify(settings));

      // Example of updating user profile status visibility
      if (user.id) {
        await userService.updateProfile({
          id: user.id,
          showStatus: settings.privacy.showStatus,
          showLastSeen: settings.privacy.showLastSeen
        });
      }

      toaster.create({
        title: 'Settings saved',
        description: 'Your preferences have been updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toaster.create({
        title: 'Save failed',
        description: 'Could not save your settings. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <Flex justify="center" align="center" height="100vh">
          <Loader />
        </Flex>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box maxW="800px" mx="auto" py={8} px={4}>
        <Heading size="lg" mb={6}>Settings</Heading>

        <VStack spacing={6} align="stretch">
          <Card.Root>
            <Card.Header>
              <Heading size="md">Notifications</Heading>
            </Card.Header>
            <Card.Body>
              <VStack spacing={4} align="stretch">
                <Field.Root display="flex" alignItems="center">
                  <Switch.Root
                    id="all-notifications"
                    isChecked={settings.notifications.all}
                    onChange={() => handleSwitchChange('notifications', 'all')}
                  >
                    <Switch.HiddenInput />
                    <Switch.Control />
                    <Switch.Label>Enable all notifications</Switch.Label>
                  </Switch.Root>
                </Field.Root>
                <Field.Root display="flex" alignItems="center">
                  <Switch.Root
                    id="message-notifications"
                    isChecked={settings.notifications.messages}
                    onChange={() => handleSwitchChange('notifications', 'messages')}
                    isDisabled={!settings.notifications.all}
                  >
                    <Switch.HiddenInput />
                    <Switch.Control />
                    <Switch.Label>New message notifications</Switch.Label>
                  </Switch.Root>
                </Field.Root>

                <Field.Root display="flex" alignItems="center">
                  <Switch.Root
                    id="mention-notifications"
                    isChecked={settings.notifications.mentions}
                    onChange={() => handleSwitchChange('notifications', 'mentions')}
                    isDisabled={!settings.notifications.all}
                  >
                    <Switch.HiddenInput />
                    <Switch.Control />
                    <Switch.Label>Mention notifications</Switch.Label>
                  </Switch.Root>
                </Field.Root>

                <Field.Root display="flex" alignItems="center">
                  <Switch.Root
                    id="sound-notifications"
                    isChecked={settings.notifications.sounds}
                    onChange={() => handleSwitchChange('notifications', 'sounds')}
                    isDisabled={!settings.notifications.all}
                  >
                    <Switch.HiddenInput />
                    <Switch.Control />
                    <Switch.Label>Sound notifications</Switch.Label>
                  </Switch.Root>
                </Field.Root>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Heading size="md">Privacy</Heading>
            </Card.Header>
            <Card.Body>
              <VStack spacing={4} align="stretch">
                <Field.Root display="flex" alignItems="center">
                  <Field.Label htmlFor="show-status" mb="0">
                  </Field.Label>
                  <Switch.Root
                    id="show-status"
                    isChecked={settings.privacy.showStatus}
                    onChange={() => handleSwitchChange('privacy', 'showStatus')}
                  >
                    <Switch.HiddenInput />
                    <Switch.Control />
                    <Switch.Label>Show online status</Switch.Label>
                  </Switch.Root>
                </Field.Root>

                <Field.Root display="flex" alignItems="center">
                  <Field.Label htmlFor="show-last-seen" mb="0">

                  </Field.Label>
                  <Switch.Root
                    id="show-last-seen"
                    isChecked={settings.privacy.showLastSeen}
                    onChange={() => handleSwitchChange('privacy', 'showLastSeen')}
                  >
                    <Switch.HiddenInput />
                    <Switch.Control />
                    <Switch.Label>Show last seen</Switch.Label>
                  </Switch.Root>
                </Field.Root>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Heading size="md">Appearance</Heading>
            </Card.Header>
            <Card.Body>
              <VStack spacing={4} align="stretch">
                <Field.Root>
                  <Select.Root
                    id="theme"
                    value={settings.theme}
                    onValueChange={(e) => handleSelectChange('theme', e.target.value)}
                  >
                    <Select.HiddenSelect />
                    <Select.Label>Select Theme</Select.Label>
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Select theme" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          <Select.Item item={"light"} key={"light"}>
                            {"Light"}
                            <Select.ItemIndicator />
                          </Select.Item>
                          <Select.Item item={"dark"} key={"dark"}>
                            {"Dark"}
                            <Select.ItemIndicator />
                          </Select.Item>
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                </Field.Root>



                <Field.Root>
                  <Select.Root
                    id="language"
                    value={settings.language}
                    onValueChange={(e) => handleSelectChange('language', e.target.value)}
                  >
                    <Select.HiddenSelect />
                    <Select.Label>Select Language</Select.Label>
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Select language" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          <Select.Item item={"en"} key={"english"}>
                            {"English"}
                            <Select.ItemIndicator />
                          </Select.Item>
                          <Select.Item item={"es"} key={"spanish"}>
                            {"Spanish"}
                            <Select.ItemIndicator />
                          </Select.Item>
                          <Select.Item item={"fr"} key={"french"}>
                            {"French"}
                            <Select.ItemIndicator />
                          </Select.Item>
                          <Select.Item item={"de"} key={"german"}>
                            {"German"}
                            <Select.ItemIndicator />
                          </Select.Item>
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                </Field.Root>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Divider />

          <Box textAlign="right">
            <Button
              colorScheme="blue"
              onClick={saveSettings}
              isLoading={saving}
            >
              Save Settings
            </Button>
          </Box>
        </VStack>
      </Box>
    </AppLayout>
  );
};

export default SettingsPage;