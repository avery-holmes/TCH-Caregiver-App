import {
  dateFromKey,
  getDateKey,
  getTodayKey,
  normalizeLegacyEventDates,
  shiftDate,
} from "@/utils/dateUtils";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { eventMeta, eventTypes } from "@/data/careEventCatalog";
import { medicationOptions } from "@/data/demoCarePlan";
import {
  roadmapPhases,
  subscriptionTiers,
} from "@/data/productRoadmap";
import {
  loadCareEvents,
  saveCareEvents,
} from "@/data/storage/careEventRepository";
import type { CareEvent } from "@/domain/careEvent";

type AppTab = "home" | "activity" | "log" | "roadmap" | "plans";

const TAB_ORDER: AppTab[] = ["home", "activity", "log", "roadmap", "plans"];
const LOOPED_TABS: AppTab[] = [...TAB_ORDER, ...TAB_ORDER, ...TAB_ORDER];

const initialEvents: CareEvent[] = [
  {
    id: 1,
    type: "Feeding",
    time: "8:45 AM",
    details: "Pump feeding • Dose 250 mL • Rate 500 mL/hr",
    caregiver: "Caregiver A",
    date: getTodayKey(),
  },
  {
    id: 2,
    type: "Medication",
    time: "9:15 AM",
    details: "Morning medication routine completed",
    caregiver: "Caregiver B",
    date: getTodayKey(),
  },
];

