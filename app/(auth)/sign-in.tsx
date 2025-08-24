import { View, Text, Button } from 'react-native'
import { router } from "expo-router"
import React from 'react'

const signIn = () => {
  return (
    <View>
      <Text>signIn</Text>
      <Button title="Sign In" onPress={() => router.push("/sign-up")} />
    </View>
  )
}

export default signIn