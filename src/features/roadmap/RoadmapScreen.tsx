import { ScrollView, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { roadmapPhases } from "@/data/productRoadmap";
import { styles } from "@/theme/appStyles";

type ScreenProps = {
  contentContainerStyle: StyleProp<ViewStyle>;
};

/** Presentational roadmap feature; no care-event side effects. */
export function RoadmapScreen({ contentContainerStyle }: ScreenProps) {
    return (
      <ScrollView
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageTitleRow}>
          <View>
            <Text style={styles.sectionEyebrow}>WHAT'S NEXT</Text>
            <Text style={styles.pageTitle}>Roadmap</Text>
          </View>
        </View>

        <View style={styles.roadmapIntroCard}>
          <Text style={styles.roadmapIntroTitle}>
            Growing with the family's care needs
          </Text>
          <Text style={styles.roadmapIntroBody}>
            TCH starts simple and adds collaboration, clinical connectivity,
            connected devices, and intelligent support over time.
          </Text>
        </View>


        {roadmapPhases.map((phase, index) => (
          <Animated.View
            key={phase.version}
            entering={FadeInDown.delay(index * 45).duration(240)}
            style={styles.roadmapStep}
          >
            <View style={styles.roadmapRail}>
              <View
                style={[
                  styles.roadmapDot,
                  { backgroundColor: phase.accent },
                ]}
              />
              {index < roadmapPhases.length - 1 && (
                <View style={styles.roadmapLine} />
              )}
            </View>

            <View
              style={[
                styles.roadmapCard,
                { backgroundColor: phase.tint },
              ]}
            >
              <View style={styles.roadmapVersionRow}>
                <Text
                  style={[
                    styles.roadmapVersion,
                    { color: phase.accent },
                  ]}
                >
                  {phase.version}
                </Text>

                <Text
                  style={[
                    styles.roadmapPhase,
                    { color: phase.accent },
                  ]}
                >
                  {phase.phase}
                </Text>
              </View>

              <Text style={styles.roadmapTitle}>{phase.title}</Text>

              <View style={styles.roadmapHighlights}>
                {phase.highlights.map((highlight) => (
                  <View key={highlight} style={styles.roadmapHighlightRow}>
                    <View
                      style={[
                        styles.roadmapHighlightDot,
                        { backgroundColor: phase.accent },
                      ]}
                    />
                    <Text style={styles.roadmapHighlightText}>
                      {highlight}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    );
  }
