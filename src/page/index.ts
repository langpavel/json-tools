async function main() {
  try {
    const el = document.getElementById("json-data");
    if (!el) return;
    (window as any).data = JSON.parse(el.textContent || "");
    console.log(
      "%c[JSON Tools]%c Data available as %cwindow.data",
      "color: #f0c674; font-weight: bold",
      "color: inherit",
      "color: #81a2be; font-weight: bold",
    );
  } catch (e) {
    console.error("[JSON Tools]", e);
  }
}

main();
