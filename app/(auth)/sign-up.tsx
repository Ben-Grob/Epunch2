import { View, Text, Button } from 'react-native'
import { router } from "expo-router"
import React from 'react'

const signUp = () => {
  return (
    <View>
      <Text>signUp</Text>
      <Button title="Sign Up" onPress={() => router.push("/sign-in")} />
    </View>
  )
}

export default signUp