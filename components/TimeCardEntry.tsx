import { View, Text } from "react-native";
import React from "react";
import { Float } from "react-native/Libraries/Types/CodegenTypes";

type TimeCardEntryProps = {
  date: string;        // e.g. "Mon, Aug 19"
  hoursWorked: Float; // "8 hrs" | "0 hrs"
  isFuture?: boolean;  // true if it's a future date
};

export default function TimeCardEntry({ date, hoursWorked, isFuture }: TimeCardEntryProps) {
  return (
    <View className="flex-row justify-between items-center px-4 py-5 border-b border-gray-200">
      <Text
        className={`text-base font-medium ${isFuture ? "text-gray-400" : "text-gray-800"}`}
      >
        {date}
      </Text>
      <Text
        className={`text-base font-semibold ${isFuture ? "text-gray-400" : "text-gray-600"}`}
      >
        {hoursWorked}
      </Text>
    </View>
  );
}
