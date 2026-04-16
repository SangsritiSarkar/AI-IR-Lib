import { useRef } from "react";
import { C, s } from "../styles/tokens";

export default function FileUploadCard({ fileName, fileAlert, onFile }) {
  const fileRef = useRef();
  return (
    <div style={s.card}>
      <div style={s.cardTitle}>
        <span style={s.dot()} />
        Input File
      </div>
      <div
        onClick={() => fileRef.current.click()}
        style={{
          border: `2px dashed ${C.border}`, borderRadius: 10,
          padding: "22px", textAlign: "center", cursor: "pointer",
          transition: "border-color 0.2s",
          background: "rgba(13,10,26,0.3)",
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 8 }}>📊</div>
        <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>
          {fileName ?? "Drop Excel file here or click to browse"}
        </div>
        <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>
          {fileName
            ? "Click to replace"
            : "Columns: Framework Name · URL · Category · Last Known Version"}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={onFile}
          style={{ display: "none" }}
        />
      </div>
      {fileAlert && (
        <div style={s.alert(fileAlert.type)}>{fileAlert.msg}</div>
      )}
    </div>
  );
}