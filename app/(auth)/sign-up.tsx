import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { createUser } from "@/lib/appwrite";
import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from 'react-native';

type UserRole = 'employee' | 'manager';

const SignUp = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [role, setRole] = useState<UserRole>('employee');
    const [form, setForm] = useState({ 
        name: '', 
        email: '', 
        password: '',
        companyId: '',
        companyName: ''
    });

    const submit = async () => {
        const { name, email, password, companyId, companyName } = form;

        // Basic validation
        if(!name || !email || !password) {
            return Alert.alert('Error', 'Please fill in all required fields.');
        }

        // Role-specific validation
        if (role === 'employee' && !companyId) {
            return Alert.alert('Error', 'Please enter a Company ID to join an existing company.');
        }

        if (role === 'manager' && !companyName) {
            return Alert.alert('Error', 'Please enter a Company Name to create a new company.');
        }

        setIsSubmitting(true);

        try {
            await createUser({ 
                email, 
                password, 
                name,
                isManager: role === 'manager',
                companyId: role === 'employee' ? companyId : undefined,
                companyName: role === 'manager' ? companyName : undefined
            });

            router.replace('/(tabs)');
        } catch(error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <View className="gap-6 bg-white rounded-lg p-5 mt-40">
            {/* Header */}
            <Text className="text-xl text-center mb-2 text-black font-bold">
                Create Your Account
            </Text>

            {/* Role Selector */}
            <View className="mb-4">
                <Text className="text-base font-semibold text-gray-900 mb-3">
                    I am a:
                </Text>
                <View className="flex-row gap-3">
                    {/* Employee Button */}
                    <TouchableOpacity
                        className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl border-2 ${
                            role === 'employee' 
                                ? 'bg-primary border-primary' 
                                : 'bg-gray-50 border-gray-200'
                        }`}
                        onPress={() => setRole('employee')}
                        activeOpacity={0.7}
                    >
                        <Ionicons 
                            name="people-outline" 
                            size={20} 
                            color={role === 'employee' ? '#fff' : '#6B7280'} 
                            style={{ marginRight: 8 }}
                        />
                        <Text className={`font-semibold ${
                            role === 'employee' ? 'text-white' : 'text-gray-600'
                        }`}>
                            Employee
                        </Text>
                    </TouchableOpacity>
                    {/* Manager Button */}
                    <TouchableOpacity
                        className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl border-2 ${
                            role === 'manager' 
                                ? 'bg-primary border-primary' 
                                : 'bg-gray-50 border-gray-200'
                        }`}
                        onPress={() => setRole('manager')}
                        activeOpacity={0.7}
                    >
                        <Ionicons 
                            name="briefcase-outline" 
                            size={20} 
                            color={role === 'manager' ? '#fff' : '#6B7280'} 
                            style={{ marginRight: 8 }}
                        />
                        <Text className={`font-semibold ${
                            role === 'manager' ? 'text-white' : 'text-gray-600'
                        }`}>
                            Manager
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Company Field - Conditional based on role */}
            {role === 'employee' ? (
                <CustomInput
                    placeholder="Enter Company ID"
                    value={form.companyId}
                    onChangeText={(text) => setForm((prev) => ({ ...prev, companyId: text }))}
                    label="Company ID"
                    keyboardType="default"
                />
            ) : (
                <CustomInput
                    placeholder="Enter Company Name"
                    value={form.companyName}
                    onChangeText={(text) => setForm((prev) => ({ ...prev, companyName: text }))}
                    label="Company Name"
                    keyboardType="default"
                />
            )}

            {/* User Info Fields */}
            <CustomInput
                placeholder="Enter your full name"
                value={form.name}
                onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
                label="Full Name"
            />
            <CustomInput
                placeholder="Enter your email"
                value={form.email}
                onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
                label="Email"
                keyboardType="email-address"
            />
            <CustomInput
                placeholder="Enter your password"
                value={form.password}
                onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
                label="Password"
                secureTextEntry={true}
            />

            {/* Info Text */}
            {role === 'employee' && (
                <View className="bg-blue-50 p-3 rounded-lg flex-row items-start">
                    <Ionicons name="information-circle-outline" size={20} color="#3B82F6" style={{ marginRight: 8, marginTop: 2 }} />
                    <Text className="text-sm text-blue-700 flex-1">
                        Ask your manager for the Company ID to join your company.
                    </Text>
                </View>
            )}

            {role === 'manager' && (
                <View className="bg-green-50 p-3 rounded-lg flex-row items-start">
                    <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" style={{ marginRight: 8, marginTop: 2 }} />
                    <Text className="text-sm text-green-700 flex-1">
                        A new company will be created with this name. You'll be set as the manager.
                    </Text>
                </View>
            )}

            <CustomButton
                title="Sign Up"
                isLoading={isSubmitting}
                onPress={submit}
                style={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl border-2 ${
                  role === 'manager' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-blue-50 border-blue-200'
              }`}
            />

            <View className="flex justify-center mt-5 flex-row gap-2">
                <Text className="base-regular text-gray-100">
                    Already have an account?
                </Text>
                <Link href="/sign-in" className="base-bold text-primary">
                    Sign In
                </Link>
            </View>
        </View>
    )
}

export default SignUp;
