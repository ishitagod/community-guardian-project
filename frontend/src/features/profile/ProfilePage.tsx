import { useState } from "react";
import { createProfile, updateProfile, deleteProfile } from "../../api/profiles";
import { useProfileStore } from "../../store/profileStore";

function IconLock() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
function IconPin() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

const FIELD_CLS = "w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent placeholder:text-slate-400";
const LABEL_CLS = "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5";

export default function ProfilePage() {
  const { userProfile, setUserProfile, clearUserProfile } = useProfileStore();
  const [formData, setFormData] = useState({
    name: "", neighborhood: "", city: "", concerns: "", share_location: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "", neighborhood: "", city: "", concerns: "", share_location: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateLocation = (location: string) => {
    const streetPatterns = [
      /\b(street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd|court|ct|circle|cir|place|pl|parkway|pkwy|plaza|plz)\b/i,
      /\b\d+\b/,
      /apt|apartment|suite|#|floor|flat/i,
    ];
    return !streetPatterns.some((p) => p.test(location));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(""); setSuccess("");
    try {
      if (!formData.name.trim()) { setError("Name is required."); setLoading(false); return; }
      if (formData.neighborhood.trim() && !validateLocation(formData.neighborhood)) {
        setError("Use neighbourhood name only — no street addresses (e.g. 'Andheri West').");
        setLoading(false); return;
      }
      const res = await createProfile(formData);
      setSuccess("Profile created.");
      setUserProfile(res.data);
      setFormData({ name: "", neighborhood: "", city: "", concerns: "", share_location: false });
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to create profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (!userProfile) return;
    setEditData({
      name: userProfile.name,
      neighborhood: userProfile.neighborhood ?? "",
      city: userProfile.city ?? "",
      concerns: userProfile.concerns ?? "",
      share_location: userProfile.share_location,
    });
    setError(""); setSuccess("");
    setIsEditing(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    setLoading(true); setError(""); setSuccess("");
    try {
      if (!editData.name.trim()) { setError("Name is required."); setLoading(false); return; }
      if (editData.neighborhood.trim() && !validateLocation(editData.neighborhood)) {
        setError("Use neighbourhood name only — no street addresses (e.g. 'Andheri West').");
        setLoading(false); return;
      }
      const res = await updateProfile(userProfile.id, editData);
      setUserProfile(res.data);
      setSuccess("Profile updated.");
      setIsEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to update profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userProfile) return;
    setLoading(true); setError("");
    try {
      await deleteProfile(userProfile.id);
      clearUserProfile();
      setSuccess("Profile deleted.");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to delete profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const Feedback = () => (
    <>
      {error && <div className="px-4 py-3 bg-noise-light border border-noise/20 rounded-xl text-noise text-sm">{error}</div>}
      {success && <div className="px-4 py-3 bg-verified-light border border-verified/20 rounded-xl text-verified text-sm">{success}</div>}
    </>
  );

  /* ── Active profile view ── */
  if (userProfile) {
    return (
      <div className="p-7 max-w-xl">
        <div className="mb-7">
          <h2 className="text-xl font-semibold text-slate-800">My Profile</h2>
          <p className="text-sm text-slate-500 mt-1">Your safety profile in Community Guardian</p>
        </div>

        {/* Avatar card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <div className="bg-sidebar px-6 py-8 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-500 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {userProfile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-semibold text-lg leading-tight">{userProfile.name}</p>
              {(userProfile.neighborhood || userProfile.city) && (
                <p className="text-slate-400 text-sm mt-0.5 flex items-center gap-1.5">
                  <IconPin />
                  {userProfile.neighborhood && userProfile.city
                    ? `${userProfile.neighborhood}, ${userProfile.city}`
                    : userProfile.neighborhood || userProfile.city}
                </p>
              )}
            </div>
          </div>

          <div className="px-6 py-5 space-y-4">
            <Feedback />

            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className={LABEL_CLS}>Full name *</label>
                  <input type="text" value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className={FIELD_CLS} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL_CLS}>Neighbourhood</label>
                    <input type="text" placeholder="e.g. Andheri West" value={editData.neighborhood}
                      onChange={(e) => setEditData({ ...editData, neighborhood: e.target.value })}
                      className={FIELD_CLS} />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>City</label>
                    <input type="text" placeholder="e.g. Mumbai" value={editData.city}
                      onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                      className={FIELD_CLS} />
                  </div>
                </div>
                <div>
                  <label className={LABEL_CLS}>Safety concerns</label>
                  <input type="text" placeholder="e.g. phishing, theft, scam" value={editData.concerns}
                    onChange={(e) => setEditData({ ...editData, concerns: e.target.value })}
                    className={FIELD_CLS} />
                  <p className="text-xs text-slate-400 mt-1">Comma-separated</p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-accent-light rounded-xl">
                  <input type="checkbox" id="edit_share_location" checked={editData.share_location}
                    onChange={(e) => setEditData({ ...editData, share_location: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded accent-indigo-600 flex-shrink-0" />
                  <label htmlFor="edit_share_location" className="cursor-pointer">
                    <p className="text-sm font-medium text-slate-700">Share neighbourhood with community</p>
                    <p className="text-xs text-slate-500 mt-0.5">Others see neighbourhood only — never street address</p>
                  </label>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsEditing(false)}
                    className="flex-1 py-2.5 text-sm font-medium border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 py-2.5 text-sm font-medium bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50">
                    {loading ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={LABEL_CLS}>Neighbourhood</p>
                    <p className="text-sm text-slate-700">{userProfile.neighborhood || <span className="text-slate-400">Not set</span>}</p>
                  </div>
                  <div>
                    <p className={LABEL_CLS}>City</p>
                    <p className="text-sm text-slate-700">{userProfile.city || <span className="text-slate-400">Not set</span>}</p>
                  </div>
                </div>

                {userProfile.concerns && (
                  <div>
                    <p className={LABEL_CLS}>Safety concerns</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {userProfile.concerns.split(",").map((c, i) => (
                        <span key={i} className="px-2 py-0.5 bg-accent-light text-accent text-xs rounded-full font-medium">{c.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`flex items-center justify-between p-4 rounded-xl ${userProfile.share_location ? "bg-accent-light" : "bg-slate-50"}`}>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Location visibility</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {userProfile.share_location ? "Neighbourhood visible to community members" : "Your location is private"}
                    </p>
                  </div>
                  <span className={userProfile.share_location ? "text-accent" : "text-slate-400"}>
                    {userProfile.share_location ? <IconGlobe /> : <IconLock />}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleEdit}
                    className="flex-1 py-2.5 text-sm font-medium border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                    Edit profile
                  </button>
                  <button onClick={handleDelete} disabled={loading}
                    className="flex-1 py-2.5 text-sm font-medium text-noise border border-noise/30 rounded-xl hover:bg-noise-light transition-colors disabled:opacity-50">
                    {loading ? "Deleting…" : "Delete profile"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Privacy note */}
        <p className="text-xs text-slate-400 flex items-center gap-1.5">
          <IconLock /> Neighbourhood-level only — street addresses are never stored.
        </p>
      </div>
    );
  }

  /* ── Create profile form ── */
  return (
    <div className="p-7 max-w-xl">
      <div className="mb-7">
        <h2 className="text-xl font-semibold text-slate-800">Set up your profile</h2>
        <p className="text-sm text-slate-500 mt-1">Connect with your community and get relevant alerts</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <Feedback />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={LABEL_CLS}>Full name *</label>
            <input type="text" placeholder="Your name" value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={FIELD_CLS} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLS}>Neighbourhood</label>
              <input type="text" placeholder="e.g. Andheri West" value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                className={FIELD_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>City</label>
              <input type="text" placeholder="e.g. Mumbai" value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={FIELD_CLS} />
            </div>
          </div>

          <div>
            <label className={LABEL_CLS}>Safety concerns</label>
            <input type="text" placeholder="e.g. phishing, theft, scam" value={formData.concerns}
              onChange={(e) => setFormData({ ...formData, concerns: e.target.value })}
              className={FIELD_CLS} />
            <p className="text-xs text-slate-400 mt-1">Comma-separated — helps personalise your alerts</p>
          </div>

          {/* Location sharing */}
          <div className="flex items-start gap-3 p-4 bg-accent-light rounded-xl">
            <input type="checkbox" id="share_location" checked={formData.share_location}
              onChange={(e) => setFormData({ ...formData, share_location: e.target.checked })}
              className="mt-0.5 w-4 h-4 rounded accent-indigo-600 flex-shrink-0" />
            <label htmlFor="share_location" className="cursor-pointer">
              <p className="text-sm font-medium text-slate-700">Share neighbourhood with community</p>
              <p className="text-xs text-slate-500 mt-0.5">Others see your neighbourhood only — never your street address</p>
            </label>
          </div>

          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <IconLock /> Neighbourhood-level only. Street addresses are rejected at submission.
          </p>

          <button type="submit" disabled={loading}
            className="w-full py-2.5 text-sm font-medium bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50">
            {loading ? "Creating…" : "Create profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
