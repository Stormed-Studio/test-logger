const WEBHOOK = "https://discord.com/api/webhooks/1482807792124297218/d-ZEaW7fRbmLfX2a19jMVVaaUb6xKb_byomhoI87j5QJg_RcG1qYF4r3M0qveFYJhrNu";

async function log(msg) {
  fetch(WEBHOOK, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      username: "Stats Log",
      embeds: [{title: msg, color: 0x00ffff, timestamp: new Date().toISOString()}]
    })
  }).catch(()=>{});
}

log("Profile stats page opened");

const urlParams = new URLSearchParams(window.location.search);
let target = urlParams.get("user") || "Roblox"; // auto from ?user= or fallback

async function fetchJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function load() {
  document.getElementById("loading").style.display = "block";

  try {
    // 1. Username → ID
    const idData = await fetchJson(`https://users.roproxy.com/v1/usernames/users`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({usernames: [target], excludeBannedUsers: false})
    });

    if (!idData?.data?.length) throw new Error("User not found");

    const uid = idData.data[0].id;

    // 2. User info
    const user = await fetchJson(`https://users.roproxy.com/v1/users/${uid}`);
    if (!user) throw new Error("Profile fetch failed");

    // 3. Counts
    const friendsC = await fetchJson(`https://friends.roproxy.com/v1/users/${uid}/friends/count`) || {count: "—"};
    const followersC = await fetchJson(`https://friends.roproxy.com/v1/users/${uid}/followers/count`) || {count: "—"};
    const followingsC = await fetchJson(`https://friends.roproxy.com/v1/users/${uid}/followings/count`) || {count: "—"};

    // Display
    document.getElementById("avatar").src = `https://thumbnails.roproxy.com/v1/users/avatar?userIds=${uid}&size=720x720&format=Png&isCircular=false`;
    document.getElementById("displayName").textContent = user.displayName || user.name;
    document.getElementById("name").textContent = user.name;
    document.getElementById("id").textContent = user.id;
    document.getElementById("created").textContent = new Date(user.created).toDateString();
    document.getElementById("desc").textContent = user.description?.slice(0,200) + "..." || "No bio";
    document.getElementById("friendsCount").textContent = friendsC.count;
    document.getElementById("followersCount").textContent = followersC.count;
    document.getElementById("followingsCount").textContent = followingsC.count;
    document.getElementById("rolimonsLink").href = `https://www.rolimons.com/player/${uid}`;
    document.getElementById("profileLink").href = `https://www.roblox.com/users/${uid}/profile`;

    document.getElementById("result").style.display = "block";
    log(`Checked profile: ${user.name} (${uid})`);

  } catch (err) {
    document.getElementById("loading").innerHTML = `<span class="error">Error: ${err.message}. Try ?user=OtherName</span>`;
  } finally {
    document.getElementById("loading").style.display = "none";
  }
}

load();
