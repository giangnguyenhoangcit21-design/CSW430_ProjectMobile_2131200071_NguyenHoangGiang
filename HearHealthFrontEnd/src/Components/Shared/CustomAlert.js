import React, { useContext } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SIZES, SHADOWS } from '../../Constants/theme';
import { LanguageContext } from '../../Context/LanguageContext';

const CustomAlert = ({
  visible = false,
  title = 'Thông báo',
  message = '',
  type = 'success', 
  buttonText,
  showCancel = false,
  cancelText,
  onClose,
  onConfirm
}) => {
  const { lang, t } = useContext(LanguageContext) || {};

  if (!visible) return null;

  const displayButtonText = buttonText || (t?.okBtn ? t.okBtn : (lang === 'EN' ? 'OK' : 'Đồng ý'));
  const displayCancelText = cancelText || (t?.cancelBtn ? t.cancelBtn : (lang === 'EN' ? 'Cancel' : 'Hủy'));

  const isSuccess = type === 'success';
  const isError = type === 'error';

  const iconName = isSuccess ? 'check-circle' : isError ? 'error' : 'info';
  const iconColor = isSuccess ? COLORS.primary : isError ? '#EF4444' : '#3B82F6';
  const iconBgColor = isSuccess ? COLORS.rose50 : isError ? '#FEE2E2' : '#DBEAFE';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertCard}>
          {/* Top Icon Circle */}
          <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
            <MaterialIcons name={iconName} size={40} color={iconColor} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          {message ? <Text style={styles.message}>{message}</Text> : null}

          {/* Action Button */}
          <View style={styles.buttonContainer}>
            {showCancel && (
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.cancelButtonText}>{displayCancelText}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: iconColor, flex: 1, marginLeft: showCancel ? 12 : 0 }]} 
              onPress={onConfirm || onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>{displayButtonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.lg,
  },
  alertCard: {
    width: '85%',
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.rose100,
    ...SHADOWS.medium,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.textMain,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: SIZES.bodyText,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: SIZES.radiusLg,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.soft,
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  cancelButtonText: {
    color: COLORS.textMain,
    fontSize: SIZES.bodyText + 1,
    fontWeight: 'bold',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.bodyText + 1,
    fontWeight: 'bold',
  },
});

export default CustomAlert;


