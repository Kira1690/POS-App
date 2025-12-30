/**
 * ImagePicker Component
 * Allows picking images from camera or gallery
 * Stores images as base64 strings for AsyncStorage persistence
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ExpoImagePicker from 'expo-image-picker';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from './Icon';

interface ImagePickerProps {
  /** Current image value (base64 string or URL) */
  value?: string;
  /** Callback when image changes */
  onChange: (imageBase64: string | undefined) => void;
  /** Placeholder text when no image */
  placeholder?: string;
  /** Optional error message */
  error?: string;
  /** Disable the picker */
  disabled?: boolean;
  /** Image aspect ratio for cropping (width/height) */
  aspectRatio?: [number, number];
  /** Image quality 0-1 */
  quality?: number;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  value,
  onChange,
  placeholder = 'Add Image',
  error,
  disabled = false,
  aspectRatio = [4, 3],
  quality = 0.8,
}) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = useCallback(async (type: 'camera' | 'gallery') => {
    if (type === 'camera') {
      const { status } = await ExpoImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is needed to take photos.',
          [{ text: 'OK' }]
        );
        return false;
      }
    } else {
      const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Media library permission is needed to select photos.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  }, []);

  const pickImage = useCallback(async (source: 'camera' | 'gallery') => {
    if (disabled) return;

    const hasPermission = await requestPermissions(source);
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const options: ExpoImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: aspectRatio,
        quality: quality,
        base64: true,
      };

      let result: ExpoImagePicker.ImagePickerResult;

      if (source === 'camera') {
        result = await ExpoImagePicker.launchCameraAsync(options);
      } else {
        result = await ExpoImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          const mimeType = asset.mimeType || 'image/jpeg';
          const base64String = `data:${mimeType};base64,${asset.base64}`;
          onChange(base64String);
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [disabled, requestPermissions, aspectRatio, quality, onChange]);

  const showImageOptions = useCallback(() => {
    if (disabled) return;

    Alert.alert(
      value ? 'Change Image' : 'Add Image',
      'Choose a source',
      [
        { text: 'Camera', onPress: () => pickImage('camera') },
        { text: 'Gallery', onPress: () => pickImage('gallery') },
        ...(value ? [{ text: 'Remove', onPress: () => onChange(undefined), style: 'destructive' as const }] : []),
        { text: 'Cancel', style: 'cancel' as const },
      ]
    );
  }, [disabled, value, pickImage, onChange]);

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    pickerContainer: {
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: error ? theme.colors.error : theme.colors.outline,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.surfaceLight,
      overflow: 'hidden',
      minHeight: 150,
    },
    pickerContainerWithImage: {
      borderStyle: 'solid',
      borderColor: theme.colors.outline,
    },
    placeholderContainer: {
      flex: 1,
      minHeight: 150,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.lg,
    },
    placeholderIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    placeholderText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    placeholderSubtext: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
    imageContainer: {
      position: 'relative',
    },
    image: {
      width: '100%',
      height: 200,
      resizeMode: 'cover',
    },
    imageOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      padding: theme.spacing.sm,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    actionButtonText: {
      fontSize: 12,
      color: theme.colors.white,
      fontWeight: '500',
    },
    removeButton: {
      backgroundColor: 'rgba(239, 68, 68, 0.8)',
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorText: {
      fontSize: 12,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
    disabledOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(128, 128, 128, 0.3)',
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.pickerContainer,
          value && styles.pickerContainerWithImage,
        ]}
        onPress={showImageOptions}
        disabled={disabled || isLoading}
        activeOpacity={0.7}
        accessibilityLabel={value ? 'Change image' : 'Add image'}
        accessibilityRole="button"
      >
        {value ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: value }} style={styles.image} />
            <View style={styles.imageOverlay}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={showImageOptions}
                accessibilityLabel="Change image"
              >
                <Icon name="camera" size={16} color={theme.colors.white} accessibilityLabel="" />
                <Text style={styles.actionButtonText}>Change</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.removeButton]}
                onPress={() => onChange(undefined)}
                accessibilityLabel="Remove image"
              >
                <Icon name="delete" size={16} color={theme.colors.white} accessibilityLabel="" />
                <Text style={styles.actionButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <View style={styles.placeholderIcon}>
              <Icon
                name="camera-plus"
                size={28}
                color={theme.colors.primary}
                accessibilityLabel=""
              />
            </View>
            <Text style={styles.placeholderText}>{placeholder}</Text>
            <Text style={styles.placeholderSubtext}>
              Tap to add from camera or gallery
            </Text>
          </View>
        )}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.white} />
          </View>
        )}
        {disabled && <View style={styles.disabledOverlay} />}
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default ImagePicker;
