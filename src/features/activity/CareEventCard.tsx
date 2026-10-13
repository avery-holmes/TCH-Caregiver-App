import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown, LinearTransition } from "react-native-reanimated";
import { eventMeta } from "@/data/careEventCatalog";
import type { CareEvent } from "@/domain/careEvent";
import { styles } from "@/theme/appStyles";

/** A reusable activity entry with explicit selection callback. */
export function CareEventCard({
  event,
  detailed = false,
  onSelect,
}: {
  event: CareEvent;
  detailed?: boolean;
  onSelect: (id: number) => void;
}) {
    const meta = eventMeta[event.type] ?? eventMeta.Note;

    return (
      <Animated.View
        key={event.id}
        entering={FadeInDown.duration(260)}
        layout={LinearTransition.duration(180)}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${event.type} event at ${event.time}, logged by ${event.caregiver}`}
          style={({ pressed }) => [
            styles.eventCard,
            detailed && styles.eventCardDetailed,
            pressed && styles.pressedSurface,
          ]}
          onPress={() => onSelect(event.id)}
        >
          <View
            style={[
              styles.eventIconWrap,
              { backgroundColor: meta.tint },
            ]}
          >
            <Text style={styles.eventIcon}>{meta.icon}</Text>
          </View>

          <View style={styles.eventCopy}>
            <View style={styles.eventTopRow}>
              <Text style={styles.eventType}>{event.type}</Text>
              <Text style={styles.eventTime}>{event.time}</Text>
            </View>

            <Text
              style={styles.eventDetails}
              numberOfLines={detailed ? undefined : 2}
            >
              {event.details}
            </Text>

            <Text style={styles.eventCaregiver}>
              Logged by {event.caregiver}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  }
