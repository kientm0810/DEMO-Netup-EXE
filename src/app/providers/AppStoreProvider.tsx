import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type PropsWithChildren,
} from "react";
import type { AdminConfig, Booking, BookingDraft, PlayerAssessment } from "../../entities";
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
  bookings: Booking[];
  ownerAnalytics: typeof ownerAnalytics;
  adminConfig: AdminConfig;
  playerAssessments: Record<string, PlayerAssessment>;
}

type AppAction =
  | { type: "CREATE_BOOKING"; payload: Booking }
  | { type: "CHECK_IN_BOOKING"; payload: { bookingId: string } }
  | { type: "UPDATE_ADMIN_CONFIG"; payload: AdminConfig }
  | { type: "SAVE_PLAYER_ASSESSMENT"; payload: PlayerAssessment };

const initialState: AppState = {
  players,
  courts,
  sessions,
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
  checkInByCode: (bookingCode: string) => CheckInResult;
  updateAdminConfig: (nextConfig: AdminConfig) => void;
  savePlayerAssessment: (assessment: Omit<PlayerAssessment, "updatedAt">) => void;
}

const CURRENT_PLAYER_ID = "player-001";
const CURRENT_OWNER_ID = "owner-001";

const AppStoreContext = createContext<AppStoreContextValue | undefined>(undefined);

function generateBookingId(sequence: number): string {
  return `booking-${sequence.toString().padStart(4, "0")}`;
}

function generateBookingCode(sequence: number): string {
  return `NTP${(2400 + sequence).toString()}`;
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

  const updateAdminConfig = useCallback((nextConfig: AdminConfig) => {
    dispatch({ type: "UPDATE_ADMIN_CONFIG", payload: nextConfig });
  }, []);

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
      checkInByCode,
      updateAdminConfig,
      savePlayerAssessment,
    }),
    [state, createBooking, checkInByCode, updateAdminConfig, savePlayerAssessment],
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
