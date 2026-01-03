import { appwriteConfig, databases, getActiveShift, getCompany, getShiftsForWeek } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { Shift, User } from "@/type";
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../../globals.css";

// Helper functions (reused from dashboard)
const getDayIndex = (dayName: string): number => {
  const dayMap: { [key: string]: number } = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6
  };
  return dayMap[dayName.toLowerCase()] ?? 0;
};

const getStartOfWeek = (date: Date, startDay: string): Date => {
  const dayIndex = getDayIndex(startDay);
  const currentDay = date.getDay();
  let daysToSubtract = (currentDay - dayIndex + 7) % 7;
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - daysToSubtract);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
};

const getEndOfWeek = (startOfWeek: Date): Date => {
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  });
};

const calculateDuration = (timeIn: string, timeOut?: string): string => {
  if (!timeOut) return 'In Progress';
  const start = new Date(timeIn);
  const end = new Date(timeOut);
  const diffMs = end.getTime() - start.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${diffHours}h ${diffMinutes}m`;
};

const calculateDurationMinutes = (timeIn: string, timeOut?: string, currentTime?: Date): number => {
  const start = new Date(timeIn);
  const end = timeOut ? new Date(timeOut) : (currentTime || new Date());
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60));
};

const formatTotalHours = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const formatWeekRange = (startOfWeek: Date, endOfWeek: Date): string => {
  const startStr = startOfWeek.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });
  const endStr = endOfWeek.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });
  return `${startStr} - ${endStr}`;
};

export default function EmployeeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user: currentUser } = useAuthStore();
  const [employeeShifts, setEmployeeShifts] = useState<Shift[]>([]);
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startDay, setStartDay] = useState<string>('Sunday');
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [employeeName, setEmployeeName] = useState<string>('Employee');

  const startOfWeek = getStartOfWeek(selectedDate, startDay);
  const endOfWeek = getEndOfWeek(startOfWeek);

  const loadCompanyData = async () => {
    if (!currentUser?.companyId) return;

    try {
      const company = await getCompany(currentUser.companyId);
      if (company?.startDay) {
        setStartDay(company.startDay);
      }
    } catch (error: any) {
      console.error('Error loading company:', error);
      setStartDay('Sunday');
    }
  };

  const loadEmployeeData = async () => {
    if (!id) return;

    try {
      setIsLoading(true);

      // Fetch employee user document to get name
      try {
        const userDoc = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId,
          id
        );
        setEmployeeName((userDoc as unknown as User).name || 'Employee');
      } catch (e) {
        console.error('Error fetching employee name:', e);
        setEmployeeName('Employee');
      }

      // Fetch active shift and weekly shifts
      const [active, shifts] = await Promise.all([
        getActiveShift(id).catch(() => null), // Don't fail if no active shift
        getShiftsForWeek(id, startOfWeek.toISOString(), endOfWeek.toISOString())
      ]);

      setActiveShift(active);
      
      // Sort by timeIn descending
      shifts.sort((a, b) => new Date(b.timeIn).getTime() - new Date(a.timeIn).getTime());
      setEmployeeShifts(shifts);

      // Calculate weekly total
      const now = new Date();
      const totalMinutes = shifts.reduce((sum, shift) => {
        return sum + calculateDurationMinutes(
          shift.timeIn,
          shift.timeOut || undefined,
          shift.isActive ? now : undefined
        );
      }, 0);
      setWeeklyTotal(totalMinutes);

    } catch (error: any) {
      console.error('Error loading employee data:', error);
      Alert.alert('Error', error.message || 'Failed to load employee data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanyData();
  }, [currentUser]);

  useEffect(() => {
    if (id) {
      loadEmployeeData();
    }
  }, [id, selectedDate, startDay]);

  const handlePreviousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const renderShiftItem = ({ item }: { item: Shift }) => (
    <View className="bg-white p-4 mb-3 rounded-xl border border-gray-200">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 mb-1">
            {formatDate(item.timeIn)}
          </Text>
          <View className="flex-row items-center mb-1">
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-1">
              {formatTime(item.timeIn)} - {item.timeOut ? formatTime(item.timeOut) : 'In Progress'}
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-lg font-bold text-primary">
            {calculateDuration(item.timeIn, item.timeOut)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <View className="mx-4 mt-4 mb-2 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 p-2"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900 flex-1">{employeeName}'s Time Card</Text>
        </View>

        {/* Week Navigator */}
        <View className="mx-4 mt-4 bg-white rounded-xl p-4 border border-gray-200">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={handlePreviousWeek}
              className="p-2 rounded-lg bg-gray-100"
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color="#6B7280" />
            </TouchableOpacity>
            
            <View className="flex-1 items-center mx-4">
              <Text className="text-base font-semibold text-gray-900 text-center">
                {formatWeekRange(startOfWeek, endOfWeek)}
              </Text>
              <TouchableOpacity onPress={handleToday} className="mt-1">
                <Text className="text-xs text-primary">Today</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              onPress={handleNextWeek}
              className="p-2 rounded-lg bg-gray-100"
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Weekly Total Card */}
        <View className="mx-4 mt-4 p-5 rounded-2xl bg-white border-2 border-gray-200 shadow-sm">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-gray-900">Weekly Total</Text>
            <Text className="text-2xl font-bold text-primary">{formatTotalHours(weeklyTotal)}</Text>
          </View>
        </View>

        {/* Status Card */}
        <View className={`mx-4 mt-4 p-5 rounded-2xl ${
          activeShift ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-100 border-2 border-gray-200'
        }`}>
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-600 mb-1">Status</Text>
              <Text className={`text-2xl font-bold ${
                activeShift ? 'text-green-700' : 'text-gray-700'
              }`}>
                {activeShift ? 'Currently Clocked In' : 'Currently Clocked Out'}
              </Text>
              {activeShift && (
                <Text className="text-sm text-gray-600 mt-2">
                  Started: {formatTime(activeShift.timeIn)}
                </Text>
              )}
            </View>
            <View className={`w-16 h-16 rounded-full items-center justify-center ${
              activeShift ? 'bg-green-200' : 'bg-gray-300'
            }`}>
              <Ionicons 
                name={activeShift ? "checkmark-circle" : "time-outline"} 
                size={32} 
                color={activeShift ? "#10B981" : "#6B7280"} 
              />
            </View>
          </View>
        </View>

        {/* Shift List */}
        <View className="mx-4 mt-6 mb-4">
          <Text className="text-xl font-bold text-gray-900 mb-4">This Week's Shifts</Text>
          {isLoading ? (
            <View className="py-8 items-center">
              <Text className="text-gray-500">Loading shifts...</Text>
            </View>
          ) : employeeShifts.length === 0 ? (
            <View className="py-8 items-center bg-white rounded-xl">
              <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-500 mt-2">No shifts this week</Text>
            </View>
          ) : (
            <FlatList
              data={employeeShifts}
              renderItem={renderShiftItem}
              keyExtractor={(item) => item.$id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
