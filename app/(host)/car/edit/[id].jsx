import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard, StatusBar } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
// Adjust path to reach root services
import carService from '../../../../services/carService';

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
            lat: 0,
            lng: 0
        }
      };

      await carService.updateCar(id, payload);
      
      Alert.alert('Success', 'Car updated successfully!', [
        { text: 'OK', onPress: () => router.push('/(host)/(tabs)/fleet') }
      ]);
      
    } catch (error) {
      console.log('Update Error:', error);
      Alert.alert('Error', 'Failed to update car.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#141E30" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <LinearGradient colors={['#141E30', '#243B55']} style={styles.header}>
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Vehicle</Text>
          <View style={{ width: 40 }} /> 
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
          
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Basic Info</Text>
            <View style={styles.row}>
              <Input flex label="Make" value={form.make} onChangeText={t => handleInputChange('make', t)} />
              <View style={{ width: 15 }} />
              <Input flex label="Model" value={form.model} onChangeText={t => handleInputChange('model', t)} />
            </View>
            <View style={styles.row}>
                <Input flex label="Year" value={form.year} keyboardType="numeric" onChangeText={t => handleInputChange('year', t)} />
                <View style={{ width: 15 }} />
                <Input flex label="Color" value={form.color} onChangeText={t => handleInputChange('color', t)} />
            </View>
            <Input label="Plate Number" value={form.plateNumber} onChangeText={t => handleInputChange('plateNumber', t)} />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Pricing (USD)</Text>
            <View style={styles.row}>
              <Input flex label="Price Per Day" value={form.pricePerDay} keyboardType="numeric" onChangeText={t => handleInputChange('pricePerDay', t)} icon="$" />
              <View style={{ width: 15 }} />
              <Input flex label="Price Per Hour" value={form.pricePerHour} keyboardType="numeric" onChangeText={t => handleInputChange('pricePerHour', t)} icon="$" />
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <View style={styles.row}>
              <Input flex label="Transmission" value={form.transmission} onChangeText={t => handleInputChange('transmission', t)} />
              <View style={{ width: 15 }} />
              <Input flex label="Fuel Type" value={form.fuelType} onChangeText={t => handleInputChange('fuelType', t)} />
            </View>
            <Input label="Seats" value={form.seats} keyboardType="numeric" onChangeText={t => handleInputChange('seats', t)} />
          </View>
          
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Details</Text>
            <Input label="Location Address" value={form.address} onChangeText={t => handleInputChange('address', t)} />
            <Input label="Description" value={form.description} onChangeText={t => handleInputChange('description', t)} multiline />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* FLOATING SAVE BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
          <LinearGradient colors={['#141E30', '#243B55']} style={styles.gradientBtn}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Save Changes</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Input({ label, value, onChangeText, keyboardType, flex, multiline, icon }) {
  return (
    <View style={[styles.inputContainer, flex && { flex: 1 }]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, multiline && { height: 100, alignItems: 'flex-start' }]}>
        {icon && <Text style={styles.inputIcon}>{icon}</Text>}
        <TextInput 
          style={[styles.input, multiline && { height: 90, textAlignVertical: 'top', paddingTop: 10 }]} 
          value={value} 
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          multiline={multiline}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F5F7FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { paddingBottom: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },

  container: { flex: 1, padding: 20 },
  
  formCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#141E30', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 0.5 },
  
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 12, fontWeight: '600', color: '#888', marginBottom: 6 },
  
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#EDF2F7', borderRadius: 10, paddingHorizontal: 12 },
  inputIcon: { fontSize: 16, color: '#666', marginRight: 5, fontWeight: 'bold' },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#141E30', fontWeight: '500' },

  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: '#fff', 
    padding: 20, paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopWidth: 1, borderTopColor: '#f0f0f0' 
  },
  submitBtn: { borderRadius: 12, overflow: 'hidden' },
  gradientBtn: { padding: 16, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});