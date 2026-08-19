import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView, Alert, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, SHADOWS } from '../Constants/theme';
import { LanguageContext } from '../Context/LanguageContext';
import api from '../Services/api';

const ScreeningScreen = ({ route, navigation }) => {
  const scrollViewRef = useRef(null);
  const { lang, t } = useContext(LanguageContext);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 State
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState(65);
  const [gender, setGender] = useState('male');

  useEffect(() => {
    const loadFullName = async () => {
      const paramName = route?.params?.initialFullName;
      if (paramName) {
        setFullName(paramName);
      } else {
        const storedName = await AsyncStorage.getItem('userFullName');
        if (storedName) setFullName(storedName);
      }
    };
    loadFullName();
  }, [route?.params?.initialFullName]);

  // Step 2 State
  const [comorbidityList, setComorbidityList] = useState([
    { id: 'hypertension', label: t.hypertension },
    { id: 'diabetes', label: t.diabetes },
    { id: 'dyslipidemia', label: t.dyslipidemia },
    { id: 'stomach', label: t.stomach },
  ]);
  const [comorbidities, setComorbidities] = useState({
    hypertension: false,
    diabetes: false,
    dyslipidemia: false,
    stomach: false,
  });
  const [showAddComorbidity, setShowAddComorbidity] = useState(false);
  const [newComorbidity, setNewComorbidity] = useState('');

  // Step 2 Stats
  const [bloodPressure, setBloodPressure] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [weight, setWeight] = useState('');
  const [cholesterol, setCholesterol] = useState('');
  const [prescriptionImage, setPrescriptionImage] = useState(null);

  const handleBPChange = (text) => {
    if (bloodPressure.endsWith('/') && text === bloodPressure.slice(0, -1)) {
      setBloodPressure(text.slice(0, -1));
      return;
    }

    let val = text.replace(/[^0-9/]/g, '');
    
    if (val.length === 3 && !val.includes('/')) {
      val += '/';
    }

    const parts = val.split('/');
    if (parts.length > 2) val = parts[0] + '/' + parts[1];
    if (parts[0] && parseInt(parts[0], 10) > 200) parts[0] = '200';
    if (parts.length > 1 && parts[1] && parseInt(parts[1], 10) > 130) parts[1] = '130';
    
    setBloodPressure(parts.length > 1 ? `${parts[0]}/${parts[1]}` : parts[0]);
  };

  const handleStatChange = (text, setter) => {
    let val = text.replace(/[^0-9]/g, '');
    if (val.length > 3) val = val.substring(0, 3);
    if (val && parseInt(val, 10) > 200) val = '200';
    setter(val);
  };

  const handleAddImage = () => {
    Alert.alert(
      t.addPrescription,
      t.selectImgSource,
      [
        { text: t.takePhoto, onPress: () => launchCamera({ mediaType: 'photo' }, res => { if(res.assets) setPrescriptionImage(res.assets[0].uri); }) },
        { text: t.chooseFromLibrary, onPress: () => launchImageLibrary({ mediaType: 'photo' }, res => { if(res.assets) setPrescriptionImage(res.assets[0].uri); }) },
        { text: t.cancelBtn, style: "cancel" }
      ]
    );
  };

  // Step 3 State
  const [chestPain, setChestPain] = useState('none');
  const [breathlessness, setBreathlessness] = useState('none');

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    } else {
      setIsSubmitting(true);
      try {
        const phone = undefined;
        
        const payload = {
          phone: phone,
          fullName,
          age,
          gender,
          comorbidities,
          bloodPressure,
          heartRate: heartRate ? heartRate.toString() : "",
          weight: weight ? weight.toString() : "",
          cholesterol: cholesterol ? cholesterol.toString() : "",
          chestPain,
          breathlessness,
          lang,
        };

        const response = await api.post('/health/assess', payload);
        setIsSubmitting(false);
        
        // Navigate to Triage with the result from backend
        navigation.navigate('Triage', { triageResult: response.data });
      } catch (error) {
        setIsSubmitting(false);
        const errorMsg = error.response?.data?.message || t.screeningError;
        Alert.alert(t.errorTitle, errorMsg);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const toggleComorbidity = (key) => {
    setComorbidities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const adjustAge = (delta) => {
    setAge(prev => {
      let newAge = prev + delta;
      if (newAge < 30) newAge = 30;
      if (newAge > 95) newAge = 95;
      return newAge;
    });
  };

  const renderProgressBar = () => {
    const percent = (currentStep / totalSteps) * 100;
    
    return (
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>{t.stepLbl} {currentStep} / {totalSteps}</Text>
          </View>
          <Text style={styles.stepTitleHeader}>
            {currentStep === 1 ? t.personalInfoTitle : currentStep === 2 ? t.medicalHistoryTitle : t.symptomsTitleShort}
          </Text>
        </View>

        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
        </View>

        <View style={styles.dotIndicators}>
          {[1, 2, 3].map(step => (
            <View key={step} style={[
              styles.dotBox, 
              currentStep === step ? styles.dotBoxActive : currentStep > step ? styles.dotBoxDone : styles.dotBoxPending
            ]}>
              <View style={[
                styles.dot,
                currentStep === step ? styles.dotActive : currentStep > step ? styles.dotDone : styles.dotPending
              ]} />
              <Text style={[
                styles.dotText,
                currentStep === step ? styles.dotTextActive : currentStep > step ? styles.dotTextDone : styles.dotTextPending
              ]} numberOfLines={1}>
                {step === 1 ? t.step1Title : step === 2 ? t.step2Title : t.step3Title}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderStep1 = () => (
    <View style={styles.stepPanel}>
      <Text style={styles.stepMainTitle}>{t.step1MainTitle}</Text>
      <Text style={styles.stepDesc}>{t.step1Desc}</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t.fullNameLbl}</Text>
        <View style={styles.inputWrapper}>
          <MaterialIcons name="person" size={20} color={COLORS.primary} />
          <TextInput 
            style={styles.inputText}
            placeholder={t.fullNamePlaceholder}
            placeholderTextColor={COLORS.textLight}
            value={fullName}
            onChangeText={setFullName}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <View style={styles.ageHeaderRow}>
          <Text style={[styles.label, { marginBottom: 0 }]}>{t.ageLbl}</Text>
          <Text style={styles.ageNumberTextInline}>{age} <Text style={styles.ageUnitTextInline}>{t.ageUnit}</Text></Text>
        </View>
        <View style={styles.sliderControls}>
          <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustAge(-1)}>
            <Text style={styles.adjustBtnText}>-</Text>
          </TouchableOpacity>
          <Slider
            style={{ flex: 1, height: 40 }}
            minimumValue={30}
            maximumValue={95}
            step={1}
            value={age}
            onValueChange={setAge}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor={COLORS.rose100}
            thumbTintColor={COLORS.primary}
          />
          <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustAge(1)}>
            <Text style={styles.adjustBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t.genderLbl}</Text>
        <View style={styles.genderRow}>
          <TouchableOpacity 
            style={[styles.genderCard, gender === 'male' && styles.genderCardActive]}
            onPress={() => setGender('male')}
          >
            <MaterialIcons name="man" size={56} color={gender === 'male' ? COLORS.primary : COLORS.textMuted} />
            <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>{t.genderMale}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.genderCard, gender === 'female' && styles.genderCardActive]}
            onPress={() => setGender('female')}
          >
            <MaterialIcons name="woman" size={56} color={gender === 'female' ? COLORS.primary : COLORS.textMuted} />
            <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>{t.genderFemale}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepPanel}>
      <Text style={styles.stepMainTitle}>{t.step2MainTitle}</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t.comorbiditiesLbl}</Text>
        <View style={styles.comorbidityGrid}>
          {comorbidityList.map(item => (
            <TouchableOpacity 
              key={item.id}
              style={[styles.checkCard, comorbidities[item.id] && styles.checkCardActive]}
              onPress={() => toggleComorbidity(item.id)}
            >
              <MaterialIcons 
                name={comorbidities[item.id] ? "check-box" : "check-box-outline-blank"} 
                size={24} 
                color={comorbidities[item.id] ? COLORS.primary : COLORS.border} 
              />
              <Text style={[styles.checkText, comorbidities[item.id] && styles.checkTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addOtherBtn} onPress={() => setShowAddComorbidity(!showAddComorbidity)}>
            <MaterialIcons name="add-circle" size={24} color={COLORS.primary} />
            <Text style={styles.addOtherBtnText}>{t.addOtherBtn}</Text>
          </TouchableOpacity>
        </View>

        {showAddComorbidity && (
          <View style={styles.addComorbidityBox}>
            <TextInput
              style={styles.addComorbidityInput}
              placeholder={t.diseaseNamePlaceholder}
              placeholderTextColor={COLORS.textLight}
              value={newComorbidity}
              onChangeText={setNewComorbidity}
            />
            <TouchableOpacity 
              style={styles.addComorbiditySubmitBtn}
              onPress={() => {
                if (newComorbidity.trim()) {
                  const label = newComorbidity.trim();
                  setComorbidityList([...comorbidityList, { id: label, label: label }]);
                  setComorbidities(prev => ({ ...prev, [label]: true }));
                  setNewComorbidity('');
                  setShowAddComorbidity(false);
                }
              }}
            >
              <Text style={styles.addComorbiditySubmitText}>{t.addBtn}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t.currentHealthStatsLbl}</Text>
        <View style={styles.healthStatsGrid}>
          <View style={styles.statInputCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#FEE2E2' }]}>
              <MaterialIcons name="favorite" size={24} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statInputLabel}>{t.bpStatLbl}</Text>
              <TextInput style={styles.statInputField} placeholder="--/--" value={bloodPressure} onChangeText={handleBPChange} keyboardType="numbers-and-punctuation" />
            </View>
          </View>
          <View style={styles.statInputCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#FFEDD5' }]}>
              <MaterialIcons name="monitor-heart" size={24} color="#F97316" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statInputLabel}>{t.hrStatLbl}</Text>
              <TextInput style={styles.statInputField} placeholder="--" keyboardType="numeric" value={heartRate} onChangeText={t => handleStatChange(t, setHeartRate)} />
            </View>
          </View>
          <View style={styles.statInputCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#DBEAFE' }]}>
              <MaterialIcons name="scale" size={24} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statInputLabel}>{t.weightStatLbl}</Text>
              <TextInput style={styles.statInputField} placeholder="--" keyboardType="numeric" value={weight} onChangeText={t => handleStatChange(t, setWeight)} />
            </View>
          </View>
          <View style={styles.statInputCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#F3E8FF' }]}>
              <MaterialIcons name="water-drop" size={24} color="#A855F7" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statInputLabel}>{t.cholStatLbl}</Text>
              <TextInput style={styles.statInputField} placeholder="--" keyboardType="numeric" value={cholesterol} onChangeText={t => handleStatChange(t, setCholesterol)} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.formGroup}>
        <View style={styles.medicationHeader}>
          <Text style={[styles.label, { marginBottom: 0 }]}>{t.medicationLbl}</Text>
          <TouchableOpacity style={styles.cameraBtn} onPress={handleAddImage}>
            <MaterialIcons name="photo-camera" size={16} color={COLORS.primary} />
            <Text style={styles.cameraBtnText}>{t.captureUploadBtn}</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.inputWrapper, { height: 100, alignItems: 'flex-start', paddingTop: 14 }]}>
          <MaterialIcons name="medication" size={20} color={COLORS.primary} />
          <TextInput 
            style={[styles.inputText, { height: 80, textAlignVertical: 'top', marginTop: -4 }]}
            placeholder={t.medicationPlaceholder}
            placeholderTextColor={COLORS.textLight}
            multiline
          />
        </View>
        {prescriptionImage && (
          <View style={{ marginTop: 12, position: 'relative' }}>
            <Image source={{ uri: prescriptionImage }} style={{ width: '100%', height: 200, borderRadius: 12 }} />
            <TouchableOpacity 
              style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 16, padding: 4 }}
              onPress={() => setPrescriptionImage(null)}
            >
              <MaterialIcons name="close" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>

    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepPanel}>
      <Text style={styles.stepMainTitle}>{t.step3MainTitle}</Text>

      {/* Đau thắt ngực */}
      <View style={styles.symptomCard}>
        <View style={styles.symptomHeader}>
          <View style={styles.symptomIcon}>
            <MaterialIcons name="sick" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.symptomTitle}>{t.chestPainLbl}</Text>
        </View>

        <View style={styles.faceScalesRow}>
          <TouchableOpacity 
            style={[styles.faceScaleCard, chestPain === 'none' && styles.faceScaleActive]}
            onPress={() => setChestPain('none')}
          >
            <View style={[styles.faceIconCircle, { backgroundColor: '#FB7185' }]}>
              <MaterialIcons name="sentiment-satisfied" size={32} color={COLORS.white} />
            </View>
            <Text style={styles.faceLabel}>{t.painNone}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.faceScaleCard, chestPain === 'mild' && styles.faceScaleActive]}
            onPress={() => setChestPain('mild')}
          >
            <View style={[styles.faceIconCircle, { backgroundColor: '#EAB308' }]}>
              <MaterialIcons name="sentiment-neutral" size={32} color={COLORS.white} />
            </View>
            <Text style={styles.faceLabel}>{t.painMild}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.faceScaleCard, chestPain === 'severe' && styles.faceScaleActive]}
            onPress={() => setChestPain('severe')}
          >
            <View style={[styles.faceIconCircle, { backgroundColor: '#DC2626' }]}>
              <MaterialIcons name="sentiment-very-dissatisfied" size={32} color={COLORS.white} />
            </View>
            <Text style={styles.faceLabel}>{t.painSevere}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Khó thở */}
      <View style={styles.symptomCard}>
        <View style={styles.symptomHeader}>
          <View style={[styles.symptomIcon, { backgroundColor: '#DBEAFE' }]}>
            <MaterialIcons name="air" size={24} color="#2563EB" />
          </View>
          <Text style={styles.symptomTitle}>{t.breathLbl}</Text>
        </View>

        <View style={styles.faceScalesRow}>
          <TouchableOpacity 
            style={[styles.faceScaleCard, breathlessness === 'none' && styles.faceScaleActive]}
            onPress={() => setBreathlessness('none')}
          >
            <View style={[styles.faceIconCircle, { backgroundColor: '#FB7185' }]}>
              <MaterialIcons name="sentiment-satisfied" size={32} color={COLORS.white} />
            </View>
            <Text style={styles.faceLabel}>{t.breathNormal}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.faceScaleCard, breathlessness === 'mild' && styles.faceScaleActive]}
            onPress={() => setBreathlessness('mild')}
          >
            <View style={[styles.faceIconCircle, { backgroundColor: '#EAB308' }]}>
              <MaterialIcons name="sentiment-neutral" size={32} color={COLORS.white} />
            </View>
            <Text style={styles.faceLabel}>{t.breathMild2}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.faceScaleCard, breathlessness === 'severe' && styles.faceScaleActive]}
            onPress={() => setBreathlessness('severe')}
          >
            <View style={[styles.faceIconCircle, { backgroundColor: '#DC2626' }]}>
              <MaterialIcons name="sentiment-very-dissatisfied" size={32} color={COLORS.white} />
            </View>
            <Text style={styles.faceLabel}>{t.breathSevere}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Ghi chú bất thường khác */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t.notesLbl}</Text>
        <View style={[styles.inputWrapper, { height: 100, alignItems: 'flex-start', paddingTop: 14 }]}>
          <MaterialIcons name="edit-note" size={24} color={COLORS.primary} style={{marginLeft: -2}} />
          <TextInput 
            style={[styles.inputText, { height: 80, textAlignVertical: 'top', marginTop: -4 }]}
            placeholder={t.notesPlaceholderShort}
            placeholderTextColor={COLORS.textLight}
            multiline
          />
        </View>
      </View>

    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <MaterialIcons name="favorite" size={32} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Heart Health</Text>
        </View>

        {renderProgressBar()}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {/* Action Buttons directly below the form */}
        <View style={styles.actionRow}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.btnBack} onPress={handleBack}>
              <MaterialIcons name="arrow-back" size={24} color={COLORS.textMain} />
              <Text style={styles.btnBackText}>{t.backBtn}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.btnNext, currentStep === 1 && { flex: 1 }, isSubmitting && { opacity: 0.7 }]} 
            onPress={handleNext}
            disabled={isSubmitting}
          >
            <Text style={styles.btnNextText}>
              {currentStep === 3 ? (isSubmitting ? t.processing : t.completeScreening) : t.continueStep.replace('{step}', currentStep + 1)}
            </Text>
            {!isSubmitting && <MaterialIcons name={currentStep === 3 ? "check-circle" : "arrow-forward"} size={24} color={COLORS.white} />}
          </TouchableOpacity>
        </View>

        {/* Security Badge moved below the button to fill bottom void without pushing button away */}
        {currentStep === 1 && (
          <View style={styles.secureBadgeContainer}>
            <View style={styles.secureIconCircle}>
              <MaterialIcons name="verified-user" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.secureBadgeText}>{t.dataEncryptedBadge}</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.lg,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.rose100,
    borderRadius: SIZES.radiusXl,
    padding: SIZES.lg,
    marginBottom: 16,
    ...SHADOWS.soft,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.md,
  },
  stepBadge: {
    backgroundColor: COLORS.rose50,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  stepBadgeText: {
    color: COLORS.primary,
    fontWeight: '900',
    fontSize: 10,
  },
  stepTitleHeader: {
    fontWeight: 'bold',
    color: COLORS.textMain,
    fontSize: SIZES.bodyText,
  },
  progressBarTrack: {
    height: 12,
    backgroundColor: COLORS.background,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: SIZES.md,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  dotIndicators: {
    flexDirection: 'row',
    gap: 8,
  },
  dotBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dotBoxActive: { backgroundColor: COLORS.rose50 },
  dotBoxDone: { backgroundColor: '#D1FAE5' }, // emerald-100
  dotBoxPending: { backgroundColor: COLORS.background },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { backgroundColor: COLORS.primary },
  dotDone: { backgroundColor: '#10B981' }, // emerald-500
  dotPending: { backgroundColor: COLORS.border },
  dotText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  dotTextActive: { color: COLORS.primary },
  dotTextDone: { color: '#047857' },
  dotTextPending: { color: COLORS.textMuted },
  
  stepPanel: {
    marginBottom: 8,
  },
  stepMainTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: SIZES.bodyText,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: SIZES.bodyText + 2,
    fontWeight: 'bold',
    color: COLORS.textMain,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.rose100,
    height: 52,
    gap: 12,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textMain,
    fontWeight: '500',
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.rose100,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textMain,
  },
  ageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: SIZES.md,
  },
  ageNumberTextInline: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
  },
  ageUnitTextInline: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textMuted,
  },
  sliderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.rose100,
  },
  adjustBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.rose100,
  },
  adjustBtnText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: -2,
    color: COLORS.primary,
  },
  genderRow: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  genderCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.rose100,
    borderRadius: SIZES.radiusXl,
    paddingVertical: 24,
    alignItems: 'center',
  },
  genderCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.rose50,
  },
  genderText: {
    fontSize: SIZES.h3,
    fontWeight: '900',
    color: COLORS.textMuted,
    marginTop: 8,
  },
  genderTextActive: {
    color: COLORS.primary,
  },
  
  // Step 2 Styles
  comorbidityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.md,
  },
  checkCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: SIZES.md,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.rose100,
    borderRadius: SIZES.radiusLg,
  },
  checkCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.rose50,
  },
  checkText: {
    fontSize: SIZES.smallText,
    fontWeight: 'bold',
    color: COLORS.textMain,
    flex: 1,
  },
  checkTextActive: {
    color: COLORS.primary,
  },
  addOtherBtn: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: SIZES.md,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.rose300,
    borderStyle: 'dashed',
    borderRadius: SIZES.radiusLg,
  },
  addOtherBtnText: {
    fontSize: SIZES.smallText,
    fontWeight: 'bold',
    color: COLORS.primary,
    flex: 1,
  },
  addComorbidityBox: {
    flexDirection: 'row',
    marginTop: SIZES.md,
    gap: 8,
  },
  addComorbidityInput: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusLg,
    paddingHorizontal: SIZES.md,
    paddingVertical: 12,
    fontSize: SIZES.bodyText,
    color: COLORS.textMain,
  },
  addComorbiditySubmitBtn: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: SIZES.radiusLg,
  },
  addComorbiditySubmitText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: SIZES.bodyText,
  },
  healthStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.md,
  },
  statInputCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: SIZES.md,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.rose100,
    borderRadius: SIZES.radiusLg,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInputLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  statInputField: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.textMain,
    padding: 0,
    margin: 0,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.md,
  },
  cameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.rose50,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cameraBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
  },

  // Step 3 Styles
  symptomCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.rose100,
    borderRadius: SIZES.radiusXl,
    padding: SIZES.lg,
    marginBottom: SIZES.xl,
    ...SHADOWS.soft,
  },
  symptomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: SIZES.lg,
  },
  symptomIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.rose50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  symptomTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  faceScalesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  faceScaleCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.rose100,
    borderRadius: SIZES.radiusLg,
    paddingVertical: SIZES.lg,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  faceScaleActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.rose50,
  },
  faceIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  faceLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textMain,
    textAlign: 'center',
  },

  secureBadgeContainer: {
    marginTop: 8,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  secureIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.rose50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secureBadgeText: {
    fontSize: SIZES.smallText,
    color: COLORS.textMuted,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 32,
  },

  actionRow: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginTop: SIZES.md,
  },
  btnBack: {
    width: '35%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.background,
    paddingVertical: 18,
    borderRadius: SIZES.radiusLg,
  },
  btnBackText: {
    fontSize: SIZES.bodyText,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  btnNext: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: SIZES.radiusLg,
    ...SHADOWS.glow,
  },
  btnNextText: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.white,
  }
});

export default ScreeningScreen;


