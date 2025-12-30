import { Account, Avatars, Client, Databases, ID, Query } from "react-native-appwrite";

import { CreateUserParams, Shift, SignInParams } from "@/type";



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

// Create a new company
export const createCompany = async (companyName: string, managerId: string) => {
    try {
        console.log('Creating company:', companyName);
        
        const companyDocument = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.companyCollectionId,
            ID.unique(),
            { 
                name: companyName,
                managerId: managerId
            }
        );

        console.log('Company created successfully:', companyDocument.$id);
        return companyDocument;
    } catch (e: any) {
        console.error('Failed to create company:', e);
        console.error('Error code:', e?.code);
        console.error('Error type:', e?.type);
        throw new Error(`Failed to create company: ${e?.message || e}. Make sure the collection has create permissions for authenticated users.`);
    }
}

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

export const createUser = async ({ email, password, name, isManager, companyId, companyName }: CreateUserParams) => {
    try {
        // Validate company information based on role
        if (isManager && !companyName) {
            throw new Error('Company name is required for managers');
        }
        if (!isManager && !companyId) {
            throw new Error('Company ID is required for employees');
        }

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

        // Handle company creation/lookup based on role
        let finalCompanyId: string;
        
        if (isManager) {
            // For managers: create a new company
            if (!companyName) {
                throw new Error('Company name is required for managers');
            }
            const companyDocument = await createCompany(companyName, newAccount.$id);
            finalCompanyId = companyDocument.$id;
            console.log('Company created for manager:', finalCompanyId);
        } else {
            // For employees: use the provided company ID
            if (!companyId) {
                throw new Error('Company ID is required for employees');
            }
            finalCompanyId = companyId;
            console.log('Using existing company ID for employee:', finalCompanyId);
        }

        // Create user document in database
        console.log('Attempting to create user document in database...');
        console.log('Database ID:', appwriteConfig.databaseId);
        console.log('Collection ID:', appwriteConfig.userCollectionId);
        console.log('isManager:', isManager);
        console.log('companyId:', finalCompanyId);
        
        try {
            const userDocument = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                ID.unique(), // Use unique ID for document, not account ID
                { 
                    email, 
                    name, 
                    accountId: newAccount.$id, // Store account ID for lookup
                    avatar: avatarUrl,
                    isManager: isManager,
                    companyId: finalCompanyId
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

export const signOut = async () => {
    try {
        console.log("Signing out...");
        await account.deleteSession('current'); // Delete current session
        console.log("Sign out successful");
    } catch (e: any) {
        console.error("Sign out error:", e?.message || e);
        // Even if there's an error, try to delete all sessions
        try {
            await deleteAllSessions();
        } catch (deleteError) {
            console.error("Error deleting all sessions:", deleteError);
        }
        // Don't throw - allow logout to proceed even if there's an error
    }
}

// Shift Functions
export const getActiveShift = async (userId: string): Promise<Shift | null> => {
    try {
        console.log('Checking for active shift for user:', userId);
        
        const shifts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.shiftCollectionId,
            [
                Query.equal('user', userId),
                Query.equal('isActive', true)
            ]
        );

        if (shifts.total === 0) {
            console.log('No active shift found');
            return null;
        }

        console.log('Active shift found:', shifts.documents[0].$id);
        return shifts.documents[0] as unknown as Shift;
    } catch (e: any) {
        console.error('Error getting active shift:', e?.message || e);
        throw new Error(`Failed to get active shift: ${e?.message || e}`);
    }
}

export const punchIn = async (userId: string): Promise<Shift> => {
    try {
        console.log('Punching in for user:', userId);
        
        // Check if there's already an active shift
        const activeShift = await getActiveShift(userId);
        if (activeShift) {
            throw new Error('You already have an active shift. Please punch out first.');
        }

        const timeIn = new Date().toISOString();
        
        const shift = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.shiftCollectionId,
            ID.unique(),
            {
                timeIn,
                isActive: true,
                user: userId
            }
        );

        console.log('Punched in successfully:', shift.$id);
        return shift as unknown as Shift;
    } catch (e: any) {
        console.error('Error punching in:', e?.message || e);
        throw new Error(`Failed to punch in: ${e?.message || e}`);
    }
}

export const punchOut = async (userId: string): Promise<Shift> => {
    try {
        console.log('Punching out for user:', userId);
        
        const activeShift = await getActiveShift(userId);
        if (!activeShift) {
            throw new Error('No active shift found. Please punch in first.');
        }

        const timeOut = new Date().toISOString();
        
        const updatedShift = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.shiftCollectionId,
            activeShift.$id,
            {
                timeOut,
                isActive: false
            }
        );

        console.log('Punched out successfully:', updatedShift.$id);
        return updatedShift as unknown as Shift;
    } catch (e: any) {
        console.error('Error punching out:', e?.message || e);
        throw new Error(`Failed to punch out: ${e?.message || e}`);
    }
}

export const getShiftHistory = async (userId: string): Promise<Shift[]> => {
    try {
        console.log('Fetching shift history for user:', userId);
        
        const shifts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.shiftCollectionId,
            [
                Query.equal('user', userId),
                Query.equal('isActive', false),
                Query.orderDesc('timeIn')
            ]
        );

        console.log(`Found ${shifts.total} completed shifts`);
        return shifts.documents as unknown as Shift[];
    } catch (e: any) {
        console.error('Error getting shift history:', e?.message || e);
        throw new Error(`Failed to get shift history: ${e?.message || e}`);
    }
}

export const createManualShift = async (
    userId: string, 
    timeIn: string, 
    timeOut?: string
): Promise<Shift> => {
    try {
        console.log('Creating manual shift for user:', userId);
        
        const shift = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.shiftCollectionId,
            ID.unique(),
            {
                timeIn,
                timeOut: timeOut || undefined,
                isActive: !timeOut // Active if no timeOut provided
            }
        );

        console.log('Manual shift created successfully:', shift.$id);
        return shift as unknown as Shift;
    } catch (e: any) {
        console.error('Error creating manual shift:', e?.message || e);
        throw new Error(`Failed to create manual shift: ${e?.message || e}`);
    }
}

export const updateShift = async (
    shiftId: string,
    timeIn: string,
    timeOut?: string
): Promise<Shift> => {
    try {
        console.log('Updating shift:', shiftId);
        
        const updatedShift = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.shiftCollectionId,
            shiftId,
            {
                timeIn,
                timeOut: timeOut || undefined,
                isActive: !timeOut // Active if no timeOut provided
            }
        );

        console.log('Shift updated successfully:', updatedShift.$id);
        return updatedShift as unknown as Shift;
    } catch (e: any) {
        console.error('Error updating shift:', e?.message || e);
        throw new Error(`Failed to update shift: ${e?.message || e}`);
    }
}