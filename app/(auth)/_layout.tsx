import { View, Text, Image, KeyboardAvoidingView, Platform, Dimensions, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Slot, Redirect } from 'expo-router'
import useAuthStore from '@/store/auth.store'


export default function authlayout() {
  const { isAuthenticated } = useAuthStore();

  if(isAuthenticated) return <Redirect href="/" />
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView className="bg-white h-full" keyboardShouldPersistTaps="handled">
                <View className="w-full relative" style={{ height: Dimensions.get('screen').height / 2.25}}>
                      </View>
                <Slot />
            </ScrollView>
        </KeyboardAvoidingView>
  )
}

