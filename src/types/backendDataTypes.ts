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
	}[]

	duration: number
	timeWindow: {
		start: number
		end: number
	}

	status: 'draft' | 'scheduling' | 'scheduled' | 'confirmed' | 'cancelled'
	scheduledTime?: number

	public: boolean

	blackoutPeriods: ITimeRange[]
	preferredTimes?: ITimeRange[]

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
	/** Expiration date for the user, null if not the current user */
	expirationDate: string | null
	/** If the user has confirmed their email, null if not the current user */
	confirmed: boolean | null
	/** Created at timestamp */
	createdAt: string
	/** Updated at timestamp */
	updatedAt: string
}
