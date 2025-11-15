import { View, Text, FlatList, TouchableOpacity, Alert, TextInput } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState, useMemo } from "react";
import useBooks from "../hooks/useBooks";
import BookItem from "../components/BookItem";

export default function Home() {
  const router = useRouter();
  const { books, load, cycleStatus, remove } = useBooks();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "planning" | "reading" | "done">("all");

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <TextInput
        placeholder="Tìm theo tiêu đề..."
        value={search}
        onChangeText={useCallback((t: string) => setSearch(t), [])}
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 10,
          borderRadius: 6,
        }}
      />

      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        {(["all", "planning", "reading", "done"] as const).map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setStatusFilter(s)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 20,
              backgroundColor: statusFilter === s ? "#3b82f6" : "#e5e7eb",
            }}
          >
            <Text style={{ color: statusFilter === s ? "white" : "#374151" }}>
              {s === "all" ? "Tất cả" : s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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

      {/* derive filtered list */}
      <FlatList
        data={useMemo(() => {
          const q = search.trim().toLowerCase();
          return books.filter((b: any) => {
            const matchTitle = q === "" || (b.title || "").toLowerCase().includes(q);
            const matchStatus = statusFilter === "all" ? true : b.status === statusFilter;
            return matchTitle && matchStatus;
          });
        }, [books, search, statusFilter])}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <BookItem
            item={item}
            onPress={() => cycleStatus(item)}
            onLongPress={() =>
              router.push({ pathname: "/add-edit", params: { id: item.id } })
            }
            onDelete={() =>
              Alert.alert(
                "Xác nhận",
                "Bạn có chắc muốn xóa sách này?",
                [
                  { text: "Hủy", style: "cancel" },
                  {
                    text: "Xóa",
                    style: "destructive",
                    onPress: () => remove(item.id),
                  },
                ]
              )
            }
          />
        )}
      />
    </View>
  );
}