export default function HomeScreen() {
  const { width: pageWidth } = useWindowDimensions();
  const isTablet = pageWidth >= 700;
  const pageContentStyle = [
    styles.screenContent,
    isTablet && styles.screenContentTablet,
  ];
  const pagerRef = useRef<FlatList<AppTab>>(null);
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [pagerIndex, setPagerIndex] = useState(TAB_ORDER.length);
  const [events, setEvents] = useState<CareEvent[]>(initialEvents);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState<string | null>(null);
  const [selectedActivityDate, setSelectedActivityDate] =
    useState(getTodayKey());
  const [calendarWeekOffset, setCalendarWeekOffset] = useState(0);
  const logoRotation = useSharedValue(0);

  const [profileExpanded, setProfileExpanded] = useState(false);
  const [profileCareFlowExpanded, setProfileCareFlowExpanded] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const [selectedType, setSelectedType] = useState("Feeding");
  const [caregiver, setCaregiver] = useState("Caregiver A");
  const [eventTime, setEventTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [feedingDose, setFeedingDose] = useState("250");
  const [feedingRate, setFeedingRate] = useState("500");
  const [feedingNotes, setFeedingNotes] = useState("");

  const [medicationDropdownOpen, setMedicationDropdownOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState("Medication A");
  const [medicationPeriod, setMedicationPeriod] =
    useState<"Morning" | "Evening">("Morning");
  const [medicationNotes, setMedicationNotes] = useState("");

  const [diaperType, setDiaperType] = useState("Wet");
  const [sleepStatus, setSleepStatus] = useState("Nap started");

  const [temperature, setTemperature] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [oxygenSaturation, setOxygenSaturation] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");

  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    async function loadSavedEvents() {
      try {
        const savedEvents = await loadCareEvents();
        if (savedEvents) {
          setEvents(normalizeLegacyEventDates(savedEvents));
        }
      } catch (error) {
        console.error("Unable to load saved care events:", error);
      } finally {
        setEventsLoaded(true);
      }
    }

    loadSavedEvents();
  }, []);

  useEffect(() => {
    if (!eventsLoaded) {
      return;
    }

    async function saveEvents() {
      try {
        await saveCareEvents(events);
      } catch (error) {
        console.error("Unable to save care events:", error);
      }
    }

    saveEvents();
  }, [events, eventsLoaded]);

  const todayEvents = useMemo(
    () => events.filter((event) => event.date === getTodayKey()),
    [events]
  );

  const latestFeeding = useMemo(
    () => todayEvents.find((event) => event.type === "Feeding"),
    [todayEvents]
  );

  const activityCalendarDays = useMemo(() => {
    const today = dateFromKey(getTodayKey());
    const endDate = shiftDate(today, calendarWeekOffset * 7);

    return Array.from({ length: 7 }, (_, index) => {
      const date = shiftDate(endDate, index - 6);
      const key = getDateKey(date);
      const count = events.filter((event) => event.date === key).length;

      return {
        key,
        date,
        count,
        weekday: date.toLocaleDateString([], { weekday: "short" }),
        dayNumber: date.getDate(),
      };
    });
  }, [events, calendarWeekOffset]);

  const activityEvents = useMemo(
    () => events.filter((event) => event.date === selectedActivityDate),
    [events, selectedActivityDate]
  );

  const activityDateLabel = useMemo(() => {
    if (selectedActivityDate === getTodayKey()) {
      return "Today";
    }

    const yesterday = getDateKey(shiftDate(new Date(), -1));
    if (selectedActivityDate === yesterday) {
      return "Yesterday";
    }

    return dateFromKey(selectedActivityDate).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [selectedActivityDate]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${logoRotation.value}deg` }],
  }));

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId),
    [events, selectedEventId]
  );

  const selectedMedicationOption = medicationOptions.find(
    (medication) => medication.name === selectedMedication
  );

  const selectedMedicationDose =
    medicationPeriod === "Morning"
      ? selectedMedicationOption?.morningDose ?? ""
      : selectedMedicationOption?.eveningDose ?? "";

  const feedingEventsToday = useMemo(
    () => todayEvents.filter((event) => event.type === "Feeding"),
    [todayEvents]
  );

  const morningMedicationComplete = useMemo(
    () =>
      todayEvents.some(
        (event) =>
          event.type === "Medication" &&
          /morning/i.test(event.details)
      ),
    [todayEvents]
  );

  const eveningMedicationComplete = useMemo(
    () =>
      todayEvents.some(
        (event) =>
          event.type === "Medication" &&
          /evening/i.test(event.details)
      ),
    [todayEvents]
  );

  const careFlow = useMemo(() => {
    const baseItems = [
      {
        id: "pump-setup",
        type: "Feeding",
        title: "Morning pump reset",
        timing: "Start of day",
        complete: feedingEventsToday.length > 0,
        progressText:
          feedingEventsToday.length > 0
            ? "Pump routine started"
            : "Reset volume total before first feeding",
      },
      {
        id: "morning-medications",
        type: "Medication",
        title: "Morning medications",
        timing: "Morning",
        complete: morningMedicationComplete,
        progressText: morningMedicationComplete
          ? "Logged"
          : "Not logged yet",
      },
      {
        id: "feeding-cycle",
        type: "Feeding",
        title: "Feeding cycle",
        timing: "Every 4 hours",
        complete: feedingEventsToday.length >= 4,
        inProgress:
          feedingEventsToday.length > 0 && feedingEventsToday.length < 4,
        progressText: `${feedingEventsToday.length} feeding${
          feedingEventsToday.length === 1 ? "" : "s"
        } logged today`,
      },
      {
        id: "evening-medications",
        type: "Medication",
        title: "Evening medications",
        timing: "Later today",
        complete: eveningMedicationComplete,
        progressText: eveningMedicationComplete
          ? "Logged"
          : "Still ahead",
      },
    ];

    let foundNext = false;

    return baseItems.map((item) => {
      if (item.complete) {
        return { ...item, status: "complete" as const };
      }

      if (item.inProgress) {
        foundNext = true;
        return { ...item, status: "active" as const };
      }

      if (!foundNext) {
        foundNext = true;
        return { ...item, status: "next" as const };
      }

      return { ...item, status: "later" as const };
    });
  }, [
    morningMedicationComplete,
    eveningMedicationComplete,
    feedingEventsToday,
  ]);

  const completedCareFlowCount = careFlow.filter(
    (item) => item.status === "complete"
  ).length;

  const nextCareItem =
    careFlow.find(
      (item) => item.status === "next" || item.status === "active"
    ) ?? careFlow[careFlow.length - 1];

  function middleIndexForTab(tab: AppTab) {
    return TAB_ORDER.length + TAB_ORDER.indexOf(tab);
  }

  function nearestIndexForTab(tab: AppTab) {
    const baseIndex = TAB_ORDER.indexOf(tab);
    const candidates = [
      baseIndex,
      baseIndex + TAB_ORDER.length,
      baseIndex + TAB_ORDER.length * 2,
    ];

    return candidates.reduce((nearest, candidate) =>
      Math.abs(candidate - pagerIndex) < Math.abs(nearest - pagerIndex)
        ? candidate
        : nearest
    );
  }

  function navigateToTab(tab: AppTab, animated = true) {
    const targetIndex = nearestIndexForTab(tab);

    setActiveTab(tab);
    setPagerIndex(targetIndex);

    pagerRef.current?.scrollToIndex({
      index: targetIndex,
      animated,
    });
  }

  function handlePagerMomentumEnd(offsetX: number) {
    const rawIndex = Math.round(offsetX / pageWidth);
    const boundedIndex = Math.max(
      0,
      Math.min(rawIndex, LOOPED_TABS.length - 1)
    );
    const tab = LOOPED_TABS[boundedIndex];

    setActiveTab(tab);
    setPagerIndex(boundedIndex);

    // Quietly recenter when the user reaches the outer copy of the loop.
    // The screen content is identical, so this keeps future swipes seamless.
    if (boundedIndex <= 1 || boundedIndex >= LOOPED_TABS.length - 2) {
      const recenteredIndex = middleIndexForTab(tab);

      requestAnimationFrame(() => {
        pagerRef.current?.scrollToIndex({
          index: recenteredIndex,
          animated: false,
        });
        setPagerIndex(recenteredIndex);
      });
    }
  }

  function previewCareReminder() {
    Alert.alert(
      "Care reminder preview",
      `${nextCareItem.title} is the next care item. In a shared-care release, authorized caregivers could receive a push notification when the configured due-time threshold is reached.`
    );
  }

  async function refreshCareData() {
    if (isRefreshing) {
      return;
    }

    navigateToTab("home");
    setIsRefreshing(true);
    setRefreshStatus("Checking for caregiver updates…");

    logoRotation.value = 0;
    logoRotation.value = withTiming(720, {
      duration: 900,
      easing: Easing.inOut(Easing.ease),
    });

    try {
      const savedEvents = await loadCareEvents();

      const refreshedEvents = savedEvents
        ? normalizeLegacyEventDates(savedEvents)
        : events;

      await new Promise((resolve) => setTimeout(resolve, 650));

      setEvents(refreshedEvents);

      const caregiverCount = new Set(
        refreshedEvents
          .map((event) => event.caregiver.trim())
          .filter(Boolean)
      ).size;

      setRefreshStatus(
        `Up to date • ${caregiverCount} caregiver${
          caregiverCount === 1 ? "" : "s"
        } represented`
      );
    } catch (error) {
      console.error("Unable to refresh care data:", error);
      setRefreshStatus("Refresh failed • local care history is still available");
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setRefreshStatus(null), 1800);
    }
  }

  function resetCategoryFields() {
    setFeedingDose("250");
    setFeedingRate("500");
    setFeedingNotes("");
    setMedicationDropdownOpen(false);
    setSelectedMedication("Medication A");
    setMedicationPeriod("Morning");
    setMedicationNotes("");
    setDiaperType("Wet");
    setSleepStatus("Nap started");
    setTemperature("");
    setHeartRate("");
    setOxygenSaturation("");
    setRespiratoryRate("");
    setSystolic("");
    setDiastolic("");
    setNoteText("");
  }

  function openLog(type = "Feeding") {
    resetCategoryFields();
    setSelectedType(type);
    setCaregiver("Caregiver A");
    setEventTime(new Date());
    setShowTimePicker(false);
    navigateToTab("log");
  }

  function showActivityEvent(event?: CareEvent) {
    setSelectedEventId(event?.id ?? null);
    setSelectedActivityDate(event?.date ?? getTodayKey());
    setCalendarWeekOffset(0);
    navigateToTab("activity");
  }

  function handleTimeChange(
    event: DateTimePickerEvent,
    selectedTime?: Date
  ) {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }

    if (event.type === "dismissed") {
      return;
    }

    if (selectedTime) {
      setEventTime(selectedTime);
    }
  }

  function buildEventDetails() {
    switch (selectedType) {
      case "Feeding": {
        const base = `Pump feeding • Dose ${feedingDose || "—"} mL • Rate ${
          feedingRate || "—"
        } mL/hr`;

        return feedingNotes.trim()
          ? `${base} • ${feedingNotes.trim()}`
          : base;
      }

      case "Medication": {
        const base = `${selectedMedication} • ${medicationPeriod} • ${selectedMedicationDose}`;

        return medicationNotes.trim()
          ? `${base} • ${medicationNotes.trim()}`
          : base;
      }

      case "Diaper/Toileting":
        return `${diaperType} diaper/toileting care`;

      case "Sleep":
        return sleepStatus;

      case "Vitals": {
        const values = [
          temperature.trim() ? `Temp ${temperature.trim()} °F` : "",
          heartRate.trim() ? `HR ${heartRate.trim()} bpm` : "",
          oxygenSaturation.trim() ? `SpO₂ ${oxygenSaturation.trim()}%` : "",
          respiratoryRate.trim() ? `RR ${respiratoryRate.trim()}/min` : "",
          systolic.trim() && diastolic.trim()
            ? `BP ${systolic.trim()}/${diastolic.trim()} mmHg`
            : "",
        ].filter(Boolean);

        return values.join(" • ");
      }

      case "Note":
        return noteText.trim();

      default:
        return "Care event";
    }
  }

  function saveEvent() {
    if (selectedType === "Feeding") {
      if (!feedingDose.trim() || !feedingRate.trim()) {
        Alert.alert(
          "Missing Feeding Details",
          "Enter both the pump dose and rate before saving."
        );
        return;
      }
    }

    if (selectedType === "Vitals") {
      const hasVital =
        temperature.trim() ||
        heartRate.trim() ||
        oxygenSaturation.trim() ||
        respiratoryRate.trim() ||
        (systolic.trim() && diastolic.trim());

      if (!hasVital) {
        Alert.alert(
          "Missing Vitals",
          "Enter at least one vital sign before saving."
        );
        return;
      }
    }

    if (selectedType === "Note" && !noteText.trim()) {
      Alert.alert("Missing Note", "Enter a note before saving.");
      return;
    }

    if (!caregiver.trim()) {
      Alert.alert(
        "Missing Caregiver",
        "Enter the caregiver name before saving."
      );
      return;
    }

    const newEvent: CareEvent = {
      id: Date.now(),
      type: selectedType,
      time: eventTime.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
      details: buildEventDetails(),
      caregiver: caregiver.trim(),
      date: getTodayKey(),
    };

    setEvents((current) => [newEvent, ...current]);
    setSelectedEventId(newEvent.id);
    setSelectedActivityDate(newEvent.date);
    setCalendarWeekOffset(0);
    navigateToTab("activity");
    resetCategoryFields();
  }

  function renderEventCard(event: CareEvent, detailed = false) {
    const meta = eventMeta[event.type] ?? eventMeta.Note;

    return (
      <Animated.View
        key={event.id}
        entering={FadeInDown.duration(260)}
        layout={LinearTransition.duration(180)}
      >
        <Pressable
          style={({ pressed }) => [
            styles.eventCard,
            detailed && styles.eventCardDetailed,
            pressed && styles.pressedSurface,
          ]}
          onPress={() => setSelectedEventId(event.id)}
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

  function renderProfileHeader() {
    return (
      <>
        <Animated.View entering={FadeInDown.duration(280).springify()}>
          <Pressable
            style={({ pressed }) => [
              styles.profileStrip,
              isTablet && styles.profileStripTablet,
              pressed && styles.pressedSurface,
            ]}
            onPress={() => setProfileExpanded((current) => !current)}
          >
            <View
              style={[
                styles.profileImage,
                styles.profileImagePlaceholder,
                isTablet && styles.profileImageTablet,
              ]}
            >
              <Text style={styles.profileImageInitials}>DC</Text>
            </View>

            <View style={styles.profileCopy}>
              <View style={styles.activeChildBadge}>
                <Text style={styles.activeChildBadgeText}>ACTIVE CHILD</Text>
              </View>

              <Text style={styles.profileName}>Demo Child</Text>
              <Text style={styles.profileSubtext}>
                {profileExpanded
                  ? "Hide care-plan details"
                  : "Tap for care-plan summary"}
              </Text>

              <View style={styles.profileSignalsRow}>
                {[
                  { label: "Feeding", icon: "🍼", meta: eventMeta.Feeding },
                  { label: "Medication", icon: "💊", meta: eventMeta.Medication },
                  { label: "Pump", icon: "◉", meta: eventMeta.Feeding },
                ].map((signal) => (
                  <View
                    key={signal.label}
                    style={[
                      styles.profileSignal,
                      { backgroundColor: signal.meta.tint },
                    ]}
                  >
                    <Text style={styles.profileSignalIcon}>{signal.icon}</Text>
                    <Text
                      style={[
                        styles.profileSignalText,
                        { color: signal.meta.accent },
                      ]}
                    >
                      {signal.label}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.dailyEssentialsRow}>
                <View style={styles.dailyEssential}>
                  <Text style={styles.dailyEssentialNumber}>1</Text>
                  <Text style={styles.dailyEssentialText}>Pump reset + feeding</Text>
                </View>

                <View style={styles.dailyEssential}>
                  <Text style={styles.dailyEssentialNumber}>2</Text>
                  <Text style={styles.dailyEssentialText}>Morning medications</Text>
                </View>

                <View style={styles.dailyEssential}>
                  <Text style={styles.dailyEssentialNumber}>3</Text>
                  <Text style={styles.dailyEssentialText}>Evening medications</Text>
                </View>
              </View>
            </View>

            <View style={styles.chevronButton}>
              <Text style={styles.chevron}>
                {profileExpanded ? "⌃" : "⌄"}
              </Text>
            </View>
          </Pressable>
        </Animated.View>

        {profileExpanded && (
          <Animated.View
            entering={FadeInDown.duration(240)}
            layout={LinearTransition.duration(200)}
            style={styles.profileExpandedWrap}
          >
            <View style={styles.carePlanSnapshotCard}>
              <View style={styles.expandedTitleRow}>
                <View style={styles.expandedTitleCopy}>
                  <Text style={styles.profileExpandedTitle}>
                    Care-plan snapshot
                  </Text>
                  <Text style={styles.profileExpandedBody}>
                    Demo values supplied for this prototype.
                  </Text>
                </View>
              </View>

              <View style={styles.carePlanDetailGrid}>
                <View style={styles.carePlanDetailCard}>
                  <View style={styles.carePlanDetailHeader}>
                    <Text style={styles.carePlanDetailIcon}>◉</Text>
                    <Text style={styles.carePlanLabel}>
                      Feeding pump + morning reset
                    </Text>
                  </View>
                  <Text style={styles.carePlanValue}>
                    Clear the volume total first. Dose 250 mL • Rate 500 mL/hr •
                    Continue feedings every 4 hours.
                  </Text>
                </View>

                <View style={styles.carePlanDetailCard}>
                  <View style={styles.carePlanDetailHeader}>
                    <Text style={styles.carePlanDetailIcon}>💊</Text>
                    <Text style={styles.carePlanLabel}>Morning medications</Text>
                  </View>
                  <Text style={styles.carePlanValue}>
                    Medication A • Medication B • Medication C
                  </Text>
                </View>

                <View style={styles.carePlanDetailCard}>
                  <View style={styles.carePlanDetailHeader}>
                    <Text style={styles.carePlanDetailIcon}>🌙</Text>
                    <Text style={styles.carePlanLabel}>Evening medications</Text>
                  </View>
                  <Text style={styles.carePlanValue}>
                    Medication A • Medication B • Medication C
                  </Text>
                </View>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.profileCareFlowDisclosure,
                pressed && styles.pressedSurface,
              ]}
              onPress={() =>
                setProfileCareFlowExpanded((current) => !current)
              }
            >
              <View style={styles.profileCareFlowDisclosureCopy}>
                <Text style={styles.profileCareFlowEyebrow}>TODAY</Text>
                <Text style={styles.profileCareFlowTitle}>Today's Care Flow</Text>
                <Text style={styles.profileCareFlowSubtext}>
                  {completedCareFlowCount} of {careFlow.length} steps complete
                </Text>
              </View>

              <View style={styles.profileCareFlowDisclosureRight}>
                <View style={styles.progressPill}>
                  <Text style={styles.progressPillText}>
                    {completedCareFlowCount}/{careFlow.length}
                  </Text>
                </View>
                <Text style={styles.chevron}>
                  {profileCareFlowExpanded ? "⌃" : "⌄"}
                </Text>
              </View>
            </Pressable>

            {profileCareFlowExpanded && (
              <Animated.View
                entering={FadeInDown.duration(200)}
                layout={LinearTransition.duration(180)}
                style={styles.profileCareFlowPanel}
              >
                <Text style={styles.expandedSectionHint}>
                  Logging care updates this sequence automatically.
                </Text>

                {careFlow.map((item, index) => {
                  const statusLabel =
                    item.status === "complete"
                      ? "Complete"
                      : item.status === "active"
                      ? "In progress"
                      : item.status === "next"
                      ? "Up next"
                      : "Later";

                  return (
                    <View key={item.id} style={styles.expandedFlowRow}>
                      <View style={styles.expandedFlowRail}>
                        <View
                          style={[
                            styles.expandedFlowMarker,
                            item.status === "complete" && styles.flowMarkerComplete,
                            item.status === "active" && styles.flowMarkerActive,
                            item.status === "next" && styles.flowMarkerNext,
                          ]}
                        >
                          <Text
                            style={[
                              styles.expandedFlowMarkerText,
                              item.status === "complete" &&
                                styles.flowMarkerTextComplete,
                            ]}
                          >
                            {item.status === "complete"
                              ? "✓"
                              : item.status === "active" ||
                                item.status === "next"
                              ? "→"
                              : "•"}
                          </Text>
                        </View>

                        {index < careFlow.length - 1 && (
                          <View style={styles.expandedFlowLine} />
                        )}
                      </View>

                      <View style={styles.expandedFlowCopy}>
                        <View style={styles.expandedFlowTitleRow}>
                          <Text style={styles.expandedFlowTitle}>{item.title}</Text>
                          <View
                            style={[
                              styles.expandedFlowStatus,
                              {
                                backgroundColor:
                                  item.status === "complete"
                                    ? "#DDF4E8"
                                    : item.status === "active" ||
                                      item.status === "next"
                                    ? "#FFF0CF"
                                    : "#ECEFEC",
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.expandedFlowStatusText,
                                {
                                  color:
                                    item.status === "complete"
                                      ? "#1F6D55"
                                      : item.status === "active" ||
                                        item.status === "next"
                                      ? "#8A642C"
                                      : "#69726D",
                                },
                              ]}
                            >
                              {statusLabel}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.expandedFlowDetail}>
                          {item.timing} • {item.progressText}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </Animated.View>
            )}
          </Animated.View>
        )}
      </>
    );
  }

  function renderHome() {
    return (
      <ScrollView
        contentContainerStyle={pageContentStyle}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshCareData}
            tintColor="#173D30"
            colors={["#173D30"]}
          />
        }
      >
        {renderProfileHeader()}

        <Animated.View entering={FadeInDown.delay(50).duration(280)}>
          <View style={styles.todayHeader}>
            <Text style={styles.todayTitle}>Today</Text>
            <Text style={styles.todaySubtitle}>Care Overview</Text>
          </View>

          <View style={styles.overviewCard}>
            <View style={styles.overviewTopRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.metricBlock,
                  pressed && styles.pressedSurface,
                ]}
                onPress={() => showActivityEvent()}
              >
                <Text style={styles.metricValue}>{todayEvents.length}</Text>
                <Text style={styles.metricLabel}>Care Events</Text>
                <Text style={styles.metricLink}>View Timeline</Text>
              </Pressable>

              <View style={styles.metricDivider} />

              <Pressable
                style={({ pressed }) => [
                  styles.metricBlock,
                  pressed && styles.pressedSurface,
                ]}
                onPress={() => showActivityEvent(latestFeeding)}
              >
                <Text
                  style={[
                    styles.metricValue,
                    { color: eventMeta.Feeding.accent },
                  ]}
                >
                  {latestFeeding?.time ?? "—"}
                </Text>
                <Text style={styles.metricLabel}>Last Feeding</Text>
                <Text style={styles.metricLink}>View Details</Text>
              </Pressable>
            </View>

            <View style={styles.overviewRule} />

            <View style={styles.careFlowHeader}>
              <View>
                <Text style={styles.overviewSectionLabel}>Today's Care Flow</Text>
                <Text style={styles.careFlowSummary}>
                  {completedCareFlowCount} of {careFlow.length} steps complete
                </Text>
              </View>

              <View style={styles.careFlowProgressTrack}>
                <View
                  style={[
                    styles.careFlowProgressFill,
                    {
                      width: `${
                        (completedCareFlowCount / careFlow.length) * 100
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>

            {careFlow.map((item, index) => {
              const meta = eventMeta[item.type];
              const isComplete = item.status === "complete";
              const isCurrent =
                item.status === "active" || item.status === "next";

              return (
                <View
                  key={item.id}
                  style={[
                    styles.careFlowRow,
                    index < careFlow.length - 1 && styles.careFlowDivider,
                  ]}
                >
                  <View
                    style={[
                      styles.careFlowStatusIcon,
                      {
                        backgroundColor: isComplete
                          ? "#DDF4E8"
                          : isCurrent
                          ? "#FFF0CF"
                          : "#ECEFEC",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.careFlowStatusIconText,
                        {
                          color: isComplete
                            ? "#1F6D55"
                            : isCurrent
                            ? "#8A642C"
                            : "#6E7671",
                        },
                      ]}
                    >
                      {isComplete ? "✓" : isCurrent ? "→" : "•"}
                    </Text>
                  </View>

                  <View style={styles.careFlowCopy}>
                    <Text style={styles.careFlowTitle}>{item.title}</Text>
                    <Text style={styles.careFlowDetail}>
                      {item.progressText}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.careFlowTimingChip,
                      { backgroundColor: meta.tint },
                    ]}
                  >
                    <Text
                      style={[
                        styles.careFlowTimingText,
                        { color: meta.accent },
                      ]}
                    >
                      {item.timing}
                    </Text>
                  </View>
                </View>
              );
            })}

            <Pressable
              style={({ pressed }) => [
                styles.reminderPreview,
                pressed && styles.pressedSurface,
              ]}
              onPress={previewCareReminder}
            >
              <View style={styles.reminderIcon}>
                <Text style={styles.reminderIconText}>🔔</Text>
              </View>

              <View style={styles.reminderCopy}>
                <Text style={styles.reminderEyebrow}>REMINDER PREVIEW</Text>
                <Text style={styles.reminderTitle}>
                  Next: {nextCareItem.title}
                </Text>
                <Text style={styles.reminderText}>
                  Caregiver alert at the configured due-time threshold
                </Text>
              </View>

              <Text style={styles.reminderAction}>Preview</Text>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(280)}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>QUICK ACTIONS</Text>
              <Text style={styles.sectionTitle}>What happened?</Text>
            </View>
            <Text style={styles.sectionHint}>Tap to log</Text>
          </View>

          <View style={styles.quickGrid}>
            {eventTypes.map((type) => {
              const meta = eventMeta[type];

              return (
                <Pressable
                  key={type}
                  style={({ pressed }) => [
                    styles.quickCard,
                    { backgroundColor: meta.tint },
                    pressed && styles.quickCardPressed,
                  ]}
                  onPress={() => openLog(type)}
                >
                  <View style={styles.quickIconWrap}>
                    <Text style={styles.quickIcon}>{meta.icon}</Text>
                  </View>

                  <Text
                    style={[
                      styles.quickTitle,
                      { color: meta.accent },
                    ]}
                  >
                    {meta.short}
                  </Text>

                  <Text style={styles.quickSubtext}>{type}</Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>
    );
  }

  function renderActivity() {
    return (
      <ScrollView
        contentContainerStyle={pageContentStyle}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageTitleRow}>
          <View>
            <Text style={styles.sectionEyebrow}>HANDOFF HISTORY</Text>
            <Text style={styles.pageTitle}>Activity</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.primarySmallButton,
              pressed && styles.pressedSurface,
            ]}
            onPress={() => openLog()}
          >
            <Text style={styles.primarySmallButtonText}>+ Add event</Text>
          </Pressable>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.calendarHeaderRow}>
            <View>
              <Text style={styles.calendarEyebrow}>CARE CALENDAR</Text>
              <Text style={styles.calendarTitle}>Review previous days</Text>
            </View>

            <View style={styles.calendarControls}>
              <Pressable
                accessibilityLabel="Previous week"
                style={({ pressed }) => [
                  styles.calendarArrow,
                  pressed && styles.pressedSurface,
                ]}
                onPress={() => setCalendarWeekOffset((current) => current - 1)}
              >
                <Text style={styles.calendarArrowText}>‹</Text>
              </Pressable>

              <Pressable
                accessibilityLabel="Return to current week"
                style={({ pressed }) => [
                  styles.calendarTodayButton,
                  pressed && styles.pressedSurface,
                ]}
                onPress={() => {
                  setCalendarWeekOffset(0);
                  setSelectedActivityDate(getTodayKey());
                  setSelectedEventId(null);
                }}
              >
                <Text style={styles.calendarTodayButtonText}>Today</Text>
              </Pressable>

              <Pressable
                accessibilityLabel="Next week"
                disabled={calendarWeekOffset >= 0}
                style={({ pressed }) => [
                  styles.calendarArrow,
                  calendarWeekOffset >= 0 && styles.calendarArrowDisabled,
                  pressed && calendarWeekOffset < 0 && styles.pressedSurface,
                ]}
                onPress={() =>
                  setCalendarWeekOffset((current) => Math.min(0, current + 1))
                }
              >
                <Text
                  style={[
                    styles.calendarArrowText,
                    calendarWeekOffset >= 0 &&
                      styles.calendarArrowTextDisabled,
                  ]}
                >
                  ›
                </Text>
              </Pressable>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.calendarWeekRow}
            snapToInterval={68}
            decelerationRate="fast"
            nestedScrollEnabled
            onMomentumScrollEnd={(event) => {
              const index = Math.max(
                0,
                Math.min(
                  activityCalendarDays.length - 1,
                  Math.round(event.nativeEvent.contentOffset.x / 68)
                )
              );
              const day = activityCalendarDays[index];
              if (day) {
                setSelectedActivityDate(day.key);
                setSelectedEventId(null);
              }
            }}
          >
            {activityCalendarDays.map((day) => {
              const selected = day.key === selectedActivityDate;
              const isToday = day.key === getTodayKey();

              return (
                <Pressable
                  key={day.key}
                  style={({ pressed }) => [
                    styles.calendarDay,
                    selected && styles.calendarDaySelected,
                    pressed && styles.pressedSurface,
                  ]}
                  onPress={() => {
                    setSelectedActivityDate(day.key);
                    setSelectedEventId(null);
                  }}
                >
                  <Text
                    style={[
                      styles.calendarWeekday,
                      selected && styles.calendarWeekdaySelected,
                    ]}
                  >
                    {day.weekday.slice(0, 2)}
                  </Text>
                  <Text
                    style={[
                      styles.calendarDayNumber,
                      selected && styles.calendarDayNumberSelected,
                    ]}
                  >
                    {day.dayNumber}
                  </Text>

                  {day.count > 0 ? (
                    <View
                      style={[
                        styles.calendarCountBadge,
                        selected && styles.calendarCountBadgeSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.calendarCountText,
                          selected && styles.calendarCountTextSelected,
                        ]}
                      >
                        {day.count}
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.calendarDot,
                        isToday && !selected && styles.calendarDotToday,
                      ]}
                    />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.calendarHint}>
            Swipe the date strip left or right, or tap a day, to review that date.
          </Text>
        </View>

        {selectedEvent && selectedEvent.date === selectedActivityDate && (
          <Animated.View
            entering={FadeInDown.duration(220)}
            style={styles.detailPanel}
          >
            <Text style={styles.detailPanelEyebrow}>SELECTED EVENT</Text>
            {renderEventCard(selectedEvent, true)}
          </Animated.View>
        )}

        <View style={styles.activityHeader}>
          <Text style={styles.activityHeaderTitle}>{activityDateLabel}</Text>
          <Text style={styles.activityHeaderCount}>
            {activityEvents.length} Care Event
            {activityEvents.length === 1 ? "" : "s"}
          </Text>
        </View>

        {activityEvents.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No care events for this day</Text>
            <Text style={styles.emptyBody}>
              Choose another date above, or use Add Event to log care for today.
            </Text>
          </View>
        ) : (
          activityEvents.map((event) => renderEventCard(event))
        )}
      </ScrollView>
    );
  }

  function renderLogFields() {
    if (selectedType === "Feeding") {
      return (
        <>
          <View
            style={[
              styles.featureCard,
              { backgroundColor: eventMeta.Feeding.tint },
            ]}
          >
            <Text
              style={[
                styles.featureEyebrow,
                { color: eventMeta.Feeding.accent },
              ]}
            >
              FEEDING PUMP
            </Text>
            <Text style={styles.featureTitle}>Every 4 hours</Text>
            <Text style={styles.featureBody}>
              Morning reset: clear the volume total. Demo settings are prefilled.
            </Text>
          </View>

          <View style={styles.twoColumnRow}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Dose (mL)</Text>
              <TextInput
                style={styles.input}
                value={feedingDose}
                onChangeText={setFeedingDose}
                keyboardType="decimal-pad"
                placeholder="250"
                placeholderTextColor="#8A908C"
              />
            </View>

            <View style={styles.halfField}>
              <Text style={styles.label}>Rate (mL/hr)</Text>
              <TextInput
                style={styles.input}
                value={feedingRate}
                onChangeText={setFeedingRate}
                keyboardType="decimal-pad"
                placeholder="500"
                placeholderTextColor="#8A908C"
              />
            </View>
          </View>

          <Text style={styles.label}>Feeding note (optional)</Text>
          <TextInput
            style={[styles.input, styles.largeInput]}
            value={feedingNotes}
            onChangeText={setFeedingNotes}
            multiline
            textAlignVertical="top"
            placeholder="Example: tolerated well, pump reset completed"
            placeholderTextColor="#8A908C"
          />
        </>
      );
    }

    if (selectedType === "Medication") {
      return (
        <>
          <Text style={styles.label}>Medication</Text>

          <Pressable
            style={styles.dropdownButton}
            onPress={() =>
              setMedicationDropdownOpen((current) => !current)
            }
          >
            <View>
              <Text style={styles.dropdownValue}>{selectedMedication}</Text>
              <Text style={styles.dropdownHint}>
                Tap to choose medication
              </Text>
            </View>
            <Text style={styles.chevron}>
              {medicationDropdownOpen ? "⌃" : "⌄"}
            </Text>
          </Pressable>

          {medicationDropdownOpen && (
            <Animated.View entering={FadeIn.duration(160)} style={styles.dropdownMenu}>
              {medicationOptions.map((medication) => (
                <Pressable
                  key={medication.name}
                  style={[
                    styles.dropdownOption,
                    selectedMedication === medication.name &&
                      styles.dropdownOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedMedication(medication.name);
                    setMedicationDropdownOpen(false);
                  }}
                >
                  <Text style={styles.dropdownOptionName}>
                    {medication.name}
                  </Text>
                  <Text style={styles.dropdownOptionDose}>
                    AM {medication.morningDose} • PM {medication.eveningDose}
                  </Text>
                </Pressable>
              ))}
            </Animated.View>
          )}

          <Text style={styles.label}>Scheduled period</Text>

          <View style={styles.segmentRow}>
            {(["Morning", "Evening"] as const).map((period) => (
              <Pressable
                key={period}
                style={[
                  styles.segmentButton,
                  medicationPeriod === period &&
                    styles.segmentButtonSelected,
                ]}
                onPress={() => setMedicationPeriod(period)}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    medicationPeriod === period &&
                      styles.segmentButtonTextSelected,
                  ]}
                >
                  {period}
                </Text>
              </Pressable>
            ))}
          </View>

          <View
            style={[
              styles.medicationDoseCard,
              { backgroundColor: eventMeta.Medication.tint },
            ]}
          >
            <Text
              style={[
                styles.featureEyebrow,
                { color: eventMeta.Medication.accent },
              ]}
            >
              DEMO CARE-PLAN DOSE
            </Text>
            <Text style={styles.medicationDoseValue}>
              {selectedMedicationDose}
            </Text>
            <Text style={styles.medicationDoseCaption}>
              {selectedMedication} • {medicationPeriod}
            </Text>
          </View>

          <Text style={styles.label}>Medication note (optional)</Text>
          <TextInput
            style={[styles.input, styles.largeInput]}
            value={medicationNotes}
            onChangeText={setMedicationNotes}
            multiline
            textAlignVertical="top"
            placeholder="Example: given via tube, no issues"
            placeholderTextColor="#8A908C"
          />
        </>
      );
    }

    if (selectedType === "Diaper/Toileting") {
      return (
        <>
          <Text style={styles.label}>Type</Text>

          <View style={styles.choiceWrap}>
            {["Wet", "Soiled", "Both", "Toileting"].map((type) => (
              <Pressable
                key={type}
                style={[
                  styles.choiceChip,
                  diaperType === type && {
                    backgroundColor: eventMeta["Diaper/Toileting"].tint,
                    borderColor: eventMeta["Diaper/Toileting"].accent,
                  },
                ]}
                onPress={() => setDiaperType(type)}
              >
                <Text
                  style={[
                    styles.choiceChipText,
                    diaperType === type && {
                      color: eventMeta["Diaper/Toileting"].accent,
                      fontWeight: "900",
                    },
                  ]}
                >
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>

          <View
            style={[
              styles.featureCard,
              { backgroundColor: eventMeta["Diaper/Toileting"].tint },
            ]}
          >
            <Text
              style={[
                styles.featureEyebrow,
                { color: eventMeta["Diaper/Toileting"].accent },
              ]}
            >
              QUICK EVENT
            </Text>
            <Text style={styles.featureTitle}>
              Timestamp-first documentation
            </Text>
            <Text style={styles.featureBody}>
              Choose the type, confirm the event time, and save.
            </Text>
          </View>
        </>
      );
    }

    if (selectedType === "Sleep") {
      return (
        <>
          <Text style={styles.label}>Sleep event</Text>

          <View style={styles.choiceWrap}>
            {["Nap started", "Woke up", "Bedtime", "Awake overnight"].map(
              (status) => (
                <Pressable
                  key={status}
                  style={[
                    styles.choiceChip,
                    sleepStatus === status && {
                      backgroundColor: eventMeta.Sleep.tint,
                      borderColor: eventMeta.Sleep.accent,
                    },
                  ]}
                  onPress={() => setSleepStatus(status)}
                >
                  <Text
                    style={[
                      styles.choiceChipText,
                      sleepStatus === status && {
                        color: eventMeta.Sleep.accent,
                        fontWeight: "900",
                      },
                    ]}
                  >
                    {status}
                  </Text>
                </Pressable>
              )
            )}
          </View>
        </>
      );
    }

    if (selectedType === "Vitals") {
      return (
        <>
          <View
            style={[
              styles.featureCard,
              { backgroundColor: eventMeta.Vitals.tint },
            ]}
          >
            <Text
              style={[
                styles.featureEyebrow,
                { color: eventMeta.Vitals.accent },
              ]}
            >
              VITALS
            </Text>
            <Text style={styles.featureTitle}>Structured readings</Text>
            <Text style={styles.featureBody}>
              Enter only the readings taken. Bluetooth devices are a future capability.
            </Text>
          </View>

          <View style={styles.twoColumnRow}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Temperature (°F)</Text>
              <TextInput
                style={styles.input}
                value={temperature}
                onChangeText={setTemperature}
                keyboardType="decimal-pad"
                placeholder="98.6"
                placeholderTextColor="#8A908C"
              />
            </View>

            <View style={styles.halfField}>
              <Text style={styles.label}>Heart rate</Text>
              <TextInput
                style={styles.input}
                value={heartRate}
                onChangeText={setHeartRate}
                keyboardType="number-pad"
                placeholder="bpm"
                placeholderTextColor="#8A908C"
              />
            </View>
          </View>

          <View style={styles.twoColumnRow}>
            <View style={styles.halfField}>
              <Text style={styles.label}>SpO₂ (%)</Text>
              <TextInput
                style={styles.input}
                value={oxygenSaturation}
                onChangeText={setOxygenSaturation}
                keyboardType="number-pad"
                placeholder="%"
                placeholderTextColor="#8A908C"
              />
            </View>

            <View style={styles.halfField}>
              <Text style={styles.label}>Respiratory rate</Text>
              <TextInput
                style={styles.input}
                value={respiratoryRate}
                onChangeText={setRespiratoryRate}
                keyboardType="number-pad"
                placeholder="/min"
                placeholderTextColor="#8A908C"
              />
            </View>
          </View>

          <Text style={styles.label}>Blood pressure</Text>

          <View style={styles.twoColumnRow}>
            <View style={styles.halfField}>
              <TextInput
                style={styles.input}
                value={systolic}
                onChangeText={setSystolic}
                keyboardType="number-pad"
                placeholder="Systolic"
                placeholderTextColor="#8A908C"
              />
            </View>

            <View style={styles.halfField}>
              <TextInput
                style={styles.input}
                value={diastolic}
                onChangeText={setDiastolic}
                keyboardType="number-pad"
                placeholder="Diastolic"
                placeholderTextColor="#8A908C"
              />
            </View>
          </View>
        </>
      );
    }

    return (
      <>
        <Text style={styles.label}>Caregiver note</Text>
        <TextInput
          style={[styles.input, styles.noteInput]}
          value={noteText}
          onChangeText={setNoteText}
          multiline
          textAlignVertical="top"
          placeholder="Write a handoff note..."
          placeholderTextColor="#8A908C"
        />
      </>
    );
  }

  function renderLog() {
    return (
      <ScrollView
        contentContainerStyle={pageContentStyle}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!showTimePicker}
      >
        <View style={styles.pageTitleRow}>
          <View>
            <Text style={styles.sectionEyebrow}>CREATE EVENT</Text>
            <Text style={styles.pageTitle}>Log care</Text>
          </View>

          <View
            style={[
              styles.logTypeBadge,
              {
                backgroundColor:
                  eventMeta[selectedType]?.tint ?? "#ECEFEC",
              },
            ]}
          >
            <Text
              style={[
                styles.logTypeBadgeText,
                {
                  color:
                    eventMeta[selectedType]?.accent ?? "#5F6964",
                },
              ]}
            >
              {eventMeta[selectedType]?.icon} {selectedType}
            </Text>
          </View>
        </View>

        <Text style={styles.label}>Event type</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeScroller}
        >
          {eventTypes.map((type) => {
            const meta = eventMeta[type];
            const selected = type === selectedType;

            return (
              <Pressable
                key={type}
                style={[
                  styles.typeChip,
                  selected && {
                    backgroundColor: meta.tint,
                    borderColor: meta.accent,
                  },
                ]}
                onPress={() => {
                  resetCategoryFields();
                  setSelectedType(type);
                }}
              >
                <Text style={styles.typeChipIcon}>{meta.icon}</Text>
                <Text
                  style={[
                    styles.typeChipText,
                    selected && {
                      color: meta.accent,
                      fontWeight: "900",
                    },
                  ]}
                >
                  {type}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.label}>Event time</Text>

        <View style={styles.timeRow}>
          <View>
            <Text style={styles.timeValue}>
              {eventTime.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </Text>
            <Text style={styles.timeHelper}>
              Defaults to the current time
            </Text>
          </View>

          <Pressable
            style={styles.adjustButton}
            onPress={() =>
              setShowTimePicker((current) => !current)
            }
          >
            <Text style={styles.adjustButtonText}>
              {showTimePicker ? "Done" : "Adjust"}
            </Text>
          </Pressable>
        </View>

        {showTimePicker && (
          <Animated.View
            entering={FadeIn.duration(180)}
            style={styles.timePickerWrap}
            onTouchStart={() => {}}
          >
            <View style={styles.timePickerHeader}>
              <Text style={styles.timePickerTitle}>Adjust event time</Text>
              <Text style={styles.timePickerHint}>
                Swipe the hour, minute and AM/PM wheels up or down.
              </Text>
            </View>

            <DateTimePicker
              value={eventTime}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleTimeChange}
              style={styles.timePicker}
              {...(Platform.OS === "ios"
                ? { themeVariant: "dark" as const, textColor: "#FFFFFF" }
                : {})}
            />
          </Animated.View>
        )}

        {renderLogFields()}

        <Text style={styles.label}>Caregiver</Text>

        <TextInput
          style={styles.input}
          value={caregiver}
          onChangeText={setCaregiver}
          placeholder="Who is logging this?"
          placeholderTextColor="#8A908C"
        />

        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            {
              backgroundColor:
                eventMeta[selectedType]?.accent ?? "#173D30",
            },
            pressed && styles.pressedButton,
          ]}
          onPress={saveEvent}
        >
          <Text style={styles.saveButtonText}>Save care event</Text>
        </Pressable>
      </ScrollView>
    );
  }

  function renderRoadmap() {
    return (
      <ScrollView
        contentContainerStyle={pageContentStyle}
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

  function renderPlans() {
    return (
      <ScrollView
        contentContainerStyle={pageContentStyle}
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

  function renderTab(tab: AppTab) {
    switch (tab) {
      case "activity":
        return renderActivity();
      case "log":
        return renderLog();
      case "roadmap":
        return renderRoadmap();
      case "plans":
        return renderPlans();
      default:
        return renderHome();
    }
  }

  const navItems: {
    key: AppTab;
    label: string;
    icon: string;
  }[] = [
    { key: "home", label: "Home", icon: "⌂" },
    { key: "activity", label: "Activity", icon: "☷" },
    { key: "log", label: "Log", icon: "＋" },
    { key: "roadmap", label: "Roadmap", icon: "→" },
    { key: "plans", label: "Plans", icon: "◇" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appHeader}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Refresh care data and return home"
          hitSlop={8}
          onPress={refreshCareData}
          style={({ pressed }) => pressed && styles.logoPressed}
        >
          <Animated.View
            style={[styles.headerLogoMark, logoAnimatedStyle]}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.headerLogoHeart}>♡</Text>
                <View style={styles.headerLogoDot} />
              </>
            )}
          </Animated.View>
        </Pressable>

        <Pressable
          style={styles.brandWordmark}
          onPress={refreshCareData}
          accessibilityRole="button"
          accessibilityLabel="TCH Care Coordination home and refresh"
        >
          <Text style={styles.brandWordmarkText}>TCH</Text>
          <Text style={styles.brandDescriptor}>Technology for Caregivers at Home</Text>
        </Pressable>

        <View style={styles.demoBadge}>
          <Text style={styles.demoBadgeText}>BETA</Text>
        </View>
      </View>

      {refreshStatus && (
        <Animated.View entering={FadeIn.duration(180)} style={styles.syncStatusBar}>
          {isRefreshing && (
            <ActivityIndicator
              size="small"
              color="#665A8F"
              style={styles.syncStatusSpinner}
            />
          )}
          <Text style={styles.syncStatusText}>{refreshStatus}</Text>
        </Animated.View>
      )}

      <View style={styles.contentArea}>
        <FlatList
          ref={pagerRef}
          data={LOOPED_TABS}
          horizontal
          pagingEnabled
          bounces={false}
          decelerationRate="fast"
          disableIntervalMomentum
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={TAB_ORDER.length}
          getItemLayout={(_, index) => ({
            length: pageWidth,
            offset: pageWidth * index,
            index,
          })}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={({ item, index }) => (
            <View
              style={[styles.pagerPage, { width: pageWidth }]}
              pointerEvents={index === pagerIndex ? "auto" : "none"}
            >
              {renderTab(item)}
            </View>
          )}
          onMomentumScrollEnd={(event) =>
            handlePagerMomentumEnd(event.nativeEvent.contentOffset.x)
          }
          onScrollToIndexFailed={(info) => {
            requestAnimationFrame(() => {
              pagerRef.current?.scrollToOffset({
                offset: info.index * pageWidth,
                animated: false,
              });
            });
          }}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={3}
        />
      </View>

      <View style={styles.bottomNav}>
        {navItems.map((item) => {
          const selected = activeTab === item.key;
          const isLog = item.key === "log";

          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              hitSlop={6}
              style={({ pressed }) => [
                styles.navItem,
                isLog && styles.logNavItem,
                pressed && styles.pressedSurface,
              ]}
              onPress={() => {
                if (item.key === "log") {
                  openLog("Feeding");
                } else {
                  navigateToTab(item.key);
                }
              }}
            >
              <View
                style={[
                  styles.navIconCircle,
                  selected && styles.navIconCircleSelected,
                  isLog && styles.logNavIconCircle,
                ]}
              >
                <Text
                  style={[
                    styles.navIcon,
                    selected && styles.navIconSelected,
                    isLog && styles.logNavIcon,
                  ]}
                >
                  {item.icon}
                </Text>
              </View>

              <Text
                style={[
                  styles.navLabel,
                  selected && styles.navLabelSelected,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F2EA",
  },

  appHeader: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 58,
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 8,
    backgroundColor: "#F5F2EA",
  },

  headerLogoMark: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#173D30",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    position: "relative",
  },

  headerLogoHeart: {
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 27,
    fontWeight: "700",
  },

  headerLogoDot: {
    position: "absolute",
    right: 5,
    top: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#B8A7E5",
    borderWidth: 1.5,
    borderColor: "#173D30",
  },

  brandWordmark: {
    flex: 1,
  },

  brandWordmarkText: {
    color: "#173D30",
    fontSize: 23,
    lineHeight: 25,
    fontWeight: "900",
    letterSpacing: -0.7,
  },

  brandDescriptor: {
    color: "#7D837F",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700",
    marginTop: 1,
  },

  demoBadge: {
    minHeight: 36,
    justifyContent: "center",
    backgroundColor: "#ECE8DE",
    paddingHorizontal: 11,
    borderRadius: 18,
  },

  demoBadgeText: {
    color: "#6E716C",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  logoPressed: {
    opacity: 0.78,
  },

  syncStatusBar: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEE9FA",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E1DBF1",
    paddingHorizontal: 16,
    paddingVertical: 7,
  },

  syncStatusSpinner: {
    marginRight: 8,
  },

  syncStatusText: {
    color: "#665A8F",
    fontSize: 11,
    fontWeight: "800",
  },

  contentArea: {
    flex: 1,
    overflow: "hidden",
  },

  pagerPage: {
    flex: 1,
    backgroundColor: "#F5F2EA",
  },

  screenContent: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 26,
  },

  screenContentTablet: {
    paddingHorizontal: 56,
    paddingTop: 18,
    paddingBottom: 40,
  },

  profileStrip: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 156,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E4E3DC",
  },

  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginRight: 14,
  },

  profileImageTablet: {
    width: 124,
    height: 124,
    borderRadius: 62,
    marginRight: 22,
  },

  profileImagePlaceholder: {
    backgroundColor: "#E7F1EA",
    alignItems: "center",
    justifyContent: "center",
  },

  profileImageInitials: {
    color: "#173D30",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 1,
  },


  profileStripTablet: {
    minHeight: 184,
    paddingHorizontal: 22,
    paddingVertical: 18,
  },

  profileCopy: {
    flex: 1,
  },

  activeChildBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#665A8F",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginBottom: 3,
  },

  activeChildBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.9,
  },

  profileName: {
    color: "#203128",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 2,
  },

  profileSubtext: {
    color: "#7D8781",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },

  profileSignalsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 9,
  },

  profileSignal: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 9,
  },

  profileSignalIcon: {
    fontSize: 11,
    marginRight: 5,
  },

  profileSignalText: {
    fontSize: 10,
    fontWeight: "900",
  },

  dailyEssentialsRow: {
    marginTop: 9,
    gap: 4,
  },

  dailyEssential: {
    flexDirection: "row",
    alignItems: "center",
  },

  dailyEssentialNumber: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EEE9FA",
    color: "#665A8F",
    textAlign: "center",
    lineHeight: 18,
    fontSize: 9,
    fontWeight: "900",
    marginRight: 7,
  },

  dailyEssentialText: {
    color: "#5B6761",
    fontSize: 11,
    fontWeight: "800",
  },

  chevronButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0F2EE",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  chevron: {
    color: "#5F6A64",
    fontSize: 22,
    fontWeight: "800",
  },

  profileExpandedWrap: {
    marginTop: -8,
    marginBottom: 16,
  },

  carePlanSnapshotCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E4E3DC",
  },

  profileExpandedTitle: {
    color: "#294B39",
    fontSize: 18,
    fontWeight: "900",
  },

  profileExpandedBody: {
    color: "#5E6C64",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
    marginBottom: 10,
  },

  expandedTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  expandedTitleCopy: {
    flex: 1,
  },

  progressPill: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  progressPillText: {
    color: "#365B47",
    fontSize: 10,
    fontWeight: "900",
  },

  carePlanDetailGrid: {
    marginTop: 4,
  },

  carePlanDetailCard: {
    borderTopWidth: 1,
    borderTopColor: "#ECEDE8",
    paddingTop: 11,
    marginTop: 11,
  },

  carePlanDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },

  carePlanDetailIcon: {
    width: 25,
    color: "#1F6D55",
    fontSize: 14,
    fontWeight: "900",
  },

  profileCareFlowDisclosure: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E7F1EA",
    borderRadius: 20,
    padding: 14,
    marginTop: 9,
  },

  profileCareFlowDisclosureCopy: {
    flex: 1,
  },

  profileCareFlowEyebrow: {
    color: "#47735D",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  profileCareFlowTitle: {
    color: "#294B39",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 1,
  },

  profileCareFlowSubtext: {
    color: "#607068",
    fontSize: 11,
    marginTop: 2,
  },

  profileCareFlowDisclosureRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  profileCareFlowPanel: {
    backgroundColor: "#E7F1EA",
    borderRadius: 20,
    padding: 14,
    marginTop: 6,
  },

  expandedSectionRule: {
    height: 1,
    backgroundColor: "rgba(41,75,57,0.12)",
    marginVertical: 14,
  },

  expandedSectionTitle: {
    color: "#294B39",
    fontSize: 16,
    fontWeight: "900",
  },

  expandedSectionHint: {
    color: "#607068",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
    marginBottom: 8,
  },

  expandedFlowRow: {
    flexDirection: "row",
    minHeight: 58,
  },

  expandedFlowRail: {
    width: 30,
    alignItems: "center",
  },

  expandedFlowMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ECEFEC",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  flowMarkerComplete: {
    backgroundColor: "#1F6D55",
  },

  flowMarkerActive: {
    backgroundColor: "#D9A84A",
  },

  flowMarkerNext: {
    backgroundColor: "#D9A84A",
  },

  expandedFlowMarkerText: {
    color: "#6E7671",
    fontSize: 12,
    fontWeight: "900",
  },

  flowMarkerTextComplete: {
    color: "#FFFFFF",
  },

  expandedFlowLine: {
    width: 2,
    flex: 1,
    backgroundColor: "rgba(41,75,57,0.14)",
    marginVertical: 3,
  },

  expandedFlowCopy: {
    flex: 1,
    paddingLeft: 8,
    paddingBottom: 10,
  },

  expandedFlowTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  expandedFlowTitle: {
    flex: 1,
    color: "#32433A",
    fontSize: 13,
    fontWeight: "900",
  },

  expandedFlowDetail: {
    color: "#647168",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  expandedFlowStatus: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  expandedFlowStatusText: {
    fontSize: 9,
    fontWeight: "900",
  },

  carePlanLabel: {
    color: "#345A46",
    fontSize: 13,
    fontWeight: "900",
  },

  carePlanValue: {
    color: "#56655D",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },

  todayHeader: {
    marginBottom: 10,
  },

  todayTitle: {
    color: "#1E2C26",
    fontSize: 31,
    lineHeight: 35,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  todaySubtitle: {
    color: "#68736D",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
    marginTop: 1,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
  },

  sectionEyebrow: {
    color: "#7D837F",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.0,
  },

  sectionTitle: {
    color: "#1E2C26",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 2,
    letterSpacing: -0.4,
  },

  sectionHint: {
    color: "#858B87",
    fontSize: 12,
    marginBottom: 3,
  },

  primarySmallButton: {
    minHeight: 46,
    minWidth: 104,
    backgroundColor: "#173D30",
    paddingHorizontal: 15,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  primarySmallButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  overviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5E4DE",
  },

  overviewTopRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },

  metricBlock: {
    flex: 1,
    minHeight: 96,
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  metricDivider: {
    width: 1,
    backgroundColor: "#E8E7E1",
    marginHorizontal: 8,
  },

  metricValue: {
    color: "#33423A",
    fontSize: 32,
    fontWeight: "900",
  },

  metricLabel: {
    color: "#5D6963",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 2,
  },

  metricLink: {
    color: "#2F6A52",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 7,
  },

  overviewRule: {
    height: 1,
    backgroundColor: "#E8E7E1",
    marginVertical: 14,
  },

  careFlowHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 6,
  },

  careFlowSummary: {
    color: "#7A827E",
    fontSize: 11,
    marginTop: 2,
  },

  careFlowProgressTrack: {
    width: 92,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#E7E9E5",
    overflow: "hidden",
    marginBottom: 4,
  },

  careFlowProgressFill: {
    height: "100%",
    backgroundColor: "#1F6D55",
    borderRadius: 999,
  },

  careFlowRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 58,
    paddingVertical: 8,
  },

  careFlowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEEDE8",
  },

  careFlowStatusIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  careFlowStatusIconText: {
    fontSize: 15,
    fontWeight: "900",
  },

  careFlowCopy: {
    flex: 1,
    paddingRight: 8,
  },

  careFlowTitle: {
    color: "#2D3933",
    fontSize: 14,
    fontWeight: "900",
  },

  careFlowDetail: {
    color: "#77807B",
    fontSize: 11,
    marginTop: 2,
  },

  careFlowTimingChip: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  careFlowTimingText: {
    fontSize: 9,
    fontWeight: "900",
  },

  reminderPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEE9FA",
    borderRadius: 17,
    padding: 11,
    marginTop: 11,
  },

  reminderIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  reminderIconText: {
    fontSize: 17,
  },

  reminderCopy: {
    flex: 1,
  },

  reminderEyebrow: {
    color: "#665A8F",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  reminderTitle: {
    color: "#40395A",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 1,
  },

  reminderText: {
    color: "#746D86",
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },

  reminderAction: {
    color: "#665A8F",
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 8,
  },

  overviewSectionLabel: {
    color: "#69736E",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  scheduleRow: {
    flexDirection: "row",
    paddingVertical: 11,
  },

  scheduleDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEEDE8",
  },

  scheduleIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  scheduleIconText: {
    fontSize: 20,
  },

  scheduleCopy: {
    flex: 1,
  },

  scheduleTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  scheduleTitle: {
    color: "#29352F",
    fontSize: 15,
    fontWeight: "900",
    flex: 1,
    paddingRight: 8,
  },

  scheduleChip: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
  },

  scheduleChipText: {
    fontSize: 10,
    fontWeight: "900",
  },

  scheduleDetails: {
    color: "#69736E",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },

  quickCard: {
    width: "31.5%",
    minHeight: 124,
    borderRadius: 22,
    padding: 13,
    justifyContent: "space-between",
  },

  quickCardPressed: {
    opacity: 0.80,
    transform: [{ scale: 0.98 }],
  },

  quickIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  quickIcon: {
    fontSize: 20,
  },

  quickTitle: {
    fontSize: 16,
    fontWeight: "900",
  },

  quickSubtext: {
    color: "#737B76",
    fontSize: 11,
    lineHeight: 15,
  },

  pageTitleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  pageTitle: {
    color: "#1E2C26",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.6,
    marginTop: 2,
  },

  detailPanel: {
    backgroundColor: "#F0EBFA",
    borderRadius: 22,
    padding: 14,
    marginBottom: 16,
  },

  detailPanelEyebrow: {
    color: "#70668D",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: 5,
  },

  calendarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E4E3DC",
    padding: 14,
    marginBottom: 16,
  },

  calendarHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },

  calendarEyebrow: {
    color: "#665A8F",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  calendarTitle: {
    color: "#26362E",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },

  calendarControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  calendarArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F2EE",
  },

  calendarArrowDisabled: { opacity: 0.35 },

  calendarArrowText: {
    color: "#45564D",
    fontSize: 24,
    lineHeight: 26,
    fontWeight: "700",
  },

  calendarArrowTextDisabled: { color: "#A8ADA9" },

  calendarTodayButton: {
    minHeight: 34,
    justifyContent: "center",
    borderRadius: 17,
    paddingHorizontal: 10,
    backgroundColor: "#EEE9FA",
  },

  calendarTodayButtonText: {
    color: "#665A8F",
    fontSize: 10,
    fontWeight: "900",
  },

  calendarWeekRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 2,
    paddingRight: 18,
  },

  calendarDay: {
    width: 60,
    minHeight: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#F7F7F3",
    paddingVertical: 7,
  },

  calendarDaySelected: { backgroundColor: "#173D30" },

  calendarWeekday: {
    color: "#7C8580",
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  calendarWeekdaySelected: { color: "#DDE9E2" },

  calendarDayNumber: {
    color: "#2F3D36",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 2,
  },

  calendarDayNumberSelected: { color: "#FFFFFF" },

  calendarCountBadge: {
    minWidth: 20,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#DDF4E8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    marginTop: 3,
  },

  calendarCountBadgeSelected: { backgroundColor: "#FFFFFF" },

  calendarCountText: {
    color: "#1F6D55",
    fontSize: 9,
    fontWeight: "900",
  },

  calendarCountTextSelected: { color: "#173D30" },

  calendarDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 7,
    backgroundColor: "transparent",
  },

  calendarDotToday: { backgroundColor: "#665A8F" },

  calendarHint: {
    color: "#7A827E",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 10,
  },

  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  activityHeaderTitle: {
    color: "#2A3630",
    fontSize: 18,
    fontWeight: "900",
  },

  activityHeaderCount: {
    color: "#757D78",
    fontSize: 12,
    fontWeight: "800",
  },

  eventCard: {
    flexDirection: "row",
    minHeight: 84,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E7E6E0",
  },

  eventCardDetailed: {
    marginBottom: 0,
    borderWidth: 0,
  },

  eventIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  eventIcon: {
    fontSize: 21,
  },

  eventCopy: {
    flex: 1,
  },

  eventTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  eventType: {
    color: "#2B3731",
    fontSize: 15,
    fontWeight: "900",
  },

  eventTime: {
    color: "#747D78",
    fontSize: 12,
    fontWeight: "800",
  },

  eventDetails: {
    color: "#56615B",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },

  eventCaregiver: {
    color: "#7A827E",
    fontSize: 11,
    marginTop: 5,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E7E6E0",
  },

  emptyTitle: {
    color: "#2B3731",
    fontSize: 17,
    fontWeight: "900",
  },

  emptyBody: {
    color: "#757D79",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginTop: 5,
  },

  logTypeBadge: {
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  logTypeBadgeText: {
    fontSize: 12,
    fontWeight: "900",
  },

  label: {
    color: "#35433C",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 7,
  },

  typeScroller: {
    gap: 8,
    paddingBottom: 2,
    marginBottom: 18,
  },

  typeChip: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DADDD8",
    backgroundColor: "#FAFAF7",
    borderRadius: 16,
    paddingHorizontal: 12,
  },

  typeChipIcon: {
    fontSize: 15,
    marginRight: 6,
  },

  typeChipText: {
    color: "#56615B",
    fontSize: 12,
    fontWeight: "800",
  },

  timeRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F7F7F3",
    borderWidth: 1,
    borderColor: "#DADDD8",
    borderRadius: 17,
    paddingHorizontal: 14,
    marginBottom: 12,
  },

  timeValue: {
    color: "#1F3029",
    fontSize: 18,
    fontWeight: "900",
  },

  timeHelper: {
    color: "#77807B",
    fontSize: 11,
    marginTop: 2,
  },

  adjustButton: {
    minWidth: 78,
    minHeight: 44,
    backgroundColor: "#E4F0E9",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  adjustButtonText: {
    color: "#286249",
    fontSize: 12,
    fontWeight: "900",
  },

  timePickerWrap: {
    backgroundColor: "#0B0B0C",
    borderWidth: 1,
    borderColor: "#2A2B2E",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 15,
    paddingTop: 12,
    paddingBottom: 6,
  },

  timePickerHeader: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },

  timePickerTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  timePickerHint: {
    color: "#B9BDC2",
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },

  timePicker: {
    width: "100%",
    height: 184,
    backgroundColor: "#0B0B0C",
  },

  featureCard: {
    borderRadius: 19,
    padding: 14,
    marginBottom: 14,
  },

  featureEyebrow: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.9,
  },

  featureTitle: {
    color: "#27342E",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 3,
  },

  featureBody: {
    color: "#5F6A64",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },

  twoColumnRow: {
    flexDirection: "row",
    gap: 10,
  },

  halfField: {
    flex: 1,
  },

  input: {
    minHeight: 50,
    backgroundColor: "#F7F7F3",
    borderWidth: 1,
    borderColor: "#DADDD8",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#1F2E27",
    fontSize: 16,
    marginBottom: 15,
  },

  largeInput: {
    minHeight: 92,
  },

  noteInput: {
    minHeight: 140,
  },

  dropdownButton: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F7F7F3",
    borderWidth: 1,
    borderColor: "#DADDD8",
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 8,
  },

  dropdownValue: {
    color: "#27342E",
    fontSize: 16,
    fontWeight: "900",
  },

  dropdownHint: {
    color: "#77807B",
    fontSize: 11,
    marginTop: 2,
  },

  dropdownMenu: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DADDD8",
    borderRadius: 16,
    padding: 6,
    marginBottom: 14,
  },

  dropdownOption: {
    minHeight: 54,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: "center",
  },

  dropdownOptionSelected: {
    backgroundColor: "#EEE9FA",
  },

  dropdownOptionName: {
    color: "#2D3732",
    fontSize: 14,
    fontWeight: "900",
  },

  dropdownOptionDose: {
    color: "#717A75",
    fontSize: 11,
    marginTop: 2,
  },

  segmentRow: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 13,
  },

  segmentButton: {
    flex: 1,
    minHeight: 48,
    backgroundColor: "#F8F8F5",
    borderWidth: 1,
    borderColor: "#DADDD8",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  segmentButtonSelected: {
    backgroundColor: "#EEE9FA",
    borderColor: "#665A8F",
  },

  segmentButtonText: {
    color: "#59645E",
    fontSize: 13,
    fontWeight: "800",
  },

  segmentButtonTextSelected: {
    color: "#665A8F",
  },

  medicationDoseCard: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },

  medicationDoseValue: {
    color: "#453D63",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 2,
  },

  medicationDoseCaption: {
    color: "#6F6880",
    fontSize: 12,
    marginTop: 2,
  },

  choiceWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginBottom: 14,
  },

  choiceChip: {
    minHeight: 44,
    backgroundColor: "#F8F8F5",
    borderWidth: 1,
    borderColor: "#DADDD8",
    borderRadius: 14,
    paddingHorizontal: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  choiceChipText: {
    color: "#59645E",
    fontSize: 12,
    fontWeight: "800",
  },

  saveButton: {
    minHeight: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  conceptBanner: {
    backgroundColor: "#FFF0CF",
    borderRadius: 19,
    padding: 15,
    marginBottom: 13,
  },

  conceptBannerTitle: {
    color: "#6F5621",
    fontSize: 15,
    fontWeight: "900",
  },

  conceptBannerBody: {
    color: "#76653F",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  planTierCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 17,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E6E5DE",
  },

  featuredTierCard: {
    borderWidth: 2,
    borderColor: "#AFCFBF",
  },

  tierHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  tierNameBadge: {
    alignSelf: "flex-start",
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 19,
  },

  tierNameText: {
    fontSize: 13,
    fontWeight: "900",
  },

  recommendedText: {
    color: "#39775B",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
    marginTop: 6,
  },

  priceWrap: {
    alignItems: "flex-end",
  },

  priceText: {
    fontSize: 28,
    fontWeight: "900",
  },

  priceCadence: {
    color: "#7C827E",
    fontSize: 11,
  },

  tierDescription: {
    color: "#58635D",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 11,
  },

  featureListRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 7,
  },

  featureCheck: {
    fontSize: 13,
    fontWeight: "900",
    marginRight: 8,
  },

  featureListText: {
    color: "#56605B",
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },

  clinicalNote: {
    backgroundColor: "#F1EEF7",
    borderRadius: 19,
    padding: 15,
    marginTop: 2,
  },

  clinicalNoteTitle: {
    color: "#5C5376",
    fontSize: 14,
    fontWeight: "900",
  },

  clinicalNoteBody: {
    color: "#6F697A",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },


  roadmapIntroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E6E5DE",
  },

  roadmapIntroTitle: {
    color: "#223029",
    fontSize: 17,
    fontWeight: "900",
  },

  roadmapIntroBody: {
    color: "#5F6963",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },

  roadmapStep: {
    flexDirection: "row",
  },

  roadmapRail: {
    width: 30,
    alignItems: "center",
  },

  roadmapDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 20,
  },

  roadmapLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#D4D5CF",
    marginVertical: 4,
  },

  roadmapCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },

  roadmapPhase: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.9,
  },

  roadmapTitle: {
    color: "#29342F",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 3,
  },

  roadmapBody: {
    color: "#59645E",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },

  roadmapVersionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  roadmapVersion: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  roadmapHighlights: {
    marginTop: 9,
    gap: 6,
  },

  roadmapHighlightRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  roadmapHighlightDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 8,
  },

  roadmapHighlightText: {
    color: "#56615B",
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },

  aiCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6E5DE",
    marginLeft: 30,
  },

  aiEyebrow: {
    color: "#786D98",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.9,
  },

  aiTitle: {
    color: "#4F4767",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 3,
  },

  aiBody: {
    color: "#686273",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },

  bottomNav: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E3E2DC",
    paddingTop: 7,
    paddingBottom: 7,
    paddingHorizontal: 4,
  },

  navItem: {
    flex: 1,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
  },

  logNavItem: {
    marginTop: -13,
  },

  navIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  navIconCircleSelected: {
    backgroundColor: "#E5EFE9",
  },

  logNavIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#173D30",
  },

  navIcon: {
    color: "#66706B",
    fontSize: 19,
    fontWeight: "900",
  },

  navIconSelected: {
    color: "#1F6D55",
  },

  logNavIcon: {
    color: "#FFFFFF",
    fontSize: 28,
  },

  navLabel: {
    color: "#777F7A",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2,
  },

  navLabelSelected: {
    color: "#1F6D55",
  },

  pressedButton: {
    opacity: 0.80,
    transform: [{ scale: 0.98 }],
  },

  pressedSurface: {
    opacity: 0.84,
  },
});
