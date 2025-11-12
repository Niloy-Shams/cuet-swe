import * as SecureStore from 'expo-secure-store';

export const saveData = async (key: string, value: unknown) => {
  try {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key}:`, err);
  }
};

export const getData = async (key: string) => {
  try {
    const jsonValue = await SecureStore.getItemAsync(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (err) {
    console.error(`Error reading ${key}:`, err);
    return null;
  }
};

export const removeData = async (key: string) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (err) {
    console.error(`Error removing ${key}:`, err);
  }
};
