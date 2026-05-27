import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "lucide-react"

import {
  UtensilsCrossed,
  Fish,
  Smartphone,
  Gift,
  Beef,
  Flower2,
  Shirt,
  Hammer,
  ShoppingBasket,
  Milk,
  Dumbbell,
  Sparkles,
  Home,
  Cigarette,
  CookingPot,
  Store,
} from "lucide-react-native";

const categories = [
  {
    title: "العطارين",
    icon: Store,
  },
  {
    title: "العطور",
    icon: Sparkles,
  },
  {
    title: "مواد غذائية",
    icon: ShoppingBasket,
  },
  {
    title: "الإنشائية",
    icon: Hammer,
  },
  {
    title: "موبايلات",
    icon: Smartphone,
  },
  {
    title: "مطاعم",
    icon: UtensilsCrossed,
  },
  {
    title: "الأسماك",
    icon: Fish,
  },
  {
    title: "مواد منزلية",
    icon: Home,
  },
  {
    title: "كمال أجسام",
    icon: Dumbbell,
  },
  {
    title: "ورود وهدايا",
    icon: Flower2,
  },
  {
    title: "النراكيل",
    icon: Cigarette,
  },
  {
    title: "قشطة وحليب",
    icon: Milk,
  },
  {
    title: "الحلويات",
    icon: CookingPot,
  },
  {
    title: "كوزمتك",
    icon: Sparkles,
  },
  {
    title: "ملابس رجال",
    icon: Shirt,
  },
  {
    title: "ملابس نساء",
    icon: Gift,
  },
];

export default function CategoriesScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>الأقسام</Text>

      <View style={styles.grid}>
        {categories.map((item, index) => {
          const Icon = item.icon;

          return (
            <TouchableOpacity key={index} style={styles.card}>
              <Icon size={34} color="#ff7a00" />

              <Text style={styles.cardText}>{item.title}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    paddingTop: 50,
  },

  header: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },

  card: {
    width: "47%",
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    paddingVertical: 25,
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#2d2d2d",
  },

  cardText: {
    color: "#fff",
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
  },
});
function Home() {
  return (
    <div>
      Home Page
    </div>
  );
}

export default Home;