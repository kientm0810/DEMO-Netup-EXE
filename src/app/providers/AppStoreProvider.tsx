import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type {
  AdminConfig,
  Booking,
  BookingDraft,
  Court,
  OwnerAnalytics,
  Player,
  PlayerAssessment,
  PoolPostConfig,
  Session,
} from "../../entities";
import {
  adminConfig as mockAdminConfig,
  bookings as mockBookings,
  courts as mockCourts,
  ownerAnalytics as mockOwnerAnalytics,
  playerAssessments as mockPlayerAssessments,
  players as mockPlayers,
  sessions as mockSessions,
} from "../../mocks";
import { calculatePriceBreakdown, findCourtById, findSessionById } from "../../shared/utils";
import { hasSupabaseConfig, supabase } from "../../shared/lib/supabase";

interface AppState {
  players: Player[];
  courts: Court[];
  sessions: Session[];
  promotedSessionIds: string[];
  poolPostConfigs: Record<string, PoolPostConfig>;
  bookings: Booking[];
  ownerAnalytics: OwnerAnalytics;
  adminConfig: AdminConfig;
  playerAssessments: Record<string, PlayerAssessment>;
}

interface CheckInResult {
  status: "not_found" | "already_checked_in" | "checked_in";
  booking?: Booking;
}

interface AppStoreContextValue {
  state: AppState;
  currentPlayerId: string;
  currentOwnerId: string;
  currentPlayerAssessment?: PlayerAssessment;
  isLoading: boolean;
  syncError: string;
  reloadData: () => Promise<void>;
  createBooking: (draft: BookingDraft) => Promise<Booking | null>;
  createRentalSlot: (draft: { courtId: string; startsAt: string; durationMinutes: number }) => Promise<Session | null>;
  checkInByCode: (bookingCode: string) => Promise<CheckInResult>;
  createPoolPost: (draft: { sessionId: string; totalSlots: number; hostSlots: number }) => Promise<boolean>;
  updateCourtRentalLimit: (courtId: string, maxRentalDurationMinutes: number) => Promise<void>;
  updateAdminConfig: (nextConfig: AdminConfig) => Promise<void>;
  savePlayerAssessment: (assessment: Omit<PlayerAssessment, "updatedAt">) => Promise<void>;
  clearCurrentTestData: () => Promise<boolean>;
  clearAllTransactionalData: () => Promise<boolean>;
}

const CURRENT_PLAYER_ID = "11111111-1111-1111-1111-111111111111";
const CURRENT_OWNER_ID = "22222222-2222-2222-2222-222222222222";
const AppStoreContext = createContext<AppStoreContextValue | undefined>(undefined);

function buildMockState(): AppState {
  const promotedSessionIds = mockSessions
    .filter((session) => session.allowsSoloJoin)
    .slice(0, 3)
    .map((session) => session.id);

  const poolPostConfigs: Record<string, PoolPostConfig> = Object.fromEntries(
    promotedSessionIds.map((sessionId) => [
      sessionId,
      {
        sessionId,
        totalSlots: 4,
        hostSlots: 1,
        createdByPlayerId: CURRENT_PLAYER_ID,
        createdAt: "2026-03-25T08:00:00.000Z",
      },
    ]),
  );

  return {
    players: [...mockPlayers],
    courts: [...mockCourts],
    sessions: [...mockSessions],
    promotedSessionIds,
    poolPostConfigs,
    bookings: [...mockBookings],
    ownerAnalytics: mockOwnerAnalytics,
    adminConfig: mockAdminConfig,
    playerAssessments: { ...mockPlayerAssessments },
  };
}

function buildEmptyState(): AppState {
  return {
    players: [],
    courts: [],
    sessions: [],
    promotedSessionIds: [],
    poolPostConfigs: {},
    bookings: [],
    ownerAnalytics: {
      ownerId: CURRENT_OWNER_ID,
      revenue: { todayVnd: 0, weeklyVnd: 0, monthlyVnd: 0, pendingPayoutVnd: 0 },
      occupancy: { todayPercent: 0, weeklyPercent: 0, peakHours: "17:00 - 21:00" },
      trend: [
        { label: "Mon", revenueVnd: 0, occupancyPercent: 0 },
        { label: "Tue", revenueVnd: 0, occupancyPercent: 0 },
        { label: "Wed", revenueVnd: 0, occupancyPercent: 0 },
        { label: "Thu", revenueVnd: 0, occupancyPercent: 0 },
        { label: "Fri", revenueVnd: 0, occupancyPercent: 0 },
        { label: "Sat", revenueVnd: 0, occupancyPercent: 0 },
        { label: "Sun", revenueVnd: 0, occupancyPercent: 0 },
      ],
    },
    adminConfig: mockAdminConfig,
    playerAssessments: {},
  };
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
}

