document.getElementById("searchInput").oninput = loadColleges;
document.getElementById("stateFilter").onchange = loadColleges;
document.getElementById("categoryFilter").onchange = loadColleges;

function clearFilters() {
  document.getElementById("searchInput").value = "";
  document.getElementById("categoryFilter").value = "";
  loadColleges();
}
