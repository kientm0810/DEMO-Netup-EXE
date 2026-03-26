import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type PropsWithChildren,
} from "react";
import type {
  AdminConfig,
  Booking,
  BookingDraft,
  PlayerAssessment,
  PoolPostConfig,
  Session,
} from "../../entities";
import {
  adminConfig,
  bookings,
  courts,
  ownerAnalytics,
  playerAssessments,
  players,
  sessions,
} from "../../mocks";
import { calculatePriceBreakdown, findBookingByCode, findCourtById, findSessionById } from "../../shared/utils";

interface AppState {
  players: typeof players;
  courts: typeof courts;
  sessions: typeof sessions;
  promotedSessionIds: string[];
  poolPostConfigs: Record<string, PoolPostConfig>;
  bookings: Booking[];
  ownerAnalytics: typeof ownerAnalytics;
  adminConfig: AdminConfig;
  playerAssessments: Record<string, PlayerAssessment>;
}

type AppAction =
  | { type: "CREATE_BOOKING"; payload: Booking }
  | { type: "CHECK_IN_BOOKING"; payload: { bookingId: string } }
  | { type: "CREATE_POOL_POST"; payload: PoolPostConfig }
  | { type: "CREATE_RENTAL_SLOT"; payload: Session }
  | { type: "UPDATE_COURT_RENTAL_LIMIT"; payload: { courtId: string; maxRentalDurationMinutes: number } }
  | { type: "UPDATE_ADMIN_CONFIG"; payload: AdminConfig }
  | { type: "SAVE_PLAYER_ASSESSMENT"; payload: PlayerAssessment };

const CURRENT_PLAYER_ID = "player-001";
const CURRENT_OWNER_ID = "owner-001";

const initialPromotedSessionIds = sessions
  .filter((session) => session.allowsSoloJoin)
  .slice(0, 3)
  .map((session) => session.id);

const initialPoolPostConfigs: Record<string, PoolPostConfig> = Object.fromEntries(
  initialPromotedSessionIds.map((sessionId) => {
    const session = sessions.find((item) => item.id === sessionId);
    const safeTotalSlots = session ? Math.max(2, Math.min(session.maxSlots, session.maxSlots)) : 4;
    return [
      sessionId,
      {
        sessionId,
        totalSlots: safeTotalSlots,
        hostSlots: Math.min(1, safeTotalSlots),
        createdByPlayerId: CURRENT_PLAYER_ID,
        createdAt: "2026-03-25T08:00:00.000Z",
      },
    ];
  }),
);

const initialState: AppState = {
  players,
  courts,
  sessions,
  promotedSessionIds: initialPromotedSessionIds,
  poolPostConfigs: initialPoolPostConfigs,
  bookings,
  ownerAnalytics,
  adminConfig,
  playerAssessments,
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "CREATE_BOOKING":
      return {
        ...state,
        bookings: [action.payload, ...state.bookings],
      };
    case "CHECK_IN_BOOKING":
      return {
        ...state,
        bookings: state.bookings.map((booking) =>
          booking.id === action.payload.bookingId ? { ...booking, status: "checked_in" } : booking,
        ),
      };
    case "CREATE_POOL_POST":
      return {
        ...state,
        promotedSessionIds: state.promotedSessionIds.includes(action.payload.sessionId)
          ? state.promotedSessionIds
          : [action.payload.sessionId, ...state.promotedSessionIds],
        poolPostConfigs: {
          ...state.poolPostConfigs,
          [action.payload.sessionId]: action.payload,
        },
      };
    case "CREATE_RENTAL_SLOT":
      return {
        ...state,
        sessions: [...state.sessions, action.payload],
      };
    case "UPDATE_COURT_RENTAL_LIMIT":
      return {
        ...state,
        courts: state.courts.map((court) =>
          court.id === action.payload.courtId
            ? { ...court, maxRentalDurationMinutes: action.payload.maxRentalDurationMinutes }
            : court,
        ),
      };
    case "UPDATE_ADMIN_CONFIG":
      return {
        ...state,
        adminConfig: action.payload,
      };
    case "SAVE_PLAYER_ASSESSMENT":
      return {
        ...state,
        playerAssessments: {
          ...state.playerAssessments,
          [action.payload.playerId]: action.payload,
        },
      };
    default:
      return state;
  }
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
  createBooking: (draft: BookingDraft) => Booking | null;
  createRentalSlot: (draft: { courtId: string; startsAt: string; durationMinutes: number }) => Session | null;
  checkInByCode: (bookingCode: string) => CheckInResult;
  createPoolPost: (draft: { sessionId: string; totalSlots: number; hostSlots: number }) => boolean;
  updateCourtRentalLimit: (courtId: string, maxRentalDurationMinutes: number) => void;
  updateAdminConfig: (nextConfig: AdminConfig) => void;
  savePlayerAssessment: (assessment: Omit<PlayerAssessment, "updatedAt">) => void;
}

