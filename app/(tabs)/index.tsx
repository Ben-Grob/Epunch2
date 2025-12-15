import "../globals.css";
import { FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TimeCardEntry from "@/components/TimeCardEntry";

// Fake data for one week
const timeCards = [
  { date: "Mon, Aug 19", hoursWorked: 8, isFuture: false },
  { date: "Tue, Aug 20", hoursWorked: 7.5, isFuture: false },
  { date: "Wed, Aug 21", hoursWorked: 0, isFuture: false },
  { date: "Thu, Aug 22", hoursWorked: 8, isFuture: false },
  { date: "Fri, Aug 23", hoursWorked: 0, isFuture: false },
  { date: "Sat, Aug 24", hoursWorked: 0, isFuture: true },
  { date: "Sun, Aug 25", hoursWorked: 0, isFuture: true },
];

const totalHours = timeCards
.reduce((sum, card) => sum + card.hoursWorked, 0);

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-center items-center bg-gray-200 p-4">
        <Text className= "text-xl text-center mb-5 text-white">
          Signed In as: <Text className="text-blue-500">John Doe</Text>
        </Text>
      </View>

      <Text className="text-2xl font-bold text-center mb-5">
        Status: <Text className="text-red-500">Punched Out</Text>
      </Text>

      {/* Time Cards */}
      <ScrollView className="flex-1">
        {timeCards.map((card, idx) => (
          <TimeCardEntry
            key={idx}
            date={card.date}
            hoursWorked={card.hoursWorked}
            isFuture={card.isFuture}
          />
        ))}
      </ScrollView>
      <View className="flex-row justify-between bg-gray-200 p-2">
        <Text className="font-bold text-left">Total</Text>
        <Text className="font-bold text-right">{totalHours}</Text>
      </View>



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