import { View, Text, Image, KeyboardAvoidingView, Platform, Dimensions, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Slot, Redirect } from 'expo-router'
import useAuthStore from '@/store/auth.store'

// Auth layout configuration
export default function authlayout() {
  const { isAuthenticated } = useAuthStore();  // Fetch is authenticated from the AuthStore (Where the current auth state is stored)

  if(isAuthenticated) {
    console.log("Root layout caught aythentication and is redirecting");
    return <Redirect href="/" /> // Redirect to the tabs group
  }
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

