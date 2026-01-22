import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

export default function CompetitonPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("active");
  const [loading, setLoading] = useState(false);

  const competitions = {
    active: [
      { id: 1, name: "Weekend Challenge #45", participants: 284, status: "Live", startTime: "Started 2h ago", endTime: "Ends in 4h" },
      { id: 2, name: "Algorithms Blitz", participants: 157, status: "Live", startTime: "Started 30m ago", endTime: "Ends in 29h" },
    ],
    upcoming: [
      { id: 3, name: "Advanced Data Structures", participants: 0, status: "Upcoming", startTime: "Starts in 6h", endTime: "Duration: 3h" },
      { id: 4, name: "Dynamic Programming Masters", participants: 0, status: "Upcoming", startTime: "Starts tomorrow", endTime: "Duration: 2h" },
    ],
    finished: [
      { id: 5, name: "Beginner Friendly Contest", participants: 512, status: "Finished", startTime: "Finished 2 days ago", endTime: "" },
      { id: 6, name: "String Manipulation Challenge", participants: 398, status: "Finished", startTime: "Finished 1 week ago", endTime: "" },
    ],
  };

  const handleJoin = (competitionId) => {
    setLoading(true);
    setTimeout(() => {
      navigate("/home");
      setLoading(false);
    }, 300);
  };

  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Competitions</h1>
          <p className="text-lg text-gray-600">Join live coding contests and challenge yourself</p>
        </div>

        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {["active", "upcoming", "finished"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="ml-2 text-sm">({competitions[tab].length})</span>
            </button>
          ))}
        </div>

        <div className="grid gap-6">
          {competitions[activeTab].map((comp) => (
            <div
              key={comp.id}
              className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{comp.name}</h3>
                  <div className="flex gap-4 mt-3">
                    <span className="text-sm text-gray-600">👥 {comp.participants} participants</span>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                      comp.status === "Live"
                        ? "bg-green-100 text-green-700"
                        : comp.status === "Upcoming"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {comp.status}
                    </span>
                  </div>
                </div>
                {comp.status !== "Finished" && (
                  <button
                    onClick={() => handleJoin(comp.id)}
                    disabled={loading}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      comp.status === "Live"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {loading ? "Loading..." : comp.status === "Live" ? "Join" : "Coming Soon"}
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600 mb-1">⏱️ Timing</p>
                  <p className="font-medium text-gray-900">{comp.startTime}</p>
                </div>
                {comp.endTime && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">⏳ Deadline</p>
                    <p className="font-medium text-gray-900">{comp.endTime}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {competitions[activeTab].length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 mb-4">No {activeTab} competitions</p>
            <button
              onClick={() => setActiveTab("active")}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              View Active
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
