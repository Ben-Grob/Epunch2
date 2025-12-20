import { Account, Avatars, Client, Databases, ID, Query } from "react-native-appwrite";

import { CreateUserParams, SignInParams } from "@/type";



export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    platform: "com.ben.Epunch",
    databaseId: "68be4356003720c7181c",
    userCollectionId: "user",
    companyCollectionId: "company",
    shiftCollectionId: "shift"
}

export const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint!)
    .setProject(appwriteConfig.projectId!)
    .setPlatform(appwriteConfig.platform)

export const account = new Account(client);
export const databases = new Databases(client);
const avatars = new Avatars(client);

// Helper function to delete all active sessions
const deleteAllSessions = async () => {
    try {
        await account.deleteSessions();
        console.log("All sessions deleted");
    } catch (e: any) {
        // If there are no sessions, this will error - that's okay
        console.log("No sessions to delete or error deleting sessions:", e?.message);
    }
};

export const createUser = async ({ email, password, name }: CreateUserParams) => {
    try {
        // Delete any existing sessions before creating a new account
        await deleteAllSessions();

        // Create the Appwrite account
        const newAccount = await account.create({
            userId: ID.unique(),
            email,
            password,
            name,
        });
        
        if(!newAccount) {
            throw new Error('Failed to create account');
        }

        console.log('Account created successfully:', newAccount.$id);

        // Sign in to create a session (no existing session since we just deleted all)
        await signIn({ email, password });

        // Generate avatar URL
        const avatarUrl = avatars.getInitialsURL(name);

        // Create user document in database
        console.log('Attempting to create user document in database...');
        console.log('Database ID:', appwriteConfig.databaseId);
        console.log('Collection ID:', appwriteConfig.userCollectionId);
        
        try {
            const userDocument = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                ID.unique(), // Use unique ID for document, not account ID
                { 
                    email, 
                    name, 
                    accountId: newAccount.$id, // Store account ID for lookup
                    avatar: avatarUrl 
                }
            );

            console.log('User document created successfully:', userDocument.$id);
            return userDocument;
        } catch (docError: any) {
            console.error('Failed to create user document:', docError);
            console.error('Error code:', docError?.code);
            console.error('Error type:', docError?.type);
            throw new Error(`Failed to create user document: ${docError?.message || docError}. Make sure the collection has create permissions for authenticated users.`);
        }
    } catch (e: any) {
        console.error('Error creating user:', e);
        // Preserve original error message if available
        const errorMessage = e?.message || e?.toString() || 'Failed to create user';
        throw new Error(errorMessage);
    }
}

export const signIn = async ({ email, password }: SignInParams) => {
    try {
        console.log("Attempting to sign in:", email);
        
        // Delete any existing sessions before creating a new one
        await deleteAllSessions();
        
        const session = await account.createEmailPasswordSession(email, password);
        console.log("Sign in successful, session created");
        return session;
    } catch (e: any) {
        console.error("Sign in error:", e?.message || e);
        
        // If the error is about an active session, try to delete and retry
        if (e?.message?.includes("session is active") || e?.code === 409) {
            console.log("Active session detected, deleting and retrying...");
            try {
                await deleteAllSessions();
                const session = await account.createEmailPasswordSession(email, password);
                console.log("Sign in successful after session cleanup");
                return session;
            } catch (retryError: any) {
                const errorMessage = retryError?.message || retryError?.toString() || 'Failed to sign in after session cleanup';
                throw new Error(errorMessage);
            }
        }
        
        const errorMessage = e?.message || e?.toString() || 'Failed to sign in';
        throw new Error(errorMessage);
    }
}

export const getCurrentUser = async () => {
    try {
        // Get current authenticated account
        const currentAccount = await account.get();
        if(!currentAccount) {
            console.log("No authenticated account found");
            return null;
        }

        console.log("Looking up user document for account:", currentAccount.$id);
        console.log('Database ID:', appwriteConfig.databaseId);
        console.log('Collection ID:', appwriteConfig.userCollectionId);

        // Query user document by accountId (matches what we store in createUser)
        try {
            const currentUser = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                [Query.equal('accountId', currentAccount.$id)] // Fixed: was 'userId', should be 'accountId'
            );

            if (currentUser.total === 0) {
                console.log("No user document found for account:", currentAccount.$id);
                console.log("This means the account exists but no database document was created");
                return null; 
            }

            console.log("User document found:", currentUser.documents[0].$id);
            return currentUser.documents[0];
        } catch (docError: any) {
            console.error('Failed to list user documents:', docError);
            console.error('Error code:', docError?.code);
            console.error('Error type:', docError?.type);
            throw new Error(`Failed to read user document: ${docError?.message || docError}. Make sure the collection has read permissions for authenticated users.`);
        }
    } catch (e: any) {
        // If account.get() fails, it usually means no session exists.
        console.error("Error getting current user:", e?.message || e);
        return null; 
    }
}