function mapSessionRow(row: any): Session {
  return {
    id: row.id,
    courtId: row.court_id,
    title: row.title,
    startsAt: row.starts_at,
    durationMinutes: row.duration_minutes,
    openSlots: row.open_slots,
    maxSlots: row.max_slots,
    requiredSkillMin: row.required_skill_min,
    requiredSkillMax: row.required_skill_max,
    slotPriceVnd: row.slot_price_vnd,
    fullCourtPriceVnd: row.full_court_price_vnd,
    isPeakHour: row.is_peak_hour,
    allowsSoloJoin: row.allows_solo_join,
  };
}

function mapBookingRow(row: any): Booking {
  return {
    id: row.id,
    bookingCode: row.booking_code,
    sessionId: row.session_id,
    courtId: row.court_id,
    playerId: row.player_id,
    mode: row.mode,
    seatsBooked: row.seats_booked,
    status: row.status,
    createdAt: row.created_at,
    basePriceVnd: row.base_price_vnd,
    floorFeeVnd: row.floor_fee_vnd,
    platformFeeVnd: row.platform_fee_vnd,
    totalPriceVnd: row.total_price_vnd,
    qrPayload: row.qr_payload,
  };
}

function mapAssessmentRow(row: any): PlayerAssessment {
  return {
    playerId: row.player_id,
    preferredSport: row.preferred_sport,
    preferredDistrict: row.preferred_district,
    budgetPerSessionVnd: row.budget_per_session_vnd,
    sessionsPerWeek: row.sessions_per_week,
    experienceYears: row.experience_years,
    staminaScore: row.stamina_score,
    techniqueScore: row.technique_score,
    tacticalScore: row.tactical_score,
    calculatedLevel: row.calculated_level,
    updatedAt: row.updated_at,
  };
}

function getSeatUsage(booking: Booking, sessionMap: Map<string, Session>): number {
  if (booking.mode === "full_court") {
    return sessionMap.get(booking.sessionId)?.maxSlots ?? booking.seatsBooked;
  }
  return booking.seatsBooked;
}

function buildOwnerAnalytics(ownerId: string, courts: Court[], sessions: Session[], bookings: Booking[]): OwnerAnalytics {
  const ownerCourtIds = new Set(courts.filter((court) => court.ownerId === ownerId).map((court) => court.id));
  const ownerSessions = sessions.filter((session) => ownerCourtIds.has(session.courtId));
  const ownerBookings = bookings.filter((booking) => ownerCourtIds.has(booking.courtId) && booking.status !== "cancelled");
  const sessionMap = new Map(ownerSessions.map((session) => [session.id, session]));

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 6);
  const startOfMonth = new Date(startOfToday);
  startOfMonth.setDate(startOfMonth.getDate() - 29);

  const todayRevenue = ownerBookings
    .filter((booking) => new Date(booking.createdAt) >= startOfToday)
    .reduce((sum, booking) => sum + booking.totalPriceVnd, 0);
  const weekRevenue = ownerBookings
    .filter((booking) => new Date(booking.createdAt) >= startOfWeek)
    .reduce((sum, booking) => sum + booking.totalPriceVnd, 0);
  const monthRevenue = ownerBookings
    .filter((booking) => new Date(booking.createdAt) >= startOfMonth)
    .reduce((sum, booking) => sum + booking.totalPriceVnd, 0);

  const totalSlots = ownerSessions.reduce((sum, session) => sum + session.maxSlots, 0);
  const usedSlots = ownerBookings.reduce((sum, booking) => sum + getSeatUsage(booking, sessionMap), 0);
  const occupancy = totalSlots > 0 ? Math.min(100, Math.round((usedSlots / totalSlots) * 100)) : 0;

  return {
    ownerId,
    revenue: {
      todayVnd: todayRevenue,
      weeklyVnd: weekRevenue,
      monthlyVnd: monthRevenue,
      pendingPayoutVnd: Math.round(weekRevenue * 0.9),
    },
    occupancy: {
      todayPercent: occupancy,
      weeklyPercent: occupancy,
      peakHours: ownerSessions.some((session) => session.isPeakHour) ? "17:00 - 21:00" : "Theo slot",
    },
    trend: mockOwnerAnalytics.trend.map((item) => ({ ...item })),
  };
}

