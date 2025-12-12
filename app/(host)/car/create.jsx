import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard, StatusBar } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import carService from '../../../services/carService';

export default function CreateCar() {
  const params = useLocalSearchParams(); 
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  
  const [form, setForm] = useState({
    make: '', model: '', year: '', color: '', plateNumber: '',
    pricePerDay: '', pricePerHour: '',
    seats: '', transmission: 'Automatic', fuelType: 'Petrol',
    address: '', description: '',
    lat: 0,
    lng: 0
  });

  // ✅ FIXED: Infinite Loop Prevention
  // We only update if params exist AND they are DIFFERENT from current state
  useEffect(() => {
    if (params.address && params.address !== form.address) {
      setForm(prev => ({
        ...prev,
        address: params.address,
        lat: parseFloat(params.lat),
        lng: parseFloat(params.lng)
      }));
    }
  }, [params.address, params.lat, params.lng]); // Depend on specific values, not the whole object

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 5,
        quality: 0.7,
      });

      if (!result.canceled) {
        setImages([...images, ...result.assets]);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open gallery.');
    }
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();

    if (!form.make || !form.model || !form.pricePerDay || !form.address || images.length === 0) {
      Alert.alert('Missing Fields', 'Please fill in all required fields and add at least one photo.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append('make', form.make.trim());
      formData.append('model', form.model.trim());
      formData.append('year', form.year.trim());
      formData.append('color', form.color.trim());
      formData.append('plateNumber', form.plateNumber.trim());
      formData.append('pricePerDay', form.pricePerDay.trim());
      formData.append('pricePerHour', form.pricePerHour.trim());
      formData.append('seats', form.seats.toString().trim()); 
      formData.append('transmission', form.transmission);
      formData.append('fuelType', form.fuelType);
      formData.append('description', form.description.trim());

      formData.append('location[address]', form.address.trim());
      formData.append('location[lat]', form.lat.toString());
      formData.append('location[lng]', form.lng.toString());

      images.forEach((img, index) => {
        const uriParts = img.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('photos', {
          uri: img.uri,
          name: `photo_${index}.${fileType}`,
          type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
        });
      });

      await carService.createCar(formData);
      
      Alert.alert('Success', 'Car Listed Successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      
    } catch (error) {
      console.log('Create Error:', error);
      Alert.alert('Error', 'Failed to create listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <LinearGradient colors={['#141E30', '#243B55']} style={styles.header}>
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>List Your Car</Text>
          <View style={{ width: 40 }} /> 
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
          
          {/* PHOTOS SECTION */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Car Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoRow}>
                <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImages}>
                    <LinearGradient colors={['#F0F9FF', '#E1F5FE']} style={styles.addPhotoGradient}>
                        <Ionicons name="camera" size={24} color="#007AFF" />
                        <Text style={styles.addPhotoText}>Add Photos</Text>
                    </LinearGradient>
                </TouchableOpacity>
                {images.map((img, index) => (
                    <Image key={index} source={{ uri: img.uri }} style={styles.thumb} />
                ))}
            </ScrollView>
          </View>

          {/* BASIC INFO */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Basic Info</Text>
            <View style={styles.row}>
              <Input flex label="Make" placeholder="e.g. Toyota" value={form.make} onChangeText={t => handleInputChange('make', t)} />
              <View style={{ width: 15 }} />
              <Input flex label="Model" placeholder="e.g. Camry" value={form.model} onChangeText={t => handleInputChange('model', t)} />
            </View>
            <View style={styles.row}>
                <Input flex label="Year" placeholder="2024" keyboardType="numeric" value={form.year} onChangeText={t => handleInputChange('year', t)} />
                <View style={{ width: 15 }} />
                <Input flex label="Color" placeholder="Silver" value={form.color} onChangeText={t => handleInputChange('color', t)} />
            </View>
            <Input label="Plate Number" placeholder="ABC-123" value={form.plateNumber} onChangeText={t => handleInputChange('plateNumber', t)} />
          </View>

          {/* PRICING */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Pricing (USD)</Text>
            <View style={styles.row}>
              <Input flex label="Price Per Day" placeholder="50" keyboardType="numeric" value={form.pricePerDay} onChangeText={t => handleInputChange('pricePerDay', t)} icon="$" />
              <View style={{ width: 15 }} />
              <Input flex label="Price Per Hour" placeholder="5" keyboardType="numeric" value={form.pricePerHour} onChangeText={t => handleInputChange('pricePerHour', t)} icon="$" />
            </View>
          </View>

          {/* SPECS */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <View style={styles.row}>
               <SelectButton label="Automatic" selected={form.transmission === 'Automatic'} onPress={() => handleInputChange('transmission', 'Automatic')} />
               <View style={{ width: 10 }} />
               <SelectButton label="Manual" selected={form.transmission === 'Manual'} onPress={() => handleInputChange('transmission', 'Manual')} />
            </View>
            <View style={{ height: 15 }} />
            <View style={styles.row}>
              <Input flex label="Fuel Type" placeholder="Petrol" value={form.fuelType} onChangeText={t => handleInputChange('fuelType', t)} />
              <View style={{ width: 15 }} />
              <Input flex label="Seats" placeholder="4" keyboardType="numeric" value={form.seats} onChangeText={t => handleInputChange('seats', t)} />
            </View>
          </View>
          
          {/* LOCATION & DESC */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Details</Text>
            
            <Text style={styles.label}>Location</Text>
            <TouchableOpacity 
                style={styles.locationBtn} 
                onPress={() => router.push('/(host)/car/location-picker')}
            >
                <View style={{flex: 1}}>
                    <Text style={form.address ? styles.locText : styles.locPlaceholder}>
                        {form.address || "Tap to pick location on map"}
                    </Text>
                    {form.lat !== 0 && (
                        <Text style={styles.coordText}>
                            GPS: {form.lat.toFixed(4)}, {form.lng.toFixed(4)}
                        </Text>
                    )}
                </View>
                <View style={styles.mapIconBox}>
                    <FontAwesome name="map-marker" size={20} color="#fff" />
                </View>
            </TouchableOpacity>

            <View style={{height: 15}} />
            <Input label="Description" placeholder="Describe your car..." value={form.description} onChangeText={t => handleInputChange('description', t)} multiline />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* FLOATING SUBMIT BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          <LinearGradient colors={['#141E30', '#243B55']} style={styles.gradientBtn}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>List Car Now</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Helper Components
function Input({ label, placeholder, value, onChangeText, keyboardType, flex, multiline, icon }) {
  return (
    <View style={[styles.inputContainer, flex && { flex: 1 }]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, multiline && { height: 100, alignItems: 'flex-start' }]}>
        {icon && <Text style={styles.inputIcon}>{icon}</Text>}
        <TextInput 
          style={[styles.input, multiline && { height: 90, textAlignVertical: 'top', paddingTop: 10 }]} 
          placeholder={placeholder}
          placeholderTextColor="#ccc"
          value={value} 
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          multiline={multiline}
        />
      </View>
    </View>
  );
}

function SelectButton({ label, selected, onPress }) {
    return (
        <TouchableOpacity 
            style={[styles.selectBtn, selected && styles.selectBtnActive]} 
            onPress={onPress}
        >
            <Text style={[styles.selectText, selected && styles.selectTextActive]}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F5F7FA' },
  
  header: { paddingBottom: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 },

  container: { flex: 1, padding: 20 },
  
  formCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#141E30', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 0.5 },
  
  photoRow: { flexDirection: 'row', marginBottom: 5 },
  addPhotoBtn: { width: 90, height: 90, borderRadius: 12, marginRight: 10, overflow: 'hidden' },
  addPhotoGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#B3E5FC', borderStyle: 'dashed', borderRadius: 12 },
  addPhotoText: { fontSize: 10, color: '#007AFF', marginTop: 5, fontWeight: 'bold' },
  thumb: { width: 90, height: 90, borderRadius: 12, marginRight: 10, backgroundColor: '#eee' },

  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 12, fontWeight: '600', color: '#888', marginBottom: 6 },
  
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#EDF2F7', borderRadius: 10, paddingHorizontal: 12 },
  inputIcon: { fontSize: 16, color: '#666', marginRight: 5, fontWeight: 'bold' },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#141E30', fontWeight: '500' },

  selectBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#EDF2F7', alignItems: 'center', backgroundColor: '#F8FAFC' },
  selectBtnActive: { backgroundColor: '#141E30', borderColor: '#141E30' },
  selectText: { color: '#666', fontWeight: '600' },
  selectTextActive: { color: '#fff' },

  locationBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#EDF2F7', borderRadius: 10, padding: 10 },
  locText: { fontSize: 14, color: '#141E30', fontWeight: '500' },
  locPlaceholder: { fontSize: 14, color: '#ccc' },
  coordText: { fontSize: 11, color: '#4CAF50', marginTop: 4, fontWeight: 'bold' },
  mapIconBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#FF4757', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },

  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: '#fff', 
    padding: 20, paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopWidth: 1, borderTopColor: '#f0f0f0' 
  },
  submitBtn: { borderRadius: 12, overflow: 'hidden' },
  gradientBtn: { padding: 16, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
});