import { getActiveShiftsForUsers, getCompany, getCompanyUsers, getShiftsForUsersInWeek } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { User } from "@/type";
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../globals.css";

// Helper function to map day name to index (reused from index.tsx)
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

// Calculate start of week based on startDay
const getStartOfWeek = (date: Date, startDay: string): Date => {
  const dayIndex = getDayIndex(startDay);
  const currentDay = date.getDay();
  
  let daysToSubtract = (currentDay - dayIndex + 7) % 7;
  
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - daysToSubtract);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
};

// Calculate end of week
const getEndOfWeek = (startOfWeek: Date): Date => {
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek;
};

// Format week range for display
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

// Calculate duration in minutes
const calculateDurationMinutes = (timeIn: string, timeOut?: string, currentTime?: Date): number => {
  const start = new Date(timeIn);
  const end = timeOut ? new Date(timeOut) : (currentTime || new Date());
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60));
};

// Format total minutes as hours and minutes
const formatTotalHours = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

interface EmployeeData {
  user: User;
  totalMinutes: number;
  isActive: boolean;
}

export default function ManagerDashboard() {
  const { user } = useAuthStore();
  const [companyUsers, setCompanyUsers] = useState<User[]>([]);
  const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startDay, setStartDay] = useState<string>('Sunday');
  const [totalTeamHours, setTotalTeamHours] = useState(0);
  const [activeCount, setActiveCount] = useState(0);

  // Calculate week range
  const startOfWeek = getStartOfWeek(selectedDate, startDay);
  const endOfWeek = getEndOfWeek(startOfWeek);

  const loadCompanyData = async () => {
    if (!user?.companyId) {
      Alert.alert('Error', 'No company associated with your account');
      return;
    }

    try {
      const company = await getCompany(user.companyId);
      if (company?.startDay) {
        setStartDay(company.startDay);
      }
    } catch (error: any) {
      console.error('Error loading company:', error);
      setStartDay('Sunday'); // Default
    }
  };

  const loadDashboardData = async () => {
    if (!user?.companyId) return;

    try {
      setIsLoading(true);

      // Fetch all users in the company
      const users = await getCompanyUsers(user.companyId);
      setCompanyUsers(users);

      // Get user IDs
      const userIds = users.map(u => u.$id);

      if (userIds.length === 0) {
        setEmployeeData([]);
        setTotalTeamHours(0);
        setActiveCount(0);
        return;
      }

      // Fetch shifts for the week and active shifts
      const [weekShifts, activeShifts] = await Promise.all([
        getShiftsForUsersInWeek(userIds, startOfWeek.toISOString(), endOfWeek.toISOString()),
        getActiveShiftsForUsers(userIds)
      ]);

      // Create a map of active user IDs
      const activeUserIds = new Set(activeShifts.map(s => s.user));

      // Calculate data for each employee
      const now = new Date();
      const employeeDataMap = new Map<string, EmployeeData>();

      // Initialize employee data
      users.forEach(emp => {
        employeeDataMap.set(emp.$id, {
          user: emp,
          totalMinutes: 0,
          isActive: activeUserIds.has(emp.$id)
        });
      });

      // Calculate totals for each employee
      weekShifts.forEach(shift => {
        const empData = employeeDataMap.get(shift.user);
        if (empData) {
          const minutes = calculateDurationMinutes(
            shift.timeIn,
            shift.timeOut || undefined,
            shift.isActive ? now : undefined
          );
          empData.totalMinutes += minutes;
        }
      });

      const employeeList = Array.from(employeeDataMap.values());
      setEmployeeData(employeeList);

      // Calculate totals
      const totalMinutes = employeeList.reduce((sum, emp) => sum + emp.totalMinutes, 0);
      setTotalTeamHours(totalMinutes);
      setActiveCount(employeeList.filter(emp => emp.isActive).length);

    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', error.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanyData();
  }, [user]);

  useEffect(() => {
    if (user?.companyId) {
      loadDashboardData();
    }
  }, [user, selectedDate, startDay]);

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

  const handleEmployeePress = (employeeId: string) => {
    router.push(`/(manager)/employee/${employeeId}`);
  };

  const renderEmployeeItem = ({ item }: { item: EmployeeData }) => (
    <TouchableOpacity
      className="bg-white p-4 mb-3 rounded-xl border border-gray-100"
      onPress={() => handleEmployeePress(item.user.$id)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900 mb-1">
            {item.user.name}
          </Text>
          <Text className="text-sm text-gray-600">
            {formatTotalHours(item.totalMinutes)}
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className={`px-3 py-1 rounded-full ${
            item.isActive ? 'bg-green-100' : 'bg-gray-300'
          }`}>
            <Text className={`text-xs font-semibold ${
              item.isActive ? 'text-green-700' : 'text-gray-600'
            }`}>
              {item.isActive ? 'Clocked In' : 'Clocked Out'}
            </Text>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color="#9CA3AF" 
            style={{ marginLeft: 12 }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mx-4 mt-4 mb-2">
          <Text className="text-2xl font-bold text-gray-900">Manager Dashboard</Text>
        </View>

        {/* Week Navigator */}
        <View className="mx-4 mt-4 bg-white rounded-xl p-4 border border-gray-200">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={handlePreviousWeek}
              className="p-2 rounded-lg bg-gray-300"
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
              className="p-2 rounded-lg bg-gray-300"
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Team Summary Card */}
        <View className="mx-4 mt-4 p-5 rounded-2xl bg-white border-2 border-gray-200 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-4">Team Summary</Text>
          <View className="flex-row gap-4">
            <View className="flex-1 bg-blue-50 p-4 rounded-xl">
              <Text className="text-sm text-gray-600 mb-1">Total Team Hours</Text>
              <Text className="text-2xl font-bold text-blue-700">
                {formatTotalHours(totalTeamHours)}
              </Text>
            </View>
            <View className="flex-1 bg-green-50 p-4 rounded-xl">
              <Text className="text-sm text-gray-600 mb-1">Currently Active</Text>
              <Text className="text-2xl font-bold text-green-700">
                {activeCount}
              </Text>
            </View>
          </View>
        </View>

        {/* Employee List */}
        <View className="mx-4 mt-6 mb-4">
          <Text className="text-xl font-bold text-gray-900 mb-4">Employees</Text>
          {isLoading ? (
            <View className="py-8 items-center">
              <Text className="text-gray-500">Loading employees...</Text>
            </View>
          ) : employeeData.length === 0 ? (
            <View className="py-8 items-center bg-white rounded-xl">
              <Ionicons name="people-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-500 mt-2">No employees found</Text>
            </View>
          ) : (
            <FlatList
              data={employeeData}
              renderItem={renderEmployeeItem}
              keyExtractor={(item) => item.user.$id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