function generateBookingCode(): string {
  const timestampPart = Date.now().toString().slice(-8);
  const randomPart = Math.floor(Math.random() * 90 + 10);
  return `DEMO${timestampPart}${randomPart}`;
}

async function loadStateFromSupabase(): Promise<AppState> {
  if (!supabase) {
    return buildMockState();
  }

  const [profiles, complexes, courts, sessions, poolPosts, bookings, adminConfig, assessments] = await Promise.all([
    supabase.from("profiles").select("id, role, full_name, city, district, age, favorite_sports, skill_level, joined_at"),
    supabase.from("court_complexes").select("id, name, district, address, latitude, longitude"),
    supabase
      .from("courts")
      .select("id, complex_id, owner_id, name, sub_court_name, sport, rating, is_pickup_enabled, status, amenities, base_price_vnd, max_rental_duration_minutes"),
    supabase.from("sessions").select("id, court_id, title, starts_at, duration_minutes, open_slots, max_slots, required_skill_min, required_skill_max, slot_price_vnd, full_court_price_vnd, is_peak_hour, allows_solo_join"),
    supabase.from("pool_posts").select("session_id, total_slots, host_slots, created_by_player_id, created_at, status"),
    supabase.from("bookings").select("id, booking_code, session_id, court_id, player_id, mode, seats_booked, status, created_at, base_price_vnd, floor_fee_vnd, platform_fee_vnd, total_price_vnd, qr_payload"),
    supabase.from("admin_configs").select("platform_fee_rate, floor_fee_vnd, matching_radius_km, no_show_strike_limit, auto_release_minutes, support_hotline_enabled, deposit_percent").eq("id", 1).maybeSingle(),
    supabase.from("player_assessments").select("player_id, preferred_sport, preferred_district, budget_per_session_vnd, sessions_per_week, experience_years, stamina_score, technique_score, tactical_score, calculated_level, updated_at"),
  ]);

  if (profiles.error) throw new Error(`profiles: ${profiles.error.message}`);
  if (complexes.error) throw new Error(`court_complexes: ${complexes.error.message}`);
  if (courts.error) throw new Error(`courts: ${courts.error.message}`);
  if (sessions.error) throw new Error(`sessions: ${sessions.error.message}`);
  if (poolPosts.error) throw new Error(`pool_posts: ${poolPosts.error.message}`);
  if (bookings.error) throw new Error(`bookings: ${bookings.error.message}`);
  if (adminConfig.error) throw new Error(`admin_configs: ${adminConfig.error.message}`);
  if (assessments.error) throw new Error(`player_assessments: ${assessments.error.message}`);

  const profileRows = profiles.data ?? [];
  const complexRows = complexes.data ?? [];
  const courtRows = courts.data ?? [];
  const sessionRows = sessions.data ?? [];
  const poolRows = poolPosts.data ?? [];
  const bookingRows = bookings.data ?? [];
  const assessmentRows = assessments.data ?? [];
  const adminRow = adminConfig.data;

  const complexById = new Map(complexRows.map((row: any) => [row.id, row]));

  const mappedPlayers: Player[] = profileRows
    .filter((row: any) => row.role === "player")
    .map((row: any) => ({
      id: row.id,
      fullName: row.full_name,
      age: row.age ?? 18,
      city: row.city ?? "Ha Noi",
      district: row.district ?? "Thach That",
      favoriteSports: row.favorite_sports ?? [],
      skillLevel: row.skill_level ?? "Beginner",
      joinedAt: row.joined_at ?? new Date().toISOString(),
    }));

  const mappedCourts: Court[] = courtRows.map((row: any) => {
    const complex = complexById.get(row.complex_id);
    return {
      id: row.id,
      ownerId: row.owner_id,
      name: row.name,
      complexName: complex?.name ?? "Khu san",
      subCourtName: row.sub_court_name,
      sport: row.sport,
      district: complex?.district ?? "Thach That",
      address: complex?.address ?? "Hoa Lac",
      rating: Number(row.rating ?? 0),
      isPickupEnabled: row.is_pickup_enabled,
      status: row.status,
      amenities: row.amenities ?? [],
      basePriceVnd: row.base_price_vnd,
      maxRentalDurationMinutes: row.max_rental_duration_minutes,
      latitude: complex?.latitude ?? 21.02,
      longitude: complex?.longitude ?? 105.53,
    };
  });

  const mappedSessions: Session[] = sessionRows.map((row: any) => mapSessionRow(row));
  const mappedBookings: Booking[] = bookingRows.map((row: any) => mapBookingRow(row));
  const activePoolRows = poolRows.filter((row: any) => row.status === "open");
  const promotedSessionIds = activePoolRows.map((row: any) => row.session_id);
  const poolPostConfigs: Record<string, PoolPostConfig> = Object.fromEntries(
    activePoolRows.map((row: any) => [
      row.session_id,
      {
        sessionId: row.session_id,
        totalSlots: row.total_slots,
        hostSlots: row.host_slots,
        createdByPlayerId: row.created_by_player_id,
        createdAt: row.created_at,
      },
    ]),
  );

  const mappedAssessments: Record<string, PlayerAssessment> = Object.fromEntries(
    assessmentRows.map((row: any) => {
      const item = mapAssessmentRow(row);
      return [item.playerId, item];
    }),
  );

  const mappedAdminConfig: AdminConfig = adminRow
    ? {
        platformFeeRate: adminRow.platform_fee_rate,
        floorFeeVnd: adminRow.floor_fee_vnd,
        matchingRadiusKm: adminRow.matching_radius_km,
        noShowStrikeLimit: adminRow.no_show_strike_limit,
        autoReleaseMinutes: adminRow.auto_release_minutes,
        supportHotlineEnabled: adminRow.support_hotline_enabled,
        depositPercent: adminRow.deposit_percent,
      }
    : mockAdminConfig;

  return {
    players: mappedPlayers,
    courts: mappedCourts,
    sessions: mappedSessions,
    promotedSessionIds,
    poolPostConfigs,
    bookings: mappedBookings,
    ownerAnalytics: buildOwnerAnalytics(CURRENT_OWNER_ID, mappedCourts, mappedSessions, mappedBookings),
    adminConfig: mappedAdminConfig,
    playerAssessments: mappedAssessments,
  };
}

