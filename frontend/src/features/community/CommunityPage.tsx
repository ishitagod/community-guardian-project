import { useState } from "react";
import { useProfiles } from "../../hooks/useProfiles";

export default function CommunityPage() {
  const [keyword, setKeyword] = useState("");
  const { profiles, loading, error } = useProfiles(keyword);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin">⏳</div>
        <p className="text-gray-600 mt-2">Loading community members...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-lg m-5">
        <p className="text-red-800 font-medium">Error loading profiles</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-5">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          👥 Community Members
        </h2>
        <p className="text-gray-600">
          Connect with others in your neighborhood
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <input
          type="text"
          placeholder="Search by name or neighborhood..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>

      {/* Profiles Grid */}
      {profiles && profiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition p-5"
            >
              {/* Name */}
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {profile.name}
              </h3>

              {/* Location - only show if shared */}
              {profile.share_location && profile.neighborhood && (
                <div className="flex gap-2 mb-3">
                  <span className="text-gray-500">📍</span>
                  <div>
                    <p className="text-sm text-gray-700">
                      {profile.neighborhood}
                    </p>
                    {profile.city && (
                      <p className="text-xs text-gray-500">{profile.city}</p>
                    )}
                  </div>
                </div>
              )}

              {!profile.share_location && (
                <div className="text-xs text-gray-500 mb-3">
                  🔒 Location not shared
                </div>
              )}

              {/* Concerns */}
              {profile.concerns && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-600 mb-2">
                    Safety Concerns:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.concerns.split(",").map((concern, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {concern.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Button */}
              <button
                onClick={() =>
                  window.alert(`${profile.name}'s profile ID: ${profile.id}`)
                }
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-2xl mb-2">👥</p>
          <p className="text-gray-600 font-medium">
            No community members found
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Be the first to join your neighborhood
          </p>
        </div>
      )}
    </div>
  );
}
