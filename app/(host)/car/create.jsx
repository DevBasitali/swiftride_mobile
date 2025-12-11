import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Stack, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import carService from '../../../services/carService'; // Needs 3 levels up

export default function CreateCar() {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  
  const [form, setForm] = useState({
    make: '', model: '', year: '', color: '', plateNumber: '',
    pricePerDay: '', pricePerHour: '',
    seats: '', transmission: 'Automatic', fuelType: 'Petrol',
    address: '', description: ''
  });

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
      console.log('Image Picker Error:', error);
      Alert.alert('Error', 'Could not open gallery.');
    }
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();

    if (!form.make || !form.model || !form.pricePerDay || !form.address || images.length === 0) {
      Alert.alert('Missing Fields', 'Please fill in all required fields and add at least one photo.');
      return;
    }

    if (isNaN(Number(form.seats)) || isNaN(Number(form.pricePerDay))) {
        Alert.alert('Invalid Input', 'Seats, Price, and Year must be valid numbers.');
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
      formData.append('location[lat]', '0');
      formData.append('location[lng]', '0');

      images.forEach((img, index) => {
        const uriParts = img.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('photos', {
          uri: img.uri,
          name: `photo_${index}.${fileType}`,
          type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
        });
      });

      console.log('Submitting Car...');
      await carService.createCar(formData);
      
      Alert.alert('Success', 'Car Listed Successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      
    } catch (error) {
      console.log('Create Car Error:', error);
      const msg = error.message || 'Failed to create listing.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'List Your Car', headerBackTitle: 'Cancel' }} />
      
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
        <Text style={styles.sectionTitle}>Car Photos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoRow}>
          <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImages}>
            <FontAwesome name="camera" size={24} color="#007AFF" />
            <Text style={styles.addPhotoText}>Add Photos</Text>
          </TouchableOpacity>
          {images.map((img, index) => (
            <Image key={index} source={{ uri: img.uri }} style={styles.thumb} />
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Car Details</Text>
        <View style={styles.row}>
          <Input flex label="Make" placeholder="Toyota" value={form.make} onChangeText={t => handleInputChange('make', t)} />
          <View style={{ width: 15 }} />
          <Input flex label="Model" placeholder="Camry" value={form.model} onChangeText={t => handleInputChange('model', t)} />
        </View>
        <View style={styles.row}>
            <Input flex label="Year" placeholder="2022" keyboardType="numeric" value={form.year} onChangeText={t => handleInputChange('year', t)} />
            <View style={{ width: 15 }} />
            <Input flex label="Color" placeholder="Silver" value={form.color} onChangeText={t => handleInputChange('color', t)} />
        </View>
        <Input label="Plate Number" placeholder="ABC-123" value={form.plateNumber} onChangeText={t => handleInputChange('plateNumber', t)} />

        <Text style={styles.sectionTitle}>Specifications</Text>
        <View style={styles.row}>
           <SelectButton label="Auto" selected={form.transmission === 'Automatic'} onPress={() => handleInputChange('transmission', 'Automatic')} />
           <SelectButton label="Manual" selected={form.transmission === 'Manual'} onPress={() => handleInputChange('transmission', 'Manual')} />
        </View>
        <View style={{ height: 10 }} />
        <View style={styles.row}>
           <Input flex label="Seats" placeholder="4" keyboardType="numeric" value={form.seats} onChangeText={t => handleInputChange('seats', t)} />
           <View style={{ width: 15 }} />
           <Input flex label="Fuel" placeholder="Petrol" value={form.fuelType} onChangeText={t => handleInputChange('fuelType', t)} />
        </View>

        <Text style={styles.sectionTitle}>Price & Location</Text>
        <View style={styles.row}>
          <Input flex label="Price / Day ($)" placeholder="50" keyboardType="numeric" value={form.pricePerDay} onChangeText={t => handleInputChange('pricePerDay', t)} />
          <View style={{ width: 15 }} />
          <Input flex label="Price / Hour ($)" placeholder="5" keyboardType="numeric" value={form.pricePerHour} onChangeText={t => handleInputChange('pricePerHour', t)} />
        </View>
        <Input label="Pickup Address" placeholder="123 Main St, New York" value={form.address} onChangeText={t => handleInputChange('address', t)} />
        
        <Text style={styles.label}>Description</Text>
        <TextInput 
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
            multiline 
            placeholder="Tell us more about your car..." 
            value={form.description}
            onChangeText={t => handleInputChange('description', t)}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>List Car Now</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Input({ label, placeholder, value, onChangeText, keyboardType, flex }) {
  return (
    <View style={[styles.inputContainer, flex && { flex: 1 }]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholder={placeholder} value={value} onChangeText={onChangeText} keyboardType={keyboardType} />
    </View>
  );
}

function SelectButton({ label, selected, onPress }) {
    return (
        <TouchableOpacity style={[styles.selectBtn, selected && styles.selectBtnActive]} onPress={onPress}>
            <Text style={[styles.selectText, selected && styles.selectTextActive]}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 25, marginBottom: 15, color: '#333' },
  photoRow: { flexDirection: 'row', marginBottom: 10 },
  addPhotoBtn: { width: 100, height: 100, borderRadius: 12, backgroundColor: '#f0f9ff', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#007AFF', marginRight: 10 },
  addPhotoText: { fontSize: 12, color: '#007AFF', marginTop: 5 },
  thumb: { width: 100, height: 100, borderRadius: 12, marginRight: 10, backgroundColor: '#eee' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 5 },
  input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 12, fontSize: 16 },
  selectBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee', alignItems: 'center', marginRight: 10 },
  selectBtnActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  selectText: { color: '#666' },
  selectTextActive: { color: '#fff', fontWeight: 'bold' },
  submitBtn: { backgroundColor: '#1a1a1a', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 30, marginBottom: 50 },
  submitText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});