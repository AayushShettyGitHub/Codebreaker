

export default function RoomDisplay({ room }) {
  return (
    <div>
      <h2>Room: {room.name}</h2>
      <p>ID: {room.id}</p>

      <h3>Players</h3>
      <ul>
        {room.players?.map(p => (
          <li key={p.id}>{p.name} ({p.role})</li>
        ))}
      </ul>

      {room.currentProblem && (
        <div>
          <h3>Current Problem</h3>
          <b>{room.currentProblem.title}</b>
          <p>{room.currentProblem.description}</p>
        </div>
      )}
    </div>
  );
}
