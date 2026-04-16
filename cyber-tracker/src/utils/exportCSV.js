import { timeRangeLabel } from "../styles/tokens";

export function exportCSV(frameworks, results, newFWs, timeRange) {
  const rows = [["Framework","URL","Category","Last Known Ver","Current Version",
    "Recent Changes","Upcoming","Implications","Status","Time Range"]];

  frameworks.forEach((f, i) => {
    const r = results[i] ?? {};
    const d = r.data ?? {};
    rows.push([
      f.name, f.url, f.category, f.version,
      d.currentVersion ?? "",
      (d.recentChanges ?? "").replace(/\n/g, " "),
      (d.upcoming ?? "").replace(/\n/g, " "),
      (d.implications ?? "").replace(/\n/g, " "),
      r.status ?? "pending",
      timeRangeLabel(timeRange),
    ]);
  });

  if (newFWs.length) {
    rows.push([]);
    rows.push(["— NEW FRAMEWORKS DISCOVERED —","","","","","","","","",""]);
    rows.push(["Name","URL","Region","Published","Relevance","Description","","","",""]);
    newFWs.forEach(n =>
      rows.push([n.name??"",n.url??"",n.region??"",n.publishedDate??"",n.relevance??"",n.description??""
        ,"","","",""])
    );
  }

  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `cyberscan_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}