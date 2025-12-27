// RoomDisplay.jsx
export default function RoomDisplay({
  room,
  currentUser,
  onLeave = null, // defensive default
}) {
  const isAdmin = room.admin?.id === currentUser?.id;

  function handleLeaveClick() {
    if (typeof onLeave !== "function") {
      console.warn("onLeave is not provided");
      return;
    }
    onLeave();
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-red-100">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-red-600">
          {room.name}
        </h2>
        <span className="text-sm text-red-400">
          Room ID: {room.id}
        </span>
      </div>

      {/* Players */}
      <h3 className="mt-6 text-lg font-medium text-red-500">
        Players
      </h3>

      <ul className="mt-3 space-y-3">
        {room.players?.map((entry, index) => {
          const player = entry.player ?? entry;
          const score = entry.score ?? 0;
          const isCurrentUser = currentUser?.id === player.id;

          return (
            <li
              key={entry.id ?? player.id}
              className="flex justify-between items-center p-3 bg-red-50 border border-red-100 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center text-sm font-semibold text-red-700">
                  {index + 1}
                </div>

                <div>
                  <div className="font-medium text-gray-800">
                    {player.username}
                  </div>
                  <div className="text-xs text-gray-500">
                    {player.role}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-red-600">
                  {score}
                </span>

                {isCurrentUser && !isAdmin && (
                  <button
                    className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300"
                    onClick={handleLeaveClick}
                  >
                    Leave
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Current Problem */}
      {room.currentProblem && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-medium text-red-600">
            Current Problem
          </h3>
          <div className="mt-2 font-semibold text-gray-800">
            {room.currentProblem.title}
          </div>
          <p className="mt-1 text-sm text-gray-700">
            {room.currentProblem.description}
          </p>
        </div>
      )}
    </div>
  );
}
