const MessageDisplay = ({ message }:
{ message: string }) => (
    <div className="flex justify-center">
        <p className="text-center text-base font-medium text-primary border-2 border-Highlights rounded p-2 mt-10 max-w-xs bg-background-light overflow-hidden">
            {message}
        </p>
    </div>
)

export default MessageDisplay
