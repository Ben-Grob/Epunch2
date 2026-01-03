import useAuthStore from "@/store/auth.store";
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from "expo-router";
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../globals.css";

interface ProfileOption {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

export default function Profile() {
  const { user, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace('/sign-in');
          }
        }
      ]
    );
  };

  const profileOptions: ProfileOption[] = [
    ...(user?.isManager ? [{
      icon: "briefcase-outline" as keyof typeof Ionicons.glyphMap,
      label: "Manager Dashboard",
      onPress: () => {
        router.push('/(manager)/dashboard');
      }
    }] : []),
    {
      icon: "person-outline",
      label: "Edit Profile",
      onPress: () => {
        // TODO: Navigate to edit profile screen
        Alert.alert("Coming Soon", "Edit profile feature coming soon!");
      }
    },
    {
      icon: "notifications-outline",
      label: "Notifications",
      onPress: () => {
        // TODO: Navigate to notifications settings
        Alert.alert("Coming Soon", "Notifications settings coming soon!");
      }
    },
    {
      icon: "lock-closed-outline",
      label: "Privacy & Security",
      onPress: () => {
        // TODO: Navigate to privacy settings
        Alert.alert("Coming Soon", "Privacy settings coming soon!");
      }
    },
    {
      icon: "help-circle-outline",
      label: "Help & Support",
      onPress: () => {
        // TODO: Navigate to help screen
        Alert.alert("Coming Soon", "Help & support coming soon!");
      }
    },
    {
      icon: "information-circle-outline",
      label: "About",
      onPress: () => {
        Alert.alert("About", "Epunch3 v1.0.0\nTime tracking application");
      }
    },
    {
      icon: "log-out-outline",
      label: "Sign Out",
      onPress: handleSignOut,
      danger: true
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="bg-white pb-6 pt-4 px-6 mb-4">
          <View className="items-center mb-4">
            {/* Avatar */}
            <View className="w-24 h-24 rounded-full bg-primary items-center justify-center mb-3">
              {user?.avatar ? (
                <Image 
                  source={{ uri: user.avatar }} 
                  className="w-24 h-24 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="person" size={48} color="#fff" />
              )}
            </View>
            
            {/* User Name */}
            <Text className="text-2xl font-bold text-gray-900 mb-1">
              {user?.name || "User"}
            </Text>
            
            {/* User Email */}
            <Text className="text-base text-gray-500">
              {user?.email || ""}
            </Text>
          </View>
        </View>

        {/* Settings Options */}
        <View className="bg-white mb-4">
          {profileOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              className={`flex-row items-center px-6 py-4 border-b border-gray-100 ${
                index === profileOptions.length - 1 ? 'border-b-0' : ''
              }`}
              onPress={option.onPress}
              activeOpacity={0.7}
            >
              <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
                option.danger ? 'bg-red-50' : 'bg-gray-100'
              }`}>
                <Ionicons 
                  name={option.icon} 
                  size={22} 
                  color={option.danger ? "#EF4444" : "#6B7280"} 
                />
              </View>
              
              <Text className={`flex-1 text-base ${
                option.danger ? 'text-red-600 font-semibold' : 'text-gray-900'
              }`}>
                {option.label}
              </Text>
              
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color="#9CA3AF" 
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
