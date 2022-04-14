import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";

import * as Location from "expo-location";
import Fontisto from "@expo/vector-icons/Fontisto";
import { backgroundColor } from "react-native/Libraries/Components/View/ReactNativeStyleAttributes";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const icons = {
  Clouds: "cloudy",
  Clear: "day-sunny",
  Atmosphere: "cloudy-gusts",
  Snow: "snow",
  Rain: "rains",
  Drizzle: "rain",
  Thunderstorm: "lightnings",
};

const weatherBackgroudColor = {
  Clouds: "#eee9e9",
  Clear: "#ffff00",
  Atmosphere: "#c0c0c0",
  Snow: "#ecf5fd",
  Rain: "#5b92e5",
  Drizzle: "#9cbdef",
  Thunderstorm: "#fffacb",
};

const weatherTextColor = {
  Clouds: "#fbceb1",
  Clear: "#ff5544",
  Atmosphere: "#5e7e9b",
  Snow: "#0080ff",
  Rain: "#83dcb7",
  Drizzle: "#008d62",
  Thunderstorm: "#00a3d2",
};

const API_KEY = "56da92249f180b80c9845e4b4433ecc0";

export default function App() {
  const [city, setCity] = useState("Loading ...");
  const [days, setDays] = useState([]);

  const [currentBackgroudColor, setCurrentBackgroudColor] = useState("black");
  const [currentTextColor, setCurrentTextColor] = useState("white");
  const [index, setIndex] = useState(0);

  const [ok, setOk] = useState(true);
  const getWeather = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();

    if (!granted) {
      setOk(false);
    }

    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 });

    const location = await Location.reverseGeocodeAsync(
      { latitude, longitude },
      { useGoogleMaps: false }
    );
    setCity(location[0].city);

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=alerts&appid=${API_KEY}&units=metric`
    );
    const json = await response.json();
    setDays(json.daily);
  };

  const onScrollHandler = (event) => {
    const index = Math.floor(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);

    if (index < 0) {
      return;
    }
    setIndex(index);
  };

  useEffect(() => {
    getWeather();
  }, []);

  useEffect(() => {
    if (days[index] == undefined) {
      return;
    } else {
      const bg = weatherBackgroudColor[days[index].weather[0].main];
      const tc = weatherTextColor[days[index].weather[0].main];
      setCurrentBackgroudColor(bg);
      setCurrentTextColor(tc);
    }
  }, [index, days]);
  return (
    <View
      style={{
        ...styles.container,
        backgroundColor: currentBackgroudColor,
      }}
    >
      <View style={styles.city}>
        <Text style={{ ...styles.cityName, color: currentTextColor }}>
          {" "}
          {city}
        </Text>
      </View>

      <ScrollView
        showsHorizontalScrollIndicator="false"
        pagingEnabled
        horizontal
        contentContainerStyle={styles.weather}
        onScroll={onScrollHandler}
        scrollEventThrottle={16}
      >
        {days.length === 0 ? (
          <View style={{ ...styles.day, alignItems: "center" }}>
            <ActivityIndicator
              color="white"
              style={{ marginTop: 10 }}
              size="large"
            />
          </View>
        ) : (
          days.map((day, index) => (
            <View key={index} style={styles.day}>
              <Text style={{ ...styles.dateTime, color: currentTextColor }}>
                {new Date(day.dt * 1000).toString().substring(0, 10)}
              </Text>
              <View style={styles.tempContainer}>
                <Text style={{ ...styles.temp, color: currentTextColor }}>
                  {parseFloat(day.temp.day).toFixed(1)}℃
                </Text>
                <Fontisto
                  name={icons[day.weather[0].main]}
                  size={65}
                  color={currentTextColor}
                  style={{ paddingRight: 20 }}
                />
              </View>
              <Text
                style={{
                  ...styles.description,
                  color: currentTextColor,
                }}
              >
                {day.weather[0].main}
              </Text>
              <Text
                style={{ ...styles.tinyDescription, color: currentTextColor }}
              >
                {day.weather[0].description}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  city: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    fontSize: 50,
    fontWeight: "500",
    color: "white",
  },
  weather: {
    // backgroundColor: "blue",
  },
  day: {
    width: SCREEN_WIDTH,
    alignItems: "flex-start",
    paddingLeft: 20,
  },
  tempContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  temp: {
    marginTop: 45,
    fontSize: 80,
    fontWeight: "500",
    marginTop: 0,
  },
  description: {
    fontSize: 35,
    fontWeight: "400",
  },
  tinyDescription: {
    fontSize: 25,
    fontWeight: "300",
  },
  dateTime: {
    fontSize: 30,
  },
});
