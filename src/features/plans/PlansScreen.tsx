import { ScrollView, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { subscriptionTiers } from "@/data/productRoadmap";
import { styles } from "@/theme/appStyles";

type ScreenProps = {
  contentContainerStyle: StyleProp<ViewStyle>;
};

/** Presentational plans feature; no care-event side effects. */
export function PlansScreen({ contentContainerStyle }: ScreenProps) {
    return (
      <ScrollView
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageTitleRow}>
          <View>
            <Text style={styles.sectionEyebrow}>SUBSCRIPTION CONCEPT</Text>
            <Text style={styles.pageTitle}>Plans</Text>
          </View>
        </View>

        <View style={styles.conceptBanner}>
          <Text style={styles.conceptBannerTitle}>
            Illustrative demo pricing
          </Text>
          <Text style={styles.conceptBannerBody}>
            The tiers show how product capability could scale with technical complexity.
          </Text>
        </View>

        {subscriptionTiers.map((tier, index) => (
          <Animated.View
            key={tier.name}
            entering={FadeInDown.delay(index * 70).duration(260)}
            style={[
              styles.planTierCard,
              index === 1 && styles.featuredTierCard,
            ]}
          >
            <View style={styles.tierHeader}>
              <View>
                <View
                  style={[
                    styles.tierNameBadge,
                    { backgroundColor: tier.tint },
                  ]}
                >
                  <Text
                    style={[
                      styles.tierNameText,
                      { color: tier.accent },
                    ]}
                  >
                    {tier.name}
                  </Text>
                </View>

                {index === 1 && (
                  <Text style={styles.recommendedText}>DEMO RECOMMENDED</Text>
                )}
              </View>

              <View style={styles.priceWrap}>
                <Text
                  style={[
                    styles.priceText,
                    { color: tier.accent },
                  ]}
                >
                  {tier.price}
                </Text>
                <Text style={styles.priceCadence}>{tier.cadence}</Text>
              </View>
            </View>

            <Text style={styles.tierDescription}>
              {tier.description}
            </Text>

            {tier.features.map((feature) => (
              <View key={feature} style={styles.featureListRow}>
                <Text
                  style={[
                    styles.featureCheck,
                    { color: tier.accent },
                  ]}
                >
                  ✓
                </Text>
                <Text style={styles.featureListText}>{feature}</Text>
              </View>
            ))}
          </Animated.View>
        ))}

        <View style={styles.clinicalNote}>
          <Text style={styles.clinicalNoteTitle}>
            Clinical-tier implementation
          </Text>
          <Text style={styles.clinicalNoteBody}>
            Real EHR connectivity and provider communication would require
            authorized integrations, privacy/security controls, consent,
            compliance review, and participating clinical systems.
          </Text>
        </View>
      </ScrollView>
    );
  }