export function AppStoreProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AppState>(() => (hasSupabaseConfig ? buildEmptyState() : buildMockState()));
  const [isLoading, setIsLoading] = useState(hasSupabaseConfig);
  const [syncError, setSyncError] = useState("");

  const reloadDataInternal = useCallback(async (silent: boolean) => {
    if (!hasSupabaseConfig || !supabase) {
      setState(buildMockState());
      setSyncError(
        "Thieu env Supabase tren frontend. Can VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (hoac NEXT_PUBLIC_*), sau do redeploy.",
      );
      setIsLoading(false);
      return;
    }
    if (!silent) setIsLoading(true);
    try {
      const nextState = await loadStateFromSupabase();
      setState(nextState);
      setSyncError("");
    } catch (error) {
      setSyncError(`Dong bo Supabase that bai: ${toErrorMessage(error)}`);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadDataInternal(false);
  }, [reloadDataInternal]);

  const reloadData = useCallback(async () => {
    await reloadDataInternal(false);
  }, [reloadDataInternal]);

  const reconcileOpenSlots = useCallback(async () => {
    if (!supabase) return;

    const [sessionsResult, bookingsResult] = await Promise.all([
      supabase.from("sessions").select("id, max_slots, open_slots"),
      supabase.from("bookings").select("session_id, mode, seats_booked, status"),
    ]);

    if (sessionsResult.error || bookingsResult.error) {
      return;
    }

    const sessionRows = sessionsResult.data ?? [];
    const bookingRows = bookingsResult.data ?? [];
    const maxSlotsBySessionId = new Map(sessionRows.map((row: any) => [row.id, row.max_slots]));
    const usedBySessionId = new Map<string, number>();

    for (const booking of bookingRows as any[]) {
      if (booking.status === "cancelled") {
        continue;
      }
      const maxSlots = maxSlotsBySessionId.get(booking.session_id);
      if (!maxSlots) {
        continue;
      }
      const used = booking.mode === "full_court" ? maxSlots : booking.seats_booked;
      usedBySessionId.set(booking.session_id, (usedBySessionId.get(booking.session_id) ?? 0) + used);
    }

    for (const session of sessionRows as any[]) {
      const used = usedBySessionId.get(session.id) ?? 0;
      const nextOpenSlots = Math.max(0, session.max_slots - used);
      if (nextOpenSlots !== session.open_slots) {
        await supabase.from("sessions").update({ open_slots: nextOpenSlots }).eq("id", session.id);
      }
    }
  }, []);

  const createBooking = useCallback(
    async (draft: BookingDraft) => {
      if (!supabase) return null;
      const session = findSessionById(state.sessions, draft.sessionId);
      if (!session) return null;
      const court = findCourtById(state.courts, session.courtId);
      if (!court) return null;

      const effectiveSeats = draft.mode === "solo" ? Math.max(1, Math.min(2, draft.seatsBooked)) : session.maxSlots;
      if (draft.mode === "solo" && effectiveSeats > session.openSlots) return null;
      if (draft.mode === "full_court" && session.openSlots <= 0) return null;

      const pricing = calculatePriceBreakdown({ session, adminConfig: state.adminConfig, mode: draft.mode, seatsBooked: effectiveSeats });
      const bookingCode = generateBookingCode();
      const payload = {
        booking_code: bookingCode,
        session_id: session.id,
        court_id: court.id,
        player_id: draft.playerId,
        mode: draft.mode,
        seats_booked: effectiveSeats,
        status: "confirmed" as const,
        base_price_vnd: pricing.basePriceVnd,
        floor_fee_vnd: pricing.floorFeeVnd,
        platform_fee_vnd: pricing.platformFeeVnd,
        total_price_vnd: pricing.totalPriceVnd,
        qr_payload: `NETUP|${bookingCode}|${session.id}|${pricing.totalPriceVnd}`,
      };

      const { data, error } = await supabase.from("bookings").insert(payload).select("*").single();
      if (error) {
        setSyncError(`Tao booking that bai: ${error.message}`);
        return null;
      }

      const nextOpenSlots = draft.mode === "full_court" ? 0 : Math.max(0, session.openSlots - effectiveSeats);
      await supabase.from("sessions").update({ open_slots: nextOpenSlots }).eq("id", session.id);
      await reloadDataInternal(true);
      return mapBookingRow(data);
    },
    [state.sessions, state.courts, state.adminConfig, reloadDataInternal],
  );

  const createRentalSlot = useCallback(
    async (draft: { courtId: string; startsAt: string; durationMinutes: number }) => {
      if (!supabase) return null;
      const court = findCourtById(state.courts, draft.courtId);
      if (!court) return null;

      const startsAtDate = new Date(draft.startsAt);
      if (Number.isNaN(startsAtDate.getTime())) return null;

      const roundedDuration = Math.round(draft.durationMinutes / 30) * 30;
      const durationMinutes = Math.max(30, Math.min(roundedDuration, Math.max(30, court.maxRentalDurationMinutes)));
      const templateSession = state.sessions.find((session) => session.courtId === court.id);
      const maxSlots = templateSession?.maxSlots ?? 4;
      const fullCourtPriceVnd = templateSession?.fullCourtPriceVnd ?? Math.round(court.basePriceVnd * 2.2);
      const slotPriceVnd = templateSession?.slotPriceVnd ?? Math.round(fullCourtPriceVnd / Math.max(2, maxSlots));
      const hour = startsAtDate.getHours();

      const payload = {
        court_id: court.id,
        title: court.subCourtName,
        post_type: "rental" as const,
        starts_at: startsAtDate.toISOString(),
        duration_minutes: durationMinutes,
        open_slots: maxSlots,
        max_slots: maxSlots,
        required_skill_min: templateSession?.requiredSkillMin ?? "Beginner",
        required_skill_max: templateSession?.requiredSkillMax ?? "Advanced",
        slot_price_vnd: slotPriceVnd,
        full_court_price_vnd: fullCourtPriceVnd,
        is_peak_hour: hour >= 17 && hour <= 21,
        allows_solo_join: false,
        created_by: CURRENT_PLAYER_ID,
      };

      const { data, error } = await supabase.from("sessions").insert(payload).select("*").single();
      if (error) {
        setSyncError(`Tao slot thue that bai: ${error.message}`);
        return null;
      }
      await reloadDataInternal(true);
      return mapSessionRow(data);
    },
    [state.courts, state.sessions, reloadDataInternal],
  );

  const checkInByCode = useCallback(
    async (bookingCode: string): Promise<CheckInResult> => {
      if (!supabase) return { status: "not_found" };
      const normalized = bookingCode.trim().toUpperCase();
      const booking = state.bookings.find((item) => item.bookingCode.toUpperCase() === normalized);
      if (!booking) return { status: "not_found" };
      if (booking.status === "checked_in") return { status: "already_checked_in", booking };

      const { error } = await supabase.from("bookings").update({ status: "checked_in" }).eq("id", booking.id);
      if (error) {
        setSyncError(`Check-in that bai: ${error.message}`);
        return { status: "not_found" };
      }

      await reloadDataInternal(true);
      return { status: "checked_in", booking: { ...booking, status: "checked_in" } };
    },
    [state.bookings, reloadDataInternal],
  );

  const createPoolPost = useCallback(
    async (draft: { sessionId: string; totalSlots: number; hostSlots: number }) => {
      if (!supabase) return false;
      const session = state.sessions.find((item) => item.id === draft.sessionId);
      if (!session) return false;
      const totalSlots = Math.max(2, Math.min(draft.totalSlots, session.maxSlots));
      const hostSlots = Math.max(1, Math.min(draft.hostSlots, totalSlots));

      const payload = {
        session_id: session.id,
        total_slots: totalSlots,
        host_slots: hostSlots,
        created_by_player_id: CURRENT_PLAYER_ID,
        status: "open" as const,
      };
      const { error } = await supabase.from("pool_posts").upsert(payload, { onConflict: "session_id" });
      if (error) {
        setSyncError(`Tao pool post that bai: ${error.message}`);
        return false;
      }
      await supabase.from("sessions").update({ post_type: "pool", allows_solo_join: true }).eq("id", session.id);
      await reloadDataInternal(true);
      return true;
    },
    [state.sessions, reloadDataInternal],
  );

  const updateCourtRentalLimit = useCallback(
    async (courtId: string, maxRentalDurationMinutes: number) => {
      if (!supabase) return;
      const safeLimit = Math.max(30, Math.min(300, Math.round(maxRentalDurationMinutes / 30) * 30));
      const { error } = await supabase.from("courts").update({ max_rental_duration_minutes: safeLimit }).eq("id", courtId);
      if (error) setSyncError(`Cap nhat gioi han thue that bai: ${error.message}`);
      await reloadDataInternal(true);
    },
    [reloadDataInternal],
  );

  const updateAdminConfig = useCallback(
    async (nextConfig: AdminConfig) => {
      if (!supabase) return;
      const payload = {
        id: 1,
        platform_fee_rate: nextConfig.platformFeeRate,
        floor_fee_vnd: nextConfig.floorFeeVnd,
        matching_radius_km: nextConfig.matchingRadiusKm,
        no_show_strike_limit: nextConfig.noShowStrikeLimit,
        auto_release_minutes: nextConfig.autoReleaseMinutes,
        support_hotline_enabled: nextConfig.supportHotlineEnabled,
        deposit_percent: nextConfig.depositPercent,
      };
      const { error } = await supabase.from("admin_configs").upsert(payload, { onConflict: "id" });
      if (error) setSyncError(`Cap nhat config that bai: ${error.message}`);
      await reloadDataInternal(true);
    },
    [reloadDataInternal],
  );

  const savePlayerAssessment = useCallback(
    async (assessment: Omit<PlayerAssessment, "updatedAt">) => {
      if (!supabase) return;
      const payload = {
        player_id: assessment.playerId,
        preferred_sport: assessment.preferredSport,
        preferred_district: assessment.preferredDistrict,
        budget_per_session_vnd: assessment.budgetPerSessionVnd,
        sessions_per_week: assessment.sessionsPerWeek,
        experience_years: assessment.experienceYears,
        stamina_score: assessment.staminaScore,
        technique_score: assessment.techniqueScore,
        tactical_score: assessment.tacticalScore,
        calculated_level: assessment.calculatedLevel,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("player_assessments").upsert(payload, { onConflict: "player_id" });
      if (error) setSyncError(`Luu assessment that bai: ${error.message}`);
      await reloadDataInternal(true);
    },
    [reloadDataInternal],
  );

  const clearCurrentTestData = useCallback(async () => {
    if (!supabase) return false;
    const bookingsDelete = await supabase.from("bookings").delete().eq("player_id", CURRENT_PLAYER_ID);
    if (bookingsDelete.error) {
      setSyncError(`Don du lieu test that bai: ${bookingsDelete.error.message}`);
      return false;
    }

    const poolDelete = await supabase.from("pool_posts").delete().eq("created_by_player_id", CURRENT_PLAYER_ID);
    if (poolDelete.error) {
      setSyncError(`Don du lieu test that bai: ${poolDelete.error.message}`);
      return false;
    }

    const sessionsDelete = await supabase.from("sessions").delete().eq("created_by", CURRENT_PLAYER_ID);
    if (sessionsDelete.error) {
      setSyncError(`Don du lieu test that bai: ${sessionsDelete.error.message}`);
      return false;
    }

    const assessmentsDelete = await supabase
      .from("player_assessments")
      .delete()
      .eq("player_id", CURRENT_PLAYER_ID);
    if (assessmentsDelete.error) {
      setSyncError(`Don du lieu test that bai: ${assessmentsDelete.error.message}`);
      return false;
    }

    await reconcileOpenSlots();
    await reloadDataInternal(true);
    return true;
  }, [reconcileOpenSlots, reloadDataInternal]);

  const clearAllTransactionalData = useCallback(async () => {
    if (!supabase) return false;

    const bookingsDelete = await supabase.from("bookings").delete().not("id", "is", null);
    if (bookingsDelete.error) {
      setSyncError(`Xoa toan bo booking that bai: ${bookingsDelete.error.message}`);
      return false;
    }

    const poolDelete = await supabase.from("pool_posts").delete().not("id", "is", null);
    if (poolDelete.error) {
      setSyncError(`Xoa toan bo pool post that bai: ${poolDelete.error.message}`);
      return false;
    }

    const sessionsDelete = await supabase.from("sessions").delete().not("created_by", "is", null);
    if (sessionsDelete.error) {
      setSyncError(`Xoa slot runtime that bai: ${sessionsDelete.error.message}`);
      return false;
    }

    const assessmentsDelete = await supabase.from("player_assessments").delete().not("player_id", "is", null);
    if (assessmentsDelete.error) {
      setSyncError(`Xoa assessment that bai: ${assessmentsDelete.error.message}`);
      return false;
    }

    await reconcileOpenSlots();
    await reloadDataInternal(true);
    return true;
  }, [reconcileOpenSlots, reloadDataInternal]);

  const value = useMemo<AppStoreContextValue>(
    () => ({
      state,
      currentPlayerId: CURRENT_PLAYER_ID,
      currentOwnerId: CURRENT_OWNER_ID,
      currentPlayerAssessment: state.playerAssessments[CURRENT_PLAYER_ID],
      isLoading,
      syncError,
      reloadData,
      createBooking,
      createRentalSlot,
      checkInByCode,
      createPoolPost,
      updateCourtRentalLimit,
      updateAdminConfig,
      savePlayerAssessment,
      clearCurrentTestData,
      clearAllTransactionalData,
    }),
    [
      state,
      isLoading,
      syncError,
      reloadData,
      createBooking,
      createRentalSlot,
      checkInByCode,
      createPoolPost,
      updateCourtRentalLimit,
      updateAdminConfig,
      savePlayerAssessment,
      clearCurrentTestData,
      clearAllTransactionalData,
    ],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreContextValue {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error("useAppStore must be used inside AppStoreProvider");
  }
  return context;
}
