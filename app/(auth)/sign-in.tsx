import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { signIn } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { Link, router } from "expo-router";
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';

const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const { fetchAuthenticatedUser } = useAuthStore();

  const submit = async () => {
    const { email, password } = form;

    if(!email || !password) return Alert.alert('Error', 'Please enter valid email address & password.');

    setIsSubmitting(true)

    try {
        await signIn({ email, password });  // calling the appwrite function

        // Update auth store to reflect authentication status
        await fetchAuthenticatedUser();
        
        console.log("succesfully authenticated and now redirecting");
        router.replace('/(tabs)');
      } catch(error: any) {
        // CHECK: Is the error just telling us we are already logged in?
        if (error.message.includes("session is active") || error.code === 401) {
          console.log("already has an active session but should redirect now");
          // Update auth store in case session exists but store wasn't updated
          await fetchAuthenticatedUser();
          router.replace('/(tabs)');
        } else {
            Alert.alert('Error', error.message);
            // Sentry.captureEvent(error);
        }
    } finally {
        setIsSubmitting(false);
    }
}

return (
  <View className="gap-10 bg-white rounded-lg p-5 mt-20">
    <Text className= "text-xl text-center mb-5 text-black">
          Sign Into Your Account 
    </Text>
      <CustomInput  // email box
          placeholder="Enter your email"
          value={form.email}
          onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
          label="Email"
          keyboardType="email-address"
      />
      <CustomInput  // Password box
          placeholder="Enter your password"
          value={form.password}
          onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
          label="Password"
          secureTextEntry={true}
      />

      <CustomButton  // sign in button
          title="Sign In"
          isLoading={isSubmitting}
          onPress={submit}
          textStyle="text-black-100"
      />
    
      <View className="flex justify-center mt-5 flex-row gap-2">
          <Text className="base-regular text-gray-100">
              Don't have an account?
          </Text>
          <Link href="/sign-up" className="base-bold text-primary">
              Sign Up
          </Link>
      </View>
  </View>
)
}

export default SignIn