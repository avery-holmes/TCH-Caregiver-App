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
import { styles } from "@/theme/appStyles";

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
  const [moreOpen, setMoreOpen] = useState(false);
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
    setMoreOpen(false);
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

  // Keep frequent caregiving actions prominent; move product information to More.
  const navItems: {
    key: AppTab | "more";
    label: string;
    icon: string;
  }[] = [
    { key: "home", label: "Today", icon: "⌂" },
    { key: "activity", label: "Activity", icon: "☷" },
    { key: "log", label: "Log Care", icon: "＋" },
    { key: "more", label: "More", icon: "⋯" },
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

      {moreOpen && (
        <View style={styles.moreMenu}>
          <Text style={styles.moreMenuHeading}>Explore TCH</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View product roadmap"
            style={styles.moreMenuItem}
            onPress={() => navigateToTab("roadmap")}
          >
            <Text style={styles.moreMenuItemText}>Product roadmap</Text>
            <Text style={styles.moreMenuChevron}>›</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View future plans and subscription concepts"
            style={styles.moreMenuItem}
            onPress={() => navigateToTab("plans")}
          >
            <Text style={styles.moreMenuItemText}>Future plans</Text>
            <Text style={styles.moreMenuChevron}>›</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.bottomNav}>
        {navItems.map((item) => {
          const selected =
            activeTab === item.key ||
            (item.key === "more" &&
              (moreOpen || activeTab === "roadmap" || activeTab === "plans"));
          const isLog = item.key === "log";

          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{
                selected,
                ...(item.key === "more" ? { expanded: moreOpen } : {}),
              }}
              hitSlop={6}
              style={({ pressed }) => [
                styles.navItem,
                isLog && styles.logNavItem,
                pressed && styles.pressedSurface,
              ]}
              onPress={() => {
                if (item.key === "log") {
                  setMoreOpen(false);
                  openLog("Feeding");
                } else if (item.key === "more") {
                  setMoreOpen((current) => !current);
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
