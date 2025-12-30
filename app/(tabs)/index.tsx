import { createManualShift, getActiveShift, getShiftHistory, punchIn, punchOut, updateShift } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { Shift } from "@/type";
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from "react";
import { Alert, FlatList, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../globals.css";

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

// Helper function to format time
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  });
};

// Helper function to calculate duration
const calculateDuration = (timeIn: string, timeOut?: string): string => {
  if (!timeOut) return 'In Progress';
  
  const start = new Date(timeIn);
  const end = new Date(timeOut);
  const diffMs = end.getTime() - start.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${diffHours}h ${diffMinutes}m`;
};

interface ShiftEditModalProps {
  visible: boolean;
  shift: Shift | null;
  onClose: () => void;
  onSave: (timeIn: string, timeOut?: string) => void;
}

const ShiftEditModal = ({ visible, shift, onClose, onSave }: ShiftEditModalProps) => {
  const [timeIn, setTimeIn] = useState(new Date());
  const [timeOut, setTimeOut] = useState<Date | null>(null);
  const [showTimeInPicker, setShowTimeInPicker] = useState(false);
  const [showTimeOutPicker, setShowTimeOutPicker] = useState(false);
  const [showDateInPicker, setShowDateInPicker] = useState(false);
  const [showDateOutPicker, setShowDateOutPicker] = useState(false);

  useEffect(() => {
    if (shift) {
      setTimeIn(new Date(shift.timeIn));
      setTimeOut(shift.timeOut ? new Date(shift.timeOut) : null);
    } else {
      // New manual entry
      const now = new Date();
      setTimeIn(now);
      setTimeOut(null);
    }
  }, [shift]);

  const handleSave = () => {
    const timeInISO = timeIn.toISOString();
    const timeOutISO = timeOut ? timeOut.toISOString() : undefined;
    onSave(timeInISO, timeOutISO);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 max-h-[90%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-900">
              {shift ? 'Edit Shift' : 'Manual Entry'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            {/* Time In */}
            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-700 mb-2">Time In</Text>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="flex-1 bg-gray-300 p-3 rounded-lg"
                  onPress={() => setShowDateInPicker(true)}
                >
                  <Text className="text-gray-900">{timeIn.toLocaleDateString()}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-gray-300 p-3 rounded-lg"
                  onPress={() => setShowTimeInPicker(true)}
                >
                  <Text className="text-gray-900">{formatTime(timeIn.toISOString())}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Time Out */}
            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-700 mb-2">Time Out (Optional)</Text>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="flex-1 bg-gray-300 p-3 rounded-lg"
                  onPress={() => setShowDateOutPicker(true)}
                >
                  <Text className="text-gray-900">
                    {timeOut ? timeOut.toLocaleDateString() : 'Not set'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-gray-300 p-3 rounded-lg"
                  onPress={() => setShowTimeOutPicker(true)}
                >
                  <Text className="text-gray-900">
                    {timeOut ? formatTime(timeOut.toISOString()) : 'Not set'}
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                className="mt-2"
                onPress={() => setTimeOut(null)}
              >
                <Text className="text-red-600 text-sm">Clear Time Out</Text>
              </TouchableOpacity>
            </View>

            {/* Date Pickers */}
            {showDateInPicker && (
              <DateTimePicker
                value={timeIn}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  if (Platform.OS === 'android') {
                    setShowDateInPicker(false);
                  }
                  if (selectedDate) setTimeIn(selectedDate);
                }}
              />
            )}
            {showTimeInPicker && (
              <DateTimePicker
                value={timeIn}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  if (Platform.OS === 'android') {
                    setShowTimeInPicker(false);
                  }
                  if (selectedDate) setTimeIn(selectedDate);
                }}
              />
            )}
            {showDateOutPicker && (
              <DateTimePicker
                value={timeOut || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  if (Platform.OS === 'android') {
                    setShowDateOutPicker(false);
                  }
                  if (selectedDate) setTimeOut(selectedDate);
                }}
              />
            )}
            {showTimeOutPicker && (
              <DateTimePicker
                value={timeOut || new Date()}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  if (Platform.OS === 'android') {
                    setShowTimeOutPicker(false);
                  }
                  if (selectedDate) setTimeOut(selectedDate);
                }}
              />
            )}

            {/* Save Button */}
            <TouchableOpacity
              className="bg-primary py-4 rounded-xl mt-4"
              onPress={handleSave}
            >
              <Text className="text-white text-center font-semibold text-lg">
                Save
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default function Index() {
  const { user } = useAuthStore();
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [shiftHistory, setShiftHistory] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPunching, setIsPunching] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  const loadShifts = async () => {
    if (!user?.$id) return;

    try {
      setIsLoading(true);
      const [active, history] = await Promise.all([
        getActiveShift(user.$id),
        getShiftHistory(user.$id)
      ]);
      setActiveShift(active);
      setShiftHistory(history);
    } catch (error: any) {
      console.error('Error loading shifts:', error);
      Alert.alert('Error', error.message || 'Failed to load shifts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadShifts();
  }, [user]);

  const handlePunchIn = async () => {
    if (!user?.$id) return;

    try {
      setIsPunching(true);
      const shift = await punchIn(user.$id);
      setActiveShift(shift);
      await loadShifts();
      Alert.alert('Success', 'Punched in successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to punch in');
    } finally {
      setIsPunching(false);
    }
  };

  const handlePunchOut = async () => {
    if (!user?.$id) return;

    try {
      setIsPunching(true);
      await punchOut(user.$id);
      setActiveShift(null);
      await loadShifts();
      Alert.alert('Success', 'Punched out successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to punch out');
    } finally {
      setIsPunching(false);
    }
  };

  const handleManualEntry = () => {
    setEditingShift(null);
    setEditModalVisible(true);
  };

  const handleEditShift = (shift: Shift) => {
    setEditingShift(shift);
    setEditModalVisible(true);
  };

  const handleSaveShift = async (timeIn: string, timeOut?: string) => {
    if (!user?.$id) return;

    try {
      if (editingShift) {
        await updateShift(editingShift.$id, timeIn, timeOut);
      } else {
        await createManualShift(user.$id, timeIn, timeOut);
      }
      setEditModalVisible(false);
      setEditingShift(null);
      await loadShifts();
      Alert.alert('Success', editingShift ? 'Shift updated successfully!' : 'Manual shift created!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save shift');
    }
  };

  const renderShiftItem = ({ item }: { item: Shift }) => (
    <TouchableOpacity
      className="bg-white p-4 mb-3 rounded-xl border border-gray-200"
      onPress={() => handleEditShift(item)}
      activeOpacity={0.7}
    >
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
      <View className="flex-row items-center mt-2">
        <Ionicons name="create-outline" size={14} color="#9CA3AF" />
        <Text className="text-xs text-gray-400 ml-1">Tap to edit</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Card */}
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

        {/* Punch In/Out Button */}
        <View className="mx-4 mt-6">
          <TouchableOpacity
            className={`py-5 rounded-2xl items-center justify-center ${
              activeShift 
                ? 'bg-red-500 active:bg-red-600' 
                : 'bg-green-500 active:bg-green-600'
            }`}
            onPress={activeShift ? handlePunchOut : handlePunchIn}
            disabled={isPunching || isLoading}
            activeOpacity={0.8}
          >
            {isPunching ? (
              <View className="flex-row items-center">
                <Text className="text-white text-xl font-bold mr-2">Processing...</Text>
              </View>
            ) : (
              <View className="flex-row items-center">
                <Ionicons 
                  name={activeShift ? "stop-circle" : "play-circle"} 
                  size={28} 
                  color="#fff" 
                  style={{ marginRight: 8 }}
                />
                <Text className="text-white text-xl font-bold">
                  {activeShift ? 'Punch Out' : 'Punch In'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Manual Entry Button */}
        <View className="mx-4 mt-4">
          <TouchableOpacity
            className="py-4 rounded-xl items-center justify-center bg-white border-2 border-gray-300"
            onPress={handleManualEntry}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Ionicons name="add-circle-outline" size={24} color="#6B7280" style={{ marginRight: 8 }} />
              <Text className="text-gray-700 text-lg font-semibold">Manual Entry</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Shift History */}
        <View className="mx-4 mt-6 mb-4">
          <Text className="text-xl font-bold text-gray-900 mb-4">Shift History</Text>
          {isLoading ? (
            <View className="py-8 items-center">
              <Text className="text-gray-500">Loading shifts...</Text>
            </View>
          ) : shiftHistory.length === 0 ? (
            <View className="py-8 items-center bg-white rounded-xl">
              <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-500 mt-2">No shift history yet</Text>
            </View>
          ) : (
            <FlatList
              data={shiftHistory}
              renderItem={renderShiftItem}
              keyExtractor={(item) => item.$id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Edit/Manual Entry Modal */}
      <ShiftEditModal
        visible={editModalVisible}
        shift={editingShift}
        onClose={() => {
          setEditModalVisible(false);
          setEditingShift(null);
        }}
        onSave={handleSaveShift}
      />
    </SafeAreaView>
  );
}