const AppStoreContext = createContext<AppStoreContextValue | undefined>(undefined);

function generateBookingId(sequence: number): string {
  return `booking-${sequence.toString().padStart(4, "0")}`;
}

function generateBookingCode(sequence: number): string {
  return `NTP${(2400 + sequence).toString()}`;
}

function generateSessionId(existingSessions: Session[]): string {
  const maxSequence = existingSessions.reduce((max, session) => {
    const matched = session.id.match(/^session-(\d+)$/);
    if (!matched) {
      return max;
    }
    const value = Number(matched[1]);
    return Number.isNaN(value) ? max : Math.max(max, value);
  }, 0);
  return `session-${(maxSequence + 1).toString().padStart(3, "0")}`;
}

export function AppStoreProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const createBooking = useCallback(
    (draft: BookingDraft): Booking | null => {
      const session = findSessionById(state.sessions, draft.sessionId);
      if (!session) {
        return null;
      }

      const court = findCourtById(state.courts, session.courtId);
      if (!court) {
        return null;
      }

      const sequence = state.bookings.length + 1;
      const pricing = calculatePriceBreakdown({
        session,
        adminConfig: state.adminConfig,
        mode: draft.mode,
        seatsBooked: draft.seatsBooked,
      });

      const booking: Booking = {
        id: generateBookingId(sequence),
        bookingCode: generateBookingCode(sequence),
        sessionId: session.id,
        courtId: court.id,
        playerId: draft.playerId,
        mode: draft.mode,
        seatsBooked: draft.mode === "solo" ? Math.max(1, Math.min(2, draft.seatsBooked)) : session.maxSlots,
        status: "confirmed",
        createdAt: new Date().toISOString(),
        basePriceVnd: pricing.basePriceVnd,
        floorFeeVnd: pricing.floorFeeVnd,
        platformFeeVnd: pricing.platformFeeVnd,
        totalPriceVnd: pricing.totalPriceVnd,
        qrPayload: `NETUP|${generateBookingCode(sequence)}|${session.id}|${pricing.totalPriceVnd}`,
      };

      dispatch({ type: "CREATE_BOOKING", payload: booking });
      return booking;
    },
    [state.adminConfig, state.bookings.length, state.courts, state.sessions],
  );

  const checkInByCode = useCallback(
    (bookingCode: string): CheckInResult => {
      const foundBooking = findBookingByCode(state.bookings, bookingCode);
      if (!foundBooking) {
        return { status: "not_found" };
      }

      if (foundBooking.status === "checked_in") {
        return { status: "already_checked_in", booking: foundBooking };
      }

      dispatch({ type: "CHECK_IN_BOOKING", payload: { bookingId: foundBooking.id } });
      return {
        status: "checked_in",
        booking: { ...foundBooking, status: "checked_in" },
      };
    },
    [state.bookings],
  );

  const createRentalSlot = useCallback(
    (draft: { courtId: string; startsAt: string; durationMinutes: number }) => {
      const court = findCourtById(state.courts, draft.courtId);
      if (!court) {
        return null;
      }

      const startsAtDate = new Date(draft.startsAt);
      if (Number.isNaN(startsAtDate.getTime())) {
        return null;
      }

      const roundedDuration = Math.round(draft.durationMinutes / 30) * 30;
      const durationMinutes = Math.max(
        30,
        Math.min(roundedDuration, Math.max(30, court.maxRentalDurationMinutes)),
      );
      const endsAtDate = new Date(startsAtDate.getTime() + durationMinutes * 60_000);

      const hasOverlap = state.sessions
        .filter((session) => session.courtId === court.id)
        .some((session) => {
          const existingStart = new Date(session.startsAt);
          const existingEnd = new Date(existingStart.getTime() + session.durationMinutes * 60_000);
          return startsAtDate < existingEnd && endsAtDate > existingStart;
        });

      if (hasOverlap) {
        return null;
      }

      const templateSession = state.sessions.find((session) => session.courtId === court.id);
      const maxSlots = templateSession?.maxSlots ?? 4;
      const fullCourtPriceVnd = templateSession?.fullCourtPriceVnd ?? Math.round(court.basePriceVnd * 2.2);
      const slotPriceVnd = templateSession?.slotPriceVnd ?? Math.round(fullCourtPriceVnd / Math.max(2, maxSlots));
      const hour = startsAtDate.getHours();

      const rentalSession: Session = {
        id: generateSessionId(state.sessions),
        courtId: court.id,
        title: court.subCourtName,
        startsAt: startsAtDate.toISOString(),
        durationMinutes,
        openSlots: maxSlots,
        maxSlots,
        requiredSkillMin: templateSession?.requiredSkillMin ?? "Beginner",
        requiredSkillMax: templateSession?.requiredSkillMax ?? "Advanced",
        slotPriceVnd,
        fullCourtPriceVnd,
        isPeakHour: hour >= 17 && hour <= 21,
        allowsSoloJoin: false,
      };

      dispatch({ type: "CREATE_RENTAL_SLOT", payload: rentalSession });
      return rentalSession;
    },
    [state.courts, state.sessions],
  );

  const updateAdminConfig = useCallback((nextConfig: AdminConfig) => {
    dispatch({ type: "UPDATE_ADMIN_CONFIG", payload: nextConfig });
  }, []);

  const updateCourtRentalLimit = useCallback((courtId: string, maxRentalDurationMinutes: number) => {
    const safeLimit = Math.max(30, Math.min(300, Math.round(maxRentalDurationMinutes / 30) * 30));
    dispatch({
      type: "UPDATE_COURT_RENTAL_LIMIT",
      payload: { courtId, maxRentalDurationMinutes: safeLimit },
    });
  }, []);

  const createPoolPost = useCallback(
    (draft: { sessionId: string; totalSlots: number; hostSlots: number }) => {
      const session = state.sessions.find((item) => item.id === draft.sessionId);
      if (!session) {
        return false;
      }

      const totalSlots = Math.max(2, Math.min(draft.totalSlots, session.maxSlots));
      const hostSlots = Math.max(1, Math.min(draft.hostSlots, totalSlots));

      dispatch({
        type: "CREATE_POOL_POST",
        payload: {
          sessionId: session.id,
          totalSlots,
          hostSlots,
          createdByPlayerId: CURRENT_PLAYER_ID,
          createdAt: new Date().toISOString(),
        },
      });
      return true;
    },
    [state.sessions],
  );

  const savePlayerAssessment = useCallback((assessment: Omit<PlayerAssessment, "updatedAt">) => {
    dispatch({
      type: "SAVE_PLAYER_ASSESSMENT",
      payload: {
        ...assessment,
        updatedAt: new Date().toISOString(),
      },
    });
  }, []);

  const value = useMemo<AppStoreContextValue>(
    () => ({
      state,
      currentPlayerId: CURRENT_PLAYER_ID,
      currentOwnerId: CURRENT_OWNER_ID,
      currentPlayerAssessment: state.playerAssessments[CURRENT_PLAYER_ID],
      createBooking,
      createRentalSlot,
      checkInByCode,
      createPoolPost,
      updateCourtRentalLimit,
      updateAdminConfig,
      savePlayerAssessment,
    }),
    [
      state,
      createBooking,
      createRentalSlot,
      checkInByCode,
      createPoolPost,
      updateCourtRentalLimit,
      updateAdminConfig,
      savePlayerAssessment,
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
