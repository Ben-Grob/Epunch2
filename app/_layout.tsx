import { Stack, SplashScreen } from "expo-router";
import { useEffect } from 'react';
import useAuthStore from '@/store/auth.store';

// Prevent the splash screen from hiding automatically
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
    const { fetchAuthenticatedUser, isLoading } = useAuthStore();

    useEffect(() => {
        console.log("ROOT LAYOUT MOUNTED")
        fetchAuthenticatedUser();
    }, []);

    useEffect(() => {
        // Once loading is finished, hide the splash screen
        if (!isLoading) {
            SplashScreen.hideAsync();
        }
    }, [isLoading]);

    // Do not return null or SplashScreen here. 
    // Always return the Stack so the router is initialized.
    return <Stack screenOptions={{ headerShown: false }} />;
}

export default RootLayout;