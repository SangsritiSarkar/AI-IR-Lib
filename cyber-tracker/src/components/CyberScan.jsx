import { useState } from "react";
import { useCyberScan } from "../hooks/useCyberScan";
import { exportCSV }    from "../utils/exportCSV";
import { s }            from "../styles/tokens";

import Header            from "./Header";
import SettingsModal     from "./SettingsModal";
import FileUploadCard    from "./FileUploadCard";
import ScanControlsCard  from "./ScanControlsCard";
import FrameworkList     from "./FrameworkList";
import DetailPanel       from "./DetailPanel";
import NewFrameworksCard from "./NewFrameworksCard";

export default function CyberScan() {
  const [showSettings, setShowSettings] = useState(false);
  const scan = useCyberScan();

  const doneCt = Object.values(scan.results).filter(r => r.status === "done").length;

  return (
    <div style={s.root}>

      {/* ── Settings Modal (credentials only, no timeRange) ─────────────── */}
      {showSettings && (
        <SettingsModal
          azureEndpoint={scan.azureEndpoint} setAzureEndpoint={scan.setAzureEndpoint}
          azureKey={scan.azureKey}           setAzureKey={scan.setAzureKey}
          deployment={scan.deployment}       setDeployment={scan.setDeployment}
          apiVersion={scan.apiVersion}       setApiVersion={scan.setApiVersion}
          tavilyKey={scan.tavilyKey}         setTavilyKey={scan.setTavilyKey}
          onSave={scan.handleSaveConfig}
          onLoad={scan.handleLoadConfig}
          onClose={() => setShowSettings(false)}
          savedMsg={scan.savedMsg}
        />
      )}

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Header
        scanning={scan.scanning}
        discovering={scan.discovering}
        timeRange={scan.timeRange}
        statusLabel={scan.statusLabel}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div style={s.main}>

        {/* File upload */}
        <FileUploadCard
          fileName={scan.fileName}
          fileAlert={scan.fileAlert}
          onFile={scan.handleFile}
        />

        {/* Scan Controls — both features */}
        <ScanControlsCard
          timeRange={scan.timeRange}           setTimeRange={scan.setTimeRange}
          scanning={scan.scanning}             scanAborted={scan.scanAborted}
          progress={scan.progress}
          frameworks={scan.frameworks}         doneCt={doneCt}
          newFWs={scan.newFWs}
          discovering={scan.discovering}       discoverAborted={scan.discoverAborted}
          discoverStatus={scan.discoverStatus} discoverError={scan.discoverError}
          onScan={scan.startScan}              onAbortScan={scan.abortScan}
          onDiscover={scan.startDiscover}      onAbortDiscover={scan.abortDiscover}
          onExport={() => exportCSV(scan.frameworks, scan.results, scan.newFWs, scan.timeRange)}
        />

        {/* Two-column: framework list (left) + detail panel (right) */}
        {scan.frameworks.length > 0 &&
          (Object.keys(scan.results).length > 0 || scan.scanning) && (
          <div style={s.twoCol}>
            <FrameworkList
              frameworks={scan.frameworks}
              results={scan.results}
              selectedIdx={scan.selectedIdx}
              onSelect={scan.setSelectedIdx}
            />
            <DetailPanel
              frameworks={scan.frameworks}
              results={scan.results}
              selectedIdx={scan.selectedIdx}
            />
          </div>
        )}

        {/* Newly discovered frameworks card */}
        <NewFrameworksCard
          newFWs={scan.newFWs}
          timeRange={scan.timeRange}
        />

      </div>
    </div>
  );
}
