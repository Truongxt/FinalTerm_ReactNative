import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import useBooks from "../hooks/useBooks";
import BookItem from "../components/BookItem";

export default function Home() {
  const router = useRouter();
  const { books, load, cycleStatus, remove } = useBooks();

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <TouchableOpacity
        style={{
          padding: 12,
          backgroundColor: "#4CAF50",
          borderRadius: 8,
          marginBottom: 15,
        }}
        onPress={() => router.push("/add-edit")}
      >
        <Text style={{ textAlign: "center", fontSize: 18, color: "white" }}>
          + Thêm sách
        </Text>
      </TouchableOpacity>

      {books.length === 0 && (
        <Text>Chưa có sách trong danh sách đọc.</Text>
      )}

      <FlatList
        data={books}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <BookItem
            item={item}
            onPress={() => cycleStatus(item)}
            onLongPress={() =>
              router.push({ pathname: "/add-edit", params: { id: item.id } })
            }
            onDelete={() => remove(item.id)}
          />
        )}
      />
    </View>
  );
}
