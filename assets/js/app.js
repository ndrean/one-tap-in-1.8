import "phoenix_html";

async function startApp() {
  const [{ Socket }, { LiveSocket }, topbar, {MapHook}] = await Promise.all([
  import("phoenix"),
  import("phoenix_live_view"),
  import("../vendor/topbar.cjs"),
  import("./mapHook.js"),
  ]);

  const csrfToken = document
  .querySelector("meta[name='csrf-token']")
  .getAttribute("content");
  
  
  const liveSocket = new LiveSocket("/live", Socket, {
    longPollFallbackMs: 2500,
    params: { _csrf_token: csrfToken },
    hooks: { MapHook: MapHook({ mapID: "map" }) },
    });

  // connect if there are any LiveViews on the page
  liveSocket.connect();
  configTopbar(topbar)

  // expose liveSocket on window for web console debug logs and latency simulation:
  // >> liveSocket.enableDebug()
  // >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
  // >> liveSocket.disableLatencySim()
  window.liveSocket = liveSocket;
  

}

startApp().then(()=> console.log("APP.JS loaded--------"))

function configTopbar(topbar) {
  // Show progress bar on live navigation and form submits
  topbar.config({ barColors: { 0: "#29d" }, shadowColor: "rgba(0, 0, 0, .3)" });
  window.addEventListener("phx:page-loading-start", (_info) => topbar.show(300));
  window.addEventListener("phx:page-loading-stop", (_info) => topbar.hide());
}




// The lines below enable quality of life phoenix_live_reload
// development features:
//
//     1. stream server logs to the browser console
//     2. click on elements to jump to their definitions in your code editor
//
if (process.env.NODE_ENV === "development") {
  window.addEventListener(
    "phx:live_reload:attached",
    ({ detail: reloader }) => {
      // Enable server log streaming to client.
      // Disable with reloader.disableServerLogs()
      reloader.enableServerLogs();

      // Open configured PLUG_EDITOR at file:line of the clicked element's HEEx component
      //
      //   * click with "c" key pressed to open at caller location
      //   * click with "d" key pressed to open at function component definition location
      let keyDown;
      window.addEventListener("keydown", (e) => (keyDown = e.key));
      window.addEventListener("keyup", (e) => (keyDown = null));
      window.addEventListener(
        "click",
        (e) => {
          if (keyDown === "c") {
            e.preventDefault();
            e.stopImmediatePropagation();
            reloader.openEditorAtCaller(e.target);
          } else if (keyDown === "d") {
            e.preventDefault();
            e.stopImmediatePropagation();
            reloader.openEditorAtDef(e.target);
          }
        },
        true,
      );

      window.liveReloader = reloader;
    },
  );
}

