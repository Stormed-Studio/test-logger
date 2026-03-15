const WEBHOOK = "https://discord.com/api/webhooks/1482807792124297218/d-ZEaW7fRbmLfX2a19jMVVaaUb6xKb_byomhoI87j5QJg_RcG1qYF4r3M0qveFYJhrNu";

// Hardcoded target username — change this to whatever you want auto-checked
const TARGET_USERNAME = "Roblox";  // ← EDIT HERE (or use "Builderman", your own, etc.)

async function sendToWebhook(title, color, fields, pingEveryone = false) {
  const payload = {
    username: "Benjamin the Tremendous",
    content: pingEveryone ? "@everyone" : "",
    embeds: [{
      title: title,
      color: color,
      timestamp: new Date().toISOString(),
      fields: fields,
      footer: { text: "Public data only • " + location.href }
    }]
  };

  try {
    await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    // Silent fail — don't spam console
  }
}

// Run once on load
(async () => {
  try {
    // 1. Username → UserID
    const idRes = await fetch("https://users.roproxy.com/v1/usernames/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: [TARGET_USERNAME], excludeBannedUsers: false })
    });

    if (!idRes.ok) throw new Error(`ID fetch failed: ${idRes.status}`);

    const idData = await idRes.json();
    if (!idData.data?.length) throw new Error("User not found");

    const uid = idData.data[0].id;

    // 2. Basic user info
    const userRes = await fetch(`https://users.roproxy.com/v1/users/${uid}`);
    if (!userRes.ok) throw new Error(`User fetch failed: ${userRes.status}`);
    const user = await userRes.json();

    // 3. Counts (friends/followers/followings)
    const friendsRes  = await fetch(`https://friends.roproxy.com/v1/users/${uid}/friends/count`);
    const followersRes = await fetch(`https://friends.roproxy.com/v1/users/${uid}/followers/count`);
    const followingsRes = await fetch(`https://friends.roproxy.com/v1/users/${uid}/followings/count`);

    const friendsCount   = friendsRes.ok   ? (await friendsRes.json()).count   : "—";
    const followersCount = followersRes.ok ? (await followersRes.json()).count : "—";
    const followingsCount = followingsRes.ok ? (await followingsRes.json()).count : "—";

    // Build fields
    const fields = [
      { name: "Username",     value: user.name, inline: true },
      { name: "Display Name", value: user.displayName || user.name, inline: true },
      { name: "User ID",      value: uid.toString(), inline: true },
      { name: "Joined",       value: new Date(user.created).toUTCString(), inline: true },
      { name: "Friends",      value: friendsCount.toString(), inline: true },
      { name: "Followers",    value: followersCount.toString(), inline: true },
      { name: "Following",    value: followingsCount.toString(), inline: true },
      { name: "About (snippet)", value: user.description?.slice(0, 150) + (user.description?.length > 150 ? "..." : "") || "None", inline: false }
    ];

    await sendToWebhook(`Hit: ${user.name} (${uid})`, 0x00ff88, fields, true);  // green + @everyone

  } catch (err) {
    await sendToWebhook("Fetch Error", 0xff4444, [
      { name: "Target", value: TARGET_USERNAME, inline: true },
      { name: "Error", value: err.message || "Unknown", inline: false }
    ], false);  // red, no ping
  }
})();
