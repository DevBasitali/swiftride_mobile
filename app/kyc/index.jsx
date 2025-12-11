import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import kycService from '../../services/kycService';
import { Stack, router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function KycScreen() {
  const { kycStatus, refreshKycStatus, user, redirectByRole } = useAuth();
  const [uploading, setUploading] = useState(false);
  
  const [images, setImages] = useState({
    id_front: null,
    id_back: null,
    live_selfie: null,
    driving_license: null
  });

  // 1. Pick from Gallery (For IDs)
  const pickFromGallery = async (field) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Corrected to prevent crash
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled) {
        setImages(prev => ({ ...prev, [field]: result.assets[0] }));
      }
    } catch (error) {
      console.log('Gallery Error:', error);
      Alert.alert('Error', 'Could not open gallery.');
    }
  };

  // 2. Capture from Camera (For Selfie)
  const captureFromCamera = async (field) => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permission.granted === false) {
        Alert.alert("Permission Required", "You need to allow camera access to take a selfie.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1], // Square for selfie
        quality: 0.6,
        cameraType: ImagePicker.CameraType.front,
      });

      if (!result.canceled) {
        setImages(prev => ({ ...prev, [field]: result.assets[0] }));
      }
    } catch (error) {
      console.log('Camera Error:', error);
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  // 3. Handle Submit
  const handleSubmit = async () => {
    if (!images.id_front || !images.id_back || !images.live_selfie || !images.driving_license) {
      Alert.alert('Missing Documents', 'Please upload all 4 required documents.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      const appendFile = (key, asset) => {
        const uriParts = asset.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        formData.append(key, {
          uri: asset.uri,
          name: `${key}.${fileType}`,
          type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
        });
      };

      appendFile('id_front', images.id_front);
      appendFile('id_back', images.id_back);
      appendFile('live_selfie', images.live_selfie);
      appendFile('driving_license', images.driving_license);

      await kycService.submitUserKyc(formData);
      
      Alert.alert('Success', 'KYC Submitted! We will notify you once approved.', [
        { 
            text: 'OK', 
            onPress: async () => {
                await refreshKycStatus();
                redirectByRole(user?.role); // Send to correct Dashboard based on role
            }
        }
      ]);
      
    } catch (error) {
      console.log('KYC Upload Error:', error);
      Alert.alert('Upload Failed', 'Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // 4. Handle Skip
  const handleSkip = () => {
    redirectByRole(user?.role); // Send to correct Dashboard based on role
  };

  // --- RENDER STATES ---

  if (kycStatus === 'pending') {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'Status' }} />
        <Text style={styles.emoji}>⏳</Text>
        <Text style={styles.title}>Verification Pending</Text>
        <Text style={styles.subtitle}>Your documents are under review.</Text>
        <TouchableOpacity style={styles.btn} onPress={handleSkip}>
          <Text style={styles.btnText}>Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (kycStatus === 'approved') {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'Status' }} />
        <Text style={styles.emoji}>✅</Text>
        <Text style={styles.title}>You are Verified!</Text>
        <TouchableOpacity style={styles.btn} onPress={handleSkip}>
          <Text style={styles.btnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // DEFAULT: Submission Form
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Stack.Screen options={{ 
        title: 'Identity Verification',
        headerRight: () => (
            <TouchableOpacity onPress={handleSkip}>
                <Text style={{color: '#007AFF', fontSize: 16}}>Skip</Text>
            </TouchableOpacity>
        )
      }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Verify Your Identity</Text>
        <Text style={styles.subtitle}>Upload your documents to unlock full features.</Text>
      </View>

      <UploadBlock 
        label="ID Card (Front)" 
        image={images.id_front} 
        onPress={() => pickFromGallery('id_front')} 
        icon="image"
      />
      <UploadBlock 
        label="ID Card (Back)" 
        image={images.id_back} 
        onPress={() => pickFromGallery('id_back')} 
        icon="image"
      />
      
      {/* Selfie forces Camera */}
      <UploadBlock 
        label="Live Selfie (Camera Only)" 
        image={images.live_selfie} 
        onPress={() => captureFromCamera('live_selfie')} 
        icon="camera" 
      />
      
      <UploadBlock 
        label="Driving License" 
        image={images.driving_license} 
        onPress={() => pickFromGallery('driving_license')} 
        icon="image"
      />

      <TouchableOpacity 
        style={[styles.btn, uploading && styles.btnDisabled]} 
        onPress={handleSubmit}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Submit Documents</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>I'll do this later</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Helper Component
function UploadBlock({ label, image, onPress, icon }) {
  return (
    <View style={styles.uploadBlock}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.uploadBox} onPress={onPress}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholder}>
             <FontAwesome name={icon} size={28} color="#999" style={{marginBottom: 5}}/>
             <Text style={styles.uploadText}>{icon === 'camera' ? 'Open Camera' : 'Select File'}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { padding: 20, paddingBottom: 50, backgroundColor: '#fff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  header: { marginBottom: 30 },
  emoji: { fontSize: 50, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 5, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center' },
  
  uploadBlock: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  uploadBox: { height: 140, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9', overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center' },
  uploadText: { color: '#999', fontSize: 14 },

  btn: { backgroundColor: '#007AFF', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  btnDisabled: { backgroundColor: '#a0cfff' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  skipBtn: { marginTop: 20, alignItems: 'center', padding: 10 },
  skipText: { color: '#666', fontSize: 16 },
});