import useAuthStore from "@/store/auth.store";
import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, Tabs } from "expo-router";

export default function TabLayout() {
    const { isAuthenticated, user } = useAuthStore();
    const isManager = user?.isManager ?? false;

    if(!isAuthenticated) {
        console.log("Tabs Layout Detecting unauthenticated user")
        return <Redirect href="/sign-in" />
    }

    return (
        <Tabs screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarActiveTintColor: '#FE8C00', // Primary color
                tabBarInactiveTintColor: '#5D5F6D', // Gray for inactive
                tabBarStyle: {
                    borderTopLeftRadius: 50,
                    borderTopRightRadius: 50,
                    borderBottomLeftRadius: 50,
                    borderBottomRightRadius: 50,
                    marginHorizontal: 20,
                    height: 80,
                    position: 'absolute',
                    bottom: 40,
                    backgroundColor: 'white',
                    shadowColor: '#1a1a1a',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 5
                }
            }}>
            <Tabs.Screen
                name='index'
                options={{
                    title: 'Time Card',
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons 
                            name={focused ? "time" : "time-outline"} 
                            size={28} 
                            color={color} 
                        />
                    )
                }}
            />
            {isManager && (
                <Tabs.Screen
                    name='dashboard'
                    options={{
                        title: 'Dashboard',
                        tabBarIcon: ({ focused, color }) => (
                            <Ionicons 
                                name={focused ? "stats-chart" : "stats-chart-outline"} 
                                size={28} 
                                color={color} 
                            />
                        )
                    }}
                />
            )}
            <Tabs.Screen
                name='profile'
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons 
                            name={focused ? "person" : "person-outline"} 
                            size={28} 
                            color={color} 
                        />
                    )
                }}
            />
        </Tabs>
    );
}