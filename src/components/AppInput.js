import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/theme';

export default function AppInput({ label, value, onChangeText, style, secureTextEntry, ...rest }) {
  // kung password field (secureTextEntry), naay eye icon
  const isPassword = !!secureTextEntry;
  const [hidden, setHidden] = useState(true);

  return (
    <View style={{ marginBottom: 12 }}>
      {label ? (
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.muted, marginBottom: 4 }}>{label}</Text>
      ) : null}

      <View>
        <TextInput
          style={[
            {
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              padding: 12,
              paddingRight: isPassword ? 48 : 12,
              fontSize: 16,
              color: colors.text,
            },
            style,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          secureTextEntry={isPassword ? hidden : false}
          {...rest}
        />

        {isPassword ? (
          <TouchableOpacity
            onPress={() => setHidden((h) => !h)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              position: 'absolute',
              right: 14,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
            }}
          >
            <Feather name={hidden ? 'eye-off' : 'eye'} size={20} color={colors.muted} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}