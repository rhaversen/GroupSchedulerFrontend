export interface ITimeRange {
	start: number
	end: number
}

// Session types
export interface SessionType {
	_id: string // Used for deletion, determining current session and key in list
	docExpires: string // Used to determine when the session document expires (ISO string)
	sessionExpires: string | null // Used to determine when session is expired if stayLoggedIn is true (Uses rolling expiration) (ISO string)
	stayLoggedIn: boolean // Used to determine if session is persistent
	type: 'admin' | 'kiosk' | 'unknown' // Used to infer user information
	userId: UserType['_id'] | null // Used to determine which user this session belongs to
	ipAddress: string // Ip address of the user
	loginTime: string // Time of login (ISO string)
	lastActivity: string // Time of last activity (ISO string)
	userAgent: string // Agent information
}

// Event types
export interface EventType {
	_id: string
	name: string
	description: string

	members: {
		userId: string
		role: 'creator' | 'admin' | 'participant'
		availabilityStatus: 'available' | 'unavailable' | 'tentative' | 'invited'
	}[]

	duration: number
	timeWindow: {
		start: number
		end: number
	}

	/**
	 * Status of the event
	 * - 'scheduling': Event is being scheduled, the system is determining available times
	 * - 'scheduled': Event has been scheduled by the system, awaiting event admin/creator confirmation. Omitted from future schedule optimizations unless it causes a conflict.
	 * - 'confirmed': Event is confirmed and finalized
	 * - 'cancelled': Event has been cancelled
	 * Note: A event with status 'scheduled' may have its 'scheduledTime' updated until its status changes to 'confirmed'.
	 */
	status: 'scheduling' | 'scheduled' | 'confirmed' | 'cancelled'
	scheduledTime?: number

	visibility: 'public' | 'private' | 'draft'

	blackoutPeriods?: ITimeRange[]
	preferredTimes?: ITimeRange[]
	dailyStartConstraints?: ITimeRange[]

	/** Created at timestamp */
	createdAt: string
	/** Updated at timestamp */
	updatedAt: string
}

// User types
export interface UserType {
	/** ID of the user */
	_id: string
	/** Username of the user */
	username: string
	/** Email of the user, null if not the current user */
	email: string | null
	// status: Current lifecycle stage of the event: "scheduling", "scheduled", "confirmed", or "cancelled".
	// Draft state is represented via visibility === 'draft'.
	expirationDate: string | null
	/** If the user has confirmed their email, null if not the current user */
	confirmed: boolean | null
	/** Created at timestamp */
	createdAt: string
	/** Updated at timestamp */
	updatedAt: string
}
