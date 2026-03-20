import { useState } from "react";
import { createProfile, deleteProfile } from "../../api/profiles";
import { useProfileStore } from "../../store/profileStore";

export default function ProfilePage() {
  const { userProfile, setUserProfile, clearUserProfile } = useProfileStore();
  const [formData, setFormData] = useState({
    name: "",
    neighborhood: "",
    city: "",
    concerns: "",
    share_location: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateLocation = (location: string): boolean => {
    // Reject common street address patterns
    const streetPatterns = [
      /\b(street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd|court|ct|circle|cir|place|pl|parkway|pkwy|plaza|plz)\b/i,
      /\b\d+\b/, // Any number (street numbers)
      /apt|apartment|suite|#|floor|flat/i, // Unit indicators
    ];

    return !streetPatterns.some((pattern) => pattern.test(location));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!formData.name.trim()) {
        setError("Please enter your name");
        setLoading(false);
        return;
      }

      if (
        formData.neighborhood.trim() &&
        !validateLocation(formData.neighborhood)
      ) {
        setError(
          "Neighborhood should not include street addresses. Use neighborhood name only (e.g., 'Andheri West')",
        );
        setLoading(false);
        return;
      }

      const res = await createProfile(formData);
      setSuccess("Profile created successfully!");
      setUserProfile(res.data); // Save to store
      setFormData({
        name: "",
        neighborhood: "",
        city: "",
        concerns: "",
        share_location: false,
      });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to create profile:", err);
      setError("Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userProfile) {
      setError("No profile to delete");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await deleteProfile(userProfile.id);
      clearUserProfile();
      setSuccess("Profile deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to delete profile:", err);
      setError("Failed to delete profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show profile details if profile exists
  if (userProfile) {
    return (
      <div className="p-5 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            👤 My Profile
          </h2>
          <p className="text-gray-600">
            Your safety profile in the Community Guardian
          </p>
        </div>

        {/* Profile Details Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6 text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6 text-green-700">
              {success}
            </div>
          )}

          {/* Profile Fields */}
          <div className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <p className="text-lg text-gray-900">{userProfile.name}</p>
            </div>

            {/* Neighborhood */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Neighborhood
              </label>
              <p className="text-gray-900">
                {userProfile.neighborhood || "Not specified"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                🔒 Privacy: Only neighborhood level, never street addresses
              </p>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <p className="text-gray-900">
                {userProfile.city || "Not specified"}
              </p>
            </div>

            {/* Share Location */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Location Visibility
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {userProfile.share_location
                      ? "Your neighborhood is visible to community members"
                      : "Your location is private"}
                  </p>
                </div>
                <span className="text-2xl">
                  {userProfile.share_location ? "🌍" : "🔒"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
              Delete Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show profile creation form
  return (
    <div className="p-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">👤 My Profile</h2>
        <p className="text-gray-600">
          Set up your safety profile to connect with your community
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6 text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Neighborhood */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Neighborhood
            </label>
            <input
              type="text"
              placeholder="e.g., Andheri West (neighborhood only, no street address)"
              value={formData.neighborhood}
              onChange={(e) =>
                setFormData({ ...formData, neighborhood: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              🔒 Privacy: Only neighborhood level, never street addresses
            </p>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              placeholder="e.g., Mumbai"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Share Location */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.share_location}
                onChange={(e) =>
                  setFormData({ ...formData, share_location: e.target.checked })
                }
                className="w-4 h-4 rounded"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Share my location with community
                </p>
                <p className="text-xs text-gray-600">
                  Other members can see your neighborhood (but not exact
                  address)
                </p>
              </div>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
          >
            {loading ? "Creating Profile..." : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
