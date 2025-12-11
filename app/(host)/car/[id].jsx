import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
// Adjust path to reach services (3 levels up from app/(host)/car/edit)
import carService from '../../../services/carService';

export default function EditCar() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    make: '', model: '', year: '', color: '', plateNumber: '',
    pricePerDay: '', pricePerHour: '',
    seats: '', transmission: '', fuelType: '',
    address: '', description: ''
  });

  // 1. Load Existing Data
  useEffect(() => {
    loadCarData();
  }, [id]);

  const loadCarData = async () => {
    try {
      const response = await carService.getCarById(id);
      const car = response.data.car;
      
      setForm({
        make: car.make,
        model: car.model,
        year: String(car.year),
        color: car.color,
        plateNumber: car.plateNumber,
        pricePerDay: String(car.pricePerDay),
        pricePerHour: String(car.pricePerHour),
        seats: String(car.seats),
        transmission: car.transmission,
        fuelType: car.fuelType,
        address: car.location?.address || '',
        description: car.description || ''
      });
    } catch (error) {
      Alert.alert('Error', 'Could not load car details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setSubmitting(true);

    try {
      // Create simple JSON object for update (assuming backend accepts JSON for PATCH)
      // If your backend strictly needs FormData even for text updates, switch to FormData.
      const payload = {
        make: form.make,
        model: form.model,
        year: Number(form.year),
        color: form.color,
        plateNumber: form.plateNumber,
        pricePerDay: Number(form.pricePerDay),
        pricePerHour: Number(form.pricePerHour),
        seats: Number(form.seats),
        transmission: form.transmission,
        fuelType: form.fuelType,
        description: form.description,
        location: {
            address: form.address,
            lat: 0, // Keep existing if not changing
            lng: 0
        }
      };

      await carService.updateCar(id, payload);
      
      Alert.alert('Success', 'Car updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      
    } catch (error) {
      console.log('Update Error:', error);
      Alert.alert('Error', 'Failed to update car.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#007AFF" /></View>;
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Edit Car', headerBackTitle: 'Cancel' }} />
      
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
        
        <Text style={styles.sectionTitle}>Car Details</Text>
        <Input label="Make" value={form.make} onChangeText={t => handleInputChange('make', t)} />
        <Input label="Model" value={form.model} onChangeText={t => handleInputChange('model', t)} />
        
        <View style={styles.row}>
            <Input flex label="Year" value={form.year} keyboardType="numeric" onChangeText={t => handleInputChange('year', t)} />
            <View style={{ width: 15 }} />
            <Input flex label="Color" value={form.color} onChangeText={t => handleInputChange('color', t)} />
        </View>

        <Text style={styles.sectionTitle}>Pricing</Text>
        <View style={styles.row}>
          <Input flex label="Price/Day" value={form.pricePerDay} keyboardType="numeric" onChangeText={t => handleInputChange('pricePerDay', t)} />
          <View style={{ width: 15 }} />
          <Input flex label="Price/Hour" value={form.pricePerHour} keyboardType="numeric" onChangeText={t => handleInputChange('pricePerHour', t)} />
        </View>

        <Text style={styles.sectionTitle}>Specs</Text>
        <View style={styles.row}>
           <Input flex label="Transmission" value={form.transmission} onChangeText={t => handleInputChange('transmission', t)} />
           <View style={{ width: 15 }} />
           <Input flex label="Fuel Type" value={form.fuelType} onChangeText={t => handleInputChange('fuelType', t)} />
        </View>

        <Input label="Description" value={form.description} onChangeText={t => handleInputChange('description', t)} multiline />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Save Changes</Text>}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Input({ label, value, onChangeText, keyboardType, flex, multiline }) {
  return (
    <View style={[styles.inputContainer, flex && { flex: 1 }]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput 
        style={[styles.input, multiline && { height: 100, textAlignVertical: 'top' }]} 
        value={value} 
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 15, color: '#333' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 5 },
  input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 12, fontSize: 16 },
  submitBtn: { backgroundColor: '#1a1a1a', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 30, marginBottom: 50 },
  submitText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});