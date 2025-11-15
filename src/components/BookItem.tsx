import { View, Text, TouchableOpacity } from "react-native";

export default function BookItem({ item, onPress, onLongPress, onDelete }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={{
        padding: 12,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        marginBottom: 10,
      }}
    >
      <Text style={{ fontSize: 17, fontWeight: "bold" }}>{item.title}</Text>
      <Text style={{ color: "#666" }}>{item.author}</Text>
      <Text style={{ marginTop: 5, color: "#673ab7" }}>{item.status}</Text>

      <TouchableOpacity
        onPress={onDelete}
        style={{
          marginTop: 8,
          backgroundColor: "#f44336",
          padding: 6,
          borderRadius: 5,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>Xóa</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
