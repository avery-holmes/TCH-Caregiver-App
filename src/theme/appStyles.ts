import { StyleSheet } from "react-native";

/** Shared MVP styles. Feature-specific styles will be colocated during subsequent refactors. */
export const styles = StyleSheet.create({
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
    fontSize: 12,
    lineHeight: 16,
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
    fontSize: 12,
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
    fontSize: 12,
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
    fontSize: 12,
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
    fontSize: 12,
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
    fontSize: 11,
    fontWeight: "900",
    marginRight: 7,
  },

  dailyEssentialText: {
    color: "#5B6761",
    fontSize: 13,
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
    fontSize: 12,
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
    fontSize: 12,
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
    fontSize: 13,
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
    fontSize: 13,
    lineHeight: 19,
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
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },

  expandedFlowStatus: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  expandedFlowStatusText: {
    fontSize: 12,
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
    fontSize: 12,
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
    fontSize: 13,
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
    fontSize: 13,
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
    fontSize: 13,
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
    minHeight: 66,
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
    fontSize: 15,
    fontWeight: "900",
  },

  careFlowDetail: {
    color: "#77807B",
    fontSize: 13,
    marginTop: 2,
  },

  careFlowTimingChip: {
    borderRadius: 999,
    minHeight: 32,
    paddingHorizontal: 9,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 1,
  },

  careFlowTimingText: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
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
    fontSize: 12,
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
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },

  reminderAction: {
    color: "#665A8F",
    fontSize: 12,
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

  moreMenu: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E3E2DC",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 5,
  },

  moreMenuHeading: {
    color: "#365B47",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 4,
  },

  moreMenuItem: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F5F7F3",
    borderRadius: 12,
    paddingHorizontal: 16,
  },

  moreMenuItemText: {
    color: "#234638",
    fontSize: 15,
    fontWeight: "800",
  },

  moreMenuChevron: {
    color: "#365B47",
    fontSize: 22,
  },

  bottomNav: {
    minHeight: 78,
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
    minHeight: 60,
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
    fontSize: 12,
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
