import * as SecureStore from 'expo-secure-store';

/**
 * Minimal AsyncStorage-like interface required by Firebase React Native persistence.
 */
export interface ReactNativeAsyncStorage {
    /** Persist an item in storage. */
    setItem(key: string, value: string): Promise<void>;
    /** Retrieve an item from storage. */
    getItem(key: string): Promise<string | null>;
    /** Remove an item from storage. */
    removeItem(key: string): Promise<void>;
}

/**
 * Implementation of the above interface using Expo SecureStore.
 *
 * Note: SecureStore stores strings only, which matches this interface.
 */
const reactNativeAsyncStorage: ReactNativeAsyncStorage = {
    async setItem(key: string, value: string) {
        key = makeSafeKey(key);
        try {
            if (!key) return;
            await SecureStore.setItemAsync(key, value);
        } catch (error) {
            console.error(`Error setting item with key ${key}:`, error);
        }
    },

    async getItem(key: string) {
        key = makeSafeKey(key);
        try {
            if (!key) return null;
            const result = await SecureStore.getItemAsync(key);
            return result;
        } catch (error) {
            console.error(`Error getting item with key ${key}:`, error);
            return null;
        }
    },

    async removeItem(key: string) {
        key = makeSafeKey(key);
        if (!key) return;
        await SecureStore.deleteItemAsync(key);
    },
};


export default reactNativeAsyncStorage;

function makeSafeKey(key: string): string {
    if (!key) return "";
    // Replace any character not matching allowed ones with "_"
    return key.replace(/[^\w.-]/g, "_");
}
