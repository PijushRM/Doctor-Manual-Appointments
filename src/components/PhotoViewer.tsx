import React, {useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {tr} from 'src/i18n';
import {filesText} from 'src/i18n/strings/files';
import {AppText} from './shared/AppText';
import {Icon} from './shared/Icon';

type Props = {
  source: ImageSourcePropType;
  label: string; // e.g. "Profile photo"
  onClose: () => void;
};

// A photo full screen on black, like a gallery. Tap anywhere or Back to close.
// Mount it only while open.
export const PhotoViewer = ({source, label, onClose}: Props) => {
  const {top} = useSafeAreaInsets();
  const t = tr(filesText);
  const [state, setState] = useState<'loading' | 'shown' | 'failed'>('loading');
  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}>
      <Pressable
        style={styles.root}
        accessibilityRole="button"
        accessibilityLabel={t.closePhoto(label)}
        onPress={onClose}>
        <Image
          source={source}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel={label}
          onLoad={() => setState('shown')}
          onError={() => setState('failed')}
        />
        {state === 'loading' && (
          <ActivityIndicator style={styles.center} size="large" color="#FFF" />
        )}
        {state === 'failed' && (
          <View style={styles.center}>
            <AppText style={styles.error}>{t.photoLoadFailed}</AppText>
          </View>
        )}
        <View style={[styles.close, {top: top + 12}]}>
          <Icon name="close" size={24} color="#FFF" strokeWidth={2} />
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#000', justifyContent: 'center'},
  image: {width: '100%', height: '100%'},
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  error: {color: '#FFF', textAlign: 'center'},
  close: {
    position: 'absolute',
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
