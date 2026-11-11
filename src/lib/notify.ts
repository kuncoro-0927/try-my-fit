import { Alert, Platform } from "react-native";

// Alert.alert tidak tampil di browser, jadi pakai alert/confirm bawaan browser di web.
export function notify(title: string, msg = "") {
  if (Platform.OS === "web")
    (globalThis as any).alert(msg ? `${title}\n${msg}` : title);
  else Alert.alert(title, msg);
}

export function confirmAsync(
  title: string,
  msg: string,
  okText = "Hapus",
): Promise<boolean> {
  if (Platform.OS === "web")
    return Promise.resolve((globalThis as any).confirm(`${title}\n${msg}`));
  return new Promise((resolve) =>
    Alert.alert(
      title,
      msg,
      [
        { text: "Batal", style: "cancel", onPress: () => resolve(false) },
        { text: okText, style: "destructive", onPress: () => resolve(true) },
      ],
      { onDismiss: () => resolve(false) },
    ),
  );
}
