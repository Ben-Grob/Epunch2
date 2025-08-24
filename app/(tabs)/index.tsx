import "../globals.css";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
 
export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-center items-center bg-gray-200 p-4">
        <Text className= "text-xl text-center mb-5 text-white">
          Signed In as: <Text className="text-blue-500">John Doe</Text>
        </Text>
      </View>

      <Text className="text-2xl font-bold text-center mb-10">
        Status: <Text className="text-red-500">Punched Out</Text>
      </Text>

      {/* Button */}
      <View className="items-center">
        <TouchableOpacity className="bg-green-600 px-8 py-4 rounded-xl active:opacity-80">
          <Text className="text-white text-lg font-semibold">Punch In</Text>
        </TouchableOpacity>
      </View>

      {/* Button */}
      <View className="items-center">
        <TouchableOpacity className=" px-8 py-4 rounded-xl active:opacity-80">
          <Text className=" text-lg font-semibold">Add Shift</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}