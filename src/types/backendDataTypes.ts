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

	/** Name of the event */
	name: string
	/** Description of the event */
	description?: string

	members: {
		userId: string
		role: 'creator' | 'admin' | 'participant'
		availabilityStatus: 'available' | 'unavailable' | 'invited'
	}[]

	schedulingMethod: 'fixed' | 'flexible'

	/** Amount of days the event lasts */
	duration: number
	/** Possible times when the event can be scheduled */
	timeWindow?: ITimeRange

	/** Lifecycle status of the event
	 * - 'scheduling': Event is being scheduled. It may or may not have a tentative scheduled time.
	 * - 'confirmed': Event has been confirmed with a scheduled time.
	 * - 'cancelled': Event has been cancelled and will not occur.
	*/
	status: 'scheduling' | 'confirmed' | 'cancelled'
	/** The current scheduled time for the event, if any */
	scheduledTime?: number

	/** Visibility of the event */
	visibility: 'draft' | 'public' | 'private'

	/** Blackout periods where the event cannot be scheduled */
	blackoutPeriods?: ITimeRange[]
	/** Preferred times for the event */
	preferredTimes?: ITimeRange[]
	/** Intra-day start constraint for the event, in minutes of the day */
	dailyStartConstraints?: ITimeRange[]

	/** Created at timestamp */
	createdAt: string
	/** Updated at timestamp */
	updatedAt: string
}

// Event creation payload allowed from client
export interface EventPostType {
	name: string
	description?: string
	members: Array<{
		userId: string
		role: 'creator' | 'admin' | 'participant'
	}>,
	timeWindow?: ITimeRange
	duration: number
	schedulingMethod: 'fixed' | 'flexible'
	scheduledTime?: number
	visibility: 'draft' | 'public' | 'private'
	blackoutPeriods?: ITimeRange[]
	preferredTimes?: ITimeRange[]
	dailyStartConstraints?: ITimeRange[]
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
