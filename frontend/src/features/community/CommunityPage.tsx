import { useState } from "react";
import { useProfiles } from "../../hooks/useProfiles";

function IconPin() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export default function CommunityPage() {
  const [keyword, setKeyword] = useState("");
  const { profiles, loading, error } = useProfiles(keyword);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-400">
        <svg className="animate-spin mb-3" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <p className="text-sm">Loading community members…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-7 px-5 py-4 bg-noise-light border border-noise/20 rounded-xl">
        <p className="text-noise font-medium text-sm">Error loading profiles</p>
        <p className="text-noise/70 text-xs mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-7">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Community</h2>
        <p className="text-sm text-slate-500 mt-1">Members in your neighbourhood</p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search by name or neighbourhood…"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent placeholder:text-slate-400"
        />
      </div>

      {/* Grid */}
      {profiles && profiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => (
            <div key={profile.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              {/* Avatar strip */}
              <div className="bg-sidebar px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm truncate">{profile.name}</p>
                  {profile.share_location && profile.neighborhood ? (
                    <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                      <IconPin />{profile.neighborhood}{profile.city ? `, ${profile.city}` : ""}
                    </p>
                  ) : (
                    <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                      <IconLock /> Private location
                    </p>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="px-5 py-4">
                {profile.concerns ? (
                  <>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Concerns</p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.concerns.split(",").map((concern, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-accent-light text-accent text-xs rounded-full font-medium">
                          {concern.trim()}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-400">No concerns listed</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <IconUsers />
          <p className="text-sm font-medium mt-4">No community members yet</p>
          <p className="text-xs mt-1">Be the first to join your neighbourhood</p>
        </div>
      )}
    </div>
  );
}
