import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import PageShell from "./components/PageShell";
import FilterBar from "./features/alerts/FilterBar";
import AlertFeed from "./features/alerts/AlertFeed";
import ReportModal from "./features/alerts/ReportModal";
import AlertDetailView from "./features/alerts/AlertDetailView";
import CommunityPage from "./features/community/CommunityPage";
import ProfilePage from "./features/profile/ProfilePage";
import type { AlertFilters } from "./types";

function AlertsPage() {
  const [filters, setFilters] = useState<AlertFilters>({
    keyword: "",
    classification: undefined,
    alert_type: undefined,
    severity: undefined,
  });
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  const [refresh, setRefresh] = useState(0);

  const handleReportSuccess = () => {
    setShowReportModal(false);
    setRefresh((r) => r + 1);
  };

  return (
    <>
      <div className="flex flex-col">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          onReport={() => setShowReportModal(true)}
        />
        <AlertFeed
          filters={filters}
          refresh={refresh}
          onViewDetails={setSelectedAlertId}
        />
      </div>

      {showReportModal && (
        <ReportModal
          onClose={() => setShowReportModal(false)}
          onSuccess={handleReportSuccess}
        />
      )}

      {selectedAlertId !== null && (
        <AlertDetailView
          id={selectedAlertId}
          onClose={() => setSelectedAlertId(null)}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <PageShell>
      <Routes>
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/" element={<AlertsPage />} />
      </Routes>
    </PageShell>
  );
}
