import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useState, useEffect } from "react";
import { RadioButton } from "react-native-paper";
import useBooks from "../hooks/useBooks";

export default function AddEdit() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { books, add, edit } = useBooks();

  const editing = id ? books.find((b) => b.id == id) : null;

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState<"planning" | "reading" | "done">("planning");

  useEffect(() => {
    if (editing) {
      setTitle(editing.title);
      setAuthor(editing.author);
      setStatus(editing.status ?? "planning");
    }
  }, [editing]);

  const onSave = () => {
    if (!title.trim()) return Alert.alert("Lỗi", "Title không được để trống");

    if (editing) {
      edit(editing.id, {
        title,
        author,
        status,
      });
    } else {
      add(title, author); // new books default to 'planning' in DB
    }

    router.back();
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
        {editing ? "Sửa sách" : "Thêm sách"}
      </Text>

      <TextInput
        placeholder="Tên sách"
        value={title}
        onChangeText={setTitle}
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 12,
          borderRadius: 6,
        }}
      />

      <TextInput
        placeholder="Tác giả"
        value={author}
        onChangeText={setAuthor}
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 12,
          borderRadius: 6,
        }}
      />

      <Text style={{ marginBottom: 8, fontWeight: "600" }}>Trạng thái</Text>
      <RadioButton.Group onValueChange={(v) => setStatus(v as any)} value={status}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
          <RadioButton value="planning" />
          <Text>Planning</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
          <RadioButton value="reading" />
          <Text>Reading</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <RadioButton value="done" />
          <Text>Done</Text>
        </View>
      </RadioButton.Group>

      <Button title="Lưu" onPress={onSave} />
    </View>
  );
}
